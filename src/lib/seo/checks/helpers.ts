/**
 * 검사 평가 공용 헬퍼.
 * 원칙: 측정 불가 → score:null + 사유. 임의 점수 생성 금지.
 */

import type {
  CheckDefinition,
  CheckOutcome,
  CheckResult,
  CrawledPage,
  CrawlResult,
  PsiMetrics,
} from "../types";

export interface EvalContext {
  crawl: CrawlResult;
  psi?: PsiMetrics | null;
}

export interface CheckSpec extends CheckDefinition {
  evaluate: (ctx: EvalContext) => CheckResult;
}

/** 정상 응답(200 + HTML) 페이지만 */
export function okPages(crawl: CrawlResult): CrawledPage[] {
  return crawl.pages.filter((p) => p.status === 200 && !p.error && p.title !== null);
}

export function pct(n: number, d: number): number {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

export function outcomeFromScore(def: CheckDefinition, score: number): CheckOutcome {
  if (score >= def.thresholds.best) return "best";
  if (score >= def.thresholds.good) return "good";
  return "fail";
}

export function measured(
  def: CheckDefinition,
  score: number,
  valueLabel: string,
  evidence: string[],
  affectedUrls: string[] = [],
): CheckResult {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return {
    checkId: def.id,
    score: s,
    outcome: outcomeFromScore(def, s),
    valueLabel,
    evidence,
    affectedUrls: affectedUrls.slice(0, 30),
  };
}

export function unmeasured(def: CheckDefinition, reason: string): CheckResult {
  return {
    checkId: def.id,
    score: null,
    outcome: "unmeasured",
    valueLabel: "측정 불가",
    evidence: [],
    affectedUrls: [],
    unmeasuredReason: reason,
  };
}

export function notConnected(def: CheckDefinition, reason: string): CheckResult {
  return {
    checkId: def.id,
    score: null,
    outcome: "not-connected",
    valueLabel: "데이터 미연결",
    evidence: [],
    affectedUrls: [],
    unmeasuredReason: reason,
  };
}

/** 페이지 비율 기반 검사 (통과 페이지 % = 점수) */
export function ratioCheck(
  def: CheckDefinition,
  ctx: EvalContext,
  test: (p: CrawledPage) => boolean,
  passLabel: string,
  failNote: (p: CrawledPage) => string,
): CheckResult {
  const pages = okPages(ctx.crawl);
  if (pages.length === 0) return unmeasured(def, "정상 응답(200) 페이지가 없어 측정할 수 없습니다.");
  const passing = pages.filter(test);
  const failing = pages.filter((p) => !test(p));
  const score = pct(passing.length, pages.length);
  const evidence = [
    `크롤한 ${pages.length}페이지 중 ${passing.length}페이지 ${passLabel} (${score}%)`,
    ...failing.slice(0, 5).map((p) => `✗ ${shortUrl(p.finalUrl)} — ${failNote(p)}`),
  ];
  return measured(def, score, `${score}%`, evidence, failing.map((p) => p.finalUrl));
}

/** 이진 검사 (충족 100 / 미충족 0) */
export function binaryCheck(
  def: CheckDefinition,
  passed: boolean,
  valueLabel: string,
  evidence: string[],
  affectedUrls: string[] = [],
): CheckResult {
  return measured(def, passed ? 100 : 0, valueLabel, evidence, affectedUrls);
}

export function shortUrl(u: string): string {
  try {
    const url = new URL(u);
    const p = url.pathname + url.search;
    return p.length > 1 ? (p.length > 60 ? p.slice(0, 57) + "…" : p) : url.hostname;
  } catch {
    return u.slice(0, 60);
  }
}

/**
 * 구간 선형 점수 매핑 (낮을수록 좋은 지표용).
 * value ≤ bestMax → 90~100, value ≤ goodMax → 70~89, 이후 failFloor 까지 선형 감소.
 */
export function bandScore(value: number, bestMax: number, goodMax: number, worst: number): number {
  if (value <= bestMax) {
    return Math.round(100 - (value / bestMax) * 10); // 90~100
  }
  if (value <= goodMax) {
    return Math.round(89 - ((value - bestMax) / (goodMax - bestMax)) * 19); // 70~89
  }
  if (value >= worst) return 0;
  return Math.round(69 - ((value - goodMax) / (worst - goodMax)) * 69); // 0~69
}

/** JSON-LD 에서 특정 @type 노드 수집 (중첩 포함) */
export function findSchemaNodes(crawl: CrawlResult, types: string[]): {
  page: CrawledPage;
  node: Record<string, unknown>;
  type: string;
}[] {
  const found: { page: CrawledPage; node: Record<string, unknown>; type: string }[] = [];
  const wanted = new Set(types.map((t) => t.toLowerCase()));
  const walk = (node: unknown, page: CrawledPage) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((n) => walk(n, page));
      return;
    }
    const obj = node as Record<string, unknown>;
    const t = obj["@type"];
    const typeList = typeof t === "string" ? [t] : Array.isArray(t) ? t.filter((x): x is string => typeof x === "string") : [];
    for (const tt of typeList) {
      if (wanted.has(tt.toLowerCase())) {
        found.push({ page, node: obj, type: tt });
        break;
      }
    }
    for (const v of Object.values(obj)) walk(v, page);
  };
  for (const page of okPages(crawl)) {
    for (const block of page.jsonLd) {
      if (block.parsed) walk(block.parsed, page);
    }
  }
  return found;
}

