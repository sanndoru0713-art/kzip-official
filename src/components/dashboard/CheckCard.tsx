"use client";

import { useState } from "react";
import { useDashboard } from "./DashboardProvider";
import { useCompetitorBenchmark } from "./benchmark";
import { AiPanel } from "./AiPanel";
import { DeltaChip, Icon, StatusBadge } from "./ui";
import type { CheckSpec } from "@/lib/seo/checks/helpers";
import type { CheckResult, SiteType, TaskStatus } from "@/lib/seo/types";
import { DIFFICULTY_LABEL } from "@/lib/seo/types";

const STATUS_STEP: { key: TaskStatus; label: string }[] = [
  { key: "todo", label: "대기" },
  { key: "in-progress", label: "진행중" },
  { key: "done", label: "완료" },
];

function CriteriaModal({ spec, onClose }: { spec: CheckSpec; onClose: () => void }) {
  const t = spec.thresholds;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="d-card d-fade relative w-full max-w-lg p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-[16px] font-bold">{spec.label} — 평가 기준</h3>
          <button className="d-btn d-btn-ghost !p-1" onClick={onClose} aria-label="닫기">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="space-y-2 text-[13px]">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center st-fail" style={{ background: "var(--st-soft)" }}>
              <p className="text-[11px] font-bold" style={{ color: "var(--st)" }}>미달</p>
              <p className="mt-1 font-bold">0 ~ {t.good - 1}{t.unit}</p>
            </div>
            <div className="rounded-xl p-3 text-center st-good" style={{ background: "var(--st-soft)" }}>
              <p className="text-[11px] font-bold" style={{ color: "var(--st)" }}>양호</p>
              <p className="mt-1 font-bold">{t.good} ~ {t.best - 1}{t.unit}</p>
            </div>
            <div className="rounded-xl p-3 text-center st-best" style={{ background: "var(--st-soft)" }}>
              <p className="text-[11px] font-bold" style={{ color: "var(--st)" }}>최적</p>
              <p className="mt-1 font-bold">{t.best} ~ 100{t.unit}</p>
            </div>
          </div>
          <div className="rounded-xl border p-3" style={{ borderColor: "var(--d-border)" }}>
            <p className="mb-1 text-[11px] font-bold" style={{ color: "var(--d-text-mute)" }}>기준 출처</p>
            <p className="leading-relaxed" style={{ color: "var(--d-text-soft)" }}>{t.source}</p>
            {t.sourceUrl && (
              <a href={t.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: "var(--d-sky-deep)" }}>
                공식 문서 <Icon name="external" size={12} />
              </a>
            )}
          </div>
          <div className="rounded-xl border p-3" style={{ borderColor: "var(--d-border)" }}>
            <p className="mb-1 text-[11px] font-bold" style={{ color: "var(--d-text-mute)" }}>검사 방법</p>
            <p className="leading-relaxed" style={{ color: "var(--d-text-soft)" }}>{spec.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckCard({
  result,
  spec,
  gain,
  siteType,
  defaultOpen = false,
}: {
  result: CheckResult;
  spec: CheckSpec;
  gain: number | null;
  siteType: SiteType;
  defaultOpen?: boolean;
}) {
  const { activeSite, taskFor, setTaskStatus, runScan } = useDashboard();
  const { benchmark } = useCompetitorBenchmark(siteType);
  const [criteria, setCriteria] = useState(false);
  const [showUrls, setShowUrls] = useState(false);
  const bm = benchmark(spec.id);
  const task = activeSite ? taskFor(activeSite.id, spec.id) : undefined;
  const status = task?.status || "todo";
  const t = spec.thresholds;

  const measured = result.score !== null;
  const aiContext = `사이트유형:${siteType}\n검사항목:${spec.label}\n현재값:${result.valueLabel}\n근거:\n${result.evidence.join("\n")}\n문제URL:\n${result.affectedUrls.slice(0, 10).join("\n")}`;

  return (
    <div className={`d-card d-card-hover st-${result.outcome} overflow-hidden`}>
      <details className="d-detail" open={defaultOpen}>
        <summary className="flex items-center gap-3 p-4">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[15px] font-bold"
            style={{ background: "var(--st-soft)", color: "var(--st)" }}
          >
            {measured ? result.score : "—"}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] font-bold">{spec.label}</span>
              <StatusBadge outcome={result.outcome} />
            </div>
            <p className="mt-0.5 truncate text-[12px]" style={{ color: "var(--d-text-soft)" }}>
              {result.valueLabel}
              {result.unmeasuredReason ? ` · ${result.unmeasuredReason}` : ""}
            </p>
          </div>
          <div className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
            {gain !== null && gain > 0 && (
              <span className="text-[12px] font-bold" style={{ color: "var(--d-mint)" }}>
                예상 +{gain}점
              </span>
            )}
            {bm.avg !== null && (
              <span className="text-[11px]" style={{ color: "var(--d-text-mute)" }}>
                경쟁사 평균 {bm.avg}
              </span>
            )}
          </div>
          <Icon name="chevron" size={18} className="chev shrink-0" />
        </summary>

        <div className="border-t px-4 py-4" style={{ borderColor: "var(--d-border)" }}>
          {/* 기준 스트립 */}
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MiniStat label="현재" value={result.valueLabel} tone={result.outcome} />
            <MiniStat label="적정 기준(양호)" value={`${t.good}${t.unit}~`} />
            <MiniStat label="최적 기준" value={`${t.best}${t.unit}~`} />
            <MiniStat
              label="경쟁사 평균 / 최고"
              value={bm.avg !== null ? `${bm.avg} / ${bm.best}` : "데이터 없음"}
              hint={bm.count > 0 ? `${bm.count}개사` : "경쟁사 미분석"}
            />
          </div>

          {/* 발견된 문제 (근거) */}
          {result.evidence.length > 0 && (
            <Section title="발견된 문제 · 산출 근거" icon="warn">
              <ul className="space-y-1 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
                {result.evidence.map((e, i) => (
                  <li key={i} className="leading-relaxed">{e}</li>
                ))}
              </ul>
            </Section>
          )}

          {/* 영향 */}
          <div className="grid gap-3 sm:grid-cols-3">
            <ImpactBox title="검색 노출 영향" body={spec.why} />
            <ImpactBox title="AEO 영향" body={spec.aeoImpact} />
            <ImpactBox
              title="문제가 되는 이유"
              body={`${spec.description} 적정 기준 미달 시 ${spec.category} 카테고리 점수와 종합점수에 반영됩니다.`}
            />
          </div>

          {/* 수정 방법 */}
          <Section title="수정 방법" icon="build">
            <ul className="ml-4 list-disc space-y-1 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
              {spec.fix.method.map((m, i) => (
                <li key={i} className="leading-relaxed">{m}</li>
              ))}
            </ul>
            <div className="mt-2">
              <p className="mb-1 text-[11px] font-bold" style={{ color: "var(--d-text-mute)" }}>수정 예시 / 권장 코드</p>
              <pre className="d-code">{spec.fix.example}</pre>
            </div>
          </Section>

          {/* 메타 정보 */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px]" style={{ color: "var(--d-text-soft)" }}>
            <Meta label="구현 난이도" value={DIFFICULTY_LABEL[spec.fix.difficulty]} />
            <Meta label="예상 작업량" value={spec.fix.effort} />
            <Meta label="예상 점수 상승" value={gain !== null && gain > 0 ? `+${gain}점` : measured ? "—" : "측정 필요"} />
            <Meta label="담당자" value={task?.assignee || "미지정"} />
          </div>

          {/* 문제 URL */}
          {result.affectedUrls.length > 0 && (
            <div className="mt-3">
              <button className="d-btn d-btn-ghost d-btn-sm !px-0" onClick={() => setShowUrls((v) => !v)}>
                <Icon name="external" size={14} /> 문제가 있는 URL {result.affectedUrls.length}개 {showUrls ? "접기" : "보기"}
              </button>
              {showUrls && (
                <div className="mt-1 max-h-40 space-y-1 overflow-auto rounded-lg p-2" style={{ background: "var(--d-sky-softer)" }}>
                  {result.affectedUrls.map((u) => (
                    <a key={u} href={u} target="_blank" rel="noreferrer" className="block truncate text-[12px]" style={{ color: "var(--d-sky-deep)" }}>
                      {u}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI 생성 */}
          {spec.aiActions && spec.aiActions.length > 0 && <AiPanel actions={spec.aiActions} context={aiContext} />}

          {/* 작업 상태 + 액션 */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: "var(--d-border)" }}>
            <button className="d-btn d-btn-ghost d-btn-sm" onClick={() => setCriteria(true)}>
              <Icon name="rule" size={14} /> 평가 기준 보기
            </button>
            <div className="d-tabs !bg-transparent ml-auto gap-1 p-0">
              {STATUS_STEP.map((s) => (
                <button
                  key={s.key}
                  className="d-tab"
                  data-active={status === s.key}
                  onClick={() => activeSite && setTaskStatus(activeSite.id, spec.id, s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button
              className="d-btn d-btn-secondary d-btn-sm"
              onClick={() => activeSite && runScan(activeSite)}
              title="사이트 전체를 다시 분석합니다"
            >
              <Icon name="refresh" size={14} /> 재분석
            </button>
          </div>
        </div>
      </details>
      {criteria && <CriteriaModal spec={spec} onClose={() => setCriteria(false)} />}
    </div>
  );
}

function MiniStat({ label, value, tone, hint }: { label: string; value: string; tone?: string; hint?: string }) {
  return (
    <div className={`rounded-xl p-2.5 ${tone ? `st-${tone}` : ""}`} style={{ background: tone ? "var(--st-soft)" : "var(--d-sky-softer)" }}>
      <p className="text-[10.5px] font-semibold" style={{ color: "var(--d-text-mute)" }}>{label}</p>
      <p className="mt-0.5 text-[13px] font-bold" style={{ color: tone ? "var(--st)" : "var(--d-text)" }}>{value}</p>
      {hint && <p className="text-[10px]" style={{ color: "var(--d-text-mute)" }}>{hint}</p>}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-bold" style={{ color: "var(--d-text)" }}>
        <Icon name={icon} size={14} className="opacity-60" /> {title}
      </p>
      {children}
    </div>
  );
}

function ImpactBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: "var(--d-border)" }}>
      <p className="mb-1 text-[11px] font-bold" style={{ color: "var(--d-sky-deep)" }}>{title}</p>
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--d-text-soft)" }}>{body}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <span>
      <span style={{ color: "var(--d-text-mute)" }}>{label} </span>
      <strong style={{ color: "var(--d-text)" }}>{value}</strong>
    </span>
  );
}

/* 미사용 import 방지용 재노출 */
export { DeltaChip };
