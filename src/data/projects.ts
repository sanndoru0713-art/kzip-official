export type Project = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  /** 공개 전 프로젝트는 true — 목록·상세에서 "비공개 프로젝트"로 표시됩니다. */
  confidential: boolean;
  /** /public/images/projects/ 안의 파일 경로. 없으면 자리표시자가 표시됩니다. */
  image?: string;
  overview: string;
  challenge: string;
  approach: string;
  execution: string[];
  deliverables: string[];
  /** 실제 수치 확보 전까지 자리표시자를 유지하세요. */
  results: string;
  role: string;
  period: string;
  relatedServices: string[]; // 서비스 slug
};

/**
 * 대표 프로젝트 목록.
 * 실제 실적·수치를 확보하기 전까지 [입력 필요] 자리표시자를 유지합니다.
 * 없는 성과를 만들어 넣지 마세요.
 */
export const projects: Project[] = [
  {
    slug: "medical-japan-marketing",
    title: "의료서비스 분야 일본어권 디지털 마케팅 운영",
    category: "일본 마케팅",
    summary:
      "일본어권 고객을 대상으로 의료서비스 브랜드의 디지털 채널을 기획하고 운영한 프로젝트입니다.",
    confidential: false,
    overview:
      "[프로젝트 개요 입력 필요] 일본어권 고객 대상 의료서비스 마케팅 운영 개요를 입력하세요.",
    challenge:
      "[고객 과제 입력 필요] 프로젝트 착수 시점의 고객 과제를 입력하세요.",
    approach:
      "[접근 전략 입력 필요] 시장 분석과 채널 전략 등 접근 방식을 입력하세요.",
    execution: [
      "[수행 내용 입력 필요] 일본어 콘텐츠 기획·제작",
      "[수행 내용 입력 필요] SNS 채널 운영",
      "[수행 내용 입력 필요] 고객 문의 대응 동선 관리",
    ],
    deliverables: ["[제작 결과물 입력 필요 — 이미지 교체 필요]"],
    results: "[공개 가능한 성과 입력 필요]",
    role: "[K:ZIP 담당 역할 입력 필요]",
    period: "[프로젝트 기간 입력 필요]",
    relatedServices: ["japan-global-marketing", "digital-marketing", "sns-operation"],
  },
  {
    slug: "global-content-booking",
    title: "글로벌 고객 대상 콘텐츠 및 예약 동선 구축",
    category: "글로벌 · CRM",
    summary:
      "해외 고객이 콘텐츠를 접한 뒤 자연스럽게 예약까지 도달하도록 콘텐츠와 전환 동선을 설계한 프로젝트입니다.",
    confidential: false,
    overview:
      "[프로젝트 개요 입력 필요] 글로벌 고객 대상 콘텐츠·예약 동선 구축 개요를 입력하세요.",
    challenge:
      "[고객 과제 입력 필요] 프로젝트 착수 시점의 고객 과제를 입력하세요.",
    approach:
      "[접근 전략 입력 필요] 고객 여정 분석과 동선 설계 등 접근 방식을 입력하세요.",
    execution: [
      "[수행 내용 입력 필요] 다국어 콘텐츠 구조 설계",
      "[수행 내용 입력 필요] 예약 전환 동선 구축",
      "[수행 내용 입력 필요] 데이터 측정 환경 셋업",
    ],
    deliverables: ["[제작 결과물 입력 필요 — 이미지 교체 필요]"],
    results: "[공개 가능한 성과 입력 필요]",
    role: "[K:ZIP 담당 역할 입력 필요]",
    period: "[프로젝트 기간 입력 필요]",
    relatedServices: ["crm-customer-journey", "brand-content", "data-kpi"],
  },
  {
    slug: "sns-influencer-integration",
    title: "브랜드 SNS·인플루언서 통합 운영",
    category: "SNS · 인플루언서",
    summary:
      "브랜드 채널 운영과 인플루언서 협업을 하나의 캠페인 구조로 통합해 운영한 프로젝트입니다.",
    confidential: false,
    overview:
      "[프로젝트 개요 입력 필요] SNS·인플루언서 통합 운영 개요를 입력하세요.",
    challenge:
      "[고객 과제 입력 필요] 프로젝트 착수 시점의 고객 과제를 입력하세요.",
    approach:
      "[접근 전략 입력 필요] 채널 전략과 인플루언서 선정 기준 등 접근 방식을 입력하세요.",
    execution: [
      "[수행 내용 입력 필요] 채널 콘텐츠 편성·제작",
      "[수행 내용 입력 필요] 인플루언서 발굴·협업 운영",
      "[수행 내용 입력 필요] 캠페인 성과 분석",
    ],
    deliverables: ["[제작 결과물 입력 필요 — 이미지 교체 필요]"],
    results: "[공개 가능한 성과 입력 필요]",
    role: "[K:ZIP 담당 역할 입력 필요]",
    period: "[프로젝트 기간 입력 필요]",
    relatedServices: ["sns-operation", "influencer-marketing", "design-video"],
  },
  {
    slug: "public-marketing-preparation",
    title: "공공 홍보·마케팅 프로젝트 준비 사례",
    category: "공공 프로젝트",
    summary:
      "공공 홍보 사업이 요구하는 수행 체계, 문서화, 품질·증빙 기준에 맞춘 준비 사례입니다.",
    confidential: true,
    overview:
      "[프로젝트 개요 입력 필요] 공공 홍보·마케팅 프로젝트 준비 개요를 입력하세요.",
    challenge:
      "[고객 과제 입력 필요] 과업 요구사항과 준비 과제를 입력하세요.",
    approach:
      "[접근 전략 입력 필요] 수행 체계 설계 방식을 입력하세요.",
    execution: [
      "[수행 내용 입력 필요] 수행 계획·일정 체계 수립",
      "[수행 내용 입력 필요] 산출물·증빙 관리 체계 구축",
    ],
    deliverables: ["[제작 결과물 입력 필요 — 이미지 교체 필요]"],
    results: "[공개 가능한 성과 입력 필요]",
    role: "[K:ZIP 담당 역할 입력 필요]",
    period: "[프로젝트 기간 입력 필요]",
    relatedServices: ["public-marketing", "project-management"],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
