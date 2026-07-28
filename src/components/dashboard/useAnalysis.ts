"use client";

import { useMemo } from "react";
import { useDashboard } from "./DashboardProvider";
import {
  checksForType,
  computeScores,
  expectedGain,
  prioritize,
  totalPotentialGain,
  CHECK_BY_ID,
} from "@/lib/seo/scoring";
import type { CategoryId, CheckResult, Scan, ScanScores, SiteType } from "@/lib/seo/types";
import type { EvalContext, CheckSpec } from "@/lib/seo/checks/helpers";
import { evaluateAll } from "@/lib/seo/scoring";

export interface AnalysisData {
  scan: Scan | null;
  prevScan: Scan | null;
  scores: ScanScores | null;
  prevScores: ScanScores | null;
  siteType: SiteType;
  categoryScore: (c: CategoryId) => number | null;
  prevCategoryScore: (c: CategoryId) => number | null;
  checksByCategory: (c: CategoryId) => { result: CheckResult; spec: CheckSpec }[];
  allChecks: { result: CheckResult; spec: CheckSpec }[];
  gainFor: (r: CheckResult) => number | null;
  potentialGain: number | null;
  priority: ReturnType<typeof prioritize>;
}

function scoresFrom(scan: Scan | null, siteType: SiteType, weights?: ScanScores["appliedWeights"]): ScanScores | null {
  if (!scan) return null;
  const ctx: EvalContext = { crawl: scan.crawl, psi: scan.psi };
  const results = evaluateAll(ctx, siteType);
  return computeScores(results, siteType, weights as never);
}

export function useAnalysis(overrideType?: SiteType): AnalysisData {
  const { activeSite, latestScan, prevScan, settings } = useDashboard();
  const siteType = overrideType || activeSite?.type || "general";
  const weights = settings.weights?.[siteType];

  return useMemo(() => {
    const scores = scoresFrom(latestScan, siteType, weights as never);
    const prevScores = scoresFrom(prevScan, siteType, weights as never);

    const specFor = (r: CheckResult) => CHECK_BY_ID.get(r.checkId)!;
    const allChecks = (scores?.checks || [])
      .map((result) => ({ result, spec: specFor(result) }))
      .filter((x) => x.spec);

    const categoryScore = (c: CategoryId) => scores?.categories.find((x) => x.category === c)?.score ?? null;
    const prevCategoryScore = (c: CategoryId) => prevScores?.categories.find((x) => x.category === c)?.score ?? null;

    const checksByCategory = (c: CategoryId) => allChecks.filter((x) => x.spec.category === c);

    const gainFor = (r: CheckResult) => (scores ? expectedGain(r, scores, siteType, weights as never) : null);
    const potentialGain = scores ? totalPotentialGain(scores, siteType, weights as never) : null;
    const priority = scores ? prioritize(scores, siteType, weights as never) : [];

    void checksForType;
    return {
      scan: latestScan,
      prevScan,
      scores,
      prevScores,
      siteType,
      categoryScore,
      prevCategoryScore,
      checksByCategory,
      allChecks,
      gainFor,
      potentialGain,
      priority,
    };
  }, [latestScan, prevScan, siteType, weights]);
}
