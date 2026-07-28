"use client";

import { useState } from "react";
import Link from "next/link";
import { useSecurity } from "@/components/dashboard/useSecurity";
import { EmptyState, Icon, PageHeader } from "@/components/dashboard/ui";
import { SECURITY_HEADERS } from "@/lib/security/headers";
import { SEVERITY_LABEL } from "@/lib/security/types";

const SERVERS = ["Nginx", "Apache", "Next.js", "Vercel", "Cloudflare"];

export default function HeadersPage() {
  const { activeSite, result, scanning, scan } = useSecurity();
  const [server, setServer] = useState("Nginx");

  if (!activeSite) {
    return (
      <>
        <PageHeader title="보안 헤더" description="9종 보안 헤더 적용 여부와 서버별 설정 예시를 제공합니다." />
        <EmptyState icon="headers" title="사이트를 등록하세요" action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }
  if (!result) {
    return (
      <>
        <PageHeader title="보안 헤더" description="9종 보안 헤더 적용 여부를 실측합니다." />
        <EmptyState icon="headers" title="보안 검사를 실행하세요" action={<button className="d-btn d-btn-primary" disabled={scanning} onClick={scan}>{scanning ? "검사 중…" : "보안 검사 실행"}</button>} />
      </>
    );
  }

  const applied = result.headers.filter((h) => h.present).length;

  return (
    <div className="d-fade">
      <PageHeader
        title="보안 헤더"
        description={`실제 응답 헤더 관측 결과입니다. 적용 ${applied}/${result.headers.length}. 각 항목의 위험도·현재값·권장값·수정 방법·서버별 예시를 제공합니다.`}
        right={
          <div className="flex items-center gap-2">
            <select className="d-select !w-auto !py-1.5 text-[13px]" value={server} onChange={(e) => setServer(e.target.value)}>
              {SERVERS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <button className="d-btn d-btn-primary d-btn-sm" disabled={scanning} onClick={scan}><Icon name="refresh" size={14} /> 재검사</button>
          </div>
        }
      />

      <div className="space-y-2.5">
        {SECURITY_HEADERS.map((spec) => {
          const observed = result.headers.find((h) => h.name === spec.name);
          const present = observed?.present ?? false;
          const example = spec.servers[server] || spec.servers[Object.keys(spec.servers)[0]];
          return (
            <div key={spec.key} className={`d-card d-card-hover overflow-hidden st-${present ? "best" : spec.severity === "info" ? "good" : "fail"}`}>
              <details className="d-detail">
                <summary className="flex items-center gap-3 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "var(--st-soft)", color: "var(--st)" }}>
                    <Icon name={present ? "check" : "warn"} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13.5px] font-bold">{spec.name}</span>
                      <span className="d-badge" style={{ background: present ? "var(--d-mint-soft)" : "var(--d-gray-chip)", color: present ? "var(--d-mint)" : "var(--d-text-mute)" }}>
                        {present ? "적용됨" : "미적용"}
                      </span>
                      <span className="d-badge" style={{ background: "var(--d-gray-chip)", color: "var(--d-text-soft)" }}>위험도 {SEVERITY_LABEL[spec.severity]}</span>
                    </div>
                    {present && observed?.value && <p className="mt-0.5 truncate text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>현재값: {observed.value}</p>}
                  </div>
                  <Icon name="chevron" size={18} className="chev shrink-0" />
                </summary>
                <div className="border-t px-4 py-4 text-[12.5px]" style={{ borderColor: "var(--d-border)", color: "var(--d-text-soft)" }}>
                  <p className="mb-1"><strong style={{ color: "var(--d-text)" }}>권장값:</strong> <code style={{ color: "var(--d-sky-deep)" }}>{spec.recommended}</code></p>
                  <p className="mb-1"><strong style={{ color: "var(--d-text)" }}>발생 가능한 문제:</strong> {spec.impact}</p>
                  <p className="mb-2"><strong style={{ color: "var(--d-text)" }}>수정 방법:</strong> {spec.fix}</p>
                  <p className="mb-1 text-[11px] font-bold" style={{ color: "var(--d-text-mute)" }}>{server} 설정 예시</p>
                  <pre className="d-code">{example}</pre>
                </div>
              </details>
            </div>
          );
        })}
      </div>
    </div>
  );
}