export function schemaTypesPresent(crawl: CrawlResult): Set<string> {
  const s = new Set<string>();
  for (const p of okPages(crawl)) for (const b of p.jsonLd) for (const t of b.types) s.add(t);
  return s;
}

/** 본문에서 파싱된 가장 최근 날짜 (yyyy-mm-dd) — 미래 날짜 제외 */
export function latestVisibleDate(crawl: CrawlResult): { date: Date; source: string } | null {
  let latest: { date: Date; source: string } | null = null;
  const now = Date.now();
  for (const p of okPages(crawl)) {
    // JSON-LD 날짜 우선
    for (const b of p.jsonLd) {
      if (!b.parsed) continue;
      const json = JSON.stringify(b.parsed);
      const re = /"(datePublished|dateModified)"\s*:\s*"(\d{4}-\d{2}-\d{2})/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(json))) {
        const d = new Date(m[2]);
        if (!isNaN(d.getTime()) && d.getTime() <= now && (!latest || d > latest.date)) {
          latest = { date: d, source: `${shortUrl(p.finalUrl)} — JSON-LD ${m[1]}: ${m[2]}` };
        }
      }
    }
    for (const s of p.patterns.visibleDates.samples) {
      const m = s.match(/(20\d{2})[.\-/년]\s?(\d{1,2})[.\-/월]\s?(\d{1,2})/);
      if (m) {
        const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
        if (!isNaN(d.getTime()) && d.getTime() <= now && (!latest || d > latest.date)) {
          latest = { date: d, source: `${shortUrl(p.finalUrl)} — 본문 표기: ${m[0]}` };
        }
      }
    }
  }
  return latest;
}

/** 브랜드명 추정 — og:site_name > title 공통 접미어 */
export function detectBrand(crawl: CrawlResult): string | null {
  const pages = okPages(crawl);
  for (const p of pages) {
    const sn = p.ogTags["og:site_name"];
    if (sn) return sn.trim();
  }
  const titles = pages.map((p) => p.title || "").filter(Boolean);
  if (titles.length < 2) return null;
  const parts = titles.map((t) => t.split(/[|\-–—:·]/).map((s) => s.trim()).filter(Boolean));
  const last = parts.map((p) => p[p.length - 1]).filter(Boolean);
  const freq = new Map<string, number>();
  for (const l of last) freq.set(l, (freq.get(l) || 0) + 1);
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1])[0];
  return top && top[1] >= Math.max(2, titles.length / 2) ? top[0] : null;
}
