/**
 * 서버측 HTML 파서 — 외부 의존성 없이 SEO 신호를 추출한다.
 * 실제 응답 HTML에서 추출한 값만 반환하며, 찾지 못한 값은 null 로 둔다.
 */

import type {
  CrawledHreflang,
  CrawledImage,
  CrawledLink,
  JsonLdBlock,
  PagePatternSignals,
  PatternHit,
} from "./types";

/* ───────── 기본 유틸 ───────── */

const decodeEntities = (s: string): string =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");

const collapse = (s: string): string => decodeEntities(s).replace(/\s+/g, " ").trim();

/** 태그 내부 속성 값 추출 (단일 태그 문자열 대상) */
export function attr(tag: string, name: string): string | null {
  const m =
    tag.match(new RegExp(`${name}\\s*=\\s*"([^"]*)"`, "i")) ||
    tag.match(new RegExp(`${name}\\s*=\\s*'([^']*)'`, "i")) ||
    tag.match(new RegExp(`${name}\\s*=\\s*([^\\s"'>]+)`, "i"));
  return m ? decodeEntities(m[1]).trim() : null;
}

/** 속성 존재 여부 (값 없는 boolean 속성 포함) */
function hasAttr(tag: string, name: string): boolean {
  return new RegExp(`[\\s"']${name}(\\s*=|[\\s/>])`, "i").test(tag);
}

function stripBlocks(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

/** 본문 텍스트 (태그 제거) */
export function extractText(html: string): string {
  return collapse(stripBlocks(html).replace(/<[^>]+>/g, " "));
}

/* ───────── head 요소 ───────── */

export function extractTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? collapse(m[1]) || null : null;
}

export function extractMeta(html: string, name: string): string | null {
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metas) {
    const n = attr(tag, "name") || attr(tag, "http-equiv");
    if (n && n.toLowerCase() === name.toLowerCase()) {
      const c = attr(tag, "content");
      if (c !== null) return c;
    }
  }
  return null;
}

export function extractMetaProperties(html: string, prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metas) {
    const p = attr(tag, "property") || attr(tag, "name");
    const c = attr(tag, "content");
    if (p && c && p.toLowerCase().startsWith(prefix)) out[p.toLowerCase()] = c;
  }
  return out;
}

export function extractCharset(html: string): string | null {
  const m = html.match(/<meta[^>]+charset\s*=\s*["']?([\w-]+)/i);
  return m ? m[1] : null;
}

export function extractLangAttr(html: string): string | null {
  const m = html.match(/<html\b[^>]*>/i);
  return m ? attr(m[0], "lang") : null;
}

export function extractLinkRel(html: string, rel: string): string[] {
  const out: string[] = [];
  const links = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of links) {
    const r = attr(tag, "rel");
    if (r && r.toLowerCase().split(/\s+/).includes(rel.toLowerCase())) {
      const href = attr(tag, "href");
      if (href) out.push(href);
    }
  }
  return out;
}

export function extractHreflang(html: string): CrawledHreflang[] {
  const out: CrawledHreflang[] = [];
  const links = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of links) {
    const rel = attr(tag, "rel");
    if (rel && rel.toLowerCase() === "alternate") {
      const lang = attr(tag, "hreflang");
      const href = attr(tag, "href");
      if (lang && href) out.push({ lang, href });
    }
  }
  return out;
}

/* ───────── 구조 요소 ───────── */

export function extractHeadings(html: string, level: 1 | 2 | 3): string[] {
  const re = new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const body = stripBlocks(html);
  while ((m = re.exec(body))) {
    const t = collapse(m[1].replace(/<[^>]+>/g, " "));
    if (t) out.push(t);
  }
  return out;
}

