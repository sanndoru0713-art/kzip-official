"use client";

import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAnalysis } from "@/components/dashboard/useAnalysis";
import { CheckCard } from "@/components/dashboard/CheckCard";
import { EmptyState, Icon, PageHeader } from "@/components/dashboard/ui";

export default function MultilingualPage() {
  const { latestScan } = useDashboard();
  const a = useAnalysis();

  const relevant = a.allChecks.filter((c) => ["hreflang", "lang-attr", "tourism-multilingual", "hospital-multilingual"].includes(c.spec.id));
  const locales = latestScan?.crawl.sitemap.localeBreakdown || null;

  if (!latestScan) {
    return (
      <>
        <PageHeader title="다국어 SEO" description="언어별 URL 구성·hreflang·lang 속성을 검사합니다." />
        <EmptyState icon="language" title="분석 데이터가 없습니다" description="사이트를 분석하면 다국어 구성이 표시됩니다." />
      </>
    );
  }

  return (
    <div className="d-fade">
      <PageHeader title="다국어 SEO" description="사이트맵 경로 기반 언어 구성과 hreflang·lang 속성을 검사합니다. 다국어가 감지되지 않으면 '해당 없음'으로 처리합니다." />

      <div className="d-card mb-5 p-5">
        <h2 className="mb-3 text-[15px] font-bold">언어별 URL 구성 (사이트맵 기준)</h2>
        {locales && Object.keys(locales).length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Object.entries(locales).sort((a, b) => b[1] - a[1]).map(([loc, count]) => (
              <div key={loc} className="rounded-xl border px-4 py-2.5" style={{ borderColor: "var(--d-border)" }}>
                <p className="text-[11px] font-semibold uppercase" style={{ color: "var(--d-text-mute)" }}>{loc === "(root)" ? "루트/기타" : loc}</p>
                <p className="text-[18px] font-bold">{count.toLocaleString()}<span className="text-[11px] font-normal"> URL</span></p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-xl p-3 text-[13px]" style={{ background: "var(--d-gray-chip)", color: "var(--d-text-soft)" }}>
            <Icon name="info" size={16} /> 사이트맵이 없거나 언어 경로가 감지되지 않았습니다. 사이트맵 등록 후 다시 분석하세요.
          </div>
        )}
      </div>

      <div className="space-y-2.5">
        {relevant.length === 0 ? (
          <div className="d-card px-5 py-8 text-center text-[13px]" style={{ color: "var(--d-text-mute)" }}>다국어 관련 검사 항목이 없습니다.</div>
        ) : (
          relevant.map(({ result, spec }) => (
            <CheckCard key={spec.id} result={result} spec={spec} gain={a.gainFor(result)} siteType={a.siteType} />
          ))
        )}
      </div>
    </div>
  );
}
