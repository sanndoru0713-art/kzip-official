/**
 * 사이트 소유권 인증 — 실제 검증 로직.
 *  - meta: <meta name="kzip-site-verification" content="TOKEN">
 *  - file: /kzip-verification-<token>.txt 에 토큰 포함
 *  - dns : TXT 레코드에 "kzip-site-verification=TOKEN" (DNS-over-HTTPS 조회)
 * gsc/manual 은 별도 연동 후 처리 (미연동 시 false).
 */

const UA = "KZIP-Ownership-Verify/1.0";

async function fetchText(url: string, ms = 8000): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": UA }, cache: "no-store", redirect: "follow" });
    if (r.status !== 200) return null;
    return (await r.text()).slice(0, 500_000);
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function verifyMeta(origin: string, token: string): Promise<boolean> {
  const html = await fetchText(origin);
  if (!html) return false;
  const re = new RegExp(
    `<meta[^>]+name\\s*=\\s*["']kzip-site-verification["'][^>]+content\\s*=\\s*["']${escapeRe(token)}["']`,
    "i",
  );
  const reAlt = new RegExp(
    `<meta[^>]+content\\s*=\\s*["']${escapeRe(token)}["'][^>]+name\\s*=\\s*["']kzip-site-verification["']`,
    "i",
  );
  return re.test(html) || reAlt.test(html);
}

export async function verifyFile(origin: string, token: string): Promise<boolean> {
  const body = await fetchText(`${origin}/kzip-verification-${token}.txt`);
  if (body && body.includes(token)) return true;
  const alt = await fetchText(`${origin}/.well-known/kzip-verification.txt`);
  return !!alt && alt.includes(token);
}

export async function verifyDns(hostname: string, token: string): Promise<boolean> {
  // DNS-over-HTTPS (Google) 로 TXT 조회
  try {
    const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=TXT`, {
      headers: { Accept: "application/dns-json" },
      cache: "no-store",
    });
    if (!r.ok) return false;
    const data = await r.json();
    const answers: { data?: string }[] = data.Answer || [];
    const needle = `kzip-site-verification=${token}`;
    return answers.some((a) => (a.data || "").replace(/"/g, "").includes(needle));
  } catch {
    return false;
  }
}

/** 통합 검증 — 토큰이 어느 방식으로든 확인되면 true (서버 보안 API에서 사용) */
export async function verifyOwnershipToken(origin: string, token: string): Promise<boolean> {
  if (!token || token.length < 8) return false;
  const hostname = new URL(origin).hostname;
  const [meta, file, dns] = await Promise.all([
    verifyMeta(origin, token).catch(() => false),
    verifyFile(origin, token).catch(() => false),
    verifyDns(hostname, token).catch(() => false),
  ]);
  return meta || file || dns;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 결정적 토큰 생성 (사이트별 안정적) — 서버 시크릿과 결합 권장 */
export function ownershipToken(siteId: string, origin: string): string {
  const seed = `${siteId}:${origin}:${process.env.OWNERSHIP_SALT || "kzip-local"}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return `kzip-${(h >>> 0).toString(36)}-${siteId.slice(0, 8)}`;
}
