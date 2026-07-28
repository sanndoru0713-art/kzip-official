/**
 * 점수 산정 엔진.
 * - 측정된 검사만 가중 평균에 포함 (측정 불가 항목은 0점 처리하지 않음)
 * - 사이트 유형별 카테고리 가중치 적용, 관리자가 변경 시 즉시 재계산
 * - 예상 점수 상승폭은 실제 산식에서 도출 (Δ전체 = 카테고리가중치 × 항목가중치비중 × (목표점수 − 현재점수))
 */

import { TECHNICAL_CHECKS } from "./checks/technical";
import { CONTENT_CHECKS } from "./checks/content";
import { GEO_CHECKS, MOBILE_CHECKS, SCHEMA_CHECKS } from "./checks/geo";
import { HOSPITAL_CHECKS, TOURISM_CHECKS } from "./checks/vertical";
import type { CheckSpec, EvalContext } from "./checks/helpers";
import type {
  CategoryId,
  CategoryScore,
  CategoryWeightMap,
  CheckResult,
  ScanScores,
  SiteType,
} from "./types";

export const ALL_CHECKS: CheckSpec[] = [
  ...TECHNICAL_CHECKS,
  ...CONTENT_CHECKS,
  ...GEO_CHECKS,
  ...SCHEMA_CHECKS,
  ...MOBILE_CHECKS,
  ...HOSPITAL_CHECKS,
  ...TOURISM_CHECKS,
];

export const CHECK_BY_ID: Map<string, CheckSpec> = new Map(ALL_CHECKS.map((c) => [c.id, c]));

/** 사이트 유형별 기본 가중치 (합 100) — 설정에서 변경 가능 */
export const DEFAULT_WEIGHTS: Record<SiteType, CategoryWeightMap> = {
  general: {
    content: 20,
    technical: 20,
    aeo: 15,
    geo: 15,
    trust: 10,
    schema: 10,
    mobile: 10,
  },
  hospital: {
    content: 14,
    technical: 14,
    aeo: 12,
    geo: 12,
    trust: 12,
    schema: 10,
    mobile: 8,
    hospital: 18,
  },
  tourism: {
    content: 14,
    technical: 14,
    aeo: 12,
    geo: 14,
    trust: 8,
    schema: 10,
    mobile: 8,
    tourism: 20,
  },
};

export function checksForType(siteType: SiteType): CheckSpec[] {
  return ALL_CHECKS.filter((c) => {
    if (c.category === "hospital") return siteType === "hospital";
    if (c.category === "tourism") return siteType === "tourism";
    if (c.siteTypes && !c.siteTypes.includes(siteType)) return false;
    return true;
  });
}

export function evaluateAll(ctx: EvalContext, siteType: SiteType): CheckResult[] {
  return checksForType(siteType).map((c) => {
    try {
      return c.evaluate(ctx);
    } catch (e) {
      return {
        checkId: c.id,
        score: null,
        outcome: "unmeasured" as const,
        valueLabel: "측정 불가",
        evidence: [],
        affectedUrls: [],
        unmeasuredReason: `평가 중 오류: ${e instanceof Error ? e.message : "알 수 없음"}`,
      };
    }
  });
}

export function computeCategoryScores(results: CheckResult[], siteType: SiteType): CategoryScore[] {
  const byCat = new Map<CategoryId, CheckResult[]>();
  for (const r of results) {
    const spec = CHECK_BY_ID.get(r.checkId);
    if (!spec) continue;
    byCat.set(spec.category, [...(byCat.get(spec.category) || []), r]);
  }
  const out: CategoryScore[] = [];
  for (const [category, rs] of byCat) {
    const measured = rs.filter((r) => r.score !== null);
    let score: number | null = null;
    if (measured.length > 0) {
      let wSum = 0;
      let acc = 0;
      for (const r of measured) {
        const w = CHECK_BY_ID.get(r.checkId)!.weight;
        wSum += w;
        acc += w * (r.score as number);
      }
      score = wSum > 0 ? Math.round(acc / wSum) : null;
    }
    out.push({
      category,
      score,
      measuredCount: measured.length,
      totalCount: rs.length,
      statusCounts: {
        fail: rs.filter((r) => r.outcome === "fail").length,
        good: rs.filter((r) => r.outcome === "good").length,
        best: rs.filter((r) => r.outcome === "best").length,
        unmeasured: rs.filter((r) => r.outcome === "unmeasured" || r.outcome === "not-connected").length,
      },
    });
  }
  void siteType;
  return out;
}

