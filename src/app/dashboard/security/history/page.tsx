"use client";

import Link from "next/link";
import { useSecurity } from "@/components/dashboard/useSecurity";
import { EmptyState, Icon, PageHeader, formatDateTime } from "@/components/dashboard/ui";
import { SEVERITY_LABEL } from "@/lib/security/types";

export default function SecurityHistoryPage() {
  const { activeSite, result, scan, scanning } = useSecurity();

  if (!activeSite) {
    return (
      <>
        <PageHeader title="보안 검사 기록" description="보안 검사 결과 이력입니다." />
        <EmptyState icon="trend" title="사이트를 등록하세요" action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }

  return (
    <div className="d-fade">
      <PageHeader
        title="보안 검사 기록"
        description="가장 최근 보안 검사 결과의 스냅샷입니다. (검사 이력 다건 저장은 백엔드 저장소 연동 시 확장됩니다)"
        right={<button className="d-btn d-btn-primary d-btn-sm" disabled={scanning} onClick={scan}>{scanning ? <span className="d-spinner" /> : <Icon name="refresh" size={14} />} 검사</button>}
      />

      {!result ? (
        <EmptyState icon="trend" title="검사 기록이 없습니다" description="보안 검사를 실행하면 결과가 여기에 저장됩니다." action={<button className="d-btn d-btn-primary" disabled={scanning} onClick={scan}>{scanning ? "검사 중…" : "보안 검사 실행"}</button>} />
      ) : (
        <div className="d-card overflow-hidden">
          <div className="flex items-center justify-between border-b p-4" style={{ borderColor: "var(--d-border)" }}>
            <div>
              <p className="text-[14px] font-bold">{result.origin}</p>
              <p className="text-[12px]" style={{ color: "var(--d-text-mute)" }}>{formatDateTime(result.scannedAt)} · 보안점수 {result.score ?? "측정 불가"} · {result.mode === "owned" ? "확장 점검" : "수동 점검"}</p>
            </div>
            <span className="d-badge" style={{ background: "var(--d-sky-soft)", color: "var(--d-sky-deep)" }}>이슈 {result.findings.length}건</span>
          </div>
          <table className="d-table d-table-hover">
            <thead><tr><th>위험도</th><th>이슈</th><th>영향 URL</th></tr></thead>
            <tbody>
              {result.findings.length === 0 ? (
                <tr><td colSpan={3} className="py-6 text-center" style={{ color: "var(--d-text-mute)" }}>수동 점검 범위에서 발견된 이슈가 없습니다.</td></tr>
              ) : (
                result.findings.map((f) => (
                  <tr key={f.id}>
                    <td><span className="d-badge" style={{ background: f.severity === "critical" ? "var(--d-red-soft)" : f.severity === "high" || f.severity === "medium" ? "var(--d-orange-soft)" : "var(--d-gray-chip)", color: f.severity === "critical" ? "var(--d-red)" : f.severity === "high" || f.severity === "medium" ? "var(--d-orange)" : "var(--d-text-soft)" }}>{SEVERITY_LABEL[f.severity]}</span></td>
                    <td className="font-semibold">{f.title}</td>
                    <td className="max-w-[240px] truncate text-[12px]" style={{ color: "var(--d-sky-deep)" }}>{f.affectedUrls[0]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
