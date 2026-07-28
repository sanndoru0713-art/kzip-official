"use client";

import { useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAnalysis } from "@/components/dashboard/useAnalysis";
import { useCompetitorBenchmark } from "@/components/dashboard/benchmark";
import { EmptyState, Icon, PageHeader, StatusBadge, formatDateTime, outcomeFromNumber } from "@/components/dashboard/ui";
import type { CategoryId, SiteType } from "@/lib/seo/types";
import { CATEGORY_LABEL, SITE_TYPE_LABEL } from "@/lib/seo/types";
import { evaluateAll, computeScores } from "@/lib/seo/scoring";

const TOURISM_DEFAULTS = [
  { name: "비짓부산", url: "https://www.visitbusan.net" },
  { name: "Visit Korea", url: "https://www.visitkorea.or.kr" },
  { name: "서울나비", url: "https://www.seoulnavi.com" },
  { name: "코네스트", url: "https://www.konest.com" },
  { name: "우리트립", url: "https://www.wooritrip.com" },
  { name: "Klook", url: "https://www.klook.com" },
  { name: "Trazy", url: "https://www.trazy.com" },
  { name: "KKday", url: "https://www.kkday.com" },
  { name: "Tripadvisor", url: "https://www.tripadvisor.com" },
  { name: "Google Travel", url: "https://www.google.com/travel" },
];

const COMPARE_ROWS: { key: "overall" | CategoryId; label: string }[] = [
  { key: "overall", label: "종합점수" },
  { key: "technical", label: "기술 SEO" },
  { key: "content", label: "콘텐츠 품질" },
  { key: "aeo", label: "AEO" },
  { key: "geo", label: "GEO·AI" },
  { key: "schema", label: "구조화데이터" },
  { key: "trust", label: "신뢰도" },
  { key: "mobile", label: "모바일·속도" },
];

