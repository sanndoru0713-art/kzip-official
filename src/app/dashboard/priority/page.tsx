"use client";

import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAnalysis } from "@/components/dashboard/useAnalysis";
import { EmptyState, Icon, PageHeader, StatusBadge } from "@/components/dashboard/ui";
import { CATEGORY_LABEL, DIFFICULTY_LABEL } from "@/lib/seo/types";
import type { TaskStatus } from "@/lib/seo/types";

const STATUS_LABEL: Record<TaskStatus, string> = { todo: "대기", "in-progress": "진행중", done: "완료" };

export default function PriorityPage() {
  const { activeSite, latestScan, taskFor, setTaskStatus } = useDashboard();
  const a = useAnalysis();

  if (!activeSite || !latestScan) {
    return (
      <>
        <PageHeader title="실행 우선순위" description="문제를 효과가 큰 순서로 정렬합니다." />
        <EmptyState icon="priority" title="분석 후 표시됩니다" description="사이트를 분석하면 개선 과제가 우선순위대로 정렬됩니다." action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      </>
    );
  }

  return (
    <div className="d-fade">
      <PageHeader
        title="실행 우선순위"
        description="정렬 기준: 예상 점수 상승폭 ÷ 난이도 계수. 효과가 크고 난이도가 낮은 항목이 상위에 옵니다. 예상 상승폭은 실제 종합점수 산식에서 도출한 값입니다."
      />

      {a.priority.length === 0 ? (
        <div className="d-card px-5 py-12 text-center">
          <Icon name="check" size={26} className="mx-auto mb-2" style={{ color: "var(--d-mint)" }} />
          <p className="text-[15px] font-bold">개선 과제가 없습니다</p>
          <p className="mt-1 text-[13px]" style={{ color: "var(--d-text-mute)" }}>미달·양호 항목이 없어 우선순위 목록이 비어 있습니다.</p>
        </div>
      ) : (
        <div className="d-card overflow-x-auto">
          <table className="d-table d-table-hover">
            <thead>
              <tr>
                <th>순위</th>
                <th>문제</th>
                <th>현재 상태</th>
                <th>목표</th>
                <th>예상 상승</th>
                <th>난이도</th>
                <th>작업량</th>
                <th>대상 URL</th>
                <th>담당자</th>
                <th>진행상태</th>
              </tr>
            </thead>
            <tbody>
              {a.priority.map((p) => {
                const task = taskFor(activeSite.id, p.spec.id);
                return (
                  <tr key={p.spec.id}>
                    <td>
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "var(--d-grad-sky)" }}>
                        {p.rank}
                      </span>
                    </td>
                    <td>
                      <Link href="/dashboard/improvement" className="font-semibold" style={{ color: "var(--d-text)" }}>{p.spec.label}</Link>
                      <span className="block text-[11px]" style={{ color: "var(--d-text-mute)" }}>{CATEGORY_LABEL[p.spec.category]}</span>
                    </td>
                    <td><StatusBadge outcome={p.result.outcome} /><span className="ml-1 text-[11px]" style={{ color: "var(--d-text-mute)" }}>{p.result.valueLabel}</span></td>
                    <td className="text-[12px]" style={{ color: "var(--d-mint)" }}>{p.spec.thresholds.best}{p.spec.thresholds.unit}~</td>
                    <td className="font-bold" style={{ color: "var(--d-mint)" }}>{p.gain !== null && p.gain > 0 ? `+${p.gain}점` : "—"}</td>
                    <td className="text-[12px]">{DIFFICULTY_LABEL[p.spec.fix.difficulty]}</td>
                    <td className="text-[12px]" style={{ color: "var(--d-text-soft)" }}>{p.spec.fix.effort}</td>
                    <td className="text-[12px]">{p.result.affectedUrls.length || "-"}</td>
                    <td>
                      <input
                        className="d-input !w-24 !py-1 text-[12px]"
                        placeholder="미지정"
                        defaultValue={task?.assignee || ""}
                        onBlur={(e) => setTaskStatus(activeSite.id, p.spec.id, task?.status || "todo", e.target.value || undefined)}
                      />
                    </td>
                    <td>
                      <select
                        className="d-select !w-24 !py-1 text-[12px]"
                        value={task?.status || "todo"}
                        onChange={(e) => setTaskStatus(activeSite.id, p.spec.id, e.target.value as TaskStatus)}
                      >
                        {(["todo", "in-progress", "done"] as TaskStatus[]).map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
