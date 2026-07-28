"use client";

import { AnalysisView } from "@/components/dashboard/AnalysisView";

export default function AeoPage() {
  return (
    <AnalysisView
      categories={["aeo"]}
      title="AEO 분석 (답변 엔진 최적화)"
      description="점수는 임의값이 아니라 실제 페이지 콘텐츠 구조에서 산출됩니다. 상단 직접 답변·질문형 제목·FAQ·표/목록·가격/운영시간/주소/교통/예약 명확성·작성자·날짜·인용 용이 문장·답변/근거 분리 구조를 검사합니다."
    />
  );
}
