"use client";

import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAnalysis } from "@/components/dashboard/useAnalysis";
import { useCompetitorBenchmark, rankAmong } from "@/components/dashboard/benchmark";
import { DeltaChip, EmptyState, Icon, ScoreRing, StatusBadge, formatDateTime, outcomeFromNumber } from "@/components/dashboard/ui";
import type { CategoryId } from "@/lib/seo/types";
import { CATEGORY_LABEL, SITE_TYPE_LABEL } from "@/lib/seo/types";

interface KpiDef {
  key: string;
  label: string;
  category?: CategoryId;
  compute?: "overall" | "cwv";
  hint?: string;
}

const KPIS: KpiDef[] = [
  { key: "overall", label: "종합 검색 경쟁력", compute: "overall" },
  { key: "technical", label: "기술 SEO", category: "technical" },
  { key: "content", label: "콘텐츠 품질", category: "content" },
  { key: "aeo", label: "AEO", category: "aeo" },
  { key: "geo", label: "GEO·AI 대응", category: "geo" },
  { key: "trust", label: "신뢰도·최신성", category: "trust" },
  { key: "schema", label: "구조화데이터", category: "schema" },
  { key: "mobile", label: "모바일·속도", category: "mobile" },
];

export default function DashboardHome() {
  const { activeSite, latestScan, prevScan, scanning, runScan } = useDashboard();
  const a = useAnalysis();
  const bench = useCompetitorBenchmark(a.siteType);

  if (!activeSite) {
    return (
      <>
        <Hero />
        <EmptyState
          icon="web"
          title="분석할 사이트를 등록하세요"
          description="K:ZIP, 병원, 관광 등 사이트를 등록하고 유형을 선택하면 해당 유형 기준으로 SEO·AEO·GEO를 실측 분석합니다."
          action={
            <Link href="/dashboard/sites" className="d-btn d-btn-primary">
              <Icon name="plus" size={16} /> 사이트 등록
            </Link>
          }
        />
      </>
    );
  }

  const overall = a.scores?.overall ?? null;
  const prevOverall = a.prevScores?.overall ?? null;
  const rank = rankAmong(overall, bench.overalls);

  return (
    <div className="d-fade">
      {/* 헤더 히어로 */}
      <div className="mb-6 overflow-hidden rounded-2xl" style={{ background: "var(--d-grad-hero)" }}>
        <div className="flex flex-wrap items-center gap-6 p-6">
          <ScoreRing score={overall} size={120} stroke={11} label={overall === null ? undefined : "종합"} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] font-bold tracking-tight">{activeSite.name}</h1>
              <span className="d-badge" style={{ background: "var(--d-sky-soft)", color: "var(--d-sky-deep)" }}>
                {SITE_TYPE_LABEL[activeSite.type]} 사이트
              </span>
              {overall !== null && <StatusBadge outcome={outcomeFromNumber(overall)} />}
            </div>
            <a href={activeSite.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[13px]" style={{ color: "var(--d-sky-deep)" }}>
              {activeSite.url} <Icon name="external" size={13} />
            </a>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
              <span>지난 검사 대비 <DeltaChip delta={overall !== null && prevOverall !== null ? overall - prevOverall : null} suffix="점" /></span>
              <span>예상 개선 가능 {a.potentialGain !== null ? <strong style={{ color: "var(--d-mint)" }}>+{a.potentialGain}점</strong> : "측정 필요"}</span>
              <span>경쟁사 대비 순위 {rank ? <strong>{rank.rank}/{rank.total}위</strong> : <span style={{ color: "var(--d-text-mute)" }}>경쟁사 미분석</span>}</span>
              <span>마지막 검사 {formatDateTime(latestScan?.scannedAt)}</span>
            </div>
          </div>
          <button className="d-btn d-btn-primary" disabled={!!scanning} onClick={() => runScan(activeSite)}>
            {scanning ? <span className="d-spinner" /> : <Icon name="refresh" size={16} />}
            {scanning ? "분석 중…" : "재분석"}
          </button>
        </div>
      </div>

      {!latestScan ? (
        <EmptyState
          icon="refresh"
          title="아직 분석되지 않았습니다"
          description="'재분석'을 눌러 실제 크롤링 기반 진단을 시작하세요. 임의 점수는 표시되지 않습니다."
          action={
            <button className="d-btn d-btn-primary" disabled={!!scanning} onClick={() => runScan(activeSite)}>
              지금 분석 실행
            </button>
          }
        />
      ) : (
        <>
          {/* KPI 그리드 */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {KPIS.map((k) => {
              const score = k.compute === "overall" ? overall : a.categoryScore(k.category!);
              const prev = k.compute === "overall" ? prevOverall : a.prevCategoryScore(k.category!);
              const bm = k.category ? bench.benchmark(guessRepId(k.category)) : { avg: bench.overallAvg, best: bench.overallBest, count: bench.benchmarkedCount, bestName: null };
              const catGain = k.category
                ? Math.round(a.allChecks.filter((c) => c.spec.category === k.category).reduce((s, c) => s + (a.gainFor(c.result) || 0), 0) * 10) / 10
                : a.potentialGain;
              return (
                <KpiCard
                  key={k.key}
                  label={k.label}
                  score={score}
                  prev={prev}
                  compAvg={k.compute === "overall" ? bench.overallAvg : bm.avg}
                  gain={catGain}
                  href={k.category ? categoryHref(k.category) : "/dashboard/analysis/" + a.siteType}
                />
              );
            })}
          </div>

          {/* 하단: CWV + 긴급 개선 */}
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <CoreWebVitalsCard />
            <UrgentCard />
          </div>

          {/* 카테고리별 상태 요약 */}
          <div className="mt-5 d-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[15px] font-bold">카테고리별 진단 요약</h2>
              <Link href="/dashboard/priority" className="text-[12.5px] font-semibold" style={{ color: "var(--d-sky-deep)" }}>
                실행 우선순위 →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="d-table d-table-hover">
                <thead>
                  <tr>
                    <th>카테고리</th>
                    <th>점수</th>
                    <th>상태</th>
                    <th>미달</th>
                    <th>양호</th>
                    <th>최적</th>
                    <th>미측정</th>
                  </tr>
                </thead>
                <tbody>
                  {a.scores?.categories.map((c) => (
                    <tr key={c.category}>
                      <td className="font-semibold">{CATEGORY_LABEL[c.category]}</td>
                      <td className="font-bold">{c.score ?? "—"}</td>
                      <td>{c.score !== null ? <StatusBadge outcome={outcomeFromNumber(c.score)} /> : <span className="d-badge st-unmeasured">미측정</span>}</td>
                      <td style={{ color: "var(--d-red)" }}>{c.statusCounts.fail || "-"}</td>
                      <td style={{ color: "var(--d-orange)" }}>{c.statusCounts.good || "-"}</td>
                      <td style={{ color: "var(--d-mint)" }}>{c.statusCounts.best || "-"}</td>
                      <td style={{ color: "var(--d-text-mute)" }}>{c.statusCounts.unmeasured || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px]" style={{ color: "var(--d-text-mute)" }}>
              종합점수 = Σ(카테고리 점수 × 가중치) ÷ 측정된 가중치 합. 적용 가중치:{" "}
              {a.scores && Object.entries(a.scores.appliedWeights).filter(([, v]) => v > 0).map(([k, v]) => `${CATEGORY_LABEL[k as CategoryId]} ${v}%`).join(" · ")}.{" "}
              <Link href="/dashboard/settings" className="font-semibold" style={{ color: "var(--d-sky-deep)" }}>가중치 변경</Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function guessRepId(cat: CategoryId): string {
  // KPI 벤치마크용 대표 검사 id
  const rep: Partial<Record<CategoryId, string>> = {
    technical: "indexability",
    content: "content-length",
    aeo: "direct-answer",
    geo: "ai-citation-likelihood",
    trust: "author-info",
    schema: "jsonld-presence",
    mobile: "mobile-viewport",
  };
  return rep[cat] || "";
}

function categoryHref(cat: CategoryId): string {
  const map: Partial<Record<CategoryId, string>> = {
    technical: "/dashboard/technical",
    content: "/dashboard/content",
    aeo: "/dashboard/aeo",
    geo: "/dashboard/geo",
    schema: "/dashboard/schema",
    trust: "/dashboard/content",
    mobile: "/dashboard/speed",
  };
  return map[cat] || "/dashboard";
}

function KpiCard({
  label,
  score,
  prev,
  compAvg,
  gain,
  href,
}: {
  label: string;
  score: number | null;
  prev: number | null;
  compAvg: number | null;
  gain: number | null;
  href: string;
}) {
  const outcome = outcomeFromNumber(score);
  return (
    <div className={`d-card d-card-hover st-${outcome} p-4`} style={{ background: score === null ? "var(--d-surface)" : "var(--st-soft, var(--d-surface))" }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12.5px] font-bold" style={{ color: "var(--d-text-soft)" }}>{label}</p>
          <p className="mt-1 text-[30px] font-extrabold leading-none" style={{ color: score === null ? "var(--d-text-mute)" : "var(--st)" }}>
            {score === null ? "—" : score}
            {score !== null && <span className="text-[15px] font-bold">%</span>}
          </p>
        </div>
        {score !== null ? <StatusBadge outcome={outcome} /> : <span className="d-badge st-unmeasured">미측정</span>}
      </div>
      <div className="mt-3 space-y-1 text-[11.5px]" style={{ color: "var(--d-text-soft)" }}>
        <div className="flex items-center justify-between">
          <span>지난 검사 대비</span>
          <DeltaChip delta={score !== null && prev !== null ? score - prev : null} suffix="" />
        </div>
        <div className="flex items-center justify-between">
          <span>경쟁사 평균</span>
          <strong>{compAvg ?? <span style={{ color: "var(--d-text-mute)" }}>데이터 없음</span>}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>예상 개선 가능</span>
          <strong style={{ color: "var(--d-mint)" }}>{gain && gain > 0 ? `+${gain}점` : score !== null ? "—" : "측정 필요"}</strong>
        </div>
      </div>
      <Link href={href} className="mt-3 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[12px] font-semibold" style={{ background: "var(--d-surface)", color: "var(--d-sky-deep)" }}>
        상세 분석 <Icon name="chevron" size={13} />
      </Link>
    </div>
  );
}

function CoreWebVitalsCard() {
  const { latestScan, activeSite, scanning, runPsi } = useDashboard();
  const psi = latestScan?.psi;
  if (!latestScan) return null;
  return (
    <div className="d-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">Core Web Vitals</h2>
        {!psi && activeSite && (
          <button className="d-btn d-btn-secondary d-btn-sm" disabled={!!scanning} onClick={() => runPsi(latestScan)}>
            {scanning ? <span className="d-spinner d-spinner-blue" /> : <Icon name="speed" size={14} />} PSI 측정
          </button>
        )}
      </div>
      {!psi ? (
        <div className="rounded-xl px-4 py-6 text-center text-[13px]" style={{ background: "var(--d-sky-softer)", color: "var(--d-text-soft)" }}>
          <Icon name="info" size={20} className="mb-1 opacity-50" />
          <p className="font-semibold">측정 필요</p>
          <p className="mt-1 text-[12px]" style={{ color: "var(--d-text-mute)" }}>
            PageSpeed Insights를 실행하면 실측 LCP·INP·CLS와 Lighthouse 점수가 표시됩니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Cwv label="성능" value={psi.performanceScore !== null ? `${psi.performanceScore}` : "—"} unit="점" good={psi.performanceScore !== null && psi.performanceScore >= 90} />
          <Cwv label="LCP" value={fmtMs(psi.fieldData?.lcpMs ?? psi.labData?.lcpMs)} unit="s" good={(psi.fieldData?.lcpMs ?? psi.labData?.lcpMs ?? 9999) <= 2500} />
          <Cwv label="CLS" value={(psi.fieldData?.cls ?? psi.labData?.cls)?.toFixed(3) ?? "—"} unit="" good={(psi.fieldData?.cls ?? psi.labData?.cls ?? 1) <= 0.1} />
          <Cwv label="INP" value={psi.fieldData?.inpMs != null ? `${psi.fieldData.inpMs}` : "실측 없음"} unit={psi.fieldData?.inpMs != null ? "ms" : ""} good={(psi.fieldData?.inpMs ?? 9999) <= 200} />
        </div>
      )}
      {psi && (
        <p className="mt-2 text-[11px]" style={{ color: "var(--d-text-mute)" }}>
          {psi.fieldData ? "실측(CrUX) 데이터 포함" : "Lab(Lighthouse) 데이터 — 실사용자 데이터는 트래픽이 충분할 때 제공됩니다"} · {formatDateTime(psi.fetchedAt)}
        </p>
      )}
    </div>
  );
}

function fmtMs(ms: number | null | undefined): string {
  if (ms == null) return "—";
  return (ms / 1000).toFixed(1);
}

function Cwv({ label, value, unit, good }: { label: string; value: string; unit: string; good: boolean }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: value === "—" || value === "실측 없음" ? "var(--d-gray-chip)" : good ? "var(--d-mint-soft)" : "var(--d-orange-soft)" }}>
      <p className="text-[11px] font-semibold" style={{ color: "var(--d-text-mute)" }}>{label}</p>
      <p className="mt-1 text-[18px] font-bold" style={{ color: value === "—" || value === "실측 없음" ? "var(--d-text-mute)" : good ? "var(--d-mint)" : "var(--d-orange)" }}>
        {value}<span className="text-[11px]">{unit}</span>
      </p>
    </div>
  );
}

function UrgentCard() {
  const a = useAnalysis();
  const urgent = a.priority.slice(0, 5);
  return (
    <div className="d-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-bold">긴급 개선 항목</h2>
        <Link href="/dashboard/improvement" className="text-[12.5px] font-semibold" style={{ color: "var(--d-sky-deep)" }}>
          개선센터 →
        </Link>
      </div>
      {urgent.length === 0 ? (
        <p className="rounded-xl px-4 py-6 text-center text-[13px]" style={{ background: "var(--d-mint-soft)", color: "var(--d-mint)" }}>
          미달·양호 상태의 항목이 없습니다. 최적 상태를 유지하고 있습니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {urgent.map((p) => (
            <li key={p.spec.id} className="flex items-center gap-3">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[12px] font-bold st-${p.result.outcome}`} style={{ background: "var(--st-soft)", color: "var(--st)" }}>
                {p.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold">{p.spec.label}</p>
                <p className="text-[11px]" style={{ color: "var(--d-text-mute)" }}>
                  현재 {p.result.valueLabel} · 난이도 {p.spec.fix.difficulty === "low" ? "낮음" : p.spec.fix.difficulty === "medium" ? "보통" : "높음"}
                </p>
              </div>
              {p.gain !== null && p.gain > 0 && <span className="shrink-0 text-[12px] font-bold" style={{ color: "var(--d-mint)" }}>+{p.gain}점</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Hero() {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl p-8 text-center" style={{ background: "var(--d-grad-hero)" }}>
      <span className="d-badge mx-auto" style={{ background: "var(--d-sky-soft)", color: "var(--d-sky-deep)" }}>K:ZIP Search Lab</span>
      <h1 className="mt-3 text-[26px] font-extrabold tracking-tight">SEO · AEO · GEO 통합 분석 대시보드</h1>
      <p className="mx-auto mt-2 max-w-xl text-[14px] leading-relaxed" style={{ color: "var(--d-text-soft)" }}>
        진단 → 원인 분석 → 경쟁사 비교 → 개선 방법 → 예상 효과 → 작업 등록 → 재검사 → 변화 추적.
        모든 점수는 실제 크롤링·API 데이터에서만 산출되며, 미연결 항목은 &ldquo;데이터 미연결&rdquo;로 표시됩니다.
      </p>
    </div>
  );
}
