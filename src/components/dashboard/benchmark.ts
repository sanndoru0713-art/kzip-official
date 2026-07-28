"use client";

import { useMemo } from "react";
import { useDashboard } from "./DashboardProvider";
import { evaluateAll, computeScores } from "@/lib/seo/scoring";
import type { CheckResult, SiteType } from "@/lib/seo/types";

export interface CheckBenchmark {
  avg: number | null;
  best: number | null;
  count: number; // 비교에 사용된 경쟁사 수
  bestName: string | null;
}

/** 동일 유형 경쟁사들의 최신 스캔에서 각 checkId 별 평균·최고 점수를 산출 */
export function useCompetitorBenchmark(siteType: SiteType) {
  const { competitors, getScansFor, settings } = useDashboard();

  return useMemo(() => {
    const rivals = competitors.filter((c) => c.type === siteType);
    const perCheck = new Map<string, { scores: { name: string; score: number }[] }>();

    for (const c of rivals) {
      const scans = getScansFor(c.id);
      const latest = scans[scans.length - 1];
      if (!latest) continue;
      const results = evaluateAll({ crawl: latest.crawl, psi: latest.psi }, siteType);
      for (const r of results) {
        if (r.score === null) continue;
        const entry = perCheck.get(r.checkId) || { scores: [] };
        entry.scores.push({ name: c.name, score: r.score });
        perCheck.set(r.checkId, entry);
      }
    }

    const benchmark = (checkId: string): CheckBenchmark => {
      const entry = perCheck.get(checkId);
      if (!entry || entry.scores.length === 0) return { avg: null, best: null, count: 0, bestName: null };
      const avg = Math.round(entry.scores.reduce((a, s) => a + s.score, 0) / entry.scores.length);
      const top = entry.scores.reduce((a, s) => (s.score > a.score ? s : a));
      return { avg, best: top.score, count: entry.scores.length, bestName: top.name };
    };

    // 경쟁사 종합점수 평균 (순위 계산용)
    const overalls = rivals
      .map((c) => {
        const scans = getScansFor(c.id);
        const latest = scans[scans.length - 1];
        if (!latest) return null;
        const results = evaluateAll({ crawl: latest.crawl, psi: latest.psi }, siteType);
        const s = computeScores(results, siteType, settings.weights?.[siteType] as never);
        return s.overall === null ? null : { name: c.name, overall: s.overall };
      })
      .filter((x): x is { name: string; overall: number } => !!x);

    return {
      benchmark,
      rivalCount: rivals.length,
      benchmarkedCount: overalls.length,
      overalls,
      overallAvg: overalls.length ? Math.round(overalls.reduce((a, o) => a + o.overall, 0) / overalls.length) : null,
      overallBest: overalls.length ? Math.max(...overalls.map((o) => o.overall)) : null,
    };
  }, [competitors, getScansFor, settings.weights, siteType]);
}

export function rankAmong(mine: number | null, rivalOveralls: { overall: number }[]): { rank: number; total: number } | null {
  if (mine === null) return null;
  const all = [...rivalOveralls.map((r) => r.overall), mine].sort((a, b) => b - a);
  const rank = all.indexOf(mine) + 1;
  return { rank, total: all.length };
}

export function checkResultById(results: CheckResult[], id: string): CheckResult | undefined {
  return results.find((r) => r.checkId === id);
}
