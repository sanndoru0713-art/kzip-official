"use client";

import { AnalysisView } from "@/components/dashboard/AnalysisView";

export default function TechnicalPage() {
  return (
    <AnalysisView
      categories={["technical"]}
      title="기술 SEO"
      description="HTTP 상태·HTTPS·robots·sitemap·canonical·색인·title/description·H1·이미지 ALT·hreflang·URL 구조 등을 실제 크롤링으로 검사합니다."
    />
  );
}
