"use client";

import { useMemo } from "react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useAnalysis } from "@/components/dashboard/useAnalysis";
import { EmptyState, Icon, PageHeader } from "@/components/dashboard/ui";
import { AiPanel } from "@/components/dashboard/AiPanel";

export default function JapanesePage() {
  const { latestScan, activeSite } = useDashboard();
  const a = useAnalysis();

  const jaData = useMemo(() => {
    if (!latestScan) return null;
    const pages = latestScan.crawl.pages.filter((p) => p.status === 200);
    const jaPages = pages.filter((p) => {
      try {
        return (p.langAttr || "").toLowerCase().startsWith("ja") || /\/ja(\/|$)/.test(new URL(p.finalUrl).pathname);
      } catch {
        return false;
      }
    });
    const jaHreflang = pages.filter((p) => p.hreflang.some((h) => h.lang.toLowerCase().startsWith("ja")));
    const locales = latestScan.crawl.sitemap.localeBreakdown || {};
    return { jaPages, jaHreflang, jaSitemapCount: locales["ja"] || 0, totalPages: pages.length };
  }, [latestScan]);

  if (!latestScan || !jaData) {
    return (
      <>
        <PageHeader title="일본어 SEO" description="일본어 페이지 구성·hreflang·일본어 콘텐츠 대응을 검사합니다." />
        <EmptyState icon="ja" title="분석 데이터가 없습니다" description="사이트를 분석하면 일본어 대응 현황이 표시됩니다." />
      </>
    );
  }

  const hasJa = jaData.jaPages.length > 0 || jaData.jaHreflang.length > 0 || jaData.jaSitemapCount > 0;

  return (
    <div className="d-fade">
      <PageHeader
        title="일본어 SEO"
        description="방한 관광·의료의 핵심 시장인 일본어 검색 대응 현황입니다. 일본어 페이지 유무, hreflang 연결, 일본어 콘텐츠 신호를 실측합니다."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="일본어 페이지 (크롤 표본)" value={`${jaData.jaPages.length}`} sub={`${jaData.totalPages}페이지 중`} good={jaData.jaPages.length > 0} />
        <Stat label="사이트맵 /ja/ URL" value={`${jaData.jaSitemapCount}`} sub="사이트맵 기준" good={jaData.jaSitemapCount > 0} />
        <Stat label="ja hreflang 연결" value={`${jaData.jaHreflang.length}`} sub="페이지" good={jaData.jaHreflang.length > 0} />
      </div>

      {!hasJa && (
        <div className="d-card mt-5 flex items-start gap-3 p-4" style={{ background: "var(--d-orange-soft)" }}>
          <Icon name="warn" size={18} className="mt-0.5 shrink-0" style={{ color: "var(--d-orange)" }} />
          <div>
            <p className="text-[13px] font-bold" style={{ color: "var(--d-orange)" }}>일본어 페이지가 감지되지 않았습니다</p>
            <p className="mt-1 text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
              /ja/ 디렉터리와 일본어 콘텐츠를 구축하고 ko↔ja hreflang을 상호 연결하세요. 아래 AI 도구로 일본어 SEO 문구 초안을 생성할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      <div className="d-card mt-5 p-5">
        <h2 className="mb-1 text-[15px] font-bold">일본어 SEO 문구 생성 (초안)</h2>
        <p className="mb-2 text-[12px]" style={{ color: "var(--d-text-mute)" }}>
          일본인이 실제 검색하는 표현 기준의 일본어 title·description·H1·주요 검색어 초안을 생성합니다. 검토 후 사용하세요.
        </p>
        <AiPanel
          actions={["japanese-seo"]}
          context={`사이트:${activeSite?.name} (${activeSite?.url})\n유형:${a.siteType}\n일본어페이지수:${jaData.jaPages.length}\n대표 title:${latestScan.crawl.pages[0]?.title || ""}`}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, good }: { label: string; value: string; sub: string; good: boolean }) {
  return (
    <div className="d-card p-4">
      <p className="text-[12px] font-semibold" style={{ color: "var(--d-text-soft)" }}>{label}</p>
      <p className="mt-1 text-[26px] font-extrabold" style={{ color: good ? "var(--d-mint)" : "var(--d-text-mute)" }}>{value}</p>
      <p className="text-[11px]" style={{ color: "var(--d-text-mute)" }}>{sub}</p>
    </div>
  );
}
