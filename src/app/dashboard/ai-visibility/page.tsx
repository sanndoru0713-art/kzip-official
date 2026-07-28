"use client";

import Link from "next/link";
import { PageHeader, Icon } from "@/components/dashboard/ui";
import { NotConnected } from "@/components/dashboard/NotConnected";

const PLATFORMS = ["Google", "Google AI Overviews", "Google AI Mode", "ChatGPT", "Gemini", "Claude", "Perplexity", "Copilot"];

export default function AiVisibilityPage() {
  return (
    <div className="d-fade">
      <PageHeader
        title="AI 가시성"
        description="AI 플랫폼별 브랜드 노출률·인용률·Share of Voice·출처 도메인·질문군별 노출을 추적합니다. 각 AI 서비스의 인용 데이터 API가 연결되기 전에는 임의 수치를 표시하지 않습니다."
      />

      {/* 플랫폼 필터 (비활성 표시) */}
      <div className="d-card mb-5 p-4">
        <p className="mb-2 text-[12px] font-semibold" style={{ color: "var(--d-text-mute)" }}>플랫폼 필터</p>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => (
            <span key={p} className="d-badge" style={{ background: "var(--d-gray-chip)", color: "var(--d-text-mute)" }}>
              {p} · 데이터 연결 필요
            </span>
          ))}
        </div>
      </div>

      <NotConnected
        icon="ai"
        title="AI 인용·노출 데이터 미연결"
        reason="AI 플랫폼별 실제 노출·인용 여부는 각 서비스의 검색/인용 데이터가 있어야 확인할 수 있습니다. 현재는 확정 데이터가 없으므로 노출률·인용률을 숫자로 표시하지 않습니다. 대신 GEO·AI 검색 분석에서 '예상 인용 가능성'을 구조 신호 기반으로 제공합니다."
        requirement="3차 개발 단계에서 AI 인용 추적 데이터 소스(예: 자체 프롬프트 실행 로그, Perplexity/Bing 인용 API, 브랜드 모니터링) 연동 후 활성화됩니다."
        fields={["플랫폼별 브랜드 노출률", "플랫폼별 인용률", "Share of Voice", "인용 출처 도메인", "질문군별 노출", "구매 여정별 노출", "경쟁사 대비 강점", "경쟁사 대비 약점"]}
      />

      <div className="d-card mt-5 flex items-center justify-between gap-3 p-4" style={{ background: "var(--d-sky-softer)" }}>
        <p className="text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
          <Icon name="info" size={15} className="mr-1 inline align-text-bottom" style={{ color: "var(--d-sky)" }} />
          지금 바로 확인 가능한 구조 기반 AI 대응 진단은 GEO·AI 검색 분석에 있습니다.
        </p>
        <Link href="/dashboard/geo" className="d-btn d-btn-secondary d-btn-sm">GEO 분석 보기</Link>
      </div>
    </div>
  );
}