export function extractImages(html: string): CrawledImage[] {
  const out: CrawledImage[] = [];
  const imgs = stripBlocks(html).match(/<img\b[^>]*>/gi) || [];
  for (const tag of imgs) {
    const src = attr(tag, "src") || attr(tag, "data-src");
    if (!src || src.startsWith("data:")) continue;
    out.push({ src, alt: hasAttr(tag, "alt") ? (attr(tag, "alt") ?? "") : null });
  }
  return out;
}

export function extractLinks(html: string, baseUrl: string): CrawledLink[] {
  const out: CrawledLink[] = [];
  const base = new URL(baseUrl);
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  const body = stripBlocks(html);
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) && out.length < 800) {
    const tag = `<a ${m[1]}>`;
    const href = attr(tag, "href");
    if (!href || href.startsWith("#") || /^(javascript|mailto|tel|sms):/i.test(href)) continue;
    let abs: URL;
    try {
      abs = new URL(href, base);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(abs.protocol)) continue;
    const relAttr = (attr(tag, "rel") || "").toLowerCase();
    out.push({
      href: abs.href,
      text: collapse(m[2].replace(/<[^>]+>/g, " ")).slice(0, 120),
      internal: abs.hostname === base.hostname,
      nofollow: relAttr.includes("nofollow"),
    });
  }
  return out;
}

/* ───────── JSON-LD ───────── */

function collectTypes(node: unknown, acc: Set<string>): void {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((n) => collectTypes(n, acc));
    return;
  }
  const obj = node as Record<string, unknown>;
  const t = obj["@type"];
  if (typeof t === "string") acc.add(t);
  if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && acc.add(x));
  for (const v of Object.values(obj)) collectTypes(v, acc);
}

export function extractJsonLd(html: string): JsonLdBlock[] {
  const out: JsonLdBlock[] = [];
  const re = /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < 30) {
    const raw = m[1].trim();
    let parsed: unknown | null = null;
    let parseError: string | null = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      parseError = e instanceof Error ? e.message : "JSON 파싱 오류";
    }
    const types = new Set<string>();
    if (parsed) collectTypes(parsed, types);
    out.push({ raw: raw.slice(0, 20000), parsed, parseError, types: [...types] });
  }
  return out;
}

/* ───────── 본문 단락 ───────── */

export function extractParagraphs(html: string): string[] {
  const out: string[] = [];
  const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  const body = stripBlocks(html);
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) && out.length < 200) {
    const t = collapse(m[1].replace(/<[^>]+>/g, " "));
    if (t.length >= 10) out.push(t);
  }
  return out;
}

/* ───────── 콘텐츠 패턴 검출 ─────────
 * 각 패턴은 실제 매칭 문자열을 samples 로 보존해 근거로 제시한다. */

function findPattern(text: string, regexps: RegExp[], contextLen = 60): PatternHit {
  const samples: string[] = [];
  let count = 0;
  for (const re of regexps) {
    const global = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = global.exec(text)) && guard++ < 500) {
      count++;
      if (samples.length < 5) {
        const start = Math.max(0, m.index - 10);
        samples.push(text.slice(start, m.index + Math.max(m[0].length, contextLen)).trim());
      }
      if (m.index === global.lastIndex) global.lastIndex++;
    }
  }
  return { matched: count > 0, samples, count };
}

const QUESTION_HEADING_RE = [
  /[?？]$/,
  /^(무엇|왜|어떻게|언제|어디|누가|얼마|몇)/,
  /(무엇인가요|인가요|하나요|할까요|될까요|있나요|어떻게|방법은)/,
  /(とは|ですか|でしょうか|方法|なぜ|どこ|いつ)/,
  /^(what|why|how|when|where|which|who|can|does|is|are)\b/i,
];

export function detectQuestionHeadings(headings: string[]): PatternHit {
  const samples: string[] = [];
  let count = 0;
  for (const h of headings) {
    if (QUESTION_HEADING_RE.some((re) => re.test(h.trim()))) {
      count++;
      if (samples.length < 5) samples.push(h);
    }
  }
  return { matched: count > 0, samples, count };
}

