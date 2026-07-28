"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAnalysis } from "@/components/dashboard/useAnalysis";
import { CheckCard } from "@/components/dashboard/CheckCard";
import { EmptyState, Icon, PageHeader, StatusTabs, StatusFilter } from "@/components/dashboard/ui";
import { CATEGORY_LABEL } from "@/lib/seo/types";
import type { CategoryId } from "@/lib/seo/types";

export default function ImprovementCenter() {
  const { activeSite, latestScan, taskFor } = useDashboard();
  const a = useAnalysis();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [hideDone, setHideDone] = useState(false);

  // 미달·양호만 자동 등록
  const items = useMemo(() => {
    let list = a.priority; // 이미 효과순 정렬
    if (filter === "fail") list = list.filter((p) => p.result.outcome === "fail");
    else if (filter === "good") list = list.filter((p) => p.result.outcome === "good");
    else if (filter === "best" || filter === "unmeasured") list = [];
    if (category !== "all") list = list.filter((p) => p.spec.category === category);
    if (hideDone && activeSite) list = list.filter((p) => taskFor(activeSite.id, p.spec.id)?.status !== "done");
    return list;
  }, [a.priority, filter, category, hideDone, activeSite, taskFor]);

  const counts = useMemo(() => {
    const c = { all: a.priority.length, fail: 0, good: 0, best: 0, unmeasured: 0 };
    for (const p of a.priority) {
      if (p.result.outcome === "fail") c.fail++;
      else if (p.result.outcome === "good") c.good++;
    }
    return c;
  }, [a.priority]);

  const categoriesPresent = useMemo(() => {
    const set = new Set<CategoryId>(a.priority.map((p) => p.spec.category));
    return [...set];
  }, [a.priority]);

  const doneCount = useMemo(() => {
    if (!activeSite) return 0;
    return a.priority.filter((p) => taskFor(activeSite.id, p.spec.id)?.status === "done").length;
  }, [a.priority, activeSite, taskFor]);

  if (!activeSite || !latestScan) {
    return (
      <>
        <PageHeader title="개선센터" description="미달·양호 상태 항목이 자동으로 등록되어 상세 개선 가이드를 제공합니다." />
        <EmptyState
          icon="build"
          title="분석 후 개선 항목이 표시됩니다"
          description="사이트를 분석하면 미달·양호 항목이 효과가 큰 순서로 이곳에 자동 등록됩니다."
          action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록/분석</Link>}
        />
      </>
    );
  }

  return (
    <div className="d-fade">
      <PageHeader
        title="개선센터"
        description="미달·양호 상태 항목이 효과가 큰 순서로 자동 등록됩니다. 각 항목마다 발견된 문제·원인·영향·기준·수정 방법·예상 상승폭·AI 생성·작업 상태를 제공합니다."
        right={
          <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--d-text-soft)" }}>
            <span>완료 {doneCount}/{a.priority.length}</span>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
              완료 숨기기
            </label>
          </div>
        }
      />

      {/* 요약 스트립 */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="미달 항목" value={counts.fail} tone="fail" />
        <SummaryTile label="양호 항목" value={counts.good} tone="good" />
        <SummaryTile label="예상 개선 가능" value={a.potentialGain !== null ? `+${a.potentialGain}점` : "—"} tone="best" />
        <SummaryTile label="완료 처리" value={`${doneCount}건`} tone="best" />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusTabs value={filter} onChange={setFilter} counts={counts} />
        <select className="d-select !w-auto !py-1.5 text-[13px]" value={category} onChange={(e) => setCategory(e.target.value as CategoryId | "all")}>
          <option value="all">전체 카테고리</option>
          {categoriesPresent.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <div className="d-card px-5 py-12 text-center">
          <Icon name="check" size={28} className="mx-auto mb-2" style={{ color: "var(--d-mint)" }} />
          <p className="text-[15px] font-bold">개선할 항목이 없습니다</p>
          <p className="mt-1 text-[13px]" style={{ color: "var(--d-text-mute)" }}>
            현재 필터 조건에 해당하는 미달·양호 항목이 없습니다. 모든 항목이 최적 상태이거나 완료 처리되었습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((p, idx) => (
            <div key={p.spec.id} className="relative">
              <span
                className="absolute -left-1 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow"
                style={{ background: "var(--d-grad-sky)" }}
              >
                {idx + 1}
              </span>
              <div className="pl-3">
                <CheckCard result={p.result} spec={p.spec} gain={p.gain} siteType={a.siteType} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryTile({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className={`d-card st-${tone} p-4`} style={{ background: "var(--st-soft)" }}>
      <p className="text-[12px] font-semibold" style={{ color: "var(--d-text-soft)" }}>{label}</p>
      <p className="mt-1 text-[24px] font-extrabold" style={{ color: "var(--st)" }}>{value}</p>
    </div>
  );
}
