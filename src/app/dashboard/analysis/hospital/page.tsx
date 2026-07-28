"use client";

import { AnalysisView } from "@/components/dashboard/AnalysisView";

export default function HospitalAnalysis() {
  return (
    <AnalysisView
      overrideType="hospital"
      title="병원 사이트 분석"
      description="피부과·성형외과·치과 등 의료기관 전용 진단입니다. 의료 신뢰도·의료진 정보·MedicalOrganization/Physician Schema·지역검색·다국어 예약 동선의 비중을 높였습니다. 의료광고 관련 표현은 자동 위법 판단이 아닌 '검토 필요'로 표시합니다."
    />
  );
}
