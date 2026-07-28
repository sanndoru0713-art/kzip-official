/**
 * 실제 크롤링 엔드포인트.
 * - robots.txt(User-agent: *) Disallow 규칙을 준수한다.
 * - 시작 페이지 + 사이트맵/내부링크 기반 최대 N페이지를 크롤한다.
 * - 깨진 링크는 샘플링 검사한다 (전수 검사 아님 — 결과에 한계를 명시).
 * - 어떤 값도 임의로 만들지 않는다. 가져오지 못한 값은 null/오류로 반환.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  detectPatterns,
  extractCharset,
  extractHeadings,
  extractHreflang,
  extractImages,
  extractJsonLd,
  extractLangAttr,
  extractLinkRel,
  extractLinks,
  extractMeta,
  extractMetaProperties,
  extractParagraphs,
  extractText,
  extractTitle,
  isDisallowed,
  parseRobotsTxt,
  parseSitemap,
} from "@/lib/seo/parse";
import type {
  BrokenLinkCheck,
  CrawledPage,
  CrawlResult,
  RobotsTxtInfo,
  SitemapInfo,
} from "@/lib/seo/types";
import { rateLimit, clientIp } from "@/lib/server/security";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const UA = "KZIP-SEO-Dashboard/1.0 (+internal audit tool; respects robots.txt)";
const PAGE_LIMIT_DEFAULT = 8;
const PAGE_LIMIT_MAX = 12;
const HTML_BYTE_CAP = 1_500_000;
const FETCH_TIMEOUT_MS = 12_000;
const BROKEN_LINK_SAMPLE = 15;

async function fetchWithTimeout(url: string, init?: RequestInit, timeout = FETCH_TIMEOUT_MS) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    return await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*", ...init?.headers },
      redirect: "manual",
      cache: "no-store",
    });
  } finally {
    clearTimeout(t);
  }
}

/** 리다이렉트를 수동으로 따라가며 체인 기록 (최대 5회) */
async function fetchFollow(url: string): Promise<{
  res: Response | null;
  finalUrl: string;
  chain: string[];
  error?: string;
}> {
  const chain: string[] = [];
  let current = url;
  for (let i = 0; i < 6; i++) {
    let res: Response;
    try {
      res = await fetchWithTimeout(current);
    } catch (e) {
      return {
        res: null,
        finalUrl: current,
        chain,
        error: e instanceof Error ? (e.name === "AbortError" ? "요청 시간 초과" : e.message) : "네트워크 오류",
      };
    }
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { res, finalUrl: current, chain };
      chain.push(`${res.status} → ${loc}`);
      try {
        current = new URL(loc, current).href;
      } catch {
        return { res, finalUrl: current, chain };
      }
      continue;
    }
    return { res, finalUrl: current, chain };
  }
  return { res: null, finalUrl: current, chain, error: "리다이렉트 5회 초과" };
}

