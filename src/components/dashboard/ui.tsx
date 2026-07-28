"use client";

/** 대시보드 공용 UI 프리미티브 */

import type { CheckOutcome } from "@/lib/seo/types";
import { STATUS_LABEL } from "@/lib/seo/types";

/* ───── 아이콘 (Material Symbols 계열 미니 세트) ───── */

const PATHS: Record<string, string> = {
  dashboard: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z",
  web: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 5h-8V6h8v3zM4 6h6v3H4V6zm0 12v-7h16v7H4z",
  business: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z",
  hospital: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z",
  tour: "M12 2 4.5 20.3l.7.7L12 18l6.8 3 .7-.7L12 2z",
  compare: "M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5v2h2V1h-2v2zm0 15H5l5-6v6zm9-15h-5v2h5v13l-5-6v9h5a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z",
  gap: "M16 6l2.3 2.3-4.9 4.9-4-4L2 16.6 3.4 18l6-6 4 4 6.3-6.3L22 12V6h-6z",
  "settings-code": "m8 17 -5-5 5-5 1.4 1.4L5.8 12l3.6 3.6L8 17zm8 0-1.4-1.4 3.6-3.6-3.6-3.6L16 7l5 5-5 5z",
  qa: "M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-9 12H9.5v-1.2c0-1 .6-1.6 1.3-2.1.6-.4 1-.7 1-1.3 0-.7-.6-1.1-1.3-1.1-.8 0-1.3.4-1.6 1.1L7.4 8.7C8 7.4 9.2 6.5 10.7 6.5c1.8 0 3.1 1.1 3.1 2.7 0 1.2-.7 1.9-1.5 2.4-.7.5-1.3.8-1.3 1.6V14zm.2 3.2h-1.9v-1.9h1.9v1.9z",
  ai: "M12 2a2 2 0 0 1 2 2c0 .7-.4 1.4-1 1.7V7h5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V5.7c-.6-.3-1-1-1-1.7a2 2 0 0 1 2-2zM8.5 11a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM8 16.5h8V18H8v-1.5z",
  schema: "M9 3v2H7a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h2v2H7a4 4 0 0 1-4-4v-2.5A1.5 1.5 0 0 0 1.5 13v-2A1.5 1.5 0 0 0 3 9.5V7a4 4 0 0 1 4-4h2zm6 0h2a4 4 0 0 1 4 4v2.5A1.5 1.5 0 0 0 22.5 11v2a1.5 1.5 0 0 0-1.5 1.5V17a4 4 0 0 1-4 4h-2v-2h2a2 2 0 0 0 2-2v-3a2 2 0 0 1 2-2 2 2 0 0 1-2-2V7a2 2 0 0 0-2-2h-2V3z",
  article: "M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
  language: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm7 9h-3a15 15 0 0 0-1-4.9A8 8 0 0 1 19 11zm-7-7c.8 1.2 1.5 3 1.9 5h-3.8c.4-2 1.1-3.8 1.9-5zM5 13h3a15 15 0 0 0 1 4.9A8 8 0 0 1 5 13zm3-2H5a8 8 0 0 1 4-6.9A15 15 0 0 0 8 11zm4 9c-.8-1.2-1.5-3-1.9-5h3.8c-.4 2-1.1 3.8-1.9 5zm2.1-7H9.9a13 13 0 0 1 0-2h4.2a13 13 0 0 1 0 2zm.9 6.9a15 15 0 0 0 1-4.9h3a8 8 0 0 1-4 4.9z",
  ja: "M5 4h14v2h-6v2.5h5v2h-5V15c0 2-1 3-3.2 3H8v-2h1.6c.9 0 1.4-.3 1.4-1.3v-4.2H5v-2h6V6H5V4z",
  speed: "m20.4 8.6-1.5 1.5A8 8 0 0 1 20 14h-2a6 6 0 0 0-.6-2.6L12 16.8a2.5 2.5 0 1 1-1.4-1.4l5.4-5.4A6 6 0 0 0 6 14H4a8 8 0 0 1 13-6.3l1.5-1.5 1.9 2.4zM12 4a10 10 0 0 1 10 10h-2a8 8 0 0 0-16 0H2A10 10 0 0 1 12 4z",
  search: "M15.5 14h-.8l-.3-.3a6.5 6.5 0 1 0-.7.7l.3.3v.8l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z",
  build: "m22.7 19-9.1-9.1a6 6 0 0 0-7.6-7.6l3.7 3.7-2.8 2.8L3.2 5A6 6 0 0 0 10.8 12.6l9.1 9.1a1 1 0 0 0 1.4 0l1.4-1.4a1 1 0 0 0 0-1.3z",
  priority: "M4 5h9v2H4V5zm0 6h9v2H4v-2zm0 6h9v2H4v-2zm13.6-9L15 5.4 16.4 4l1.2 1.2L20.6 2 22 3.4 17.6 8z",
  trend: "m3.5 18.5-1.4-1.4L9 10.2l4 4 7.1-8 1.4 1.3L13 17l-4-4-5.5 5.5z",
  report: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  rule: "M16.5 4 15 5.6 17.4 8H10v2h7.4L15 12.4l1.5 1.6 5-5-5-5zM4 20h16v2H4v-2zm0-16h6v2H4V4zm0 6h6v2H4v-2z",
  settings: "M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6a.5.5 0 0 0 .1-.6l-2-3.4a.5.5 0 0 0-.6-.2l-2.4 1a7.5 7.5 0 0 0-1.7-1l-.4-2.6a.5.5 0 0 0-.5-.4h-4a.5.5 0 0 0-.5.4l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1a.5.5 0 0 0-.6.2l-2 3.4a.5.5 0 0 0 .1.6l2 1.6a7.6 7.6 0 0 0 0 2l-2 1.6a.5.5 0 0 0-.1.6l2 3.4c.1.2.4.3.6.2l2.4-1a7.5 7.5 0 0 0 1.7 1l.4 2.6c0 .2.2.4.5.4h4c.2 0 .5-.2.5-.4l.4-2.6a7.5 7.5 0 0 0 1.7-1l2.4 1c.2.1.5 0 .6-.2l2-3.4a.5.5 0 0 0-.1-.6l-2-1.6zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z",
  check: "M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z",
  warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
  chevron: "M8.6 16.6 13.2 12 8.6 7.4 10 6l6 6-6 6-1.4-1.4z",
  plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  refresh: "M17.7 6.3A8 8 0 1 0 20 12h-2a6 6 0 1 1-1.8-4.3L13 11h7V4l-2.3 2.3z",
  close: "M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4z",
  external: "M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.6l-9.8 9.8 1.4 1.4L19 6.4V10h2V3h-7z",
  bolt: "M11 21h-1l1-7H7.5c-.6 0-.6-.3-.4-.7l.1-.2L13 3h1l-1 7h3.5c.5 0 .8.2.5.8L11 21z",
  menu: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z",
};

