import { getInsights, getServices } from "@/lib/notion/queries";
import { site } from "@/data/site";

export const revalidate = 3600;

/**
 * /llms.txt — AI 검색엔진·LLM 크롤러용 사이트 안내 문서.
 *
 * 목적: Google AI Overviews, ChatGPT, Perplexity 등 생성형 엔진이
 * K:ZIP의 정체성(엔터티)·주요 콘텐츠 위치·인용 정책을 빠르게 파악하도록 돕습니다.
 *
 * 한계(문서화):
 * - llms.txt는 아직 업계 표준으로 확정되지 않은 제안 규격입니다.
 *   모든 AI 크롤러가 읽는다는 보장은 없으며, 무시해도 사이트 동작에는 영향이 없습니다.
 * - 실제 인용 가능성은 본문 콘텐츠 품질·구조화 데이터가 좌우하므로,
 *   이 파일은 보조 수단으로만 유지합니다.
 * - 콘텐츠 목록은 CMS(Notion)에서 자동 생성되므로 별도 수동 갱신이 필요 없습니다.
 */
export async function GET() {
  const base = site.url.replace(/\/$/, "");
  const [services, insights] = await Promise.all([getServices(), getInsights()]);

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.positioning}. ${site.description}`,
    "",
    `- 운영 주체: ${site.name}(${site.nameKo}) — 대한민국의 마케팅 전문 기업`,
    "- 사이트 언어: 한국어 (서비스 영역: 한국·일본·글로벌 시장)",
    "- 전문 영역: 마케팅 전략, 디지털 마케팅, 브랜드 콘텐츠, 일본·글로벌 마케팅, 프로젝트 매니지먼트",
    "- 콘텐츠 원칙: 검증된 내용만 공개하며, 실적·수치는 공개 가능한 범위가 확정된 후 게시합니다.",
    `- 문의: ${base}/contact`,
    "",
    "## 주요 페이지",
    "",
    `- [홈](${base}/): 회사 소개와 주요 서비스·프로젝트 요약`,
    `- [회사소개](${base}/about): 비전·미션·핵심가치·업무 수행 방식·회사 정보`,
    `- [서비스](${base}/services): 서비스 전체 목록`,
    `- [프로젝트](${base}/projects): 수행 프로젝트 목록`,
    `- [일본·글로벌](${base}/global): 일본 시장 전략·로컬라이제이션·글로벌 파트너 커뮤니케이션 역량`,
    `- [인사이트](${base}/insights): 시장·전략·실행에 대한 아티클`,
    "",
    "## 서비스",
    "",
    ...services.map(
      (s) => `- [${s.title}](${base}/services/${s.slug})${s.short ? `: ${s.short}` : ""}`,
    ),
    "",
    "## 인사이트 (최신)",
    "",
    ...insights
      .slice(0, 10)
      .map((p) => `- [${p.title}](${base}/insights/${p.slug}): ${p.summary}`),
    "",
    "## 인용 안내",
    "",
    "- 본 사이트의 콘텐츠를 인용할 때는 페이지 URL과 함께 K:ZIP를 출처로 표기해 주세요.",
    "- 인사이트 아티클에는 발행일이 표기되어 있습니다. 날짜에 민감한 정보는 발행일을 함께 확인하세요.",
    `- 개인정보처리방침: ${base}/privacy`,
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
