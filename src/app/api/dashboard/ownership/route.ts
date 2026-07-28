/** 소유권 인증 검증 엔드포인트 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp, validatePublicUrl } from "@/lib/server/security";
import { verifyDns, verifyFile, verifyMeta } from "@/lib/security/ownership";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(`own:${ip}`, 15, 60_000).ok)
    return NextResponse.json({ error: "요청이 많습니다. 잠시 후 다시 시도하세요." }, { status: 429 });

  let body: { url?: string; token?: string; method?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const v = validatePublicUrl(body.url || "");
  if ("error" in v) return NextResponse.json({ error: v.error }, { status: 400 });
  const token = (body.token || "").trim();
  if (token.length < 8) return NextResponse.json({ error: "유효한 토큰이 필요합니다" }, { status: 400 });

  const origin = v.url.origin;
  const method = body.method || "auto";

  let verified = false;
  const results: Record<string, boolean> = {};
  if (method === "meta" || method === "auto") results.meta = verified = (await verifyMeta(origin, token)) || verified;
  if (method === "file" || method === "auto") results.file = (await verifyFile(origin, token)) || false, (verified = verified || results.file);
  if (method === "dns" || method === "auto") results.dns = (await verifyDns(v.url.hostname, token)) || false, (verified = verified || results.dns);

  return NextResponse.json({
    origin,
    verified,
    results,
    checkedAt: new Date().toISOString(),
    note: verified
      ? "소유권이 확인되었습니다. 확장 보안 점검(민감파일 노출 등)을 사용할 수 있습니다."
      : "인증에 실패했습니다. 토큰이 사이트에 적용되었는지 확인 후 다시 시도하세요. DNS는 전파에 시간이 걸릴 수 있습니다.",
  });
}
