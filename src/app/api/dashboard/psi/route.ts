/**
 * PageSpeed Insights 프록시 — 실제 Google API 결과만 반환.
 * 실패 시 오류를 그대로 전달한다 (임의 수치 생성 금지).
 */

import { NextRequest, NextResponse } from "next/server";
import type { PsiMetrics } from "@/lib/seo/types";
import { rateLimit, clientIp, validatePublicUrl } from "@/lib/server/security";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(`psi:${ip}`, 10, 60_000).ok)
    return NextResponse.json({ error: "요청이 많습니다. 잠시 후 다시 시도하세요." }, { status: 429 });

  let body: { url?: string; strategy?: "mobile" | "desktop"; key?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const v = validatePublicUrl((body.url || "").trim());
  if ("error" in v) return NextResponse.json({ error: v.error }, { status: 400 });
  const url = v.url.href;
  const strategy = body.strategy === "desktop" ? "desktop" : "mobile";
  const key = body.key || process.env.PSI_API_KEY || "";

  const params = new URLSearchParams({
    url,
    strategy,
    category: "performance",
  });
  params.append("category", "seo");
  params.append("category", "accessibility");
  if (key) params.set("key", key);

  let res: Response;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 55_000);
    res = await fetch(`${PSI_ENDPOINT}?${params}`, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
  } catch (e) {
    return NextResponse.json(
      { error: `PSI API 요청 실패: ${e instanceof Error && e.name === "AbortError" ? "시간 초과" : "네트워크 오류"}. API Key 설정 또는 네트워크 정책을 확인하세요.` },
      { status: 502 },
    );
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    const msg = detail?.error?.message || `HTTP ${res.status}`;
    return NextResponse.json(
      { error: `PSI API 오류: ${msg}${res.status === 429 ? " — 무료 쿼터 초과. 설정에서 API Key를 등록하세요." : ""}` },
      { status: 502 },
    );
  }

  const data = await res.json();
  const lh = data.lighthouseResult;
  const audits = lh?.audits || {};
  const cat = lh?.categories || {};
  const field = data.loadingExperience?.metrics;

  const toScore = (v: unknown): number | null =>
    typeof v === "number" ? Math.round(v * 100) : null;
  const num = (v: unknown): number | null => (typeof v === "number" ? v : null);

  const metrics: PsiMetrics = {
    fetchedAt: new Date().toISOString(),
    strategy,
    performanceScore: toScore(cat.performance?.score),
    seoScore: toScore(cat.seo?.score),
    accessibilityScore: toScore(cat.accessibility?.score),
    fieldData: field
      ? {
          lcpMs: num(field.LARGEST_CONTENTFUL_PAINT_MS?.percentile),
          inpMs: num(field.INTERACTION_TO_NEXT_PAINT?.percentile),
          cls: field.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile != null ? field.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100 : null,
          overallCategory: data.loadingExperience?.overall_category || null,
        }
      : null,
    labData: lh
      ? {
          lcpMs: num(audits["largest-contentful-paint"]?.numericValue),
          cls: num(audits["cumulative-layout-shift"]?.numericValue),
          tbtMs: num(audits["total-blocking-time"]?.numericValue),
          fcpMs: num(audits["first-contentful-paint"]?.numericValue),
          speedIndexMs: num(audits["speed-index"]?.numericValue),
        }
      : null,
  };

  return NextResponse.json(metrics);
}
