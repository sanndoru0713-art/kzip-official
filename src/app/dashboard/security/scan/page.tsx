"use client";

import Link from "next/link";
import { useSecurity } from "@/components/dashboard/useSecurity";
import { EmptyState, Icon, PageHeader, formatDateTime } from "@/components/dashboard/ui";
import { SEVERITY_LABEL } from "@/lib/security/types";

export default function SecurityScanPage() {
  const { activeSite, result, ownership, scanning, error, scan } = useSecurity();

  if (!activeSite) {
    return (
      <>
        <PageHeader title="웹사이트 보안 진단" description="SSL·보안 헤더·공개 노출·정책을 진단합니다." />
        <EmptyState icon="scan" title="사이트를 등록하세요" action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }

  return (
    <div className="d-fade">
      <PageHeader
        title="웹사이트 보안 진단"
        description="화이트햇 수동 진단. 로그인 시도·인증 우회·포트 스캔·디렉터리 무차별·부하 테스트 등 능동 공격은 수행하지 않습니다."
        right={<button className="d-btn d-btn-primary" disabled={scanning} onClick={scan}>{scanning ? <span className="d-spinner" /> : <Icon name="scan" size={16} />} {scanning ? "검사 중…" : "검사 실행"}</button>}
      />

      {error && <div className="d-card mb-4 p-3 text-[12.5px]" style={{ color: "var(--d-red)", background: "var(--d-red-soft)" }}>⚠ {error}</div>}

      {!result ? (
        <EmptyState icon="scan" title="검사를 실행하세요" description="검사하지 않은 항목은 '검사 필요'로 표시되며 '안전'으로 단정하지 않습니다." action={<button className="d-btn d-btn-primary" disabled={scanning} onClick={scan}>{scanning ? "검사 중…" : "지금 검사"}</button>} />
      ) : (
        <>
          {/* 공개 정보 요약 */}
          <div className="d-card mb-5 p-5">
            <h2 className="mb-3 text-[15px] font-bold">공개 정보 스캔</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="robots.txt" value={result.robotsPresent === null ? "확인 불가" : result.robotsPresent ? "존재" : "없음"} />
              <Info label="sitemap.xml" value={result.sitemapPresent === null ? "확인 불가" : result.sitemapPresent ? "존재" : "없음"} />
              <Info label="개인정보처리방침" value={result.privacyPolicyFound === null ? "확인 불가" : result.privacyPolicyFound ? "링크 발견" : "미발견"} />
              <Info label="쿠키 정책" value={result.cookiePolicyFound === null ? "확인 불가" : result.cookiePolicyFound ? "링크 발견" : "미발견"} />
              <Info label="Server 헤더" value={result.serverHeader || "노출 안 함"} />
              <Info label="X-Powered-By" value={result.poweredBy || "노출 안 함 (권장)"} />
            </div>
          </div>

          {/* 민감파일 노출 (owned) */}
          <div className="d-card mb-5 p-5">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-[15px] font-bold">민감 파일 노출 점검</h2>
              <span className="d-badge" style={{ background: ownership?.verified ? "var(--d-mint-soft)" : "var(--d-orange-soft)", color: ownership?.verified ? "var(--d-mint)" : "var(--d-orange)" }}>
                {ownership?.verified ? "소유권 인증 — 점검 수행" : "소유권 인증 필요"}
              </span>
            </div>
            {!ownership?.verified ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4" style={{ background: "var(--d-orange-soft)" }}>
                <p className="text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
                  .env·.git·백업·설정 파일 노출 점검은 소유·점검 권한이 확인된 사이트에서만 수행합니다.
                </p>
                <Link href="/dashboard/security/ownership" className="d-btn d-btn-secondary d-btn-sm"><Icon name="lock" size={14} /> 소유권 인증</Link>
              </div>
            ) : result.exposures.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--d-text-mute)" }}>점검 결과가 없습니다.</p>
            ) : (
              <table className="d-table">
                <thead><tr><th>경로</th><th>상태</th><th>판정</th><th>비고</th></tr></thead>
                <tbody>
                  {result.exposures.map((e) => (
                    <tr key={e.path}>
                      <td className="font-mono text-[12px]">{e.path}</td>
                      <td>{e.status ?? "—"}</td>
                      <td>{e.exposed ? <span className="d-badge st-fail" style={{ background: "var(--d-red-soft)", color: "var(--d-red)" }}>노출 의심</span> : <span className="d-badge st-best" style={{ background: "var(--d-mint-soft)", color: "var(--d-mint)" }}>정상</span>}</td>
                      <td className="text-[12px]" style={{ color: "var(--d-text-soft)" }}>{e.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* 전체 발견 항목 */}
          <div className="d-card p-5">
            <h2 className="mb-3 text-[15px] font-bold">발견된 보안 이슈 ({result.findings.length})</h2>
            {result.findings.length === 0 ? (
              <p className="rounded-xl px-4 py-4 text-center text-[13px]" style={{ background: "var(--d-mint-soft)", color: "var(--d-mint)" }}>
                수동 점검 범위에서 발견된 이슈가 없습니다. (검사하지 않은 능동 항목은 '검사 필요' 상태로 별도 표시됩니다)
              </p>
            ) : (
              <div className="space-y-2">
                {result.findings.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: "var(--d-border)" }}>
                    <span className="d-badge shrink-0" style={{ background: sevBg(f.severity), color: sevColor(f.severity) }}>{SEVERITY_LABEL[f.severity]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold">{f.title}</p>
                      <p className="truncate text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>{f.impact}</p>
                    </div>
                    <Link href="/dashboard/security/improvement" className="d-btn d-btn-ghost d-btn-sm shrink-0">개선 →</Link>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-3 text-[11px]" style={{ color: "var(--d-text-mute)" }}>검사 {formatDateTime(result.scannedAt)} · {result.limitNote}</p>
          </div>
        </>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: "var(--d-sky-softer)" }}>
      <p className="text-[11px] font-semibold" style={{ color: "var(--d-text-mute)" }}>{label}</p>
      <p className="text-[13px] font-bold">{value}</p>
    </div>
  );
}

function sevBg(s: string) {
  return s === "critical" ? "var(--d-red-soft)" : s === "high" ? "var(--d-orange-soft)" : s === "medium" ? "var(--d-orange-soft)" : "var(--d-gray-chip)";
}
function sevColor(s: string) {
  return s === "critical" ? "var(--d-red)" : s === "high" || s === "medium" ? "var(--d-orange)" : "var(--d-text-soft)";
}
