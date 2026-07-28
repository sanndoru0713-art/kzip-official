"use client";

import { PageHeader } from "@/components/dashboard/ui";
import { NotConnected } from "@/components/dashboard/NotConnected";

export default function PromptsPage() {
  const journey = ["인지", "탐색", "비교", "고려", "예약·구매", "방문 후"];
  return (
    <div className="d-fade">
      <PageHeader
        title="질문·프롬프트 분석"
        description="검색 질문·키워드·검색 의도·고객 여정 단계·AI 노출 여부·브랜드 언급·인용 출처·순위·감성·위험도를 표로 분석합니다."
      />
      <div className="d-card mb-5 p-4">
        <p className="mb-2 text-[12px] font-semibold" style={{ color: "var(--d-text-mute)" }}>고객 여정 필터</p>
        <div className="flex flex-wrap gap-1.5">
          {journey.map((j) => (
            <span key={j} className="d-badge" style={{ background: "var(--d-gray-chip)", color: "var(--d-text-mute)" }}>{j}</span>
          ))}
        </div>
      </div>
      <NotConnected
        icon="qa"
        title="프롬프트/질문 데이터 미연결"
        reason="질문별 AI 노출·브랜드 언급·인용 출처는 실제 프롬프트 실행 로그 또는 검색 데이터가 있어야 산출됩니다. 월간 검색량은 키워드 데이터 API(예: Search Console 검색어, 키워드 도구) 연동이 필요합니다. 연결 전에는 표에 임의 수치를 채우지 않습니다."
        requirement="3차 개발 단계에서 프롬프트 실행 파이프라인 + 키워드 볼륨 API 연동 후 활성화됩니다."
        fields={["검색 질문", "핵심 키워드", "검색 의도", "여정 단계", "월간 검색량", "AI 노출 여부", "브랜드 언급", "경쟁사 언급", "인용 출처", "브랜드 순위", "감성", "위험도"]}
      />
    </div>
  );
}