export default function CompetitorsPage() {
  const { activeSite, competitors, groups, addCompetitor, removeCompetitor, addGroup, removeGroup, getScansFor, runScan, scanning, settings } = useDashboard();
  const a = useAnalysis();
  const type: SiteType = activeSite?.type || "general";
  const bench = useCompetitorBenchmark(type);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [groupId, setGroupId] = useState("");
  const [groupName, setGroupName] = useState("");

  const rivals = competitors.filter((c) => c.type === type);
  const typeGroups = groups.filter((g) => g.type === type);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const u = url.trim();
    if (!name.trim() || !u) return;
    const normalized = /^https?:\/\//i.test(u) ? u : `https://${u}`;
    addCompetitor(name.trim(), normalized, type, groupId || undefined);
    setName("");
    setUrl("");
  }

  function scoreOf(targetId: string, key: "overall" | CategoryId): number | null {
    const scans = getScansFor(targetId);
    const latest = scans[scans.length - 1];
    if (!latest) return null;
    const results = evaluateAll({ crawl: latest.crawl, psi: latest.psi }, type);
    const s = computeScores(results, type, settings.weights?.[type] as never);
    if (key === "overall") return s.overall;
    return s.categories.find((c) => c.category === key)?.score ?? null;
  }

  if (!activeSite) {
    return (
      <>
        <PageHeader title="경쟁사 분석" description="경쟁사를 사이트 유형별로 등록하고 동일 기준으로 비교합니다." />
        <EmptyState icon="compare" title="먼저 내 사이트를 등록하세요" description="활성 사이트의 유형에 맞는 경쟁사를 등록해 비교합니다." action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }

  return (
    <div className="d-fade">
      <PageHeader
        title="경쟁사 분석"
        description={`현재 유형: ${SITE_TYPE_LABEL[type]}. 경쟁사도 내 사이트와 완전히 동일한 기준·가중치로 분석합니다. robots.txt를 준수하며 크롤링합니다.`}
      />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          {/* 등록 */}
          <form onSubmit={submit} className="d-card p-5">
            <h2 className="mb-3 text-[15px] font-bold">경쟁사 등록</h2>
            <div className="space-y-2.5">
              <input className="d-input" placeholder="경쟁사명" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="d-input" placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} />
              {typeGroups.length > 0 && (
                <select className="d-select" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
                  <option value="">그룹 없음</option>
                  {typeGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              )}
              <button type="submit" className="d-btn d-btn-primary w-full"><Icon name="plus" size={15} /> 추가</button>
            </div>

            {type === "tourism" && (
              <div className="mt-4 border-t pt-3" style={{ borderColor: "var(--d-border)" }}>
                <p className="mb-2 text-[12px] font-semibold" style={{ color: "var(--d-text-soft)" }}>관광 경쟁사 기본값 빠른 추가</p>
                <div className="flex flex-wrap gap-1.5">
                  {TOURISM_DEFAULTS.filter((d) => !rivals.some((r) => r.name === d.name)).map((d) => (
                    <button key={d.name} className="d-btn d-btn-ghost d-btn-sm" style={{ background: "var(--d-sky-softer)" }} onClick={() => addCompetitor(d.name, d.url, "tourism")}>
                      + {d.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </form>

          {/* 그룹 관리 */}
          <div className="d-card p-5">
            <h2 className="mb-2 text-[15px] font-bold">그룹 관리</h2>
            <p className="mb-2 text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>지역·진료과목·시술·외국인/일본인 대상 등으로 그룹화</p>
            <div className="flex gap-2">
              <input className="d-input" placeholder="예: 강남 피부과 / 일본인 대상" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
              <button className="d-btn d-btn-secondary" onClick={() => { if (groupName.trim()) { addGroup(groupName.trim(), type); setGroupName(""); } }}>추가</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {typeGroups.map((g) => (
                <span key={g.id} className="d-badge" style={{ background: "var(--d-gray-chip)", color: "var(--d-text-soft)" }}>
                  {g.name}
                  <button onClick={() => removeGroup(g.id)} aria-label="그룹 삭제"><Icon name="close" size={12} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 목록 + 비교 */}
        <div className="space-y-4">
          {rivals.length === 0 ? (
            <div className="d-card px-5 py-10 text-center">
              <Icon name="compare" size={26} className="mx-auto mb-2 opacity-30" />
              <p className="text-[14px] font-bold">등록된 경쟁사가 없습니다</p>
              <p className="mt-1 text-[12.5px]" style={{ color: "var(--d-text-mute)" }}>{type === "tourism" ? "왼쪽에서 기본 경쟁사를 빠르게 추가하세요." : "경쟁사명과 URL을 직접 추가하세요."}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {rivals.map((c) => {
                  const scans = getScansFor(c.id);
                  const last = scans[scans.length - 1];
                  const ov = scoreOf(c.id, "overall");
                  return (
                    <div key={c.id} className="d-card d-card-hover flex flex-wrap items-center gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold">{c.name}</span>
                          {c.groupId && <span className="d-badge" style={{ background: "var(--d-gray-chip)", color: "var(--d-text-mute)" }}>{typeGroups.find((g) => g.id === c.groupId)?.name}</span>}
                          {ov !== null && <StatusBadge outcome={outcomeFromNumber(ov)} label={`${ov}점`} />}
                        </div>
                        <p className="truncate text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>{c.url} · {last ? `검사 ${formatDateTime(last.scannedAt)}` : "미분석"}</p>
                      </div>
                      <button className="d-btn d-btn-secondary d-btn-sm" disabled={!!scanning} onClick={() => runScan(c)}>
                        <Icon name="refresh" size={13} /> 분석
                      </button>
                      <button className="d-btn d-btn-ghost d-btn-sm" style={{ color: "var(--d-red)" }} onClick={() => removeCompetitor(c.id)}>
                        <Icon name="close" size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* 비교 표 */}
              <div className="d-card overflow-x-auto">
                <div className="flex items-center justify-between p-4 pb-2">
                  <h2 className="text-[15px] font-bold">동일 기준 비교</h2>
                  <Link href="/dashboard/gap" className="text-[12.5px] font-semibold" style={{ color: "var(--d-sky-deep)" }}>격차 분석 →</Link>
                </div>
                <table className="d-table d-table-hover">
                  <thead>
                    <tr>
                      <th>항목</th>
                      <th style={{ color: "var(--d-sky-deep)" }}>내 사이트</th>
                      <th>경쟁사 평균</th>
                      {rivals.map((c) => <th key={c.id}>{c.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((row) => {
                      const mine = row.key === "overall" ? a.scores?.overall ?? null : a.categoryScore(row.key);
                      const rivalScores = rivals.map((c) => scoreOf(c.id, row.key)).filter((v): v is number => v !== null);
                      const avg = rivalScores.length ? Math.round(rivalScores.reduce((x, y) => x + y, 0) / rivalScores.length) : null;
                      return (
                        <tr key={row.key}>
                          <td className="font-semibold">{row.key === "overall" ? "종합점수" : CATEGORY_LABEL[row.key as CategoryId]}</td>
                          <td className="font-bold" style={{ color: mine !== null && avg !== null ? (mine >= avg ? "var(--d-mint)" : "var(--d-red)") : "var(--d-text)" }}>{mine ?? "—"}</td>
                          <td>{avg ?? <span style={{ color: "var(--d-text-mute)" }}>미분석</span>}</td>
                          {rivals.map((c) => {
                            const v = scoreOf(c.id, row.key);
                            return <td key={c.id} style={{ color: "var(--d-text-soft)" }}>{v ?? "—"}</td>;
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="p-3 text-[11px]" style={{ color: "var(--d-text-mute)" }}>
                  경쟁사 점수가 &lsquo;—&rsquo;이면 아직 분석되지 않은 것입니다. 각 경쟁사의 &lsquo;분석&rsquo;을 실행하면 실제 크롤링 기반으로 채워집니다.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