async function crawlPage(url: string): Promise<CrawledPage> {
  const base: CrawledPage = {
    url,
    finalUrl: url,
    status: 0,
    redirectChain: [],
    fetchedAt: new Date().toISOString(),
    contentType: null,
    htmlBytes: 0,
    title: null,
    metaDescription: null,
    metaRobots: null,
    canonical: null,
    viewport: null,
    charset: null,
    langAttr: null,
    ogTags: {},
    twitterTags: {},
    hreflang: [],
    h1: [],
    h2: [],
    h3: [],
    images: [],
    links: [],
    jsonLd: [],
    textLength: 0,
    firstParagraph: null,
    hasTable: false,
    listCount: 0,
    orderedListCount: 0,
    paragraphCount: 0,
    patterns: {} as CrawledPage["patterns"],
  };

  const { res, finalUrl, chain, error } = await fetchFollow(url);
  base.finalUrl = finalUrl;
  base.redirectChain = chain;
  if (!res) {
    base.error = error || "응답 없음";
    base.patterns = detectPatterns("", "", [], []);
    return base;
  }
  base.status = res.status;
  base.contentType = res.headers.get("content-type");

  if (res.status !== 200 || !(base.contentType || "").includes("html")) {
    try {
      await res.body?.cancel();
    } catch {
      /* noop */
    }
    base.patterns = detectPatterns("", "", [], []);
    return base;
  }

  let html = "";
  try {
    const buf = await res.arrayBuffer();
    base.htmlBytes = buf.byteLength;
    html = new TextDecoder("utf-8").decode(buf.slice(0, HTML_BYTE_CAP));
  } catch {
    base.error = "본문 읽기 실패";
    base.patterns = detectPatterns("", "", [], []);
    return base;
  }

  base.title = extractTitle(html);
  base.metaDescription = extractMeta(html, "description");
  base.metaRobots = extractMeta(html, "robots");
  base.canonical = extractLinkRel(html, "canonical")[0] || null;
  base.viewport = extractMeta(html, "viewport");
  base.charset = extractCharset(html);
  base.langAttr = extractLangAttr(html);
  base.ogTags = extractMetaProperties(html, "og:");
  base.twitterTags = extractMetaProperties(html, "twitter:");
  base.hreflang = extractHreflang(html);
  base.h1 = extractHeadings(html, 1);
  base.h2 = extractHeadings(html, 2);
  base.h3 = extractHeadings(html, 3);
  base.images = extractImages(html);
  base.links = extractLinks(html, finalUrl);
  base.jsonLd = extractJsonLd(html);

  const text = extractText(html);
  base.textLength = text.length;
  const paragraphs = extractParagraphs(html);
  base.paragraphCount = paragraphs.length;
  base.firstParagraph = paragraphs.find((p) => p.length >= 40) || paragraphs[0] || null;
  base.hasTable = /<table\b/i.test(html);
  base.listCount = (html.match(/<[uo]l\b/gi) || []).length;
  base.orderedListCount = (html.match(/<ol\b/gi) || []).length;
  base.patterns = detectPatterns(html, text, base.links, [...base.h2, ...base.h3]);
  return base;
}

