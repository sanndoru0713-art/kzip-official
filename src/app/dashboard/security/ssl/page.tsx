"use client";

import Link from "next/link";
import { useSecurity } from "@/components/dashboard/useSecurity";
import { EmptyState, Icon, PageHeader, formatDateTime } from "@/components/dashboard/ui";

export default function SslPage() {
  const { activeSite, result, scanning, scan } = useSecurity();

  if (!activeSite) {
    return (
      <>
        <PageHeader title="SSL · HTTPS" description="인증서 유효성·만료·TLS·HSTS를 검사합니다." />
        <EmptyState icon="lock" title="사이트를 등록하세요" action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }
  if (!result) {
    return (
      <>
        <PageHeader title="SSL · HTTPS" description="인증서 유효성·만료·TLS·HSTS를 실측합니다." />
        <EmptyState icon="lock" title="보안 검사를 실행하세요" action={<button className="d-btn d-btn-primary" disabled={scanning} onClick={scan}>{scanning ? "검사 중…" : "보안 검사 실행"}</button>} />
      </>
    );
  }

  const s = result.ssl;
  const rows: { label: string; value: string; tone?: string }[] = [
    { label: "HTTPS 적용", value: s.https ? "적용됨" : "미적용", tone: s.https ? "best" : "fail" },
    { label: "HTTP→HTTPS 리다이렉트", value: s.redirectsToHttps === null ? "측정 불가" : s.redirectsToHttps ? "정상" : "없음", tone: s.redirectsToHttps ? "best" : s.redirectsToHttps === false ? "good" : "unmeasured" },
    { label: "인증서 유효성", value: s.valid === null ? "측정 불가" : s.valid ? "유효" : `오류: ${s.error || "검증 실패"}`, tone: s.valid ? "best" : s.valid === false ? "fail" : "unmeasured" },
    { label: "발급기관", value: s.issuer || "측정 불가" },
    { label: "인증서 도메인", value: s.subjectCN || "측정 불가" },
    { label: "SAN (대체 도메인)", value: s.altNames.length ? s.altNames.slice(0, 5).join(", ") + (s.altNames.length > 5 ? ` 외 ${s.altNames.length - 5}` : "") : "측정 불가" },
    { label: "도메인 일치", value: s.domainMatch === null ? "측정 불가" : s.domainMatch ? "일치" : "불일치", tone: s.domainMatch ? "best" : s.domainMatch === false ? "fail" : "unmeasured" },
    { label: "발급일", value: s.validFrom ? s.validFrom.slice(0, 10) : "측정 불가" },
    { label: "만료일", value: s.validTo ? `${s.validTo.slice(0, 10)} (D-${s.daysToExpiry})` : "측정 불가", tone: s.daysToExpiry !== null && s.daysToExpiry <= 30 ? "fail" : s.daysToExpiry !== null ? "best" : "unmeasured" },
    { label: "TLS 프로토콜", value: s.tlsProtocol || "측정 불가", tone: s.tlsProtocol && /TLSv1\.[23]/.test(s.tlsProtocol) ? "best" : s.tlsProtocol ? "good" : "unmeasured" },
    { label: "HSTS", value: s.hsts ? s.hstsValue || "적용" : "미적용", tone: s.hsts ? "best" : "good" },
  ];

  return (
    <div className="d-fade">
      <PageHeader
        title="SSL · HTTPS"
        description="TLS 연결로 실제 인증서를 관측합니다. 만료 알림 기준: 30일·14일·7일·1일 전."
        right={<button className="d-btn d-btn-primary" disabled={scanning} onClick={scan}>{scanning ? <span className="d-spinner" /> : <Icon name="refresh" size={16} />} 재검사</button>}
      />

      {s.daysToExpiry !== null && s.daysToExpiry <= 30 && (
        <div className="d-card mb-4 flex items-center gap-2 p-3" style={{ background: "var(--d-red-soft)" }}>
          <Icon name="warn" size={18} style={{ color: "var(--d-red)" }} />
          <p className="text-[13px] font-semibold" style={{ color: "var(--d-red)" }}>인증서 만료까지 {s.daysToExpiry}일 남았습니다. 갱신 및 자동 갱신 설정이 필요합니다.</p>
        </div>
      )}

      <div className="d-card overflow-hidden">
        <table className="d-table d-table-hover">
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="w-56 font-semibold">{r.label}</td>
                <td>
                  <span className={r.tone ? `d-badge st-${r.tone}` : ""} style={r.tone ? { background: r.tone === "unmeasured" ? "var(--d-gray-chip)" : "var(--st-soft)", color: r.tone === "unmeasured" ? "var(--d-text-mute)" : "var(--st)" } : { color: "var(--d-text-soft)" }}>
                    {r.value}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px]" style={{ color: "var(--d-text-mute)" }}>검사 {formatDateTime(result.scannedAt)} · 혼합 콘텐츠·중간 인증서 세부 검사는 능동 점검 범위로 소유권 인증 후 확장됩니다.</p>
    </div>
  );
}
