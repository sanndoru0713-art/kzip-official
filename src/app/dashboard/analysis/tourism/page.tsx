"use client";

import { AnalysisView } from "@/components/dashboard/AnalysisView";

export default function TourismAnalysis() {
  return (
    <AnalysisView
      overrideType="tourism"
      title="관광 사이트 분석"
      description="여행 플랫폼·관광 포털·도시 가이드 전용 진단입니다. 지역·도시별 콘텐츠, 다국어 SEO(일본어·영어), hreflang, 관광지 Entity, 장소 상세정보, 지도·교통, 관광 구조화데이터의 비중을 높였습니다."
    />
  );
}
