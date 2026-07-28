"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { useAnalysis } from "./useAnalysis";
import { CheckCard } from "./CheckCard";
import { EmptyState, Icon, ScoreRing, StatusTabs, StatusFilter, formatDateTime } from "./ui";
import type { CategoryId, SiteType } from "@/lib/seo/types";
import { CATEGORY_LABEL } from "@/lib/seo/types";

export function CrawlSummaryBar() {
  const { scan: latestScan } = useAnalysis();
  if (!latestScan) return null;
  const c = latestScan.crawl;
  return (
    <div className="d-card mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-[12px]">
      <span style={{ color: "var(--d-text-mute)" }}>
        마지막 검사 <strong style={{ color: "var(--d-text)" }}>{formatDateTime(latestScan.scannedAt)}</strong>
      </span>
      <span style={{ color: "var(--d-text-mute)" }}>
        크롤 <strong style={{ color: "var(--d-text)" }}>{c.pages.length}</strong>페이지
      </span>
      <span style={{ color: "var(--d-text-mute)" }}>
        사이트맵 <strong style={{ color: "var(--d-text)" }}>{c.sitemap.fetched ? `${c.sitemap.urlCount ?? "?"}개` : "없음"}</strong>
      </span>
      <span style={{ color: "var(--d-text-mute)" }}>
        {latestScan.psi ? (
          <>PSI <strong style={{ color: "var(--d-mint)" }}>측정됨</strong></>
        ) : (
          <>PSI <strong style={{ color: "var(--d-text-mute)" }}>미측정</strong></>
        )}
      </span>
      <span className="ml-auto max-w-full truncate" style={{ color: "var(--d-text-mute)" }}>
        {c.crawlLimitNote}
      </span>
    </div>
  );
}

export function AnalysisView({
  overrideType,
  categories,
  title,
  description,
}: {
  overrideType?: SiteType;
  categories?: CategoryId[];
  title?: string;
  description?: string;
}) {
  const { activeSite, latestScan, scanning, runScan } = useDashboard();
  const a = useAnalysis(overrideType);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const shownCategories = useMemo<CategoryId[]>(() => {
    if (categories) return categories;
    const order: CategoryId[] = ["technical", "content", "aeo", "geo", "schema", "trust", "mobile", "hospital", "tourism"];
    const present = new Set(a.allChecks.map((c) => c.spec.category));
    return order.filter((c) => present.has(c));
  }, [categories, a.allChecks]);

  const scoped = useMemo(
    () => a.allChecks.filter((c) => shownCategories.includes(c.spec.category)),
    [a.allChecks, shownCategories],
  );

  const counts = useMemo(() => {
    const base = { all: scoped.length, fail: 0, good: 0, best: 0, unmeasured: 0 };
    for (const { result } of scoped) {
      if (result.outcome === "fail") base.fail++;
      else if (result.outcome === "good") base.good++;
      else if (result.outcome === "best") base.best++;
      else base.unmeasured++;
    }
    return base;
  }, [scoped]);

  const visible = useMemo(() => {
    let list = scoped;
    if (filter === "unmeasured") list = scoped.filter((c) => c.result.outcome === "unmeasured" || c.result.outcome === "not-connected");
    else if (filter !== "all") list = scoped.filter((c) => c.result.outcome === filter);
    // 미달 → 양호 → 최적 → 미측정, 각 그룹 내 점수 오름차순
    const rank = { fail: 0, good: 1, best: 2, unmeasured: 3, "not-connected": 3 } as const;
    return [...list].sort((x, y) => {
      const rx = rank[x.result.outcome];
      const ry = rank[y.result.outcome];
      if (rx !== ry) return rx - ry;
      return (x.result.score ?? 101) - (y.result.score ?? 101);
    });
  }, [scoped, filter]);

  if (!activeSite) {
    return (
      <EmptyState
        icon="web"
        title="분석할 사이트를 먼저 등록하세요"
        description="사이트 관리에서 URL과 사이트 유형(일반·병원·관광)을 등록하면 실제 크롤링 기반 분석을 시작합니다."
        action={
          <Link href="/dashboard/sites" className="d-btn d-btn-primary">
            <Icon name="plus" size={16} /> 사이트 등록하기
          </Link>
        }
      />
    );
  }

  if (!latestScan) {
    return (
      <EmptyState
        icon="refresh"
        title="아직 분석되지 않았습니다"
        description={`${activeSite.name}(${activeSite.url})을(를) 분석하려면 '분석 실행'을 눌러주세요. robots.txt를 준수하며 실제 페이지를 크롤링합니다.`}
        action={
          <button className="d-btn d-btn-primary" disabled={!!scanning} onClick={() => runScan(activeSite)}>
            {scanning ? <span className="d-spinner" /> : <Icon name="refresh" size={16} />}
            {scanning ? "분석 중…" : "지금 분석 실행"}
          </button>
        }
      />
    );
  }

  return (
    <div className="d-fade">
      {title && (
        <div className="mb-4">
          <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-[13px]" style={{ color: "var(--d-text-soft)" }}>{description}</p>}
        </div>
      )}

      {/* 카테고리 점수 요약 */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shownCategories.map((cat) => {
          const score = a.categoryScore(cat);
          const prev = a.prevCategoryScore(cat);
          const cs = a.scores?.categories.find((c) => c.category === cat);
          return (
            <div key={cat} className="d-card d-card-hover p-4">
              <div className="flex items-center justify-between">
                <span className="text-[12.5px] font-bold">{CATEGORY_LABEL[cat]}</span>
                <ScoreRing score={score} size={44} stroke={5} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]" style={{ color: "var(--d-text-mute)" }}>
                <span>
                  {cs ? `측정 ${cs.measuredCount}/${cs.totalCount}` : ""}
                </span>
                {prev !== null && score !== null && (
                  <span style={{ color: score - prev > 0 ? "var(--d-mint)" : score - prev < 0 ? "var(--d-red)" : "var(--d-text-mute)" }}>
                    {score - prev > 0 ? "▲" : score - prev < 0 ? "▼" : "—"} {Math.abs(score - prev) || ""}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CrawlSummaryBar />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <StatusTabs value={filter} onChange={setFilter} counts={counts} />
        <span className="text-[12px]" style={{ color: "var(--d-text-mute)" }}>
          {counts.fail + counts.good > 0 && (
            <>
              미달·양호 {counts.fail + counts.good}건 →{" "}
              <Link href="/dashboard/improvement" className="font-semibold" style={{ color: "var(--d-sky-deep)" }}>
                개선센터에서 관리
              </Link>
            </>
          )}
        </span>
      </div>

      <div className="space-y-2.5">
        {visible.length === 0 ? (
          <div className="d-card px-5 py-10 text-center text-[13px]" style={{ color: "var(--d-text-mute)" }}>
            해당 상태의 항목이 없습니다.
          </div>
        ) : (
          visible.map(({ result, spec }) => (
            <CheckCard key={spec.id} result={result} spec={spec} gain={a.gainFor(result)} siteType={a.siteType} />
          ))
        )}
      </div>
    </div>
  );
}
