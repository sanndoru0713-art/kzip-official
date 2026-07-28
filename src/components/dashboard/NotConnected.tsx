"use client";

import { Icon } from "./ui";

/** 데이터 미연결 상태를 명확히 표시 (가짜 수치 대신) */
export function NotConnected({
  title,
  reason,
  requirement,
  fields,
  icon = "info",
}: {
  title: string;
  reason: string;
  requirement?: string;
  fields?: string[];
  icon?: string;
}) {
  return (
    <div className="d-card p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl" style={{ background: "var(--d-orange-soft)", color: "var(--d-orange)" }}>
          <Icon name={icon} size={24} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold">{title}</h3>
            <span className="d-badge" style={{ background: "var(--d-orange-soft)", color: "var(--d-orange)" }}>데이터 연결 필요</span>
          </div>
          <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "var(--d-text-soft)" }}>{reason}</p>
          {requirement && (
            <div className="mt-3 rounded-xl p-3 text-[12px]" style={{ background: "var(--d-sky-softer)", color: "var(--d-text-soft)" }}>
              <strong style={{ color: "var(--d-sky-deep)" }}>연동 방법: </strong>
              {requirement}
            </div>
          )}
        </div>
      </div>

      {fields && fields.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-[12px] font-semibold" style={{ color: "var(--d-text-mute)" }}>연동 시 표시될 항목 (현재는 측정 불가)</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {fields.map((f) => (
              <div key={f} className="rounded-xl border border-dashed p-3" style={{ borderColor: "var(--d-border-strong)" }}>
                <p className="text-[11.5px] font-semibold" style={{ color: "var(--d-text-soft)" }}>{f}</p>
                <p className="mt-1 text-[15px] font-bold" style={{ color: "var(--d-text-mute)" }}>— 측정 불가</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
