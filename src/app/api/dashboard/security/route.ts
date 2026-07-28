/**
 * 수동(passive) 웹 보안 진단 — 실측 데이터만 사용.
 *  - SSL 인증서: node:tls 로 실제 인증서 관측
 *  - 보안 헤더: 실제 응답 헤더 관측
 *  - robots/sitemap/개인정보처리방침: 공개 경로 존재 확인
 *  - 민감파일 노출: owned 모드(소유권 인증)에서만 공개 GET 확인, 값 마스킹
 *
 * 능동 공격(로그인·인증 우회·포트스캔·디렉터리 무차별·부하)은 수행하지 않는다.
 */

import { NextRequest, NextResponse } from "next/server";
import tls from "node:tls";
import { rateLimit, clientIp } from "@/lib/server/security";
import { SECURITY_HEADERS } from "@/lib/security/headers";
import { verifyOwnershipToken } from "@/lib/security/ownership";
import type {
  PublicExposureCheck,
  SecurityFinding,
  SecurityHeaderCheck,
  SecurityScanResult,
  SslInfo,
} from "@/lib/security/types";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const UA = "KZIP-Security-Audit/1.0 (+passive scan; owner-authorized only for active checks)";

function isPrivateHost(host: string): boolean {
  return (
    /^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    host === "[::1]" ||
    !host.includes(".")
  );
}

async function fetchTimeout(url: string, init?: RequestInit, ms = 10000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal, headers: { "User-Agent": UA, ...init?.headers }, cache: "no-store" });
  } finally {
    clearTimeout(t);
  }
}

function inspectSsl(hostname: string, port = 443): Promise<Partial<SslInfo>> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v: Partial<SslInfo>) => {
      if (!settled) {
        settled = true;
        resolve(v);
      }
    };
    try {
      const socket = tls.connect(
        { host: hostname, port, servername: hostname, timeout: 10000, rejectUnauthorized: false },
        () => {
          const cert = socket.getPeerCertificate(true);
          const cipher = socket.getCipher();
          const protocol = socket.getProtocol();
          const authorized = socket.authorized;
          const altNames = (cert.subjectaltname || "")
            .split(",")
            .map((s) => s.trim().replace(/^DNS:/, ""))
            .filter(Boolean);
          const str = (v: string | string[] | undefined): string | null =>
            Array.isArray(v) ? v[0] ?? null : v ?? null;
          const validTo = cert.valid_to ? new Date(cert.valid_to) : null;
          const days = validTo ? Math.floor((validTo.getTime() - Date.now()) / 86400000) : null;
          const cn = str(cert.subject?.CN);
          const domainMatch =
            (cn ? matchHost(hostname, cn) : false) || altNames.some((n) => matchHost(hostname, n));
          done({
            valid: authorized,
            issuer: str(cert.issuer?.O) || str(cert.issuer?.CN) || null,
            subjectCN: cn,
            altNames: altNames.slice(0, 20),
            validFrom: cert.valid_from ? new Date(cert.valid_from).toISOString() : null,
            validTo: validTo ? validTo.toISOString() : null,
            daysToExpiry: days,
            tlsProtocol: protocol,
            domainMatch,
            error: authorized ? null : socket.authorizationError ? String(socket.authorizationError) : null,
          });
          socket.end();
        },
      );
      socket.on("error", (e) => done({ error: e instanceof Error ? e.message : "TLS 연결 실패" }));
      socket.on("timeout", () => {
        socket.destroy();
        done({ error: "TLS 연결 시간 초과" });
      });
    } catch (e) {
      done({ error: e instanceof Error ? e.message : "TLS 검사 불가" });
    }
  });
}

function matchHost(host: string, pattern: string): boolean {
  if (pattern.startsWith("*.")) {
    const base = pattern.slice(2);
    return host === base || host.endsWith("." + base);
  }
  return host.toLowerCase() === pattern.toLowerCase();
}

const OWNED_ONLY_PATHS = [
  "/.env",
  "/.git/config",
  "/.git/HEAD",
  "/config.php",
  "/wp-config.php.bak",
  "/backup.zip",
  "/database.sql",
  "/.env.local",
  "/config.json",
  "/.DS_Store",
];

