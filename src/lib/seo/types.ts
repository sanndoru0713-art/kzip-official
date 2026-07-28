/**
 * K:ZIP SEO·AEO·GEO 분석 대시보드 — 도메인 타입
 *
 * 원칙:
 *  - 측정하지 못한 값은 null. 절대 0이나 임의 값으로 대체하지 않는다.
 *  - 모든 점수는 근거(evidence)와 함께 저장한다.
 */

/* ───────────────────────── 사이트 · 경쟁사 ───────────────────────── */

export type SiteType = "hospital" | "tourism" | "general";

export interface SiteEntry {
  id: string;
  name: string;
  url: string;
  type: SiteType;
  locale?: string;
  memo?: string;
  createdAt: string; // ISO
  isCompetitor: false;
}

export interface CompetitorEntry {
  id: string;
  name: string;
  url: string;
  type: SiteType;
  groupId?: string;
  memo?: string;
  createdAt: string;
  isCompetitor: true;
}

export interface CompetitorGroup {
  id: string;
  name: string;
  type: SiteType;
  createdAt: string;
}

/* ───────────────────────── 크롤 결과 (원시 데이터) ───────────────────────── */

export interface CrawledImage {
  src: string;
  alt: string | null; // 속성 자체가 없으면 null, 빈 문자열이면 ""
}

export interface CrawledLink {
  href: string;
  text: string;
  internal: boolean;
  nofollow: boolean;
}

export interface CrawledHreflang {
  lang: string;
  href: string;
}

export interface JsonLdBlock {
  raw: string;
  parsed: unknown | null; // JSON 파싱 실패 시 null
  parseError: string | null;
  types: string[]; // @type 수집 (중첩 포함)
}

export interface CrawledPage {
  url: string;
  finalUrl: string;
  status: number;
  redirectChain: string[];
  fetchedAt: string;
  contentType: string | null;
  htmlBytes: number;
  /* head */
  title: string | null;
  metaDescription: string | null;
  metaRobots: string | null;
  canonical: string | null;
  viewport: string | null;
  charset: string | null;
  langAttr: string | null;
  ogTags: Record<string, string>;
  twitterTags: Record<string, string>;
  hreflang: CrawledHreflang[];
  /* 구조 */
  h1: string[];
  h2: string[];
  h3: string[];
  images: CrawledImage[];
  links: CrawledLink[];
  jsonLd: JsonLdBlock[];
  /* 본문 텍스트 신호 */
  textLength: number; // 본문 텍스트 길이 (태그 제거 후)
  firstParagraph: string | null; // 첫 의미 단락 (직접 답변 판정용)
  hasTable: boolean;
  listCount: number; // ul+ol
  orderedListCount: number;
  paragraphCount: number;
  /* 콘텐츠 패턴 (본문 텍스트 기반 — 실제 매칭된 근거 문자열 포함) */
  patterns: PagePatternSignals;
  error?: string; // fetch 실패 시
}

export interface PatternHit {
  matched: boolean;
  samples: string[]; // 실제 매칭 문자열 (근거 표시용, 최대 5)
  count: number;
}

export interface PagePatternSignals {
  questionHeadings: PatternHit; // 질문형 제목
  faqSection: PatternHit;
  price: PatternHit;
  businessHours: PatternHit;
  address: PatternHit;
  transport: PatternHit;
  reservation: PatternHit;
  phone: PatternHit; // tel: 링크 또는 전화 패턴
  authorInfo: PatternHit;
  visibleDates: PatternHit; // 게시일/수정일 표기
  statistics: PatternHit; // 수치·통계 표현
  steps: PatternHit; // 단계별 설명
  mapEmbed: PatternHit; // 지도 링크/임베드
  medicalRiskExpressions: PatternHit; // 의료광고 검토 필요 표현
  medicalStaff: PatternHit; // 의료진/원장 소개
  sideEffects: PatternHit; // 부작용·주의사항
  seasonal: PatternHit; // 계절·축제·이벤트
  admission: PatternHit; // 입장료·요금
  externalCitations: PatternHit; // 공식 출처 링크
}

export interface RobotsTxtInfo {
  fetched: boolean;
  status: number | null;
  sitemaps: string[];
  disallowAll: boolean;
  disallowRules: string[]; // User-agent: * 기준
  raw: string | null;
}

export interface SitemapInfo {
  fetched: boolean;
  status: number | null;
  url: string | null;
  urlCount: number | null;
  isIndex: boolean;
  sampleUrls: string[];
  localeBreakdown: Record<string, number> | null; // 경로 프리픽스 기반 (/ja/, /en/ …)
}

export interface BrokenLinkCheck {
  checkedCount: number;
  brokenCount: number;
  broken: { url: string; status: number | null; foundOn: string }[];
  skipped: boolean; // 검사량 제한으로 생략된 경우
}

export interface CrawlResult {
  origin: string;
  startUrl: string;
  crawledAt: string;
  https: boolean;
  robotsTxt: RobotsTxtInfo;
  sitemap: SitemapInfo;
  pages: CrawledPage[]; // 첫 항목이 시작 페이지
  pagesAttempted: number;
  pagesBlockedByRobots: string[];
  brokenLinks: BrokenLinkCheck;
  crawlLimitNote: string; // 크롤 범위 한계 명시 (근거 투명성)
  error?: string; // 크롤 자체 실패
}

/* ───────────────────────── 검사 항목 · 점수 ───────────────────────── */

export type ScoreStatus = "fail" | "good" | "best"; // 미달 | 양호 | 최적
export type CheckOutcome = ScoreStatus | "unmeasured" | "not-connected";

