"use client";

import { useState } from "react";
import { PageHeader, Icon } from "@/components/dashboard/ui";
import { ALL_CHECKS, DEFAULT_WEIGHTS } from "@/lib/seo/scoring";
import { CATEGORY_LABEL, SITE_TYPE_LABEL } from "@/lib/seo/types";
import type { CategoryId, SiteType } from "@/lib/seo/types";

export default function CriteriaPage() {
  const [type, setType] = useState<SiteType>("general");
  const [q, setQ] = useState("");

  const cats = [...new Set(ALL_CHECKS.map((c) => c.category))].filter((c) => {
    if (c === "hospital") return type === "hospital";
    if (c === "tourism") return type === "tourism";
    return true;
  });

  return (
    <div className="d-fade">
      <PageHeader
        title="평가 기준"
        description="모든 검사 항목의 미달·양호·최적 구간과 기준 출처(공식 문서)를 공개합니다. 임의로 만든 기준이 아니라 Google·web.dev·schema.org·W3C 등의 공식 문서와 명확한 운영 기준에 근거합니다."
        right={
          <div className="d-tabs">
            {(["general", "hospital", "tourism"] as SiteType[]).map((t) => (
              <button key={t} className="d-tab" data-active={type === t} onClick={() => setType(t)}>{SITE_TYPE_LABEL[t]}</button>
            ))}
          </div>
        }
      />

      {/* 가중치 */}
      <div className="d-card mb-5 p-5">
        <h2 className="mb-1 text-[15px] font-bold">종합점수 산식 · {SITE_TYPE_LABEL[type]} 가중치</h2>
        <p className="mb-3 text-[12px]" style={{ color: "var(--d-text-mute)" }}>
          종합점수 = Σ(카테고리 점수 × 가중치) ÷ 측정된 가중치 합. 카테고리 점수 = Σ(항목 점수 × 항목 가중치) ÷ 항목 가중치 합. 측정 불가 항목은 제외됩니다(0점 처리 안 함).
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DEFAULT_WEIGHTS[type]).map(([cat, w]) => (
            <div key={cat} className="rounded-xl px-4 py-2" style={{ background: "var(--d-sky-softer)" }}>
              <span className="text-[12px] font-semibold" style={{ color: "var(--d-text-soft)" }}>{CATEGORY_LABEL[cat as CategoryId]}</span>
              <span className="ml-2 text-[15px] font-bold" style={{ color: "var(--d-sky-deep)" }}>{w}%</span>
            </div>
          ))}
        </div>
      </div>

      <input className="d-input mb-4 max-w-sm" placeholder="검사 항목 검색…" value={q} onChange={(e) => setQ(e.target.value)} />

      <div className="space-y-5">
        {cats.map((cat) => {
          const checks = ALL_CHECKS.filter((c) => c.category === cat && (c.category === "hospital" ? type === "hospital" : c.category === "tourism" ? type === "tourism" : true) && (!c.siteTypes || c.siteTypes.includes(type)) && (q === "" || c.label.includes(q) || c.description.includes(q)));
          if (checks.length === 0) return null;
          return (
            <div key={cat} className="d-card overflow-hidden">
              <div className="border-b px-5 py-3" style={{ borderColor: "var(--d-border)", background: "var(--d-sky-softer)" }}>
                <h3 className="text-[14px] font-bold">{CATEGORY_LABEL[cat as CategoryId]}</h3>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--d-border)" }}>
                {checks.map((c) => (
                  <details key={c.id} className="d-detail" style={{ borderColor: "var(--d-border)" }}>
                    <summary className="flex items-center gap-3 px-5 py-3">
                      <span className="min-w-0 flex-1">
                        <span className="text-[13.5px] font-semibold">{c.label}</span>
                        <span className="ml-2 hidden text-[11.5px] sm:inline" style={{ color: "var(--d-text-mute)" }}>{c.description}</span>
                      </span>
                      <span className="flex shrink-0 gap-1 text-[11px]">
                        <b className="rounded px-1.5 py-0.5" style={{ background: "var(--d-red-soft)", color: "var(--d-red)" }}>~{c.thresholds.good - 1}</b>
                        <b className="rounded px-1.5 py-0.5" style={{ background: "var(--d-orange-soft)", color: "var(--d-orange)" }}>{c.thresholds.good}~{c.thresholds.best - 1}</b>
                        <b className="rounded px-1.5 py-0.5" style={{ background: "var(--d-mint-soft)", color: "var(--d-mint)" }}>{c.thresholds.best}~</b>
                      </span>
                      <Icon name="chevron" size={16} className="chev shrink-0" />
                    </summary>
                    <div className="px-5 pb-4 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
                      <div className="mb-2 grid grid-cols-3 gap-2 text-center">
                        <Band label="미달" range={`0~${c.thresholds.good - 1}${c.thresholds.unit}`} tone="fail" />
                        <Band label="양호" range={`${c.thresholds.good}~${c.thresholds.best - 1}${c.thresholds.unit}`} tone="good" />
                        <Band label="최적" range={`${c.thresholds.best}~100${c.thresholds.unit}`} tone="best" />
                      </div>
                      <p><strong style={{ color: "var(--d-text)" }}>검사 내용:</strong> {c.description}</p>
                      <p className="mt-1"><strong style={{ color: "var(--d-text)" }}>중요성:</strong> {c.why}</p>
                      <p className="mt-1"><strong style={{ color: "var(--d-text)" }}>기준 출처:</strong> {c.thresholds.source}
                        {c.thresholds.sourceUrl && (
                          <a href={c.thresholds.sourceUrl} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center gap-0.5 font-semibold" style={{ color: "var(--d-sky-deep)" }}>
                            문서 <Icon name="external" size={11} />
                          </a>
                        )}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Band({ label, range, tone }: { label: string; range: string; tone: string }) {
  return (
    <div className={`st-${tone} rounded-lg py-2`} style={{ background: "var(--st-soft)" }}>
      <p className="text-[10px] font-bold" style={{ color: "var(--st)" }}>{label}</p>
      <p className="text-[12px] font-bold" style={{ color: "var(--st)" }}>{range}</p>
    </div>
  );
}
