"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAnalysis } from "@/components/dashboard/useAnalysis";
import { PageHeader, Icon, ScoreRing } from "@/components/dashboard/ui";
import { DEFAULT_WEIGHTS } from "@/lib/seo/scoring";
import { CATEGORY_LABEL, SITE_TYPE_LABEL } from "@/lib/seo/types";
import type { CategoryId, SiteType } from "@/lib/seo/types";

export default function SettingsPage() {
  const { settings, saveSettings, activeSite } = useDashboard();
  const [type, setType] = useState<SiteType>(activeSite?.type || "general");
  const [integrations, setIntegrations] = useState<Record<string, { connected?: boolean; keyConfigured?: boolean; requirement: string }> | null>(null);
  const a = useAnalysis(type);

  useEffect(() => {
    fetch("/api/dashboard/integrations").then((r) => r.json()).then(setIntegrations).catch(() => setIntegrations(null));
  }, []);

  const weights = { ...DEFAULT_WEIGHTS[type], ...settings.weights?.[type] };
  const total = Object.values(weights).reduce((a, b) => a + (b ?? 0), 0);

  function setWeight(cat: CategoryId, value: number) {
    const next = { ...settings.weights, [type]: { ...weights, [cat]: value } };
    saveSettings({ ...settings, weights: next });
  }

  function resetWeights() {
    const next = { ...settings.weights, [type]: { ...DEFAULT_WEIGHTS[type] } };
    saveSettings({ ...settings, weights: next });
  }

  return (
    <div className="d-fade">
      <PageHeader title="설정" description="카테고리 가중치·API 연동·PSI Key를 관리합니다. 가중치 변경 시 점수와 순위가 즉시 재계산됩니다." />

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* 가중치 편집 */}
        <div className="d-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[15px] font-bold">카테고리 가중치</h2>
            <div className="d-tabs">
              {(["general", "hospital", "tourism"] as SiteType[]).map((t) => (
                <button key={t} className="d-tab" data-active={type === t} onClick={() => setType(t)}>{SITE_TYPE_LABEL[t]}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {(Object.keys(weights) as CategoryId[]).map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[13px] font-semibold">{CATEGORY_LABEL[cat]}</span>
                <input
                  type="range"
                  min={0}
                  max={40}
                  value={weights[cat] ?? 0}
                  onChange={(e) => setWeight(cat, Number(e.target.value))}
                  className="flex-1 accent-[var(--d-sky)]"
                />
                <span className="w-12 text-right text-[13px] font-bold" style={{ color: "var(--d-sky-deep)" }}>{weights[cat] ?? 0}%</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: "var(--d-border)" }}>
            <span className="text-[12.5px]" style={{ color: total === 100 ? "var(--d-mint)" : "var(--d-orange)" }}>
              합계 {total}% {total !== 100 && "(100%가 아니어도 비율로 정규화되어 계산됩니다)"}
            </span>
            <button className="d-btn d-btn-ghost d-btn-sm" onClick={resetWeights}><Icon name="refresh" size={14} /> 기본값 복원</button>
          </div>
        </div>

        {/* 실시간 재계산 미리보기 */}
        <div className="d-card p-5 text-center">
          <h3 className="mb-2 text-[13px] font-bold">현재 사이트 종합점수</h3>
          {activeSite && a.scores?.overall !== null && a.scores ? (
            <>
              <ScoreRing score={a.scores.overall} size={110} label="재계산" />
              <p className="mt-2 text-[12px]" style={{ color: "var(--d-text-mute)" }}>
                {activeSite.name} 기준. 위 가중치를 조정하면 즉시 반영됩니다.
              </p>
            </>
          ) : (
            <p className="py-8 text-[12.5px]" style={{ color: "var(--d-text-mute)" }}>
              {activeSite ? "분석 후 미리보기가 표시됩니다." : "사이트를 선택하세요."}
            </p>
          )}
        </div>
      </div>

      {/* API 연동 */}
      <div className="d-card mt-5 p-5">
        <h2 className="mb-1 text-[15px] font-bold">데이터 연동</h2>
        <p className="mb-3 text-[12px]" style={{ color: "var(--d-text-mute)" }}>
          연동은 서버 환경변수로 설정합니다. API Key는 프론트엔드에 노출되지 않으며, 미연결 항목은 데모 수치 대신 &lsquo;연결 필요&rsquo;로 표시됩니다.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <IntegrationRow name="Google Search Console" state={integrations?.searchConsole} />
          <IntegrationRow name="Google Analytics 4" state={integrations?.ga4} />
          <IntegrationRow name="PageSpeed Insights" state={integrations?.psi} keyMode />
          <IntegrationRow name="Bing Webmaster" state={integrations?.bing} />
          <IntegrationRow name="AI 생성 (Claude)" state={integrations?.ai} />
        </div>

        <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--d-border)" }}>
          <label className="d-label">PSI API Key (이 브라우저에만 저장 — 서버 로그에 남지 않음)</label>
          <div className="flex gap-2">
            <input
              className="d-input"
              type="password"
              placeholder="AIza… (선택 — 없어도 측정되나 쿼터 낮음)"
              defaultValue={settings.psiApiKey || ""}
              onBlur={(e) => saveSettings({ ...settings, psiApiKey: e.target.value.trim() || undefined })}
            />
          </div>
          <p className="mt-1 text-[11px]" style={{ color: "var(--d-text-mute)" }}>
            운영 환경에서는 브라우저 저장 대신 서버 환경변수(PSI_API_KEY)를 권장합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function IntegrationRow({ name, state, keyMode }: { name: string; state?: { connected?: boolean; keyConfigured?: boolean; requirement: string }; keyMode?: boolean }) {
  const connected = keyMode ? state?.keyConfigured : state?.connected;
  return (
    <div className="flex items-start justify-between gap-2 rounded-xl border p-3" style={{ borderColor: "var(--d-border)" }}>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold">{name}</p>
        <p className="mt-0.5 text-[11px]" style={{ color: "var(--d-text-mute)" }}>{state?.requirement || "연동 정보를 불러오는 중…"}</p>
      </div>
      <span className="d-badge shrink-0" style={{ background: connected ? "var(--d-mint-soft)" : "var(--d-gray-chip)", color: connected ? "var(--d-mint)" : "var(--d-text-mute)" }}>
        {connected ? "연결됨" : keyMode ? "키 없음" : "연결 필요"}
      </span>
    </div>
  );
}
