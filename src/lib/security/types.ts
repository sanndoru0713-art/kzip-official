/** 보안센터 도메인 타입 — 실측/공개정보 기반. 검사하지 않은 항목은 절대 '안전'으로 표시하지 않음 */

export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type SecOutcome = "pass" | "warn" | "fail" | "unchecked" | "needs-permission";

export const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "긴급",
  high: "높음",
  medium: "보통",
  low: "낮음",
  info: "정보",
};

export const SEC_OUTCOME_LABEL: Record<SecOutcome, string> = {
  pass: "양호",
  warn: "점검 권장",
  fail: "조치 필요",
  unchecked: "검사 필요",
  "needs-permission": "권한 확인 필요",
};

export interface SecurityFinding {
  id: string;
  title: string;
  category: string; // ssl | headers | exposure | policy | dns
  severity: Severity;
  outcome: SecOutcome;
  currentValue: string | null; // 실제 관측값 (없으면 null)
  recommendedValue: string | null;
  evidence: string[]; // 관측 근거
  affectedUrls: string[];
  impact: string; // 발생 가능한 문제
  fix: string; // 수정 방법
  serverExamples?: Record<string, string>; // Nginx/Apache/Vercel/...
  expectedGain: number | null; // 예상 보안점수 상승폭
  requiresOwnership: boolean;
}

export interface SslInfo {
  checked: boolean;
  https: boolean;
  redirectsToHttps: boolean | null;
  valid: boolean | null;
  issuer: string | null;
  subjectCN: string | null;
  altNames: string[];
  validFrom: string | null;
  validTo: string | null;
  daysToExpiry: number | null;
  tlsProtocol: string | null;
  domainMatch: boolean | null;
  hsts: boolean;
  hstsValue: string | null;
  error: string | null;
}

export interface SecurityHeaderCheck {
  name: string;
  present: boolean;
  value: string | null;
  recommended: string;
  severity: Severity;
  impact: string;
}

export interface PublicExposureCheck {
  path: string;
  status: number | null;
  exposed: boolean; // 200 + 의심 콘텐츠
  note: string;
}

export interface SecurityScanResult {
  origin: string;
  scannedAt: string;
  mode: "passive" | "owned"; // owned = 소유권 인증됨 → 확장 점검
  ownershipVerified: boolean;
  ssl: SslInfo;
  headers: SecurityHeaderCheck[];
  robotsPresent: boolean | null;
  sitemapPresent: boolean | null;
  privacyPolicyFound: boolean | null;
  cookiePolicyFound: boolean | null;
  serverHeader: string | null;
  poweredBy: string | null;
  exposures: PublicExposureCheck[]; // owned 모드에서만 채워짐
  findings: SecurityFinding[];
  score: number | null; // 실측 항목 기반. 측정 항목 없으면 null
  limitNote: string;
  error?: string;
}

/* 소유권 인증 */
export type OwnershipMethod = "meta" | "file" | "dns" | "gsc" | "manual";

export interface OwnershipVerification {
  siteId: string;
  origin: string;
  method: OwnershipMethod;
  token: string; // kzip-site-verification=<token>
  verified: boolean;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  note: string;
}

/* 역할·권한 (모델 정의 — 서버 연동 시 강제) */
export type Role =
  | "super-admin"
  | "admin"
  | "analyst"
  | "content-editor"
  | "hospital-manager"
  | "tourism-manager"
  | "viewer"
  | "external-client";

export const ROLE_LABEL: Record<Role, string> = {
  "super-admin": "Super Admin",
  admin: "Admin",
  analyst: "Analyst",
  "content-editor": "Content Editor",
  "hospital-manager": "Hospital Manager",
  "tourism-manager": "Tourism Manager",
  viewer: "Viewer",
  "external-client": "External Client",
};

export type Permission =
  | "site.manage"
  | "security.scan"
  | "apikey.view"
  | "competitor.manage"
  | "analysis.view"
  | "report.download"
  | "ai.generate"
  | "settings.change"
  | "user.invite"
  | "billing.view"
  | "data.delete";

export const PERMISSION_LABEL: Record<Permission, string> = {
  "site.manage": "사이트 추가·삭제",
  "security.scan": "보안검사 실행",
  "apikey.view": "API Key 열람",
  "competitor.manage": "경쟁사 등록",
  "analysis.view": "분석 결과 열람",
  "report.download": "리포트 다운로드",
  "ai.generate": "AI 콘텐츠 생성",
  "settings.change": "설정 변경",
  "user.invite": "사용자 초대",
  "billing.view": "결제정보 열람",
  "data.delete": "데이터 삭제",
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  "super-admin": Object.keys(PERMISSION_LABEL) as Permission[],
  admin: ["site.manage", "security.scan", "competitor.manage", "analysis.view", "report.download", "ai.generate", "settings.change", "user.invite"],
  analyst: ["security.scan", "competitor.manage", "analysis.view", "report.download", "ai.generate"],
  "content-editor": ["analysis.view", "ai.generate", "report.download"],
  "hospital-manager": ["analysis.view", "competitor.manage", "report.download", "ai.generate"],
  "tourism-manager": ["analysis.view", "competitor.manage", "report.download", "ai.generate"],
  viewer: ["analysis.view", "report.download"],
  "external-client": ["analysis.view", "report.download"],
};

export interface AuditLogEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  ip: string | null;
  agent: string | null;
  result: "success" | "failure" | "info";
}
