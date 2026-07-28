/**
 * AI 생성 지원 엔드포인트 — Claude API (ANTHROPIC_API_KEY 필요).
 * 키가 없으면 "AI API 연결 필요"를 명확히 반환한다. 임의 결과 생성 금지.
 * 생성 결과는 초안이며, 사용자가 검토·복사·승인 후 직접 적용한다.
 */

import { NextRequest, NextResponse } from "next/server";
import { rateLimit, clientIp, sanitizeText } from "@/lib/server/security";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const PROMPTS: Record<string, string> = {
  title: "다음 페이지 정보를 바탕으로 SEO에 최적화된 title 태그 후보 3개를 작성하세요. 각 15~60자, 핵심 키워드 앞배치, 브랜드명 뒤배치. 한국어 페이지면 한국어로, 일본어 페이지면 일본어로.",
  "meta-description": "다음 페이지 정보를 바탕으로 meta description 후보 3개를 작성하세요. 각 70~160자, 핵심 답변을 앞 80자 안에, 행동 유도 포함.",
  h1: "다음 페이지 정보를 바탕으로 명확한 H1 후보 3개를 작성하세요. 페이지 주제를 하나의 문장으로 선언.",
  "h2-structure": "다음 페이지 정보를 바탕으로 AEO에 유리한 H2/H3 구조안을 작성하세요. 질문형 소제목을 우선 사용하고 계층을 들여쓰기로 표시.",
  faq: "다음 페이지 정보를 바탕으로 FAQ 5개(질문+2~4문장 답변)를 작성하세요. 실제 검색 질의 형태의 질문 사용. 의료 관련이면 과장·보장 표현 금지.",
  "faq-schema": "다음 페이지 정보를 바탕으로 FAQPage JSON-LD를 작성하세요. 실제 페이지에 실릴 FAQ 5개 포함, 유효한 JSON만 출력.",
  "json-ld": "다음 페이지 정보에 맞는 JSON-LD 구조화데이터를 작성하세요. 사이트 유형에 맞는 @type 선택(병원: MedicalOrganization/Physician, 관광: TouristAttraction/Place), 필수 속성 포함, 유효한 JSON만 출력.",
  "image-alt": "다음 이미지 파일명·페이지 맥락을 바탕으로 각 이미지의 ALT 텍스트를 작성하세요. 키워드+내용 조합, 중복 금지, 의료 이미지는 과장 표현 금지, 일본어 페이지는 일본어로.",
  "internal-links": "다음 사이트 페이지 목록을 바탕으로 내부 링크 추천안을 작성하세요. 어떤 페이지에서 어떤 페이지로, 어떤 앵커텍스트로 연결할지 표로.",
  "content-brief": "다음 페이지 정보를 바탕으로 콘텐츠 보강안을 작성하세요: 추가할 섹션, 직접 답변 문장 초안, 필요한 데이터·근거, 목표 분량.",
  "japanese-seo": "다음 페이지 정보를 바탕으로 일본어 SEO 문구를 작성하세요: 일본어 title, meta description, H1, 주요 검색어 5개. 일본인이 실제 검색하는 표현 기준.",
  "english-seo": "다음 페이지 정보를 바탕으로 영어 SEO 문구를 작성하세요: 영어 title, meta description, H1, 주요 검색어 5개.",
};

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(`ai:${ip}`, 12, 60_000).ok)
    return NextResponse.json({ error: "요청이 많습니다. 잠시 후 다시 시도하세요." }, { status: 429 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        connected: false,
        error:
          "AI API 연결 필요 — 환경변수 ANTHROPIC_API_KEY를 설정하면 AI 수정안 생성 기능이 활성화됩니다. 생성 결과는 자동 적용되지 않으며 검토 후 복사해 사용합니다.",
      },
      { status: 501 },
    );
  }

  let body: { action?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const prompt = PROMPTS[body.action || ""];
  if (!prompt) return NextResponse.json({ error: "지원하지 않는 action" }, { status: 400 });

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: `${prompt}\n\n--- 페이지/사이트 정보 ---\n${sanitizeText(body.context, 8000)}`,
          },
        ],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: `AI API 오류: ${data?.error?.message || res.status}` }, { status: 502 });
    }
    const text = Array.isArray(data.content)
      ? data.content.map((c: { text?: string }) => c.text || "").join("\n")
      : "";
    return NextResponse.json({ connected: true, result: text });
  } catch {
    return NextResponse.json({ error: "AI API 호출 실패 — 네트워크를 확인하세요." }, { status: 502 });
  }
}
