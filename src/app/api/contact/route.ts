/**
 * 문의 폼 → Notion CRM 저장 API.
 *
 * - API 키와 Database ID는 서버 환경변수로만 사용됩니다 (클라이언트 미노출).
 * - Notion 미설정 시 503을 반환하고, 클라이언트는 메일 작성 폴백으로 전환합니다.
 * - 저장 실패 시 실제 실패로 응답합니다 (성공 위장 금지).
 */
import { NextResponse } from "next/server";
import { createPage, isNotionConfigured, notionEnv } from "@/lib/notion/client";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 20_000;
const FIELD_LIMITS: Record<string, number> = {
  company: 100,
  name: 50,
  email: 100,
  phone: 30,
  type: 30,
  schedule: 200,
  budget: 200,
  message: 2000,
};

const INQUIRY_TYPES = new Set([
  "프로젝트 문의",
  "공공 프로젝트 협업",
  "일본 마케팅",
  "글로벌 제휴",
  "콘텐츠 제작",
  "기타",
]);

// 중복 제출 방지 (베스트 에포트 — 서버리스 다중 인스턴스에서는 인스턴스별로 동작)
const recentSubmissions = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 60_000;

function isDuplicate(key: string): boolean {
  const now = Date.now();
  // 오래된 항목 정리
  for (const [k, t] of recentSubmissions) {
    if (now - t > DUPLICATE_WINDOW_MS) recentSubmissions.delete(k);
  }
  if (recentSubmissions.has(key)) return true;
  recentSubmissions.set(key, now);
  return false;
}

function sanitize(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, limit);
}

function generateReceiptId(): string {
  const now = new Date();
  const ymd = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KZ-${ymd}-${rand}`;
}

const richText = (content: string) => ({
  rich_text: content ? [{ text: { content } }] : [],
});

export async function POST(request: Request) {
  try {
    // 요청 본문 크기 제한
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    // honeypot — 봇이면 저장하지 않고 성공처럼 응답 (봇에게 힌트를 주지 않음)
    if (typeof body.website === "string" && body.website.length > 0) {
      return NextResponse.json({ ok: true, receiptId: generateReceiptId() });
    }

    // 서버 측 입력값 정리
    const company = sanitize(body.company, FIELD_LIMITS.company);
    const name = sanitize(body.name, FIELD_LIMITS.name);
    const email = sanitize(body.email, FIELD_LIMITS.email);
    const phone = sanitize(body.phone, FIELD_LIMITS.phone);
    const type = sanitize(body.type, FIELD_LIMITS.type);
    const schedule = sanitize(body.schedule, FIELD_LIMITS.schedule);
    const budget = sanitize(body.budget, FIELD_LIMITS.budget);
    const message = sanitize(body.message, FIELD_LIMITS.message);
    const consent = body.consent === true;

    // 필수값·형식 검증
    if (!company || !name || !email || !type || !message) {
      return NextResponse.json({ error: "missing_required" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }
    if (phone && !/^[\d\s\-+().]{7,30}$/.test(phone)) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }
    if (!INQUIRY_TYPES.has(type)) {
      return NextResponse.json({ error: "invalid_type" }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: "consent_required" }, { status: 400 });
    }

    // 중복 제출 방지 (동일 이메일+내용 60초 이내 재제출 차단)
    if (isDuplicate(`${email}|${message.slice(0, 200)}`)) {
      return NextResponse.json({ error: "duplicate_submission" }, { status: 429 });
    }

    // Notion CRM 저장
    const crmDb = notionEnv.crmDb();
    if (!isNotionConfigured(crmDb)) {
      console.error("[contact] NOTION_API_KEY 또는 NOTION_CRM_DATABASE_ID가 설정되지 않았습니다.");
      return NextResponse.json({ error: "not_configured" }, { status: 503 });
    }

    const receiptId = generateReceiptId();
    await createPage(crmDb, {
      문의명: { title: [{ text: { content: `[${company}] ${name} 문의` } }] },
      접수번호: richText(receiptId),
      회사명: richText(company),
      담당자명: richText(name),
      이메일: { email },
      ...(phone && { 연락처: { phone_number: phone } }),
      "문의 유형": { select: { name: type } },
      "예상 예산": richText(budget),
      "예상 일정": richText(schedule),
      "문의 내용": richText(message),
      유입경로: { select: { name: "홈페이지" } },
      상태: { select: { name: "신규 문의" } },
      우선순위: { select: { name: "보통" } },
      "개인정보 동의 여부": { checkbox: true },
    });

    return NextResponse.json({ ok: true, receiptId });
  } catch (error) {
    console.error("[contact] Notion CRM 저장 실패:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }
}
