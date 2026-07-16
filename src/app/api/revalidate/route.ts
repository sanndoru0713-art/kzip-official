/**
 * 즉시 반영 엔드포인트 — Notion 수정 후 5분(ISR 주기)을 기다리지 않고
 * 캐시를 비워 즉시 반영할 때 사용합니다.
 *
 * 사용법: GET/POST /api/revalidate?secret=REVALIDATE_SECRET값
 * REVALIDATE_SECRET 환경변수가 설정된 경우에만 동작합니다 (남용 방지).
 */
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function handle(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "revalidate_not_configured", hint: "REVALIDATE_SECRET 환경변수를 설정하세요." },
      { status: 503 },
    );
  }
  const provided = new URL(request.url).searchParams.get("secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "invalid_secret" }, { status: 401 });
  }

  // Notion 데이터 캐시 + 전체 페이지 캐시 무효화
  revalidateTag("notion-cms");
  revalidatePath("/", "layout");

  console.log("[notion-cms] 수동 재검증 실행 — 캐시를 비웠습니다.");
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
