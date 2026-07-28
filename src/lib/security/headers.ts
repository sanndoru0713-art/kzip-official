/** 보안 헤더 정의 — 서버별 설정 예시 포함 (실제 관측값과 비교) */

import type { Severity } from "./types";

export interface HeaderSpec {
  name: string;
  key: string; // 소문자 헤더 키
  recommended: string;
  severity: Severity;
  impact: string;
  fix: string;
  servers: Record<string, string>;
}

export const SECURITY_HEADERS: HeaderSpec[] = [
  {
    name: "Strict-Transport-Security",
    key: "strict-transport-security",
    recommended: "max-age=31536000; includeSubDomains; preload",
    severity: "high",
    impact: "HSTS 미적용 시 초기 HTTP 요청이 가로채기(SSL stripping) 공격에 노출될 수 있습니다.",
    fix: "HTTPS 응답에 HSTS 헤더를 추가하고 max-age를 1년 이상으로 설정하세요.",
    servers: {
      Nginx: 'add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;',
      Apache: 'Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"',
      "Next.js": `// next.config.ts headers()\n{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" }`,
      Vercel: `// vercel.json headers\n{ "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" }`,
      Cloudflare: "SSL/TLS → Edge Certificates → HSTS 활성화 (Enable HSTS)",
    },
  },
  {
    name: "Content-Security-Policy",
    key: "content-security-policy",
    recommended: "default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'self'",
    severity: "high",
    impact: "CSP 미적용 시 XSS로 삽입된 스크립트 실행을 브라우저가 차단하지 못합니다.",
    fix: "허용 출처를 명시한 CSP를 적용하세요. 초기에는 Report-Only 모드로 영향 범위를 확인하는 것을 권장합니다.",
    servers: {
      Nginx: `add_header Content-Security-Policy "default-src 'self'; object-src 'none'; frame-ancestors 'self'" always;`,
      Apache: `Header always set Content-Security-Policy "default-src 'self'; object-src 'none'; frame-ancestors 'self'"`,
      "Next.js": `{ key: "Content-Security-Policy", value: "default-src 'self'; object-src 'none'; frame-ancestors 'self'" }`,
      Vercel: `{ "key": "Content-Security-Policy", "value": "default-src 'self'; object-src 'none'" }`,
    },
  },
  {
    name: "X-Content-Type-Options",
    key: "x-content-type-options",
    recommended: "nosniff",
    severity: "medium",
    impact: "미적용 시 브라우저가 MIME 타입을 추측(sniffing)해 콘텐츠를 잘못 실행할 수 있습니다.",
    fix: "nosniff 값을 설정하세요.",
    servers: {
      Nginx: 'add_header X-Content-Type-Options "nosniff" always;',
      Apache: 'Header always set X-Content-Type-Options "nosniff"',
      "Next.js": `{ key: "X-Content-Type-Options", value: "nosniff" }`,
    },
  },
  {
    name: "X-Frame-Options",
    key: "x-frame-options",
    recommended: "SAMEORIGIN",
    severity: "medium",
    impact: "미적용 시 클릭재킹(iframe에 사이트를 삽입해 사용자를 속이는 공격)에 노출됩니다.",
    fix: "SAMEORIGIN 또는 DENY를 설정하세요. CSP frame-ancestors로도 대체 가능합니다.",
    servers: {
      Nginx: 'add_header X-Frame-Options "SAMEORIGIN" always;',
      Apache: 'Header always set X-Frame-Options "SAMEORIGIN"',
      "Next.js": `{ key: "X-Frame-Options", value: "SAMEORIGIN" }`,
    },
  },
  {
    name: "Referrer-Policy",
    key: "referrer-policy",
    recommended: "strict-origin-when-cross-origin",
    severity: "low",
    impact: "미적용 시 외부 이동 시 전체 URL이 Referer로 유출될 수 있습니다.",
    fix: "strict-origin-when-cross-origin 등 적절한 정책을 설정하세요.",
    servers: {
      Nginx: 'add_header Referrer-Policy "strict-origin-when-cross-origin" always;',
      "Next.js": `{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }`,
    },
  },
  {
    name: "Permissions-Policy",
    key: "permissions-policy",
    recommended: "geolocation=(), camera=(), microphone=()",
    severity: "low",
    impact: "미적용 시 삽입된 스크립트가 카메라·위치 등 브라우저 기능을 요청할 수 있습니다.",
    fix: "불필요한 기능을 비활성화하는 Permissions-Policy를 설정하세요.",
    servers: {
      Nginx: 'add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;',
      "Next.js": `{ key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" }`,
    },
  },
  {
    name: "Cross-Origin-Opener-Policy",
    key: "cross-origin-opener-policy",
    recommended: "same-origin",
    severity: "low",
    impact: "미적용 시 교차 출처 창과 브라우징 컨텍스트를 공유해 일부 사이드채널 공격에 노출될 수 있습니다.",
    fix: "same-origin을 설정하세요.",
    servers: { "Next.js": `{ key: "Cross-Origin-Opener-Policy", value: "same-origin" }` },
  },
  {
    name: "Cross-Origin-Resource-Policy",
    key: "cross-origin-resource-policy",
    recommended: "same-origin",
    severity: "low",
    impact: "미적용 시 리소스가 임의의 교차 출처에서 로드될 수 있습니다.",
    fix: "same-origin 또는 same-site를 설정하세요.",
    servers: { "Next.js": `{ key: "Cross-Origin-Resource-Policy", value: "same-origin" }` },
  },
  {
    name: "Cross-Origin-Embedder-Policy",
    key: "cross-origin-embedder-policy",
    recommended: "require-corp",
    severity: "info",
    impact: "고급 격리(cross-origin isolation)가 필요한 기능 사용 시 요구됩니다.",
    fix: "require-corp를 설정하되 외부 리소스 호환성을 확인하세요.",
    servers: { "Next.js": `{ key: "Cross-Origin-Embedder-Policy", value: "require-corp" }` },
  },
];