export type CategoryId =
  | "technical" // 기술 SEO
  | "content" // 콘텐츠 품질
  | "aeo"
  | "geo" // GEO·AI 검색 대응
  | "trust" // 신뢰도·최신성
  | "schema" // 구조화데이터
  | "mobile" // 모바일·속도
  | "hospital" // 병원 전용
  | "tourism"; // 관광 전용

export type Difficulty = "low" | "medium" | "high";

export interface CheckThresholds {
  /** 양호 하한 (이 값 미만이면 미달) */
  good: number;
  /** 최적 하한 */
  best: number;
  unit: string; // "%", "점", "개" 등
  /** 기준 출처 (공식 문서 등) */
  source: string;
  sourceUrl?: string;
}

export interface CheckDefinition {
  id: string;
  category: CategoryId;
  label: string;
  description: string; // 무엇을 검사하는지
  why: string; // 왜 중요한지 (검색 노출 영향)
  aeoImpact: string; // AEO·AI 검색 영향
  thresholds: CheckThresholds;
  weight: number; // 카테고리 내 가중치
  fix: {
    method: string[]; // 개선 방법
    example: string; // 수정 예시 (문구/코드)
    difficulty: Difficulty;
    effort: string; // 예상 작업량
  };
  aiActions?: AiActionId[]; // 연결할 AI 생성 기능
  siteTypes?: SiteType[]; // 제한 적용 (없으면 전체)
}

export type AiActionId =
  | "title"
  | "meta-description"
  | "h1"
  | "h2-structure"
  | "faq"
  | "faq-schema"
  | "json-ld"
  | "image-alt"
  | "internal-links"
  | "content-brief"
  | "japanese-seo"
  | "english-seo";

export interface CheckResult {
  checkId: string;
  /** 0~100 정규화 점수. 측정 불가면 null — 절대 0으로 대체하지 않음 */
  score: number | null;
  outcome: CheckOutcome;
  /** 실측값 표시용 (예: "42%", "38개 누락") */
  valueLabel: string;
  /** 산출 근거 — 실제 크롤 데이터에서 나온 사실만 기록 */
  evidence: string[];
  /** 문제가 발견된 URL */
  affectedUrls: string[];
  /** 측정 불가/미연결 사유 */
  unmeasuredReason?: string;
}

export interface CategoryScore {
  category: CategoryId;
  /** 측정된 검사만으로 산출. 측정 항목이 없으면 null */
  score: number | null;
  measuredCount: number;
  totalCount: number;
  statusCounts: { fail: number; good: number; best: number; unmeasured: number };
}

export interface ScanScores {
  overall: number | null;
  categories: CategoryScore[];
  checks: CheckResult[];
  /** 산식 설명용 — 적용된 가중치 스냅샷 */
  appliedWeights: Record<string, number>;
}

/* ───────────────────────── 검사 기록 (스캔) ───────────────────────── */

export interface PsiMetrics {
  fetchedAt: string;
  strategy: "mobile" | "desktop";
  performanceScore: number | null; // 0~100 (Lighthouse)
  seoScore: number | null;
  accessibilityScore: number | null;
  /* 실측(CrUX) Core Web Vitals — 없으면 null */
  fieldData: {
    lcpMs: number | null;
    inpMs: number | null;
    cls: number | null;
    overallCategory: string | null; // FAST/AVERAGE/SLOW
  } | null;
  /* Lab 데이터 */
  labData: {
    lcpMs: number | null;
    cls: number | null;
    tbtMs: number | null;
    fcpMs: number | null;
    speedIndexMs: number | null;
  } | null;
}

export interface Scan {
  id: string;
  targetId: string; // SiteEntry.id 또는 CompetitorEntry.id
  targetUrl: string;
  targetType: SiteType;
  isCompetitor: boolean;
  scannedAt: string;
  crawl: CrawlResult;
  psi?: PsiMetrics | null; // PSI 미실행 시 undefined/null
}

/* ───────────────────────── 설정 ───────────────────────── */

export type CategoryWeightMap = Partial<Record<CategoryId, number>>;

export interface DashboardSettings {
  /** 사이트 유형별 카테고리 가중치 (합계 100 기준) */
  weights: Record<SiteType, CategoryWeightMap>;
  /** PSI API Key (없으면 keyless 호출 시도 — 쿼터 낮음) */
  psiApiKey?: string;
  activeSiteId?: string;
}

/* ───────────────────────── 개선 작업 추적 ───────────────────────── */

export type TaskStatus = "todo" | "in-progress" | "done";

export interface ImprovementTask {
  id: string; // `${siteId}:${checkId}`
  siteId: string;
  checkId: string;
  status: TaskStatus;
  assignee?: string;
  updatedAt: string;
}

/* ───────────────────────── 상태 라벨 유틸 타입 ───────────────────────── */

export const STATUS_LABEL: Record<CheckOutcome, string> = {
  fail: "미달",
  good: "양호",
  best: "최적",
  unmeasured: "측정 불가",
  "not-connected": "데이터 미연결",
};

export const SITE_TYPE_LABEL: Record<SiteType, string> = {
  hospital: "병원",
  tourism: "관광",
  general: "일반",
};

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  technical: "기술 SEO",
  content: "콘텐츠 품질",
  aeo: "AEO",
  geo: "GEO·AI 검색",
  trust: "신뢰도·최신성",
  schema: "구조화데이터",
  mobile: "모바일·속도",
  hospital: "병원 전용",
  tourism: "관광 전용",
};

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  low: "낮음",
  medium: "보통",
  high: "높음",
};
