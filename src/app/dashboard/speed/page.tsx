"use client";

import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAnalysis } from "@/components/dashboard/useAnalysis";
import { CheckCard } from "@/components/dashboard/CheckCard";
import { EmptyState, Icon, PageHeader, formatDateTime } from "@/components/dashboard/ui";

export default function SpeedPage() {
  const { latestScan, activeSite, scanning, runPsi } = useDashboard();
  const a = useAnalysis();
  const psi = latestScan?.psi;
  const mobileChecks = a.allChecks.filter((c) => c.spec.category === "mobile");

  if (!latestScan) {
    return (
      <>
        <PageHeader title="페이지 속도 · Core Web Vitals" description="Google PageSpeed Insights 실측 데이터를 사용합니다." />
        <EmptyState icon="speed" title="분석 데이터가 없습니다" description="먼저 사이트를 분석한 뒤 PSI 측정을 실행하세요." />
      </>
    );
  }

  return (
    <div className="d-fade">
      <PageHeader
        title="페이지 속도 · Core Web Vitals"
        description="Google PageSpeed Insights(Lighthouse + CrUX 실측)를 사용합니다. 측정 전에는 임의 점수를 표시하지 않습니다."
        right={
          activeSite && (
            <button className="d-btn d-btn-primary" disabled={!!scanning} onClick={() => runPsi(latestScan)}>
              {scanning ? <span className="d-spinner" /> : <Icon name="speed" size={16} />}
              {psi ? "재측정" : "PSI 측정 실행"}
            </button>
          )
        }
      />

      {!psi ? (
        <div className="d-card px-6 py-12 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "var(--d-sky-soft)", color: "var(--d-sky)" }}>
            <Icon name="speed" size={24} />
          </div>
          <p className="text-[15px] font-bold">측정 필요</p>
          <p className="mx-auto mt-1 max-w-md text-[13px]" style={{ color: "var(--d-text-soft)" }}>
            PageSpeed Insights API를 호출해 실측 성능·LCP·CLS·INP를 가져옵니다. API Key 없이도 측정되지만 쿼터가 낮으므로,
            설정에서 PSI API Key를 등록하면 안정적으로 사용할 수 있습니다.
          </p>
          <button className="d-btn d-btn-primary mx-auto mt-4" disabled={!!scanning} onClick={() => runPsi(latestScan)}>
            {scanning ? "측정 중… (최대 60초)" : "지금 측정"}
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Lighthouse 성능" value={psi.performanceScore} unit="점" thresholds={[50, 90]} />
            <Metric label="LCP" value={toSec(psi.fieldData?.lcpMs ?? psi.labData?.lcpMs)} unit="s" thresholds={[4, 2.5]} invert />
            <Metric label="CLS" value={psi.fieldData?.cls ?? psi.labData?.cls} unit="" thresholds={[0.25, 0.1]} invert digits={3} />
            <Metric label="INP" value={psi.fieldData?.inpMs} unit="ms" thresholds={[500, 200]} invert fallback="실측 데이터 없음" />
          </div>
          <p className="mt-2 text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>
            데이터 출처: {psi.fieldData ? "실측 CrUX(실사용자) + Lab" : "Lab(Lighthouse) — 실사용자 데이터는 트래픽이 충분할 때 Google이 제공"} · {psi.strategy} · {formatDateTime(psi.fetchedAt)}
          </p>
          {psi.labData && (
            <div className="d-card mt-4 p-4">
              <p className="mb-2 text-[13px] font-bold">Lab 세부 지표</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-[12px]">
                <LabItem label="FCP" v={toSec(psi.labData.fcpMs)} u="s" />
                <LabItem label="Speed Index" v={toSec(psi.labData.speedIndexMs)} u="s" />
                <LabItem label="TBT" v={psi.labData.tbtMs != null ? Math.round(psi.labData.tbtMs) : null} u="ms" />
                <LabItem label="SEO 점수" v={psi.seoScore} u="점" />
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-5 space-y-2.5">
        {mobileChecks.map(({ result, spec }) => (
          <CheckCard key={spec.id} result={result} spec={spec} gain={a.gainFor(result)} siteType={a.siteType} />
        ))}
      </div>
    </div>
  );
}

function toSec(ms: number | null | undefined): number | null {
  return ms == null ? null : Math.round((ms / 1000) * 10) / 10;
}

function Metric({ label, value, unit, thresholds, invert, digits, fallback }: { label: string; value: number | null | undefined; unit: string; thresholds: [number, number]; invert?: boolean; digits?: number; fallback?: string }) {
  if (value == null) {
    return (
      <div className="d-card p-4">
        <p className="text-[12px] font-semibold" style={{ color: "var(--d-text-soft)" }}>{label}</p>
        <p className="mt-1 text-[15px] font-bold" style={{ color: "var(--d-text-mute)" }}>{fallback || "—"}</p>
      </div>
    );
  }
  const [bad, goodT] = thresholds;
  let tone: string;
  if (invert) tone = value <= goodT ? "mint" : value <= bad ? "orange" : "red";
  else tone = value >= goodT ? "mint" : value >= bad ? "orange" : "red";
  const color = tone === "mint" ? "var(--d-mint)" : tone === "orange" ? "var(--d-orange)" : "var(--d-red)";
  const bg = tone === "mint" ? "var(--d-mint-soft)" : tone === "orange" ? "var(--d-orange-soft)" : "var(--d-red-soft)";
  return (
    <div className="d-card p-4" style={{ background: bg }}>
      <p className="text-[12px] font-semibold" style={{ color: "var(--d-text-soft)" }}>{label}</p>
      <p className="mt-1 text-[26px] font-extrabold" style={{ color }}>
        {digits ? value.toFixed(digits) : value}<span className="text-[13px]">{unit}</span>
      </p>
    </div>
  );
}

function LabItem({ label, v, u }: { label: string; v: number | null; u: string }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: "var(--d-sky-softer)" }}>
      <p style={{ color: "var(--d-text-mute)" }}>{label}</p>
      <p className="font-bold">{v == null ? "—" : v}{v != null ? u : ""}</p>
    </div>
  );
}
