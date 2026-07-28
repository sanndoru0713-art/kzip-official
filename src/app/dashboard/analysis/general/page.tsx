"use client";

import { AnalysisView } from "@/components/dashboard/AnalysisView";

export default function GeneralAnalysis() {
  return (
    <AnalysisView
      overrideType="general"
      title="일반 사이트 분석"
      description="기업·브랜드·콘텐츠·쇼핑몰 등 범용 사이트를 위한 SEO·AEO·GEO 종합 진단입니다. 일반 사이트 가중치가 적용됩니다."
    />
  );
}