function maskSecret(text: string): string {
  return text.replace(/([A-Za-z0-9_\-]{6})[A-Za-z0-9_\-]{6,}/g, (_, p) => `${p}****`).slice(0, 120);
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`sec:${ip}`, 8, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "요청이 많습니다. 잠시 후 다시 시도하세요." }, { status: 429 });

  let body: { url?: string; ownershipToken?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const raw = (body.url || "").trim();
  if (!raw) return NextResponse.json({ error: "url 필요" }, { status: 400 });
  let start: URL;
  try {
    start = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return NextResponse.json({ error: "URL 형식 오류" }, { status: 400 });
  }
  if (isPrivateHost(start.hostname)) return NextResponse.json({ error: "내부 주소는 검사할 수 없습니다" }, { status: 400 });

  const origin = start.origin;
  const ownershipVerified = body.ownershipToken
    ? await verifyOwnershipToken(origin, body.ownershipToken).catch(() => false)
    : false;
  const mode: "passive" | "owned" = ownershipVerified ? "owned" : "passive";

  /* 1. HTTPS 리다이렉트 */
  let redirectsToHttps: boolean | null = null;
  try {
    const httpRes = await fetchTimeout(`http://${start.hostname}${start.pathname}`, { redirect: "manual" }, 8000);
    const loc = httpRes.headers.get("location");
    redirectsToHttps = httpRes.status >= 300 && httpRes.status < 400 && !!loc && loc.startsWith("https:");
    try {
      await httpRes.body?.cancel();
    } catch {
      /* noop */
    }
  } catch {
    redirectsToHttps = null;
  }

  /* 2. 메인 응답 헤더 */
  let mainRes: Response | null = null;
  let mainHeaders: Headers | null = null;
  try {
    mainRes = await fetchTimeout(origin, { redirect: "follow" }, 10000);
    mainHeaders = mainRes.headers;
    try {
      await mainRes.body?.cancel();
    } catch {
      /* noop */
    }
  } catch {
    /* noop */
  }

  /* 3. SSL */
  const sslPartial = start.protocol === "https:" ? await inspectSsl(start.hostname) : { error: "HTTP 사이트" };
  const hstsValue = mainHeaders?.get("strict-transport-security") || null;
  const ssl: SslInfo = {
    checked: start.protocol === "https:",
    https: start.protocol === "https:",
    redirectsToHttps,
    valid: sslPartial.valid ?? null,
    issuer: sslPartial.issuer ?? null,
    subjectCN: sslPartial.subjectCN ?? null,
    altNames: sslPartial.altNames ?? [],
    validFrom: sslPartial.validFrom ?? null,
    validTo: sslPartial.validTo ?? null,
    daysToExpiry: sslPartial.daysToExpiry ?? null,
    tlsProtocol: sslPartial.tlsProtocol ?? null,
    domainMatch: sslPartial.domainMatch ?? null,
    hsts: !!hstsValue,
    hstsValue,
    error: sslPartial.error ?? null,
  };

  /* 4. 보안 헤더 */
  const headers: SecurityHeaderCheck[] = SECURITY_HEADERS.map((h) => {
    const value = mainHeaders?.get(h.key) ?? null;
    return { name: h.name, present: !!value, value, recommended: h.recommended, severity: h.severity, impact: h.impact };
  });

  /* 5. 공개 정보 */
  const checkExists = async (path: string): Promise<boolean | null> => {
    try {
      const r = await fetchTimeout(`${origin}${path}`, { redirect: "manual" }, 6000);
      const ok = r.status === 200;
      try {
        await r.body?.cancel();
      } catch {
        /* noop */
      }
      return ok;
    } catch {
      return null;
    }
  };
  const [robotsPresent, sitemapPresent] = await Promise.all([checkExists("/robots.txt"), checkExists("/sitemap.xml")]);

  // 개인정보처리방침/쿠키정책 — 메인 페이지 링크 텍스트로 근사 판단
  let privacyPolicyFound: boolean | null = null;
  let cookiePolicyFound: boolean | null = null;
  try {
    const homeRes = await fetchTimeout(origin, {}, 8000);
    const html = (await homeRes.text()).slice(0, 500_000).toLowerCase();
    privacyPolicyFound = /(개인정보처리방침|개인정보 처리방침|privacy policy|プライバシーポリシー|\/privacy)/.test(html);
    cookiePolicyFound = /(쿠키 정책|쿠키정책|cookie policy|クッキーポリシー|\/cookie)/.test(html);
  } catch {
    /* noop */
  }

  /* 6. 민감파일 노출 — owned 모드에서만 */
  const exposures: PublicExposureCheck[] = [];
  if (mode === "owned") {
    for (const path of OWNED_ONLY_PATHS) {
      try {
        const r = await fetchTimeout(`${origin}${path}`, { redirect: "manual" }, 6000);
        let exposed = false;
        let note = `상태 ${r.status}`;
        if (r.status === 200) {
          const ct = r.headers.get("content-type") || "";
          const text = (await r.text()).slice(0, 2000);
          const looksSensitive =
            /(DB_|API_KEY|SECRET|PASSWORD|token|BEGIN RSA|ref:|\[core\])/i.test(text) || path.includes(".git");
          exposed = looksSensitive && !ct.includes("text/html");
          note = exposed ? `노출 의심: ${maskSecret(text.split("\n")[0] || "")}` : "200 응답이나 민감 콘텐츠로 보이지 않음 (커스텀 404 가능)";
        }
        exposures.push({ path, status: r.status, exposed, note });
        try {
          await r.body?.cancel();
        } catch {
          /* noop */
        }
      } catch {
        exposures.push({ path, status: null, exposed: false, note: "확인 불가" });
      }
    }
  }

  /* 7. findings 조립 */
  const findings: SecurityFinding[] = [];
  const push = (f: SecurityFinding) => findings.push(f);

  // SSL findings
  if (!ssl.https) {
    push({
      id: "no-https",
      title: "HTTPS 미적용",
      category: "ssl",
      severity: "critical",
      outcome: "fail",
      currentValue: "HTTP",
      recommendedValue: "HTTPS",
      evidence: ["시작 URL이 http 프로토콜입니다."],
      affectedUrls: [origin],
      impact: "전송 구간이 암호화되지 않아 통신 내용이 노출·변조될 수 있습니다.",
      fix: "SSL 인증서를 적용하고 전체 HTTP → HTTPS 301 리다이렉트를 설정하세요.",
      expectedGain: 25,
      requiresOwnership: false,
    });
  } else {
    if (ssl.valid === false)
      push({
        id: "invalid-cert",
        title: "SSL 인증서 검증 실패",
        category: "ssl",
        severity: "high",
        outcome: "fail",
        currentValue: ssl.error || "검증 실패",
        recommendedValue: "유효한 인증서 체인",
        evidence: [`인증서 오류: ${ssl.error || "체인 검증 실패"}`, ssl.issuer ? `발급기관: ${ssl.issuer}` : ""].filter(Boolean),
        affectedUrls: [origin],
        impact: "브라우저 경고로 방문자 이탈·신뢰도 하락이 발생합니다.",
        fix: "유효한 인증서와 중간 인증서 체인을 올바르게 구성하세요.",
        expectedGain: 15,
        requiresOwnership: false,
      });
    if (ssl.domainMatch === false)
      push({
        id: "cert-domain-mismatch",
        title: "인증서 도메인 불일치",
        category: "ssl",
        severity: "high",
        outcome: "fail",
        currentValue: `CN: ${ssl.subjectCN || "?"}`,
        recommendedValue: start.hostname,
        evidence: [`요청 호스트: ${start.hostname}`, `인증서 CN/SAN: ${[ssl.subjectCN, ...ssl.altNames].filter(Boolean).join(", ")}`],
        affectedUrls: [origin],
        impact: "인증서가 이 도메인용이 아니어서 브라우저가 연결을 차단할 수 있습니다.",
        fix: "이 도메인을 포함하는 인증서를 발급받으세요 (SAN 포함).",
        expectedGain: 12,
        requiresOwnership: false,
      });
    if (ssl.daysToExpiry !== null && ssl.daysToExpiry <= 30)
      push({
        id: "cert-expiring",
        title: `SSL 인증서 만료 임박 (D-${ssl.daysToExpiry})`,
        category: "ssl",
        severity: ssl.daysToExpiry <= 7 ? "high" : "medium",
        outcome: ssl.daysToExpiry <= 0 ? "fail" : "warn",
        currentValue: `만료: ${ssl.validTo?.slice(0, 10)}`,
        recommendedValue: "갱신 후 60일 이상",
        evidence: [`만료일: ${ssl.validTo?.slice(0, 10)} (${ssl.daysToExpiry}일 남음)`, ssl.issuer ? `발급기관: ${ssl.issuer}` : ""].filter(Boolean),
        affectedUrls: [origin],
        impact: "만료 시 사이트 전체가 접속 불가·경고 상태가 됩니다.",
        fix: "인증서를 갱신하고 자동 갱신(예: certbot, 호스팅 자동 갱신)을 설정하세요.",
        expectedGain: 5,
        requiresOwnership: false,
      });
    if (ssl.redirectsToHttps === false)
      push({
        id: "no-https-redirect",
        title: "HTTP → HTTPS 리다이렉트 없음",
        category: "ssl",
        severity: "medium",
        outcome: "warn",
        currentValue: "HTTP 응답이 HTTPS로 이동하지 않음",
        recommendedValue: "301 → https",
        evidence: ["http:// 요청이 https로 리다이렉트되지 않았습니다."],
        affectedUrls: [`http://${start.hostname}/`],
        impact: "HTTP로 진입한 사용자가 암호화되지 않은 채로 사이트를 이용할 수 있습니다.",
        fix: "모든 HTTP 요청을 HTTPS로 301 리다이렉트하세요.",
        expectedGain: 6,
        requiresOwnership: false,
      });
    if (ssl.tlsProtocol && /TLSv1(\.[01])?$/.test(ssl.tlsProtocol))
      push({
        id: "weak-tls",
        title: `구버전 TLS (${ssl.tlsProtocol})`,
        category: "ssl",
        severity: "medium",
        outcome: "warn",
        currentValue: ssl.tlsProtocol,
        recommendedValue: "TLS 1.2 이상",
        evidence: [`협상된 프로토콜: ${ssl.tlsProtocol}`],
        affectedUrls: [origin],
        impact: "구버전 TLS는 알려진 취약점이 있습니다.",
        fix: "서버에서 TLS 1.2/1.3만 허용하도록 설정하세요.",
        expectedGain: 8,
        requiresOwnership: false,
      });
  }

  // 헤더 findings
  for (const spec of SECURITY_HEADERS) {
    const observed = mainHeaders?.get(spec.key) ?? null;
    if (!observed) {
      push({
        id: `header-${spec.key}`,
        title: `${spec.name} 헤더 누락`,
        category: "headers",
        severity: spec.severity,
        outcome: spec.severity === "info" ? "warn" : "fail",
        currentValue: null,
        recommendedValue: spec.recommended,
        evidence: mainHeaders ? [`응답 헤더에 ${spec.name}가 없습니다.`] : ["메인 페이지 응답 헤더를 가져오지 못했습니다."],
        affectedUrls: [origin],
        impact: spec.impact,
        fix: spec.fix,
        serverExamples: spec.servers,
        expectedGain: spec.severity === "high" ? 8 : spec.severity === "medium" ? 5 : 2,
        requiresOwnership: false,
      });
    }
  }

  // 정책 findings
  if (privacyPolicyFound === false)
    push({
      id: "no-privacy-policy",
      title: "개인정보처리방침 링크 미발견",
      category: "policy",
      severity: "medium",
      outcome: "warn",
      currentValue: "메인 페이지에서 미발견",
      recommendedValue: "개인정보처리방침 페이지 및 링크",
      evidence: ["메인 페이지 HTML에서 개인정보처리방침 관련 링크를 찾지 못했습니다 (근사 판단)."],
      affectedUrls: [origin],
      impact: "국내법상 개인정보를 수집하는 사이트는 개인정보처리방침 게시가 의무입니다.",
      fix: "개인정보처리방침 페이지를 작성하고 푸터 등에 링크하세요.",
      expectedGain: 4,
      requiresOwnership: false,
    });

  // 노출 findings
  for (const ex of exposures.filter((e) => e.exposed)) {
    push({
      id: `exposure-${ex.path}`,
      title: `민감 파일 노출: ${ex.path}`,
      category: "exposure",
      severity: "critical",
      outcome: "fail",
      currentValue: ex.note,
      recommendedValue: "외부 접근 차단 (404/403)",
      evidence: [`${origin}${ex.path} — ${ex.note}`],
      affectedUrls: [`${origin}${ex.path}`],
      impact: "설정 파일·소스·백업 노출은 자격증명 유출과 2차 침해로 이어질 수 있습니다.",
      fix: "해당 파일을 웹 루트 밖으로 이동하거나 서버에서 접근을 차단하세요. 노출된 자격증명은 즉시 교체하세요.",
      expectedGain: 20,
      requiresOwnership: true,
    });
  }

  /* 8. 점수 — 실측 항목 기반 감점 방식 */
  let score: number | null;
  if (!mainHeaders && !ssl.checked) {
    score = null; // 아무것도 관측 못함
  } else {
    let s = 100;
    for (const f of findings) {
      s -= f.severity === "critical" ? 22 : f.severity === "high" ? 12 : f.severity === "medium" ? 6 : f.severity === "low" ? 2 : 0;
    }
    score = Math.max(0, Math.round(s));
  }

  const result: SecurityScanResult = {
    origin,
    scannedAt: new Date().toISOString(),
    mode,
    ownershipVerified,
    ssl,
    headers,
    robotsPresent,
    sitemapPresent,
    privacyPolicyFound,
    cookiePolicyFound,
    serverHeader: mainHeaders?.get("server") ?? null,
    poweredBy: mainHeaders?.get("x-powered-by") ?? null,
    exposures,
    findings,
    score,
    limitNote:
      mode === "owned"
        ? "소유권 인증 완료 — 수동 점검 + 공개 경로 민감파일 노출 확인 포함. 능동 공격(로그인·인증우회·포트스캔·부하)은 수행하지 않습니다."
        : "수동(passive) 점검만 수행 — SSL·보안헤더·공개정책만 확인. 민감파일/취약점 능동 점검은 소유권 인증 후 가능합니다. 경쟁사·외부 사이트는 공개 정보만 분석합니다.",
  };

  if (!mainHeaders && ssl.error) result.error = `사이트 응답을 가져오지 못했습니다: ${ssl.error}`;

  return NextResponse.json(result);
}
