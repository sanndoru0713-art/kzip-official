export type InsightCategory =
  | "전략"
  | "디지털 마케팅"
  | "일본 시장"
  | "글로벌 비즈니스"
  | "프로젝트 관리"
  | "공공 마케팅"
  | "콘텐츠"
  | "데이터·AI";

export const insightCategories: InsightCategory[] = [
  "전략",
  "디지털 마케팅",
  "일본 시장",
  "글로벌 비즈니스",
  "프로젝트 관리",
  "공공 마케팅",
  "콘텐츠",
  "데이터·AI",
];

export type Insight = {
  slug: string;
  title: string;
  category: InsightCategory;
  summary: string;
  date: string; // YYYY-MM-DD
  /**
   * 본문 문단 배열. 초기에는 요약만 공개하고,
   * 검증된 원고가 준비되면 이 배열에 문단을 추가하세요.
   */
  body?: string[];
};

/**
 * 인사이트 게시물.
 * 새 글은 이 배열에 객체를 추가하면 목록·상세·사이트맵에 자동 반영됩니다.
 * 초기 샘플은 제목과 요약만 제공합니다 — 본문은 검증된 원고로 채우세요.
 */
export const insights: Insight[] = [
  {
    slug: "japan-market-chosen-brands",
    title: "일본 시장에서 선택받는 브랜드는 무엇이 다른가",
    category: "일본 시장",
    summary:
      "일본 소비자는 신뢰를 확인하는 방식이 다릅니다. 번역이 아니라 신뢰 구조를 현지화한 브랜드가 선택받는 이유를 정리합니다.",
    date: "2026-07-01",
  },
  {
    slug: "content-to-booking",
    title: "콘텐츠 노출을 실제 방문과 예약으로 연결하는 방법",
    category: "디지털 마케팅",
    summary:
      "조회수와 매출 사이에는 동선이 있습니다. 콘텐츠 접점에서 예약·방문까지의 전환 구조를 설계하는 관점을 다룹니다.",
    date: "2026-06-15",
  },
  {
    slug: "public-project-delivery-system",
    title: "공공 홍보 프로젝트에서 평가되는 수행체계",
    category: "공공 마케팅",
    summary:
      "공공 사업은 아이디어보다 수행체계를 먼저 봅니다. 일정, 산출물, 증빙 관리가 평가에서 어떻게 작동하는지 정리합니다.",
    date: "2026-06-01",
  },
  {
    slug: "ai-with-quality",
    title: "AI를 실무에 적용하면서도 품질을 지키는 방법",
    category: "데이터·AI",
    summary:
      "AI 도입의 관건은 속도가 아니라 검증 체계입니다. 산출물 품질을 지키는 워크플로 설계 원칙을 공유합니다.",
    date: "2026-05-20",
  },
];

export function getInsight(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug);
}
