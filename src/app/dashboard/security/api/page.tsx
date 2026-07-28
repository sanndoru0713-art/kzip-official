"use client";

import { useEffect, useState } from "react";
import { PageHeader, Icon } from "@/components/dashboard/ui";

export default function ApiSecurityPage() {
  const [integrations, setIntegrations] = useState<Record<string, { connected?: boolean; keyConfigured?: boolean; requirement: string }> | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/integrations").then((r) => r.json()).then(setIntegrations).catch(() => setIntegrations(null));
  }, []);

  const keys = [
    { name: "Google 서비스 계정 (GSC·GA4)", connected: integrations?.searchConsole?.connected || integrations?.ga4?.connected, env: "GOOGLE_SERVICE_ACCOUNT_JSON" },
    { name: "PageSpeed Insights", connected: integrations?.psi?.keyConfigured, env: "PSI_API_KEY" },
    { name: "Bing Webmaster", connected: integrations?.bing?.connected, env: "BING_WEBMASTER_API_KEY" },
    { name: "AI 생성 (Claude)", connected: integrations?.ai?.connected, env: "ANTHROPIC_API_KEY" },
  ];

  return (
    <div className="d-fade">
      <PageHeader title="API 보안" description="외부 서비스 API Key는 서버 환경변수에만 저장되며 프론트엔드·페이지 소스·개발자도구에서 확인할 수 없습니다." />

      <div className="d-card mb-5 p-5">
        <h2 className="mb-3 text-[15px] font-bold">연동 Key 상태 (값은 마스킹)</h2>
        <div className="space-y-2">
          {keys.map((k) => (
            <div key={k.name} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3" style={{ borderColor: "var(--d-border)" }}>
              <div>
                <p className="text-[13px] font-semibold">{k.name}</p>
                <p className="font-mono text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>
                  env: {k.env} · 값: {k.connected ? "sk-••••••••••••••••" : "미설정"}
                </p>
              </div>
              <span className="d-badge" style={{ background: k.connected ? "var(--d-mint-soft)" : "var(--d-gray-chip)", color: k.connected ? "var(--d-mint)" : "var(--d-text-mute)" }}>
                {k.connected ? "연결됨" : "연결 필요"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="d-card p-5">
        <h2 className="mb-2 text-[15px] font-bold">API 보안 적용 원칙</h2>
        <ul className="grid gap-1.5 text-[12.5px] sm:grid-cols-2" style={{ color: "var(--d-text-soft)" }}>
          {[
            "API Key를 프론트엔드 코드/번들에 포함하지 않음",
            "서버 환경변수에만 저장 (브라우저 접근 불가)",
            "로그에 전체 Key 미기록 · 화면 표시 시 마스킹",
            "최소 권한 OAuth Scope · Access Token 갱신 처리",
            "만료 Token 감지 · 호출 횟수 제한(Rate Limit)",
            "Key 교체·연결 해제 기능 (설정에서 관리)",
            "Webhook 서명 검증",
            "비정상 API 사용 감지 (2차 개발)",
          ].map((t) => (
            <li key={t} className="flex items-start gap-1.5">
              <Icon name="check" size={14} className="mt-0.5 shrink-0" style={{ color: "var(--d-mint)" }} /> {t}
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-lg p-2.5 text-[11.5px]" style={{ background: "var(--d-sky-softer)", color: "var(--d-text-soft)" }}>
          이 대시보드의 crawl·PSI·AI·보안 API 라우트는 서버에서 실행되며, 레이트리밋·입력 검증·SSRF 방지가 적용되어 있습니다. AI 생성 요청 시 API Key나 개인정보를 프롬프트에 포함하지 않습니다.
        </p>
      </div>
    </div>
  );
}
