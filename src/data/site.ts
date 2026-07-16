/**
 * 사이트 전역 정보.
 * [입력 필요]로 표시된 값은 실제 정보로 교체하세요.
 */
export const site = {
  name: "K:ZIP",
  nameKo: "케이집",
  ceo: "박서영",
  tagline: "전략을 설계하고, 성장을 실행합니다.",
  description:
    "K:ZIP는 시장과 고객을 분석하고, 브랜드 전략, 콘텐츠, 디지털 채널, 데이터, 글로벌 커뮤니케이션을 연결하여 실행 가능한 성장 구조를 설계합니다.",
  positioning: "전략 중심의 디지털 마케팅 및 글로벌 프로젝트 수행 기업",
  // 실제 도메인 확정 후 교체하세요. (환경변수 NEXT_PUBLIC_SITE_URL 우선)
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://kzip-official.example.com",
  // [입력 필요] 실제 연락처 정보로 교체하세요.
  contact: {
    email: "[이메일 입력 필요]",
    phone: "[전화번호 입력 필요]",
    address: "[사업장 주소 입력 필요]",
    businessNumber: "[사업자등록번호 입력 필요]",
  },
} as const;

export const nav = [
  { label: "홈", href: "/" },
  { label: "회사소개", href: "/about" },
  { label: "서비스", href: "/services" },
  { label: "프로젝트", href: "/projects" },
  { label: "일본·글로벌", href: "/global" },
  { label: "인사이트", href: "/insights" },
  { label: "문의하기", href: "/contact" },
] as const;