export function detectPatterns(
  html: string,
  text: string,
  links: CrawledLink[],
  headings: string[],
): PagePatternSignals {
  const telLinks = (html.match(/href\s*=\s*["']tel:[^"']+/gi) || []).map((s) =>
    s.replace(/href\s*=\s*["']/i, ""),
  );
  const mapLinks = links.filter((l) =>
    /(google\.[a-z.]+\/maps|maps\.app\.goo\.gl|map\.naver|map\.kakao)/i.test(l.href),
  );
  const iframeMaps = html.match(/<iframe[^>]+(google\.[a-z.]+\/maps|map\.naver|map\.kakao)[^>]*>/gi) || [];

  const authorityDomains =
    /(\.go\.kr|\.or\.kr|\.gov|\.edu|wikipedia\.org|who\.int|visitkorea|korea\.kr|mohw\.go\.kr|kto\.visitkorea)/i;
  const externalAuthority = links.filter((l) => !l.internal && authorityDomains.test(l.href));

  return {
    questionHeadings: detectQuestionHeadings(headings),
    faqSection: findPattern(text, [
      /(자주\s*묻는\s*질문|FAQ|Q&A|Q＆A|よくある質問|자주하는\s*질문)/gi,
    ]),
    price: findPattern(text, [
      /\d[\d,.]*\s*(원|만원|円|ウォン|₩|KRW|JPY|USD)/g,
      /[₩¥$]\s?\d[\d,.]*/g,
      /(가격|비용|요금|料金|価格|費用)\s*[:：]?\s*\d/g,
    ]),
    businessHours: findPattern(text, [
      /(영업시간|진료시간|운영시간|営業時間|診療時間|open|hours)\s*[:：]?/gi,
      /\d{1,2}\s*[:시]\s*\d{0,2}\s*[~〜–-]\s*\d{1,2}\s*[:시]?\d{0,2}/g,
      /(월|화|수|목|금|토|일|평일|주말|공휴일)\s*[~〜–-]?\s*(요일)?\s*\d{1,2}[:시]/g,
    ]),
    address: findPattern(text, [
      /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)[특별자치광역시도]*\s*\S+[시군구]\s*\S+[로길동가]/g,
      /(주소|所在地|住所|address)\s*[:：]/gi,
      /\b\d{5}\b\s*(서울|부산|경기)/g,
    ]),
    transport: findPattern(text, [
      /(지하철|호선|역에서|도보\s*\d+분|버스|정류장|地下鉄|駅から|徒歩|バス|공항에서|터미널)/g,
    ]),
    reservation: findPattern(text, [/(예약|상담\s*신청|booking|reserve|予約|問い合わせ|문의하기)/gi]),
    phone: {
      matched: telLinks.length > 0 || /(0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4})/.test(text),
      samples: telLinks.slice(0, 5),
      count: telLinks.length,
    },
    authorInfo: findPattern(text, [
      /(작성자|글쓴이|저자|감수|監修|執筆|written by|author|by\s+[A-Z][a-z]+)/g,
      /(원장|대표원장|전문의)\s*[가-힣]{2,4}/g,
    ]),
    visibleDates: findPattern(text, [
      /(20\d{2})[.\-/년]\s?(\d{1,2})[.\-/월]\s?(\d{1,2})/g,
      /(게시일|작성일|수정일|업데이트|최종\s*확인|更新日|公開日)/g,
    ]),
    statistics: findPattern(text, [
      /\d[\d,.]*\s*[%％]/g,
      /(통계|조사에\s*따르면|연구에\s*따르면|기준|출처)\s*[:：]?/g,
      /\d[\d,.]*\s*(명|건|회|개소|호|人|件)/g,
    ]),
    steps: findPattern(text, [
      /(1단계|2단계|STEP\s*\d|Step\s*\d|첫\s*번째|두\s*번째|순서|절차|手順|ステップ)/gi,
    ]),
    mapEmbed: {
      matched: mapLinks.length > 0 || iframeMaps.length > 0,
      samples: [...mapLinks.map((l) => l.href), ...iframeMaps.map(() => "지도 iframe 임베드")].slice(0, 5),
      count: mapLinks.length + iframeMaps.length,
    },
    medicalRiskExpressions: findPattern(text, [
      /(100\s*[%％]|완치|부작용\s*(이|가)?\s*없|전혀\s*아프지|무통증|최고의|국내\s*1위|세계\s*최초|유일한|보장합니다|확실한\s*효과|영구적)/g,
    ]),
    medicalStaff: findPattern(text, [
      /(의료진|원장|대표원장|전문의|약력|경력|학회|논문|자격|専門医|院長|医師)/g,
    ]),
    sideEffects: findPattern(text, [
      /(부작용|주의사항|주의\s*사항|회복\s*기간|유의사항|副作用|注意事項|リスク|다운타임)/g,
    ]),
    seasonal: findPattern(text, [
      /(봄|여름|가을|겨울|벚꽃|단풍|축제|페스티벌|이벤트|행사|시즌|春|夏|秋|冬|桜|紅葉|祭り|フェス)/g,
    ]),
    admission: findPattern(text, [
      /(입장료|입장권|관람료|이용료|무료\s*입장|入場料|観覧料|チケット|ticket)/gi,
    ]),
    externalCitations: {
      matched: externalAuthority.length > 0,
      samples: externalAuthority.slice(0, 5).map((l) => l.href),
      count: externalAuthority.length,
    },
  };
}

/* ───────── robots.txt 파서 ───────── */

export function parseRobotsTxt(raw: string): {
  sitemaps: string[];
  disallowAll: boolean;
  disallowRules: string[];
} {
  const sitemaps: string[] = [];
  const disallowRules: string[] = [];
  let inStarGroup = false;
  let sawAnyGroup = false;
  for (const lineRaw of raw.split(/\r?\n/)) {
    const line = lineRaw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const [keyRaw, ...rest] = line.split(":");
    const key = keyRaw.trim().toLowerCase();
    const value = rest.join(":").trim();
    if (key === "sitemap" && value) sitemaps.push(value);
    if (key === "user-agent") {
      inStarGroup = value === "*";
      if (inStarGroup) sawAnyGroup = true;
    }
    if (key === "disallow" && inStarGroup && value) disallowRules.push(value);
  }
  void sawAnyGroup;
  return { sitemaps, disallowAll: disallowRules.includes("/"), disallowRules };
}

/** robots.txt Disallow 규칙에 걸리는지 (User-agent: * 기준, 접두사 매칭) */
export function isDisallowed(pathname: string, disallowRules: string[]): boolean {
  return disallowRules.some((rule) => {
    if (!rule) return false;
    if (rule.includes("*")) {
      const re = new RegExp(
        "^" + rule.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*"),
      );
      return re.test(pathname);
    }
    return pathname.startsWith(rule);
  });
}

/* ───────── sitemap 파서 ───────── */

export function parseSitemap(xml: string): { isIndex: boolean; urls: string[] } {
  const isIndex = /<sitemapindex/i.test(xml);
  const tag = isIndex ? "sitemap" : "url";
  const urls: string[] = [];
  const re = new RegExp(`<${tag}>[\\s\\S]*?<loc>\\s*([^<]+?)\\s*</loc>[\\s\\S]*?</${tag}>`, "gi");
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) && urls.length < 5000) urls.push(decodeEntities(m[1].trim()));
  if (urls.length === 0) {
    // loc 만 있는 단순 형식 대응
    const re2 = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
    while ((m = re2.exec(xml)) && urls.length < 5000) urls.push(decodeEntities(m[1].trim()));
  }
  return { isIndex, urls };
}
