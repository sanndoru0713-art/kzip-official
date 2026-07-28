"use client";

import { AnalysisView } from "@/components/dashboard/AnalysisView";
import { Icon } from "@/components/dashboard/ui";

export default function GeoPage() {
  return (
    <div>
      <div className="d-card mb-5 flex items-start gap-3 p-4" style={{ background: "var(--d-sky-softer)" }}>
        <Icon name="info" size={18} className="mt-0.5 shrink-0" style={{ color: "var(--d-sky)" }} />
        <p className="text-[12.5px] leading-relaxed" style={{ color: "var(--d-text-soft)" }}>
          Google AI Overviews·AI Mode·ChatGPT·Gemini·Claude·Perplexity·Copilot 등 생성형 검색 대응을 위한 구조 신호를 분석합니다.
          실제 인용 데이터(각 AI 서비스 API)가 없으므로 인용 여부를 확정 표시하지 않고 <strong>&ldquo;예상 인용 가능성&rdquo;</strong>으로 표기합니다.
        </p>
      </div>
      <AnalysisView
        categories={["geo"]}
        title="GEO · AI 검색 분석"
        description="브랜드/조직 Entity, sameAs, 통계·근거, Q&A 구조, 주제 일관성, Topic Cluster, 콘텐츠 독창성, AI 크롤러 접근성을 검사합니다."
      />
    </div>
  );
}
