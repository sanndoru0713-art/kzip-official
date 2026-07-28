"use client";

import { useMemo } from "react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { AnalysisView } from "@/components/dashboard/AnalysisView";
import { Icon } from "@/components/dashboard/ui";
import { auditSchemas } from "@/lib/seo/checks/geo";
import type { SchemaAudit } from "@/lib/seo/checks/geo";

function shortUrl(u: string): string {
  try {
    const url = new URL(u);
    return url.pathname.length > 1 ? url.pathname : url.hostname;
  } catch {
    return u;
  }
}

export default function SchemaPage() {
  const { latestScan } = useDashboard();

  const audit = useMemo(() => (latestScan ? auditSchemas(latestScan.crawl) : null), [latestScan]);

  return (
    <div>
      <AnalysisView
        categories={["schema"]}
        title="구조화데이터 분석"
        description="페이지의 JSON-LD를 실제로 파싱해 타입·필수/권장 속성·문법 오류·콘텐츠 불일치를 검사합니다. 존재 여부만이 아니라 정상/경고/오류로 구분합니다."
      />

      {audit && (audit.audits.length > 0 || audit.syntaxErrors.length > 0) && (
        <div className="d-card mt-5 p-5">
          <h2 className="mb-3 text-[15px] font-bold">발견된 Schema 상세</h2>
          {audit.syntaxErrors.length > 0 && (
            <div className="mb-3 rounded-xl p-3" style={{ background: "var(--d-red-soft)" }}>
              <p className="text-[12.5px] font-bold" style={{ color: "var(--d-red)" }}>문법 오류 {audit.syntaxErrors.length}건</p>
              {audit.syntaxErrors.slice(0, 5).map((e, i) => (
                <p key={i} className="mt-1 text-[12px]" style={{ color: "var(--d-text-soft)" }}>
                  {shortUrl(e.page)} — {e.error}
                </p>
              ))}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="d-table d-table-hover">
              <thead>
                <tr>
                  <th>@type</th>
                  <th>페이지</th>
                  <th>상태</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {audit.audits.map((a: SchemaAudit, i) => (
                  <tr key={i}>
                    <td className="font-semibold">{a.type}</td>
                    <td className="max-w-[200px] truncate" style={{ color: "var(--d-sky-deep)" }}>{shortUrl(a.page)}</td>
                    <td>
                      <SchemaStatus status={a.status} />
                    </td>
                    <td className="text-[12px]" style={{ color: "var(--d-text-soft)" }}>{a.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {latestScan && audit && audit.audits.length === 0 && audit.syntaxErrors.length === 0 && (
        <div className="d-card mt-5 flex items-center gap-3 p-4" style={{ background: "var(--d-orange-soft)" }}>
          <Icon name="warn" size={18} style={{ color: "var(--d-orange)" }} />
          <p className="text-[13px]" style={{ color: "var(--d-text-soft)" }}>
            크롤한 페이지에서 인식 가능한 JSON-LD 구조화데이터를 찾지 못했습니다. 위 검사 항목의 개선 방법을 참고해 적용하세요.
          </p>
        </div>
      )}
    </div>
  );
}

function SchemaStatus({ status }: { status: SchemaAudit["status"] }) {
  const map = {
    ok: { label: "정상", cls: "st-best" },
    warning: { label: "경고(권장 누락)", cls: "st-good" },
    error: { label: "오류(필수 누락)", cls: "st-fail" },
  } as const;
  const s = map[status];
  return <span className={`d-badge ${s.cls}`}>{s.label}</span>;
}