export function computeScores(
  results: CheckResult[],
  siteType: SiteType,
  weights?: CategoryWeightMap,
): ScanScores {
  const w = { ...DEFAULT_WEIGHTS[siteType], ...(weights || {}) };
  const categories = computeCategoryScores(results, siteType);
  let acc = 0;
  let wSum = 0;
  for (const cat of categories) {
    const cw = w[cat.category] ?? 0;
    if (cat.score !== null && cw > 0) {
      acc += cw * cat.score;
      wSum += cw;
    }
  }
  const overall = wSum > 0 ? Math.round(acc / wSum) : null;
  return {
    overall,
    categories,
    checks: results,
    appliedWeights: Object.fromEntries(Object.entries(w).map(([k, v]) => [k, v ?? 0])),
  };
}

/**
 * 특정 검사 항목을 목표 점수(최적 하한)까지 올렸을 때의 전체 점수 상승폭.
 * 실제 가중 평균 산식에서 도출한 값이며 임의 추정이 아님.
 */
export function expectedGain(
  result: CheckResult,
  scores: ScanScores,
  siteType: SiteType,
  weights?: CategoryWeightMap,
): number | null {
  if (result.score === null) return null;
  const spec = CHECK_BY_ID.get(result.checkId);
  if (!spec) return null;
  const w = { ...DEFAULT_WEIGHTS[siteType], ...(weights || {}) };
  const cw = w[spec.category] ?? 0;
  if (cw === 0) return null;

  const cat = scores.categories.find((c) => c.category === spec.category);
  if (!cat || cat.score === null) return null;

  // 카테고리 내 측정 항목 가중치 합
  const measuredInCat = scores.checks.filter(
    (r) => r.score !== null && CHECK_BY_ID.get(r.checkId)?.category === spec.category,
  );
  const catWeightSum = measuredInCat.reduce((a, r) => a + (CHECK_BY_ID.get(r.checkId)?.weight || 0), 0);
  if (catWeightSum === 0) return null;

  // 전체 가중치 합 (측정된 카테고리만)
  const totalW = scores.categories.reduce((a, c) => a + (c.score !== null ? (w[c.category] ?? 0) : 0), 0);
  if (totalW === 0) return null;

  const target = Math.max(spec.thresholds.best, result.score);
  const deltaCheck = target - result.score;
  const deltaCat = (spec.weight / catWeightSum) * deltaCheck;
  const deltaOverall = (cw / totalW) * deltaCat;
  return Math.round(deltaOverall * 10) / 10;
}

/** 전체 예상 개선 가능 점수 (미달·양호 항목을 모두 최적으로 올렸을 때) */
export function totalPotentialGain(
  scores: ScanScores,
  siteType: SiteType,
  weights?: CategoryWeightMap,
): number | null {
  if (scores.overall === null) return null;
  let sum = 0;
  for (const r of scores.checks) {
    if (r.outcome === "fail" || r.outcome === "good") {
      const g = expectedGain(r, scores, siteType, weights);
      if (g) sum += g;
    }
  }
  return Math.round(sum * 10) / 10;
}

const DIFFICULTY_ORDER = { low: 0, medium: 1, high: 2 } as const;

export interface PriorityItem {
  result: CheckResult;
  spec: CheckSpec;
  gain: number | null;
  rank: number;
}

/** 실행 우선순위: 예상 상승폭 ÷ 난이도 계수로 정렬 */
export function prioritize(
  scores: ScanScores,
  siteType: SiteType,
  weights?: CategoryWeightMap,
): PriorityItem[] {
  const items = scores.checks
    .filter((r) => r.outcome === "fail" || r.outcome === "good")
    .map((r) => {
      const spec = CHECK_BY_ID.get(r.checkId)!;
      const gain = expectedGain(r, scores, siteType, weights);
      return { result: r, spec, gain, rank: 0 };
    })
    .filter((i) => i.spec);
  items.sort((a, b) => {
    const ga = (a.gain ?? 0) / (1 + DIFFICULTY_ORDER[a.spec.fix.difficulty] * 0.5);
    const gb = (b.gain ?? 0) / (1 + DIFFICULTY_ORDER[b.spec.fix.difficulty] * 0.5);
    if (gb !== ga) return gb - ga;
    return (a.result.score ?? 100) - (b.result.score ?? 100);
  });
  items.forEach((i, idx) => (i.rank = idx + 1));
  return items;
}