export function Icon({ name, size = 18, className = "", style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} style={style} fill="currentColor" aria-hidden>
      <path d={PATHS[name] || PATHS.info} />
    </svg>
  );
}

/* ───── 상태 뱃지 ───── */

export function StatusBadge({ outcome, label }: { outcome: CheckOutcome; label?: string }) {
  const icon = outcome === "best" ? "check" : outcome === "good" ? "info" : outcome === "fail" ? "warn" : "info";
  return (
    <span className={`d-badge st-${outcome}`}>
      <Icon name={icon} size={13} />
      {label ?? STATUS_LABEL[outcome]}
    </span>
  );
}

export function outcomeFromNumber(score: number | null): CheckOutcome {
  if (score === null) return "unmeasured";
  if (score >= 90) return "best";
  if (score >= 70) return "good";
  return "fail";
}

/* ───── 점수 링 ───── */

export function ScoreRing({
  score,
  size = 96,
  stroke = 8,
  label,
}: {
  score: number | null;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const outcome = outcomeFromNumber(score);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const filled = score === null ? 0 : (score / 100) * c;
  const color =
    outcome === "best" ? "var(--d-mint)" : outcome === "good" ? "var(--d-orange)" : outcome === "fail" ? "var(--d-red)" : "var(--d-border-strong)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--d-gray-chip)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${c - filled}`}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold" style={{ fontSize: size / 4, color: score === null ? "var(--d-text-mute)" : "var(--d-text)" }}>
          {score === null ? "—" : score}
        </span>
        {label && <span className="text-[10px] font-medium" style={{ color: "var(--d-text-mute)" }}>{label}</span>}
      </div>
    </div>
  );
}

/* ───── 변화 표시 ───── */

export function DeltaChip({ delta, suffix = "" }: { delta: number | null; suffix?: string }) {
  if (delta === null)
    return <span className="text-[11.5px] font-medium" style={{ color: "var(--d-text-mute)" }}>첫 검사</span>;
  if (delta === 0)
    return <span className="text-[11.5px] font-medium" style={{ color: "var(--d-text-mute)" }}>변동 없음</span>;
  const up = delta > 0;
  return (
    <span className="text-[11.5px] font-bold" style={{ color: up ? "var(--d-mint)" : "var(--d-red)" }}>
      {up ? "▲" : "▼"} {Math.abs(delta)}
      {suffix}
    </span>
  );
}

/* ───── 빈 상태 ───── */

export function EmptyState({
  icon = "info",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="d-card flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ background: "var(--d-sky-soft)", color: "var(--d-sky)" }}
      >
        <Icon name={icon} size={24} />
      </div>
      <p className="text-[15px] font-bold">{title}</p>
      {description && (
        <p className="max-w-md text-[13px] leading-relaxed" style={{ color: "var(--d-text-soft)" }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

/* ───── 페이지 헤더 ───── */

export function PageHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed" style={{ color: "var(--d-text-soft)" }}>
            {description}
          </p>
        )}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

/* ───── 상태 필터 탭 (전체/미달/양호/최적) ───── */

export type StatusFilter = "all" | "fail" | "good" | "best" | "unmeasured";

export function StatusTabs({
  value,
  onChange,
  counts,
}: {
  value: StatusFilter;
  onChange: (v: StatusFilter) => void;
  counts: Record<StatusFilter, number>;
}) {
  const tabs: { key: StatusFilter; label: string; color?: string }[] = [
    { key: "all", label: "전체" },
    { key: "fail", label: "미달", color: "var(--d-red)" },
    { key: "good", label: "양호", color: "var(--d-orange)" },
    { key: "best", label: "최적", color: "var(--d-mint)" },
    { key: "unmeasured", label: "미측정", color: "var(--d-text-mute)" },
  ];
  return (
    <div className="d-tabs" role="tablist" aria-label="상태 필터">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={value === t.key}
          data-active={value === t.key}
          className="d-tab"
          onClick={() => onChange(t.key)}
        >
          {t.label}
          <span className="cnt" style={{ color: t.color }}>
            {counts[t.key]}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ───── 마지막 검사 시각 ───── */

export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
