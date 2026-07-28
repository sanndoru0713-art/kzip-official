"use client";

import { PageHeader } from "@/components/dashboard/ui";
import { NotConnected } from "@/components/dashboard/NotConnected";

export default function SourcesPage() {
  return (
    <div className="d-fade">
      <PageHeader
        title="AI 답변 출처 분석"
        description="AI 답변에서 가장 많이 인용되는 도메인, 자사·경쟁사·블로그·언론·공식기관·커뮤니티 인용 비율, 플랫폼별 차이, 기간별 변화, 신규/이탈 출처를 분석합니다."
      />
      <NotConnected
        icon="external"
        title="출처 인용 데이터 미연결"
        reason="AI 답변의 인용 출처 분포는 각 AI 플랫폼의 인용 데이터가 있어야 산출됩니다. 확정 데이터 없이 도메인별 인용 비율을 만들어내지 않습니다."
        requirement="3차 개발 단계에서 AI 인용 추적(자체 프롬프트 실행의 인용 파싱, Perplexity/Bing 인용 API 등) 연동 후 활성화됩니다."
        fields={["최다 인용 도메인", "자사 인용 비율", "경쟁사 인용 비율", "블로그 비율", "언론 비율", "공식기관 비율", "커뮤니티 비율", "플랫폼별 차이", "기간별 변화", "신규 인용 출처", "이탈 인용 출처"]}
      />
    </div>
  );
}
