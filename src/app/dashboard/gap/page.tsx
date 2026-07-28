"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAnalysis } from "@/components/dashboard/useAnalysis";
import { useCompetitorBenchmark } from "@/components/dashboard/benchmark";
import { EmptyState, Icon, PageHeader, StatusBadge } from "@/components/dashboard/ui";
import { CATEGORY_LABEL, DIFFICULTY_LABEL } from "@/lib/seo/types";

export default function GapPage() {
  const { activeSite, latestScan, competitors } = useDashboard();
  const a = useAnalysis();
  const bench = useCompetitorBenchmark(a.siteType);

  const gaps = useMemo(() => {
    return a.allChecks
      .map(({ result, spec }) => {
        if (result.score === null) return null;
        const bm = bench.benchmark(spec.id);
        if (bm.avg === null) return null;
        const deficit = bm.avg - result.score;
        if (deficit <= 2) return null; // 경쟁사 평균보다 낮은 항목만
        return { result, spec, bm, deficit, gain: a.gainFor(result) };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((x, y) => y.deficit - x.deficit);
  }, [a, bench]);

  const rivalsAnalyzed = bench.benchmarkedCount;

  if (!activeSite || !latestScan) {
    return (
      <>
        <PageHeader title="경쟁사 격차 분석" description="내 사이트가 경쟁사 평균보다 부족한 항목만 모아 보여줍니다." />
        <EmptyState icon="gap" title="분석 데이터가 필요합니다" description="내 사이트를 분석하세요." action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }

  if (rivalsAnalyzed === 0) {
    return (
      <>
        <PageHeader title="경쟁사 격차 분석" description="내 사이트가 경쟁사 평균보다 부족한 항목만 모아 보여줍니다." />
        <EmptyState
          icon="compare"
          title="비교할 경쟁사 데이터가 없습니다"
          description="경쟁사 분석에서 경쟁사를 등록하고 각 경쟁사의 '분석'을 실행하세요. 임의 수치로 비교하지 않으며, 실제 분석된 경쟁사만 기준이 됩니다."
          action={<Link href="/dashboard/competitors" className="d-btn d-btn-primary">경쟁사 등록·분석</Link>}
        />
      </>
    );
  }

  return (
    <div className="d-fade">
      <PageHeader
        title="경쟁사 격차 분석"
        description={`분석된 경쟁사 ${rivalsAnalyzed}개사 평균 대비, 내 사이트가 부족한 항목만 표시합니다. 부족 폭이 큰 순서입니다.`}
      />

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="부족 항목" value={`${gaps.length}건`} tone="fail" />
        <Tile label="비교 경쟁사" value={`${rivalsAnalyzed}개사`} tone="best" />
        <Tile label="경쟁사 종합 평균" value={bench.overallAvg !== null ? `${bench.overallAvg}점` : "—"} tone="good" />
        <Tile label="경쟁사 최고" value={bench.overallBest !== null ? `${bench.overallBest}점` : "—"} tone="best" />
      </div>

      {gaps.length === 0 ? (
        <div className="d-card px-5 py-12 text-center">
          <Icon name="check" size={26} className="mx-auto mb-2" style={{ color: "var(--d-mint)" }} />
          <p className="text-[15px] font-bold">경쟁사 평균보다 부족한 항목이 없습니다</p>
          <p className="mt-1 text-[13px]" style={{ color: "var(--d-text-mute)" }}>측정된 모든 항목에서 경쟁사 평균 이상입니다.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {gaps.map(({ result, spec, bm, deficit, gain }) => (
            <div key={spec.id} className="d-card d-card-hover st-fail overflow-hidden">
              <details className="d-detail">
                <summary className="flex items-center gap-3 p-4">
                  <span className="flex h-11 w-16 shrink-0 flex-col items-center justify-center rounded-xl" style={{ background: "var(--d-red-soft)" }}>
                    <span className="text-[15px] font-extrabold" style={{ color: "var(--d-red)" }}>-{Math.round(deficit)}</span>
                    <span className="text-[9px]" style={{ color: "var(--d-red)" }}>격차</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[14px] font-bold">{spec.label}</span>
                      <StatusBadge outcome={result.outcome} />
                      <span className="text-[11px]" style={{ color: "var(--d-text-mute)" }}>{CATEGORY_LABEL[spec.category]}</span>
                    </div>
                    <p className="mt-0.5 text-[12px]" style={{ color: "var(--d-text-soft)" }}>
                      내 사이트 <strong>{result.score}</strong> · 경쟁사 평균 <strong>{bm.avg}</strong> · 최고 <strong>{bm.best}</strong>{bm.bestName ? ` (${bm.bestName})` : ""}
                    </p>
                  </div>
                  {gain !== null && gain > 0 && <span className="hidden shrink-0 text-[13px] font-bold sm:block" style={{ color: "var(--d-mint)" }}>예상 +{gain}점</span>}
                  <Icon name="chevron" size={18} className="chev shrink-0" />
                </summary>
                <div className="border-t px-4 py-4" style={{ borderColor: "var(--d-border)" }}>
                  <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Mini label="내 사이트 수치" value={result.valueLabel} />
                    <Mini label="경쟁사 평균" value={`${bm.avg}점`} />
                    <Mini label="경쟁사 최고치" value={`${bm.best}점`} />
                    <Mini label="부족한 차이" value={`${Math.round(deficit)}점`} tone />
                  </div>

                  <Block title="원인 · 발견된 문제">
                    <ul className="space-y-1 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
                      {result.evidence.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  </Block>

                  <Block title="개선 방법">
                    <ul className="ml-4 list-disc space-y-1 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
                      {spec.fix.method.map((m, i) => <li key={i}>{m}</li>)}
                    </ul>
                  </Block>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px]" style={{ color: "var(--d-text-soft)" }}>
                    <span>예상 효과 <strong style={{ color: "var(--d-text)" }}>{spec.why.slice(0, 40)}…</strong></span>
                    <span>예상 점수 상승 <strong style={{ color: "var(--d-mint)" }}>{gain !== null && gain > 0 ? `+${gain}점` : "—"}</strong></span>
                    <span>구현 난이도 <strong style={{ color: "var(--d-text)" }}>{DIFFICULTY_LABEL[spec.fix.difficulty]}</strong></span>
                    <span>예상 작업시간 <strong style={{ color: "var(--d-text)" }}>{spec.fix.effort}</strong></span>
                    <span>AI 자동 생성 <strong style={{ color: spec.aiActions?.length ? "var(--d-mint)" : "var(--d-text-mute)" }}>{spec.aiActions?.length ? "가능" : "불가"}</strong></span>
                  </div>

                  <div className="mt-3 flex gap-2 border-t pt-3" style={{ borderColor: "var(--d-border)" }}>
                    <Link href="/dashboard/improvement" className="d-btn d-btn-primary d-btn-sm"><Icon name="build" size={14} /> 개선센터에서 실행</Link>
                    {result.affectedUrls.length > 0 && (
                      <a href={result.affectedUrls[0]} target="_blank" rel="noreferrer" className="d-btn d-btn-secondary d-btn-sm"><Icon name="external" size={14} /> 대상 URL</a>
                    )}
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-[11px]" style={{ color: "var(--d-text-mute)" }}>
        비교 대상: {competitors.filter((c) => c.type === a.siteType).map((c) => c.name).join(", ")} 중 분석 완료 {rivalsAnalyzed}개사.
      </p>
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`d-card st-${tone} p-4`} style={{ background: "var(--st-soft)" }}>
      <p className="text-[12px] font-semibold" style={{ color: "var(--d-text-soft)" }}>{label}</p>
      <p className="mt-1 text-[22px] font-extrabold" style={{ color: "var(--st)" }}>{value}</p>
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: boolean }) {
  return (
    <div className="rounded-xl p-2.5" style={{ background: tone ? "var(--d-red-soft)" : "var(--d-sky-softer)" }}>
      <p className="text-[10.5px] font-semibold" style={{ color: "var(--d-text-mute)" }}>{label}</p>
      <p className="mt-0.5 text-[13px] font-bold" style={{ color: tone ? "var(--d-red)" : "var(--d-text)" }}>{value}</p>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-[12px] font-bold">{title}</p>
      {children}
    </div>
  );
}
