"use client";

import Link from "next/link";
import { useSecurity } from "@/components/dashboard/useSecurity";
import { EmptyState, Icon, PageHeader, ScoreRing, formatDateTime, outcomeFromNumber } from "@/components/dashboard/ui";
import { SEVERITY_LABEL } from "@/lib/security/types";

export default function SecurityDashboard() {
  const { activeSite, result, ownership, scanning, error, scan } = useSecurity();

  if (!activeSite) {
    return (
      <>
        <PageHeader title="보안 종합 대시보드" description="사이트의 SSL·보안 헤더·공개 노출을 진단합니다." />
        <EmptyState icon="shield" title="사이트를 먼저 등록하세요" action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }

  const critical = result?.findings.filter((f) => f.severity === "critical").length ?? 0;
  const high = result?.findings.filter((f) => f.severity === "high").length ?? 0;

  return (
    <div className="d-fade">
      <PageHeader
        title="보안 종합 대시보드"
        description="화이트햇 수동(passive) 진단입니다. 공격·침투·부하 테스트는 수행하지 않으며, 능동 점검은 소유권 인증 후에만 확장됩니다."
        right={
          <button className="d-btn d-btn-primary" disabled={scanning} onClick={scan}>
            {scanning ? <span className="d-spinner" /> : <Icon name="scan" size={16} />}
            {scanning ? "검사 중…" : "보안 검사 실행"}
          </button>
        }
      />

      {error && <div className="d-card mb-4 p-3 text-[12.5px]" style={{ color: "var(--d-red)", background: "var(--d-red-soft)" }}>⚠ {error}</div>}

      {!result ? (
        <EmptyState
          icon="scan"
          title="아직 검사하지 않았습니다"
          description={`${activeSite.name}의 SSL·보안 헤더·공개 정책을 진단합니다. 검사하지 않은 항목을 '안전'으로 표시하지 않습니다.`}
          action={<button className="d-btn d-btn-primary" disabled={scanning} onClick={scan}>{scanning ? "검사 중…" : "지금 검사"}</button>}
        />
      ) : (
        <>
          {/* 상단 요약 */}
          <div className="mb-5 overflow-hidden rounded-2xl" style={{ background: "var(--d-grad-hero)" }}>
            <div className="flex flex-wrap items-center gap-6 p-6">
              <ScoreRing score={result.score} size={110} label="보안점수" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[18px] font-bold">{activeSite.name}</h2>
                  <span className="d-badge" style={{ background: ownership?.verified ? "var(--d-mint-soft)" : "var(--d-gray-chip)", color: ownership?.verified ? "var(--d-mint)" : "var(--d-text-mute)" }}>
                    {ownership?.verified ? "소유권 인증됨 (확장 점검)" : "수동 점검 (소유권 미인증)"}
                  </span>
                </div>
                <p className="mt-1 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>{result.origin} · 검사 {formatDateTime(result.scannedAt)}</p>
                <p className="mt-2 max-w-2xl text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>{result.limitNote}</p>
              </div>
            </div>
          </div>

          {/* KPI 타일 */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <Tile label="HTTPS" value={result.ssl.https ? "적용" : "미적용"} tone={result.ssl.https ? "best" : "fail"} />
            <Tile label="SSL 인증서" value={result.ssl.valid === null ? "측정 불가" : result.ssl.valid ? "유효" : "오류"} tone={result.ssl.valid ? "best" : result.ssl.valid === false ? "fail" : "unmeasured"} />
            <Tile label="인증서 만료" value={result.ssl.daysToExpiry !== null ? `D-${result.ssl.daysToExpiry}` : "측정 불가"} tone={result.ssl.daysToExpiry !== null && result.ssl.daysToExpiry <= 30 ? "fail" : result.ssl.daysToExpiry !== null ? "best" : "unmeasured"} />
            <Tile label="보안 헤더" value={`${result.headers.filter((h) => h.present).length}/${result.headers.length}`} tone={outcomeFromNumber(Math.round((result.headers.filter((h) => h.present).length / result.headers.length) * 100))} />
            <Tile label="긴급 취약점" value={`${critical}건`} tone={critical > 0 ? "fail" : "best"} />
            <Tile label="높음 위험" value={`${high}건`} tone={high > 0 ? "good" : "best"} />
          </div>

          {/* 미연결 항목 명시 */}
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="d-card p-5">
              <h3 className="mb-3 text-[14px] font-bold">즉시 조치 항목</h3>
              {result.findings.filter((f) => f.severity === "critical" || f.severity === "high").length === 0 ? (
                <p className="rounded-xl px-4 py-4 text-center text-[13px]" style={{ background: "var(--d-mint-soft)", color: "var(--d-mint)" }}>긴급·높음 위험 항목이 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {result.findings.filter((f) => f.severity === "critical" || f.severity === "high").slice(0, 6).map((f) => (
                    <li key={f.id} className="flex items-center gap-2 text-[13px]">
                      <span className="d-badge" style={{ background: f.severity === "critical" ? "var(--d-red-soft)" : "var(--d-orange-soft)", color: f.severity === "critical" ? "var(--d-red)" : "var(--d-orange)" }}>{SEVERITY_LABEL[f.severity]}</span>
                      <span className="truncate">{f.title}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/dashboard/security/improvement" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: "var(--d-sky-deep)" }}>
                보안 개선센터에서 관리 <Icon name="chevron" size={13} />
              </Link>
            </div>

            <div className="d-card p-5">
              <h3 className="mb-3 text-[14px] font-bold">권한 기반 점검 안내</h3>
              <div className="space-y-2 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
                <PermRow label="SSL·HTTPS·보안 헤더·공개 정책" enabled note="수동 점검 — 모든 사이트 가능" />
                <PermRow label="민감 파일 노출 점검" enabled={ownership?.verified} note={ownership?.verified ? "소유권 인증됨" : "소유권 인증 필요"} />
                <PermRow label="취약점 징후 점검 (비파괴)" enabled={ownership?.verified} note={ownership?.verified ? "소유권 인증됨" : "소유권 인증 필요"} />
                <PermRow label="능동 공격·부하·포트스캔" enabled={false} note="정책상 미수행 (전 사이트)" />
              </div>
              {!ownership?.verified && (
                <Link href="/dashboard/security/ownership" className="d-btn d-btn-secondary d-btn-sm mt-3">
                  <Icon name="lock" size={14} /> 소유권 인증하기
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Tile({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className={`d-card st-${tone} p-3`} style={{ background: tone === "unmeasured" ? "var(--d-surface)" : "var(--st-soft)" }}>
      <p className="text-[11px] font-semibold" style={{ color: "var(--d-text-mute)" }}>{label}</p>
      <p className="mt-0.5 text-[16px] font-bold" style={{ color: tone === "unmeasured" ? "var(--d-text-mute)" : "var(--st)" }}>{value}</p>
    </div>
  );
}

function PermRow({ label, enabled, note }: { label: string; enabled?: boolean; note: string }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg px-3 py-2" style={{ background: "var(--d-sky-softer)" }}>
      <span>{label}</span>
      <span className="d-badge shrink-0" style={{ background: enabled ? "var(--d-mint-soft)" : "var(--d-gray-chip)", color: enabled ? "var(--d-mint)" : "var(--d-text-mute)" }}>
        {enabled ? "가능" : "제한"} · {note}
      </span>
    </div>
  );
}