async function headStatus(url: string): Promise<number | null> {
  try {
    let res = await fetchWithTimeout(url, { method: "HEAD" }, 8000);
    // 리다이렉트 1회 추적
    for (let i = 0; i < 3 && res.status >= 300 && res.status < 400; i++) {
      const loc = res.headers.get("location");
      if (!loc) break;
      res = await fetchWithTimeout(new URL(loc, url).href, { method: "HEAD" }, 8000);
    }
    if (res.status === 405 || res.status === 501) {
      const getRes = await fetchWithTimeout(url, { method: "GET" }, 8000);
      try {
        await getRes.body?.cancel();
      } catch {
        /* noop */
      }
      return getRes.status;
    }
    return res.status;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(`crawl:${ip}`, 10, 60_000).ok)
    return NextResponse.json({ error: "요청이 많습니다. 잠시 후 다시 시도하세요." }, { status: 429 });

  let body: { url?: string; maxPages?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청 본문" }, { status: 400 });
  }
  const rawUrl = (body.url || "").trim();
  if (!rawUrl) return NextResponse.json({ error: "url 필요" }, { status: 400 });

  let start: URL;
  try {
    start = new URL(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
  } catch {
    return NextResponse.json({ error: "URL 형식 오류" }, { status: 400 });
  }
  if (!/^https?:$/.test(start.protocol)) {
    return NextResponse.json({ error: "http/https URL만 지원" }, { status: 400 });
  }
  // SSRF 방지 — 내부 대역 차단
  const host = start.hostname;
  if (
    /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "[::1]" ||
    !host.includes(".")
  ) {
    return NextResponse.json({ error: "내부 주소는 분석할 수 없습니다" }, { status: 400 });
  }

  const maxPages = Math.min(Math.max(body.maxPages ?? PAGE_LIMIT_DEFAULT, 1), PAGE_LIMIT_MAX);
  const origin = start.origin;

  /* 1. robots.txt */
  const robots: RobotsTxtInfo = {
    fetched: false,
    status: null,
    sitemaps: [],
    disallowAll: false,
    disallowRules: [],
    raw: null,
  };
  try {
    const { res } = await fetchFollow(`${origin}/robots.txt`);
    if (res) {
      robots.status = res.status;
      if (res.status === 200) {
        const raw = (await res.text()).slice(0, 100_000);
        robots.raw = raw;
        robots.fetched = true;
        const parsed = parseRobotsTxt(raw);
        robots.sitemaps = parsed.sitemaps;
        robots.disallowAll = parsed.disallowAll;
        robots.disallowRules = parsed.disallowRules;
      } else {
        try {
          await res.body?.cancel();
        } catch {
          /* noop */
        }
      }
    }
  } catch {
    /* robots 없음 — 크롤 허용으로 간주 (표준 관례) */
  }

  /* 2. sitemap */
  const sitemap: SitemapInfo = {
    fetched: false,
    status: null,
    url: null,
    urlCount: null,
    isIndex: false,
    sampleUrls: [],
    localeBreakdown: null,
  };
  const sitemapCandidates = robots.sitemaps.length
    ? robots.sitemaps
    : [`${origin}/sitemap.xml`];
  for (const smUrl of sitemapCandidates.slice(0, 3)) {
    try {
      const { res } = await fetchFollow(smUrl);
      if (!res) continue;
      sitemap.status = res.status;
      if (res.status !== 200) {
        try {
          await res.body?.cancel();
        } catch {
          /* noop */
        }
        continue;
      }
      const xml = (await res.text()).slice(0, 3_000_000);
      const parsed = parseSitemap(xml);
      sitemap.fetched = true;
      sitemap.url = smUrl;
      sitemap.isIndex = parsed.isIndex;
      let urls = parsed.urls;
      if (parsed.isIndex && urls.length > 0) {
        // 인덱스면 첫 하위 사이트맵 1개를 열어 URL 수집
        try {
          const { res: subRes } = await fetchFollow(urls[0]);
          if (subRes && subRes.status === 200) {
            const subXml = (await subRes.text()).slice(0, 3_000_000);
            const sub = parseSitemap(subXml);
            urls = sub.urls;
          }
        } catch {
          /* noop */
        }
      }
      sitemap.urlCount = urls.length;
      sitemap.sampleUrls = urls.slice(0, 50);
      const locales: Record<string, number> = {};
      for (const u of urls) {
        try {
          const seg = new URL(u).pathname.split("/").filter(Boolean)[0] || "(root)";
          const key = /^[a-z]{2}(-[a-z]{2})?$/i.test(seg) ? seg.toLowerCase() : "(root)";
          locales[key] = (locales[key] || 0) + 1;
        } catch {
          /* noop */
        }
      }
      sitemap.localeBreakdown = locales;
      break;
    } catch {
      /* 다음 후보 */
    }
  }

  /* 3. 페이지 크롤 — 시작 페이지 + 사이트맵/내부링크 후보 */
  const pagesBlockedByRobots: string[] = [];
  const visited = new Set<string>();
  const queue: string[] = [start.href];

  const enqueue = (u: string) => {
    try {
      const parsed = new URL(u);
      if (parsed.origin !== origin) return;
      parsed.hash = "";
      const norm = parsed.href;
      if (visited.has(norm) || queue.includes(norm)) return;
      if (/\.(jpg|jpeg|png|gif|webp|avif|svg|pdf|zip|mp4|css|js|ico|xml)(\?|$)/i.test(parsed.pathname)) return;
      if (robots.disallowAll || isDisallowed(parsed.pathname, robots.disallowRules)) {
        if (!pagesBlockedByRobots.includes(norm) && pagesBlockedByRobots.length < 20)
          pagesBlockedByRobots.push(norm);
        return;
      }
      queue.push(norm);
    } catch {
      /* noop */
    }
  };

  // 사이트맵에서 다양한 경로 우선 수집 (언어 프리픽스 다양성 확보)
  const bySegment = new Map<string, string[]>();
  for (const u of sitemap.sampleUrls) {
    try {
      const seg = new URL(u).pathname.split("/").filter(Boolean)[0] || "(root)";
      const arr = bySegment.get(seg) || [];
      arr.push(u);
      bySegment.set(seg, arr);
    } catch {
      /* noop */
    }
  }
  for (const arr of bySegment.values()) enqueue(arr[0]);
  for (const u of sitemap.sampleUrls.slice(0, maxPages * 2)) enqueue(u);

  const pages: CrawledPage[] = [];
  // robots.txt가 시작 페이지 자체를 차단하는 경우도 기록하고 진행 (자기 사이트 진단 목적)
  if (robots.disallowAll || isDisallowed(start.pathname, robots.disallowRules)) {
    pagesBlockedByRobots.unshift(start.href);
  }

  while (queue.length > 0 && pages.length < maxPages) {
    const next = queue.shift()!;
    if (visited.has(next)) continue;
    visited.add(next);
    const page = await crawlPage(next);
    pages.push(page);
    if (pages.length < maxPages) {
      for (const l of page.links.filter((l) => l.internal).slice(0, 30)) enqueue(l.href);
    }
  }

  /* 4. 깨진 링크 샘플링 */
  const brokenLinks: BrokenLinkCheck = {
    checkedCount: 0,
    brokenCount: 0,
    broken: [],
    skipped: false,
  };
  const linkPool = new Map<string, string>(); // url -> foundOn
  for (const p of pages) {
    for (const l of p.links) {
      if (!linkPool.has(l.href) && l.href !== p.finalUrl) linkPool.set(l.href, p.finalUrl);
    }
  }
  const internalFirst = [...linkPool.entries()].sort((a, b) => {
    const ai = a[0].startsWith(origin) ? 0 : 1;
    const bi = b[0].startsWith(origin) ? 0 : 1;
    return ai - bi;
  });
  const sample = internalFirst.slice(0, BROKEN_LINK_SAMPLE);
  brokenLinks.skipped = internalFirst.length > sample.length;
  const results = await Promise.all(
    sample.map(async ([u, foundOn]) => ({ u, foundOn, status: await headStatus(u) })),
  );
  brokenLinks.checkedCount = results.length;
  for (const r of results) {
    if (r.status === null || r.status >= 400) {
      brokenLinks.brokenCount++;
      brokenLinks.broken.push({ url: r.u, status: r.status, foundOn: r.foundOn });
    }
  }

  const result: CrawlResult = {
    origin,
    startUrl: start.href,
    crawledAt: new Date().toISOString(),
    https: start.protocol === "https:",
    robotsTxt: robots,
    sitemap,
    pages,
    pagesAttempted: visited.size,
    pagesBlockedByRobots,
    brokenLinks,
    crawlLimitNote: `표본 크롤 ${pages.length}페이지 기준 (최대 ${maxPages}페이지 제한). 링크 검사는 ${brokenLinks.checkedCount}개 샘플링. 전체 사이트 수치와 다를 수 있습니다.`,
  };

  const okCount = pages.filter((p) => p.status === 200 && !p.error).length;
  if (pages.length === 0 || pages.every((p) => p.error || p.status === 0)) {
    result.error =
      pages[0]?.error ||
      "사이트에 접근할 수 없습니다. 방화벽/봇 차단 설정 또는 네트워크 정책을 확인해주세요.";
  } else if (okCount === 0) {
    // 모든 페이지가 4xx/5xx (봇 차단·인증·서버오류) — 점수를 산출하지 않고 사유를 명확히 표시
    const codes = [...new Set(pages.map((p) => p.status))].join(", ");
    const blocked = pages.some((p) => p.status === 403 || p.status === 401 || p.status === 429);
    result.error = blocked
      ? `사이트가 크롤러 접근을 차단했습니다 (HTTP ${codes}). 봇 차단(WAF/Cloudflare)·인증 필요·요청 제한 또는 실행 환경의 아웃바운드 네트워크 정책 때문일 수 있습니다. 측정 불가로 처리하며 임의 점수를 산출하지 않습니다.`
      : `분석 대상 페이지에서 정상(200) 응답을 받지 못했습니다 (HTTP ${codes}). 측정 불가로 처리합니다.`;
  }

  return NextResponse.json(result);
}
