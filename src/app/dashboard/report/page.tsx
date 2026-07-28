"use client";

import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAnalysis } from "@/components/dashboard/useAnalysis";
import { EmptyState, Icon, PageHeader, ScoreRing, StatusBadge, formatDateTime, outcomeFromNumber } from "@/components/dashboard/ui";
import { CATEGORY_LABEL, SITE_TYPE_LABEL } from "@/lib/seo/types";

export default function ReportPage() {
  const { activeSite, latestScan } = useDashboard();
  const a = useAnalysis();

  if (!activeSite || !latestScan || !a.scores) {
    return (
      <>
        <PageHeader title="리포트" description="분석 결과를 리포트로 정리합니다." />
        <EmptyState icon="report" title="분석 후 리포트를 생성할 수 있습니다" action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }

  const measured = a.scores.checks.filter((c) => c.score !== null);
  const unmeasured = a.scores.checks.filter((c) => c.score === null);

  return (
    <div className="d-fade">
      <PageHeader
        title="리포트"
        description="현재 분석 스냅샷 기반 종합 리포트입니다. 인쇄(또는 PDF 저장)로 내보낼 수 있습니다."
        right={<button className="d-btn d-btn-primary d-no-print" onClick={() => window.print()}><Icon name="report" size={16} /> 인쇄 / PDF</button>}
      />

      <div className="d-card p-6">
        {/* 헤더 */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--d-border)" }}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--d-sky-deep)" }}>K:ZIP Search Lab — 검색 경쟁력 리포트</p>
            <h2 className="mt-1 text-[20px] font-bold">{activeSite.name}</h2>
            <p className="text-[12.5px]" style={{ color: "var(--d-text-mute)" }}>{activeSite.url} · {SITE_TYPE_LABEL[activeSite.type]} 사이트 · 검사 {formatDateTime(latestScan.scannedAt)}</p>
          </div>
          <ScoreRing score={a.scores.overall} size={90} label="종합" />
        </div>

        {/* 요약 */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Sum label="측정 항목" value={`${measured.length}개`} />
          <Sum label="미달" value={`${measured.filter((c) => c.outcome === "fail").length}개`} tone="fail" />
          <Sum label="양호" value={`${measured.filter((c) => c.outcome === "good").length}개`} tone="good" />
          <Sum label="예상 개선 가능" value={a.potentialGain !== null ? `+${a.potentialGain}점` : "—"} tone="best" />
        </div>

        {/* 카테고리 점수 */}
        <h3 className="mb-2 mt-6 text-[14px] font-bold">카테고리별 점수</h3>
        <table className="d-table">
          <thead><tr><th>카테고리</th><th>점수</th><th>상태</th><th>가중치</th><th>측정</th></tr></thead>
          <tbody>
            {a.scores.categories.map((c) => (
              <tr key={c.category}>
                <td className="font-semibold">{CATEGORY_LABEL[c.category]}</td>
                <td className="font-bold">{c.score ?? "측정 불가"}</td>
                <td>{c.score !== null ? <StatusBadge outcome={outcomeFromNumber(c.score)} /> : "—"}</td>
                <td>{a.scores!.appliedWeights[c.category] ?? 0}%</td>
                <td style={{ color: "var(--d-text-mute)" }}>{c.measuredCount}/{c.totalCount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 우선 개선 과제 */}
        <h3 className="mb-2 mt-6 text-[14px] font-bold">우선 개선 과제 (상위 10)</h3>
        <table className="d-table">
          <thead><tr><th>순위</th><th>항목</th><th>현재</th><th>예상 상승</th><th>난이도</th></tr></thead>
          <tbody>
            {a.priority.slice(0, 10).map((p) => (
              <tr key={p.spec.id}>
                <td>{p.rank}</td>
                <td className="font-semibold">{p.spec.label}</td>
                <td><StatusBadge outcome={p.result.outcome} label={p.result.valueLabel} /></td>
                <td style={{ color: "var(--d-mint)" }}>{p.gain !== null && p.gain > 0 ? `+${p.gain}점` : "—"}</td>
                <td>{p.spec.fix.difficulty === "low" ? "낮음" : p.spec.fix.difficulty === "medium" ? "보통" : "높음"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 검사 제한/면책 */}
        <div className="mt-6 rounded-xl p-4 text-[11.5px] leading-relaxed" style={{ background: "var(--d-gray-chip)", color: "var(--d-text-soft)" }}>
          <p className="font-bold" style={{ color: "var(--d-text)" }}>검사 범위 및 면책</p>
          <p className="mt-1">{latestScan.crawl.crawlLimitNote}</p>
          <p className="mt-1">
            측정 불가/미연결 항목 {unmeasured.length}개는 점수 산정에서 제외되었습니다 (0점 처리하지 않음):{" "}
            {unmeasured.slice(0, 8).map((c) => CATEGORY_LABEL[a.allChecks.find((x) => x.spec.id === c.checkId)?.spec.category || "content"]).length > 0 && unmeasured.map((c) => a.allChecks.find((x) => x.spec.id === c.checkId)?.spec.label).filter(Boolean).slice(0, 8).join(", ")}.
          </p>
          <p className="mt-1">본 리포트는 표본 크롤링·공개 데이터 기반 추정이며, 실제 검색 성과는 Search Console 등 실측 데이터로 보완해야 합니다.</p>
        </div>
      </div>
    </div>
  );
}

function Sum({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className={`rounded-xl p-3 ${tone ? `st-${tone}` : ""}`} style={{ background: tone ? "var(--st-soft)" : "var(--d-sky-softer)" }}>
      <p className="text-[11px] font-semibold" style={{ color: "var(--d-text-mute)" }}>{label}</p>
      <p className="mt-0.5 text-[18px] font-bold" style={{ color: tone ? "var(--st)" : "var(--d-text)" }}>{value}</p>
    </div>
  );
}
