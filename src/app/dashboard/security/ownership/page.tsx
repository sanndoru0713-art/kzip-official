"use client";

import { useState } from "react";
import Link from "next/link";
import { useSecurity } from "@/components/dashboard/useSecurity";
import { EmptyState, Icon, PageHeader, formatDateTime } from "@/components/dashboard/ui";

export default function OwnershipPage() {
  const { activeSite, origin, token, ownership, verifyOwnership, error } = useSecurity();
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!activeSite || !origin) {
    return (
      <>
        <PageHeader title="사이트 소유권 인증" description="능동 보안 점검 전 소유권을 확인합니다." />
        <EmptyState icon="lock" title="사이트를 먼저 등록/선택하세요" action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }

  async function run(method: "meta" | "file" | "dns") {
    setBusy(method);
    await verifyOwnership(method);
    setBusy(null);
  }

  const metaTag = `<meta name="kzip-site-verification" content="${token}" />`;
  const dnsTxt = `kzip-site-verification=${token}`;
  const fileUrl = `${origin}/kzip-verification-${token}.txt`;

  return (
    <div className="d-fade">
      <PageHeader
        title="사이트 소유권 인증"
        description="소유권이 확인된 사이트만 민감파일 노출·취약점 징후 등 확장 점검을 사용할 수 있습니다. 인증 전에는 공개 정보(수동 점검)만 분석합니다."
      />

      {/* 현재 상태 */}
      <div className="d-card mb-5 flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <p className="text-[13px] font-bold">{activeSite.name}</p>
          <p className="text-[12px]" style={{ color: "var(--d-text-mute)" }}>{origin}</p>
        </div>
        <span className="d-badge" style={{ background: ownership?.verified ? "var(--d-mint-soft)" : "var(--d-orange-soft)", color: ownership?.verified ? "var(--d-mint)" : "var(--d-orange)" }}>
          {ownership?.verified ? `인증됨 · ${formatDateTime(ownership.verifiedAt)}` : "미인증"}
        </span>
      </div>

      {error && <div className="d-card mb-4 p-3 text-[12.5px]" style={{ color: "var(--d-red)", background: "var(--d-red-soft)" }}>⚠ {error}</div>}

      {/* 토큰 */}
      <div className="d-card mb-5 p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">인증 토큰</h2>
          <button
            className="d-btn d-btn-ghost d-btn-sm"
            onClick={() => { navigator.clipboard?.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          >
            <Icon name="check" size={14} /> {copied ? "복사됨" : "토큰 복사"}
          </button>
        </div>
        <pre className="d-code">{token}</pre>
        <p className="mt-1 text-[11px]" style={{ color: "var(--d-text-mute)" }}>이 토큰은 사이트별로 고정됩니다. 아래 3가지 중 한 방법으로 사이트에 적용한 뒤 인증하세요.</p>
      </div>

      {/* 방법들 */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Method
          title="① Meta 태그"
          desc="사이트 홈페이지 <head>에 아래 태그를 추가하세요."
          code={metaTag}
          busy={busy === "meta"}
          verified={ownership?.verified && ownership.method === "meta"}
          onVerify={() => run("meta")}
        />
        <Method
          title="② HTML 파일"
          desc="아래 경로에 토큰을 담은 파일을 업로드하세요."
          code={fileUrl}
          busy={busy === "file"}
          verified={ownership?.verified && ownership.method === "file"}
          onVerify={() => run("file")}
        />
        <Method
          title="③ DNS TXT"
          desc="도메인 DNS에 아래 TXT 레코드를 추가하세요 (전파에 시간 소요)."
          code={dnsTxt}
          busy={busy === "dns"}
          verified={ownership?.verified && ownership.method === "dns"}
          onVerify={() => run("dns")}
        />
      </div>

      <div className="d-card mt-5 p-5">
        <h3 className="mb-2 text-[14px] font-bold">기타 인증 방식</h3>
        <ul className="space-y-1 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
          <li>• Google Search Console 소유권 연동 — GSC 연결 시 자동 인증 (2차 개발)</li>
          <li>• 관리자 승인 — 조직 관리자가 수동 승인 (백엔드 연동 후)</li>
        </ul>
      </div>

      {ownership?.verified && (
        <div className="d-card mt-5 flex items-center justify-between gap-3 p-4" style={{ background: "var(--d-mint-soft)" }}>
          <p className="text-[13px] font-semibold" style={{ color: "var(--d-mint)" }}>
            <Icon name="check" size={16} className="mr-1 inline align-text-bottom" /> 소유권 인증 완료 — 확장 보안 점검을 사용할 수 있습니다.
          </p>
          <Link href="/dashboard/security/scan" className="d-btn d-btn-primary d-btn-sm">보안 검사 실행</Link>
        </div>
      )}
    </div>
  );
}

function Method({ title, desc, code, busy, verified, onVerify }: { title: string; desc: string; code: string; busy: boolean; verified?: boolean; onVerify: () => void }) {
  return (
    <div className="d-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-[14px] font-bold">{title}</h3>
        {verified && <span className="d-badge" style={{ background: "var(--d-mint-soft)", color: "var(--d-mint)" }}>인증됨</span>}
      </div>
      <p className="mb-2 text-[12px]" style={{ color: "var(--d-text-soft)" }}>{desc}</p>
      <pre className="d-code">{code}</pre>
      <button className="d-btn d-btn-secondary d-btn-sm mt-3 w-full" disabled={busy} onClick={onVerify}>
        {busy ? <span className="d-spinner d-spinner-blue" /> : <Icon name="check" size={14} />}
        {busy ? "확인 중…" : "인증 확인"}
      </button>
    </div>
  );
}
