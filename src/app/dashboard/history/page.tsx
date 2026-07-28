"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { EmptyState, Icon, PageHeader, formatDateTime } from "@/components/dashboard/ui";
import { evaluateAll, computeScores } from "@/lib/seo/scoring";
import { CATEGORY_LABEL } from "@/lib/seo/types";
import type { CategoryId, Scan, SiteType } from "@/lib/seo/types";

const TRACKED: (CategoryId | "overall")[] = ["overall", "technical", "content", "aeo", "geo", "schema", "trust", "mobile"];

export default function HistoryPage() {
  const { activeSite, scans, settings } = useDashboard();
  const [range, setRange] = useState<"all" | "week" | "month" | "quarter">("all");

  const rows = useMemo(() => {
    if (!activeSite) return [];
    const type: SiteType = activeSite.type;
    const now = Date.now();
    const cutoff = range === "week" ? 7 : range === "month" ? 31 : range === "quarter" ? 93 : Infinity;
    return scans
      .filter((s) => (now - new Date(s.scannedAt).getTime()) / 86400000 <= cutoff)
      .map((s: Scan) => {
        const results = evaluateAll({ crawl: s.crawl, psi: s.psi }, type);
        const sc = computeScores(results, type, settings.weights?.[type] as never);
        const errors = s.crawl.pages.filter((p) => p.status !== 200).length + s.crawl.brokenLinks.brokenCount;
        const fails = sc.checks.filter((c) => c.outcome === "fail").length;
        return { scan: s, scores: sc, errors, fails };
      });
  }, [activeSite, scans, settings.weights, range]);

  if (!activeSite) {
    return (
      <>
        <PageHeader title="변화 추적" description="검사 결과를 날짜별로 저장해 종합·카테고리 점수 변화를 추적합니다." />
        <EmptyState icon="trend" title="사이트를 등록하세요" action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }

  if (rows.length === 0) {
    return (
      <>
        <PageHeader title="변화 추적" />
        <EmptyState icon="trend" title="저장된 검사 이력이 없습니다" description="분석을 실행할 때마다 결과가 날짜별로 자동 저장됩니다. 두 번 이상 검사하면 변화가 표시됩니다." />
      </>
    );
  }

  const maxOverall = Math.max(...rows.map((r) => r.scores.overall ?? 0), 100);
  const first = rows[0];
  const last = rows[rows.length - 1];

  return (
    <div className="d-fade">
      <PageHeader
        title="변화 추적"
        description="분석 실행마다 저장된 스냅샷을 기준으로 종합·카테고리 점수, 오류 수, 미달 항목 변화를 추적합니다."
        right={
          <div className="d-tabs">
            {(["week", "month", "quarter", "all"] as const).map((r) => (
              <button key={r} className="d-tab" data-active={range === r} onClick={() => setRange(r)}>
                {r === "week" ? "주간" : r === "month" ? "월간" : r === "quarter" ? "분기" : "전체"}
              </button>
            ))}
          </div>
        }
      />

      {/* 스파크라인 */}
      <div className="d-card mb-5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold">종합점수 추이</h2>
          {first.scores.overall !== null && last.scores.overall !== null && (
            <span className="text-[13px] font-bold" style={{ color: last.scores.overall >= first.scores.overall ? "var(--d-mint)" : "var(--d-red)" }}>
              {last.scores.overall - first.scores.overall >= 0 ? "▲" : "▼"} {Math.abs(last.scores.overall - first.scores.overall)}점 ({rows.length}회 검사)
            </span>
          )}
        </div>
        <div className="flex items-end gap-1.5" style={{ height: 120 }}>
          {rows.map((r, i) => {
            const h = r.scores.overall !== null ? (r.scores.overall / maxOverall) * 100 : 0;
            const tone = r.scores.overall === null ? "var(--d-gray-chip)" : r.scores.overall >= 90 ? "var(--d-mint)" : r.scores.overall >= 70 ? "var(--d-orange)" : "var(--d-red)";
            return (
              <div key={i} className="flex flex-1 flex-col items-center justify-end" title={`${formatDateTime(r.scan.scannedAt)}: ${r.scores.overall ?? "—"}`}>
                <span className="mb-1 text-[10px] font-bold" style={{ color: "var(--d-text-soft)" }}>{r.scores.overall ?? "—"}</span>
                <div className="w-full rounded-t" style={{ height: `${Math.max(h, 3)}%`, background: tone, minHeight: 4 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 상세 표 */}
      <div className="d-card overflow-x-auto">
        <table className="d-table d-table-hover">
          <thead>
            <tr>
              <th>검사 일시</th>
              {TRACKED.map((k) => <th key={k}>{k === "overall" ? "종합" : CATEGORY_LABEL[k as CategoryId]}</th>)}
              <th>오류</th>
              <th>미달 항목</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const prev = i > 0 ? rows[i - 1] : null;
              return (
                <tr key={r.scan.id}>
                  <td className="whitespace-nowrap font-semibold">{formatDateTime(r.scan.scannedAt)}</td>
                  {TRACKED.map((k) => {
                    const cur = k === "overall" ? r.scores.overall : r.scores.categories.find((c) => c.category === k)?.score ?? null;
                    const pv = prev ? (k === "overall" ? prev.scores.overall : prev.scores.categories.find((c) => c.category === k)?.score ?? null) : null;
                    const delta = cur !== null && pv !== null ? cur - pv : null;
                    return (
                      <td key={k}>
                        <span className="font-bold">{cur ?? "—"}</span>
                        {delta !== null && delta !== 0 && (
                          <span className="ml-1 text-[10px]" style={{ color: delta > 0 ? "var(--d-mint)" : "var(--d-red)" }}>
                            {delta > 0 ? "+" : ""}{delta}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td style={{ color: r.errors > 0 ? "var(--d-red)" : "var(--d-text-mute)" }}>{r.errors}</td>
                  <td style={{ color: r.fails > 0 ? "var(--d-orange)" : "var(--d-text-mute)" }}>{r.fails}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
