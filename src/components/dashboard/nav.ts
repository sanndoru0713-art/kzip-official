export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: "개요",
    items: [
      { href: "/dashboard", label: "종합 대시보드", icon: "dashboard" },
      { href: "/dashboard/sites", label: "사이트 관리", icon: "web" },
    ],
  },
  {
    title: "사이트 유형별 분석",
    items: [
      { href: "/dashboard/analysis/general", label: "일반 사이트 분석", icon: "business" },
      { href: "/dashboard/analysis/hospital", label: "병원 사이트 분석", icon: "hospital" },
      { href: "/dashboard/analysis/tourism", label: "관광 사이트 분석", icon: "tour" },
    ],
  },
  {
    title: "경쟁 분석",
    items: [
      { href: "/dashboard/competitors", label: "경쟁사 분석", icon: "compare" },
      { href: "/dashboard/gap", label: "경쟁사 격차 분석", icon: "gap" },
    ],
  },
  {
    title: "검색 분석",
    items: [
      { href: "/dashboard/technical", label: "기술 SEO", icon: "settings-code" },
      { href: "/dashboard/aeo", label: "AEO", icon: "qa" },
      { href: "/dashboard/geo", label: "GEO·AI 검색", icon: "ai" },
      { href: "/dashboard/schema", label: "구조화데이터", icon: "schema" },
      { href: "/dashboard/content", label: "콘텐츠 분석", icon: "article" },
      { href: "/dashboard/multilingual", label: "다국어 SEO", icon: "language" },
      { href: "/dashboard/japanese", label: "일본어 SEO", icon: "ja" },
      { href: "/dashboard/speed", label: "페이지 속도", icon: "speed" },
      { href: "/dashboard/search-console", label: "Search Console", icon: "search" },
    ],
  },
  {
    title: "AI 가시성",
    items: [
      { href: "/dashboard/ai-visibility", label: "AI 가시성", icon: "ai" },
      { href: "/dashboard/prompts", label: "질문·프롬프트 분석", icon: "qa" },
      { href: "/dashboard/sources", label: "출처 분석", icon: "external" },
    ],
  },
  {
    title: "실행",
    items: [
      { href: "/dashboard/improvement", label: "개선센터", icon: "build" },
      { href: "/dashboard/priority", label: "실행 우선순위", icon: "priority" },
      { href: "/dashboard/history", label: "변화 추적", icon: "trend" },
      { href: "/dashboard/report", label: "리포트", icon: "report" },
    ],
  },
  {
    title: "보안센터",
    items: [
      { href: "/dashboard/security", label: "보안 종합 대시보드", icon: "shield" },
      { href: "/dashboard/security/scan", label: "웹사이트 보안 진단", icon: "scan" },
      { href: "/dashboard/security/ssl", label: "SSL·HTTPS", icon: "lock" },
      { href: "/dashboard/security/headers", label: "보안 헤더", icon: "headers" },
      { href: "/dashboard/security/vulnerabilities", label: "취약점 점검", icon: "bug" },
      { href: "/dashboard/security/monitoring", label: "악성코드·변조 감시", icon: "monitor" },
      { href: "/dashboard/security/account", label: "로그인·계정 보안", icon: "person" },
      { href: "/dashboard/security/api", label: "API 보안", icon: "key" },
      { href: "/dashboard/security/privacy", label: "개인정보·데이터 보호", icon: "privacy" },
      { href: "/dashboard/security/access-log", label: "접속 기록", icon: "history" },
      { href: "/dashboard/security/alerts", label: "보안 알림", icon: "bell" },
      { href: "/dashboard/security/improvement", label: "보안 개선센터", icon: "build" },
      { href: "/dashboard/security/history", label: "검사 기록", icon: "trend" },
    ],
  },
  {
    title: "기준·설정",
    items: [
      { href: "/dashboard/criteria", label: "평가 기준", icon: "rule" },
      { href: "/dashboard/settings", label: "설정", icon: "settings" },
    ],
  },
];
