"use client";

import { useState } from "react";
import Link from "next/link";
import { useSecurity } from "@/components/dashboard/useSecurity";
import { EmptyState, Icon, PageHeader } from "@/components/dashboard/ui";
import { SEVERITY_LABEL } from "@/lib/security/types";
import type { Severity } from "@/lib/security/types";

const SEV_ORDER: Severity[] = ["critical", "high", "medium", "low", "info"];

export default function SecurityImprovementPage() {
  const { activeSite, result, scanning, scan } = useSecurity();
  const [server, setServer] = useState("Nginx");
  const [filter, setFilter] = useState<Severity | "all">("all");

  if (!activeSite || !result) {
    return (
      <>
        <PageHeader title="보안 개선센터" description="발견된 보안 문제별 상세 개선 가이드를 제공합니다." />
        <EmptyState icon="build" title="보안 검사 후 표시됩니다" description="보안 검사를 실행하면 발견된 문제가 위험도 순으로 등록됩니다." action={<button className="d-btn d-btn-primary" disabled={scanning} onClick={scan}>{scanning ? "검사 중…" : "보안 검사 실행"}</button>} />
      </>
    );
  }

  const findings = [...result.findings]
    .filter((f) => filter === "all" || f.severity === filter)
    .sort((a, b) => SEV_ORDER.indexOf(a.severity) - SEV_ORDER.indexOf(b.severity));

  const counts = SEV_ORDER.reduce((acc, s) => ({ ...acc, [s]: result.findings.filter((f) => f.severity === s).length }), {} as Record<Severity, number>);

  return (
    <div className="d-fade">
      <PageHeader
        title="보안 개선센터"
        description="각 문제의 위험 등급·영향 URL·탐지 근거·예상 피해·수정 방법·서버별 설정·개발자 전달용 설명을 제공합니다."
        right={
          <select className="d-select !w-auto !py-1.5 text-[13px]" value={server} onChange={(e) => setServer(e.target.value)}>
            {["Nginx", "Apache", "Next.js", "Vercel", "Cloudflare"].map((s) => <option key={s}>{s}</option>)}
          </select>
        }
      />

      <div className="mb-4 d-tabs">
        <button className="d-tab" data-active={filter === "all"} onClick={() => setFilter("all")}>전체 <span className="cnt">{result.findings.length}</span></button>
        {SEV_ORDER.map((s) => counts[s] > 0 && (
          <button key={s} className="d-tab" data-active={filter === s} onClick={() => setFilter(s)}>
            {SEVERITY_LABEL[s]} <span className="cnt" style={{ color: sevColor(s) }}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {findings.length === 0 ? (
        <div className="d-card px-5 py-12 text-center">
          <Icon name="check" size={26} className="mx-auto mb-2" style={{ color: "var(--d-mint)" }} />
          <p className="text-[15px] font-bold">해당 위험도의 문제가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {findings.map((f) => (
            <div key={f.id} className="d-card d-card-hover overflow-hidden">
              <details className="d-detail">
                <summary className="flex items-center gap-3 p-4">
                  <span className="d-badge shrink-0" style={{ background: sevBg(f.severity), color: sevColor(f.severity) }}>{SEVERITY_LABEL[f.severity]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-bold">{f.title}</p>
                    <p className="truncate text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>{f.affectedUrls[0]}</p>
                  </div>
                  {f.expectedGain !== null && <span className="hidden shrink-0 text-[12px] font-bold sm:block" style={{ color: "var(--d-mint)" }}>보안 +{f.expectedGain}</span>}
                  <Icon name="chevron" size={18} className="chev shrink-0" />
                </summary>
                <div className="border-t px-4 py-4 text-[12.5px]" style={{ borderColor: "var(--d-border)", color: "var(--d-text-soft)" }}>
                  <Row label="탐지 근거">
                    <ul className="space-y-0.5">{f.evidence.map((e, i) => <li key={i}>{e}</li>)}</ul>
                  </Row>
                  <Row label="현재값 / 권장값"><span>{f.currentValue || "—"} → <strong style={{ color: "var(--d-mint)" }}>{f.recommendedValue || "—"}</strong></span></Row>
                  <Row label="예상 피해">{f.impact}</Row>
                  <Row label="권장 수정 방법">{f.fix}</Row>
                  {f.serverExamples && (
                    <Row label={`${server} 설정 예시`}>
                      <pre className="d-code">{f.serverExamples[server] || f.serverExamples[Object.keys(f.serverExamples)[0]]}</pre>
                    </Row>
                  )}
                  <Row label="영향을 받는 URL">
                    {f.affectedUrls.map((u) => <a key={u} href={u} target="_blank" rel="noreferrer" className="block truncate" style={{ color: "var(--d-sky-deep)" }}>{u}</a>)}
                  </Row>
                  <div className="mt-3 flex flex-wrap gap-2 border-t pt-3" style={{ borderColor: "var(--d-border)" }}>
                    <button
                      className="d-btn d-btn-secondary d-btn-sm"
                      onClick={() => navigator.clipboard?.writeText(`[보안 개선 요청] ${f.title}\n위험도: ${SEVERITY_LABEL[f.severity]}\n영향 URL: ${f.affectedUrls.join(", ")}\n문제: ${f.impact}\n수정: ${f.fix}\n${f.serverExamples?.[server] ? `설정(${server}):\n${f.serverExamples[server]}` : ""}`)}
                    >
                      <Icon name="check" size={14} /> 개발자 요청문 복사
                    </button>
                    <button className="d-btn d-btn-secondary d-btn-sm" onClick={scan}><Icon name="refresh" size={14} /> 재검사</button>
                  </div>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-[11px]" style={{ color: "var(--d-text-mute)" }}>
        위험도 판정은 관측된 사실(헤더 부재·인증서 상태 등)에 근거합니다. 능동 검증이 필요한 취약점은 임의로 &lsquo;취약&rsquo; 표시하지 않습니다.
        <Link href="/dashboard/security/vulnerabilities" className="ml-1 font-semibold" style={{ color: "var(--d-sky-deep)" }}>취약점 점검 정책 →</Link>
      </p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="mb-0.5 text-[11px] font-bold" style={{ color: "var(--d-text-mute)" }}>{label}</p>
      <div>{children}</div>
    </div>
  );
}
function sevBg(s: string) {
  return s === "critical" ? "var(--d-red-soft)" : s === "high" || s === "medium" ? "var(--d-orange-soft)" : "var(--d-gray-chip)";
}
function sevColor(s: string) {
  return s === "critical" ? "var(--d-red)" : s === "high" || s === "medium" ? "var(--d-orange)" : "var(--d-text-soft)";
}
