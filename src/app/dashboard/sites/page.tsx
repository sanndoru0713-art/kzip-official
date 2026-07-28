"use client";

import { useState } from "react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { PageHeader, Icon, formatDateTime } from "@/components/dashboard/ui";
import type { SiteType } from "@/lib/seo/types";
import { SITE_TYPE_LABEL } from "@/lib/seo/types";

const TYPES: { key: SiteType; label: string; desc: string }[] = [
  { key: "general", label: "일반 사이트", desc: "기업·브랜드·콘텐츠·쇼핑몰 등 범용" },
  { key: "hospital", label: "병원 사이트", desc: "피부과·성형외과·치과·의료기관" },
  { key: "tourism", label: "관광 사이트", desc: "여행 플랫폼·관광 포털·도시 가이드" },
];

export default function SitesPage() {
  const { sites, addSite, removeSite, updateSite, getScansFor, setActiveSiteId, runScan, scanning } = useDashboard();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<SiteType>("general");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = url.trim();
    if (!name.trim() || !trimmed) {
      setError("사이트명과 URL을 입력하세요.");
      return;
    }
    try {
      new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    } catch {
      setError("올바른 URL 형식이 아닙니다.");
      return;
    }
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    addSite(name.trim(), normalized, type, memo.trim() || undefined);
    setName("");
    setUrl("");
    setMemo("");
    setType("general");
  }

  return (
    <div className="d-fade">
      <PageHeader
        title="사이트 관리"
        description="분석·관리할 사이트를 등록합니다. 사이트 유형에 따라 평가 기준과 카테고리 가중치가 달라집니다. 모든 데이터는 이 브라우저에 저장되며, 백엔드 연동 시 서버로 이관됩니다."
      />

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        {/* 등록 폼 */}
        <form onSubmit={submit} className="d-card h-fit p-5">
          <h2 className="mb-3 text-[15px] font-bold">새 사이트 등록</h2>
          <div className="space-y-3">
            <div>
              <label className="d-label">사이트명</label>
              <input className="d-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="예: K:ZIP 일본어" />
            </div>
            <div>
              <label className="d-label">URL</label>
              <input className="d-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://ja.koreatrendzip.kr/ja" />
            </div>
            <div>
              <label className="d-label">사이트 유형</label>
              <div className="grid grid-cols-1 gap-2">
                {TYPES.map((t) => (
                  <button
                    type="button"
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className="flex items-center gap-3 rounded-xl border p-2.5 text-left transition"
                    style={{
                      borderColor: type === t.key ? "var(--d-sky)" : "var(--d-border)",
                      background: type === t.key ? "var(--d-sky-soft)" : "var(--d-surface)",
                    }}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: type === t.key ? "var(--d-sky)" : "var(--d-gray-chip)", color: type === t.key ? "#fff" : "var(--d-text-soft)" }}
                    >
                      <Icon name={t.key === "hospital" ? "hospital" : t.key === "tourism" ? "tour" : "business"} size={16} />
                    </span>
                    <span>
                      <span className="block text-[13px] font-bold">{t.label}</span>
                      <span className="block text-[11px]" style={{ color: "var(--d-text-mute)" }}>{t.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="d-label">메모 (선택)</label>
              <input className="d-input" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="예: GA 3일 내 연결 예정" />
            </div>
            {error && <p className="text-[12px]" style={{ color: "var(--d-red)" }}>{error}</p>}
            <button type="submit" className="d-btn d-btn-primary w-full">
              <Icon name="plus" size={16} /> 사이트 등록
            </button>
          </div>
        </form>

        {/* 사이트 목록 */}
        <div>
          {sites.length === 0 ? (
            <div className="d-card px-5 py-12 text-center">
              <Icon name="web" size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-[14px] font-bold">등록된 사이트가 없습니다</p>
              <p className="mt-1 text-[12.5px]" style={{ color: "var(--d-text-mute)" }}>왼쪽 폼에서 첫 사이트를 등록하세요.</p>
              <div className="mx-auto mt-4 max-w-sm space-y-1.5 text-left text-[12px]" style={{ color: "var(--d-text-soft)" }}>
                <p className="font-semibold">추천 등록 예시</p>
                <Suggest name="K:ZIP 일본어" url="https://ja.koreatrendzip.kr/ja" type="tourism" onAdd={(n, u, t) => addSite(n, u, t)} />
                <Suggest name="K:ZIP Research" url="https://research.koreatrendzip.kr/" type="general" onAdd={(n, u, t) => addSite(n, u, t)} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sites.map((s) => {
                const scans = getScansFor(s.id);
                const last = scans[scans.length - 1];
                return (
                  <div key={s.id} className="d-card d-card-hover p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] font-bold">{s.name}</span>
                          <span className="d-badge" style={{ background: "var(--d-sky-soft)", color: "var(--d-sky-deep)" }}>
                            {SITE_TYPE_LABEL[s.type]}
                          </span>
                        </div>
                        <a href={s.url} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-[12.5px]" style={{ color: "var(--d-sky-deep)" }}>
                          {s.url} <Icon name="external" size={12} />
                        </a>
                        <p className="mt-1 text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>
                          마지막 검사 {last ? formatDateTime(last.scannedAt) : "없음"} · 검사 이력 {scans.length}회
                          {s.memo ? ` · ${s.memo}` : ""}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <select
                          className="d-select !w-auto !py-1.5 text-[12px]"
                          value={s.type}
                          onChange={(e) => updateSite({ ...s, type: e.target.value as SiteType })}
                          aria-label="유형 변경"
                        >
                          {TYPES.map((t) => (
                            <option key={t.key} value={t.key}>{t.label}</option>
                          ))}
                        </select>
                        <button className="d-btn d-btn-secondary d-btn-sm" onClick={() => { setActiveSiteId(s.id); runScan(s); }} disabled={!!scanning}>
                          <Icon name="refresh" size={13} /> 분석
                        </button>
                        <button className="d-btn d-btn-ghost d-btn-sm" onClick={() => setActiveSiteId(s.id)}>
                          선택
                        </button>
                        <button
                          className="d-btn d-btn-ghost d-btn-sm"
                          style={{ color: "var(--d-red)" }}
                          onClick={() => {
                            if (confirm(`${s.name}과(와) 모든 검사 이력을 삭제할까요?`)) removeSite(s.id);
                          }}
                        >
                          <Icon name="close" size={13} /> 삭제
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Suggest({ name, url, type, onAdd }: { name: string; url: string; type: SiteType; onAdd: (n: string, u: string, t: SiteType) => void }) {
  return (
    <button className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left" style={{ borderColor: "var(--d-border)" }} onClick={() => onAdd(name, url, type)}>
      <span>
        <span className="block font-semibold" style={{ color: "var(--d-text)" }}>{name}</span>
        <span className="block text-[11px]" style={{ color: "var(--d-text-mute)" }}>{url}</span>
      </span>
      <Icon name="plus" size={15} style={{ color: "var(--d-sky)" }} />
    </button>
  );
}
