"use client";

import { AnalysisView } from "@/components/dashboard/AnalysisView";

export default function ContentPage() {
  return (
    <AnalysisView
      categories={["content", "trust"]}
      title="콘텐츠 분석 · 신뢰도"
      description="콘텐츠 분량·구조화(표/목록)·중복·CTA와 함께 E-E-A-T 신뢰 신호(작성자·게시일/수정일·최신성·공식 출처·연락처 투명성)를 검사합니다."
    />
  );
}
