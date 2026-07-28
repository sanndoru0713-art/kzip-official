/** 콘텐츠 품질 · AEO · 신뢰도 검사 항목 */

import type { CheckDefinition, CheckResult } from "../types";
import {
  bandScore,
  CheckSpec,
  detectBrand,
  EvalContext,
  findSchemaNodes,
  latestVisibleDate,
  measured,
  okPages,
  pct,
  ratioCheck,
  schemaTypesPresent,
  shortUrl,
  unmeasured,
  notConnected,
} from "./helpers";

const P100 = { good: 70, best: 90, unit: "%" };

export function make(
  def: Omit<CheckSpec, "evaluate">,
  ev: (def: CheckDefinition, ctx: EvalContext) => CheckResult,
): CheckSpec {
  return { ...def, evaluate: (ctx) => ({ ...ev(def, ctx), checkId: def.id }) };
}

/** 사이트 단위 존재형 검사: 발견 페이지 비율 + 최소 존재 보정 */
function presenceCheck(
  def: CheckDefinition,
  ctx: EvalContext,
  test: (p: ReturnType<typeof okPages>[number]) => boolean,
  sampleOf: (p: ReturnType<typeof okPages>[number]) => string[],
  foundLabel: string,
  noneEvidence: string,
): CheckResult {
  const pages = okPages(ctx.crawl);
  if (pages.length === 0) return unmeasured(def, "정상 페이지가 없습니다.");
  const found = pages.filter(test);
  if (found.length === 0) return measured(def, 0, "미발견", [noneEvidence], pages.map((p) => p.finalUrl));
  const share = pct(found.length, pages.length);
  // 존재(최소 75) + 확산도 보정: 표본의 절반 이상이면 최적 구간
  const score = Math.min(100, 75 + Math.round(share / 4));
  const samples = found.flatMap((p) => sampleOf(p).map((s) => `${shortUrl(p.finalUrl)} — "${s.slice(0, 70)}"`)).slice(0, 4);
  return measured(def, score, `${found.length}/${pages.length}페이지 ${foundLabel}`, [
    `크롤 표본 ${pages.length}페이지 중 ${found.length}페이지에서 발견 (${share}%)`,
    ...samples,
  ], pages.filter((p) => !test(p)).map((p) => p.finalUrl));
}

export const CONTENT_CHECKS: CheckSpec[] = [
  make(
    {
      id: "content-length",
      category: "content",
      label: "콘텐츠 분량",
      description: "페이지당 본문 텍스트 분량(태그 제거 기준)을 검사합니다.",
      why: "지나치게 짧은 페이지(thin content)는 질의를 충족하지 못해 순위·색인에서 불리합니다.",
      aeoImpact: "AI는 충분한 맥락이 있는 페이지에서 답변을 추출합니다. 300자 미만 페이지는 인용 근거로 쓰이기 어렵습니다.",
      thresholds: { ...P100, source: "Google 검색품질평가 가이드라인 — 페이지 목적 대비 충분한 메인 콘텐츠(MC)", sourceUrl: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content" },
      weight: 4,
      fix: {
        method: ["핵심 페이지 본문을 1,500자 이상으로 보강", "질문·답변, 상세정보, 근거 데이터 추가"],
        example: "관광지 페이지: 소개 + 가는 법 + 운영시간 + 요금 + 주변 코스 + FAQ 구성",
        difficulty: "medium",
        effort: "페이지당 2시간",
      },
      aiActions: ["content-brief"],
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(def, "정상 페이지가 없습니다.");
      const avg = pages.reduce((a, p) => a + p.textLength, 0) / pages.length;
      const score = Math.min(100, Math.round((avg / 2000) * 90));
      const thin = pages.filter((p) => p.textLength < 800);
      return measured(def, score, `평균 ${Math.round(avg).toLocaleString()}자`, [
        `표본 평균 본문 ${Math.round(avg).toLocaleString()}자 (양호 기준 ~1,500자, 최적 기준 2,000자 이상)`,
        ...thin.slice(0, 5).map((p) => `✗ ${shortUrl(p.finalUrl)} — ${p.textLength.toLocaleString()}자 (얇은 콘텐츠)`),
      ], thin.map((p) => p.finalUrl));
    },
  ),
  make(
    {
      id: "content-structure",
      category: "content",
      label: "본문 구조화 (표·목록)",
      description: "본문에 표·목록 등 구조화된 요소가 있는지 검사합니다.",
      why: "구조화된 정보는 가독성과 체류시간을 높이고 리치 스니펫 채택률을 올립니다.",
      aeoImpact: "표와 목록은 AI가 가장 즐겨 추출하는 형식입니다. 비교·요금·일정 정보는 표로 제공하면 인용 확률이 크게 오릅니다.",
      thresholds: { ...P100, source: "Google — 구조화된 콘텐츠와 추천 스니펫 관행", sourceUrl: "https://developers.google.com/search/docs/appearance/featured-snippets" },
      weight: 3,
      fix: {
        method: ["요금·시간·비교 정보를 표로 변환", "절차·목록형 정보는 ul/ol 사용"],
        example: "<table><tr><th>시술</th><th>비용</th><th>소요시간</th></tr>…</table>",
        difficulty: "low",
        effort: "페이지당 30분",
      },
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => p.hasTable || p.listCount >= 2, "표 또는 목록 2개 이상", (p) => `표 ${p.hasTable ? "있음" : "없음"}, 목록 ${p.listCount}개`),
  ),
  make(
    {
      id: "content-duplication",
      category: "content",
      label: "콘텐츠 중복",
      description: "페이지 간 title+description+H1 지문 중복으로 실질 중복 페이지를 검사합니다.",
      why: "중복 콘텐츠는 랭킹 신호를 분산시키고 크롤 예산을 낭비합니다.",
      aeoImpact: "동일 내용의 반복은 사이트 전체의 독창성 평가를 떨어뜨립니다.",
      thresholds: { ...P100, source: "Google — 중복 콘텐츠 통합 가이드", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls" },
      weight: 3,
      fix: {
        method: ["중복 페이지 통합 후 301", "불가피한 중복은 canonical로 대표 URL 지정"],
        example: "print 버전·파라미터 변형 → 원본으로 canonical",
        difficulty: "medium",
        effort: "1일",
      },
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length < 2) return unmeasured(def, "비교할 페이지가 2개 미만입니다.");
      const fp = new Map<string, string[]>();
      for (const p of pages) {
        const key = `${p.title}|${p.metaDescription}|${p.h1.join(",")}`;
        fp.set(key, [...(fp.get(key) || []), p.finalUrl]);
      }
      const dups = [...fp.values()].filter((v) => v.length > 1);
      const dupCount = dups.reduce((a, v) => a + v.length - 1, 0);
      const score = pct(pages.length - dupCount, pages.length);
      return measured(def, score, dupCount ? `중복 의심 ${dupCount}건` : "중복 없음", [
        `${pages.length}페이지 지문 비교 — 중복 그룹 ${dups.length}개`,
        ...dups.slice(0, 3).map((v) => `동일 지문: ${v.map((u) => shortUrl(u)).join(" = ")}`),
      ], dups.flat());
    },
  ),
  make(
    {
      id: "cta-presence",
      category: "content",
      label: "전환 요소 (CTA)",
      description: "예약·문의·전화 등 전환 유도 요소가 있는지 검사합니다.",
      why: "유입이 있어도 전환 동선이 없으면 성과로 이어지지 않습니다.",
      aeoImpact: "AI 검색은 '예약 방법'을 자주 질문받습니다. 명확한 예약 동선은 답변 인용에 유리합니다.",
      thresholds: { ...P100, source: "운영 기준 — 상업 페이지 전환 요소 필수 (GA4 전환 추적 전제)", sourceUrl: undefined },
      weight: 2,
      fix: {
        method: ["주요 페이지에 예약/문의 CTA 배치", "전화번호는 tel: 링크로", "다국어 페이지에는 해당 언어 CTA"],
        example: '<a href="tel:+82-2-000-0000">전화 예약</a> <a href="/ja/contact">日本語で予約</a>',
        difficulty: "low",
        effort: "1일",
      },
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => p.patterns.reservation.matched || p.patterns.phone.matched, "CTA 존재", () => "예약·문의·전화 요소 미발견"),
  ),

  /* ───────────── AEO ───────────── */
  make(
    {
      id: "direct-answer",
      category: "aeo",
      label: "상단 직접 답변",
      description: "페이지 상단 첫 단락이 주제에 대한 직접적인 답을 40~300자로 제시하는지 검사합니다.",
      why: "추천 스니펫과 AI Overviews는 상단의 요약 답변을 우선 추출합니다.",
      aeoImpact: "직접 답변 구조는 AEO의 핵심입니다. '결론 먼저' 구조가 인용 확률을 결정합니다.",
      thresholds: { ...P100, source: "Google — 추천 스니펫 작동 방식 (간결한 답변 추출)", sourceUrl: "https://developers.google.com/search/docs/appearance/featured-snippets" },
      weight: 5,
      fix: {
        method: ["H1 바로 아래에 핵심 질문에 대한 2~3문장 요약 답변 배치", "세부 근거는 그 아래에 전개"],
        example: "Q: 부산 여행 며칠이 적당한가요? → 첫 단락: '부산 여행은 2박 3일이 가장 적당합니다. 해운대·광안리·감천문화마을을 …'",
        difficulty: "medium",
        effort: "페이지당 30분",
      },
      aiActions: ["content-brief"],
    },
    (def, ctx) =>
      ratioCheck(
        def,
        ctx,
        (p) => !!p.firstParagraph && p.firstParagraph.length >= 40 && p.firstParagraph.length <= 400,
        "직접 답변형 첫 단락",
        (p) => (p.firstParagraph ? `첫 단락 ${p.firstParagraph.length}자` : "본문 단락 없음"),
      ),
  ),
  make(
    {
      id: "question-headings",
      category: "aeo",
      label: "질문형 제목",
      description: "H2/H3에 질문형 제목이 사용되는지 검사합니다.",
      why: "질문형 제목은 검색 질의와 직접 매칭되어 PAA(다른 사람들이 묻는 질문) 노출에 유리합니다.",
      aeoImpact: "AI는 질문-답변 쌍을 우선 학습·인용합니다. 질문형 H2는 답변 추출 단위가 됩니다.",
      thresholds: { ...P100, source: "AEO 실무 표준 — 질의 매칭형 소제목 (Google PAA 노출 관행 기반)", sourceUrl: "https://developers.google.com/search/docs/appearance/featured-snippets" },
      weight: 4,
      fix: {
        method: ["핵심 소제목을 실제 검색 질문 형태로 변경", "일본어 페이지는 「〜とは?」「〜の方法は?」 형태 활용"],
        example: "'시술 안내' → '보톡스 시술 시간은 얼마나 걸리나요?'",
        difficulty: "low",
        effort: "페이지당 20분",
      },
      aiActions: ["h2-structure", "faq"],
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => p.patterns.questionHeadings.count >= 1, "질문형 제목 1개 이상", (p) => `질문형 제목 0개 (H2 ${p.h2.length}개 중)`),
  ),
  make(
    {
      id: "faq-presence",
      category: "aeo",
      label: "FAQ 콘텐츠",
      description: "FAQ(자주 묻는 질문) 섹션 존재 여부를 검사합니다.",
      why: "FAQ는 롱테일 질의를 흡수하고 PAA 노출 기회를 만듭니다.",
      aeoImpact: "Q&A 형식은 생성형 검색이 가장 쉽게 인용하는 구조입니다.",
      thresholds: { ...P100, source: "AEO 실무 표준 — 핵심 페이지 FAQ 배치", sourceUrl: "https://developers.google.com/search/docs/appearance/structured-data/faqpage" },
      weight: 4,
      fix: {
        method: ["주요 페이지 하단에 실제 고객 질문 기반 FAQ 5개 이상 배치", "각 답변은 2~4문장으로 간결하게"],
        example: "Q. 예약 없이 방문해도 되나요? A. 가능하지만 대기가 발생할 수 있어 온라인 예약을 권장합니다.",
        difficulty: "low",
        effort: "페이지당 1시간",
      },
      aiActions: ["faq", "faq-schema"],
    },
    (def, ctx) =>
      presenceCheck(def, ctx, (p) => p.patterns.faqSection.matched, (p) => p.patterns.faqSection.samples, "FAQ 발견", "크롤 표본에서 FAQ 섹션(자주 묻는 질문/FAQ/Q&A)을 찾지 못했습니다."),
  ),
  make(
    {
      id: "step-guides",
      category: "aeo",
      label: "단계별 설명",
      description: "절차·순서형 콘텐츠(1단계, STEP, 手順 등)가 있는지 검사합니다.",
      why: "How-to 질의에 대한 단계별 설명은 리치 결과와 스니펫 채택률을 높입니다.",
      aeoImpact: "AI는 단계 구조를 그대로 목록 형태로 인용합니다.",
      thresholds: { ...P100, source: "Google — HowTo 콘텐츠 관행 (단계 구조화)", sourceUrl: "https://developers.google.com/search/docs/appearance/structured-data" },
      weight: 2,
      fix: {
        method: ["예약 방법·이용 절차·가는 법을 번호 목록으로 구조화"],
        example: "1. 온라인 예약 → 2. 방문 접수 → 3. 상담 → 4. 시술",
        difficulty: "low",
        effort: "페이지당 30분",
      },
    },
    (def, ctx) =>
      presenceCheck(def, ctx, (p) => p.patterns.steps.matched || p.orderedListCount >= 1, (p) => p.patterns.steps.samples, "단계 구조 발견", "단계별 설명(1단계/STEP/번호 목록)을 찾지 못했습니다."),
  ),
  make(
    {
      id: "price-clarity",
      category: "aeo",
      label: "가격 정보 명확성",
      description: "가격·요금 정보가 본문에 명시되어 있는지 검사합니다.",
      why: "'비용/가격' 질의는 상업 검색의 핵심이며, 가격 없는 페이지는 해당 질의에서 배제됩니다.",
      aeoImpact: "AI는 명시적 숫자 가격을 우선 인용합니다. '상담 후 안내'만으로는 인용되지 않습니다.",
      thresholds: { ...P100, source: "운영 기준 — 상업 페이지 가격 명시 (의료광고 규정 내에서)", sourceUrl: undefined },
      weight: 3,
      fix: {
        method: ["대표 가격 또는 가격 범위 명시", "일본어 페이지는 円 병기 권장", "의료: 비급여 진료비 고지 규정 준수"],
        example: "보톡스(국산 50유닛) 5만원~ / ボトックス 5万ウォン〜(約5,500円)",
        difficulty: "low",
        effort: "페이지당 20분",
      },
    },
    (def, ctx) =>
      presenceCheck(def, ctx, (p) => p.patterns.price.matched, (p) => p.patterns.price.samples, "가격 표기", "가격·요금 표기를 찾지 못했습니다."),
  ),
  make(
    {
      id: "hours-clarity",
      category: "aeo",
      label: "운영시간 명확성",
      description: "영업·진료·운영시간이 본문에 명시되어 있는지 검사합니다.",
      why: "'영업시간' 질의는 로컬 검색의 최다 질의 유형입니다.",
      aeoImpact: "AI 로컬 답변의 필수 인용 요소입니다.",
      thresholds: { ...P100, source: "Google 비즈니스 프로필 관행 — 영업시간 명시", sourceUrl: undefined },
      weight: 3,
      fix: {
        method: ["운영시간을 표 형태로 명시 (요일별)", "휴무일·브레이크타임 포함"],
        example: "평일 10:00~19:00 / 토 10:00~15:00 / 일·공휴일 휴무",
        difficulty: "low",
        effort: "0.5시간",
      },
    },
    (def, ctx) =>
      presenceCheck(def, ctx, (p) => p.patterns.businessHours.matched, (p) => p.patterns.businessHours.samples, "운영시간 표기", "운영시간 표기를 찾지 못했습니다."),
  ),
  make(
    {
      id: "address-clarity",
      category: "aeo",
      label: "주소 명확성",
      description: "주소가 본문에 텍스트로 명시되어 있는지 검사합니다.",
      why: "이미지가 아닌 텍스트 주소는 로컬 검색 매칭의 기본입니다.",
      aeoImpact: "위치 질의('어디에 있나요')의 인용 필수 요소입니다.",
      thresholds: { ...P100, source: "로컬 SEO 표준 — NAP(상호·주소·전화) 텍스트 명시", sourceUrl: undefined },
      weight: 3,
      fix: {
        method: ["도로명 주소를 텍스트로 명시", "일본어 페이지에는 일본어 표기 병행"],
        example: "서울 강남구 테헤란로 000, 3층 (역삼동) / ソウル江南区…",
        difficulty: "low",
        effort: "0.5시간",
      },
    },
    (def, ctx) =>
      presenceCheck(def, ctx, (p) => p.patterns.address.matched, (p) => p.patterns.address.samples, "주소 표기", "텍스트 주소를 찾지 못했습니다."),
  ),
  make(
    {
      id: "transport-clarity",
      category: "aeo",
      label: "교통편 안내",
      description: "지하철·버스·도보 등 교통 안내가 있는지 검사합니다.",
      why: "'가는 법' 질의 대응 및 방문 전환에 직접 영향을 줍니다.",
      aeoImpact: "AI 여행·로컬 답변에서 교통 정보는 고빈도 인용 요소입니다.",
      thresholds: { ...P100, source: "관광·로컬 콘텐츠 실무 표준", sourceUrl: undefined },
      weight: 2,
      fix: {
        method: ["최寄역·출구·도보 시간 명시", "공항/주요 거점 기준 소요시간 추가"],
        example: "지하철 2호선 강남역 3번 출구 도보 2분 / 金浦空港から約40分",
        difficulty: "low",
        effort: "페이지당 20분",
      },
    },
    (def, ctx) =>
      presenceCheck(def, ctx, (p) => p.patterns.transport.matched, (p) => p.patterns.transport.samples, "교통편 표기", "교통편 안내를 찾지 못했습니다."),
  ),
  make(
    {
      id: "reservation-clarity",
      category: "aeo",
      label: "예약 방법 명확성",
      description: "예약·문의 방법이 명확히 안내되는지 검사합니다.",
      why: "전환 동선의 명확성은 검색 의도 충족도의 핵심 지표입니다.",
      aeoImpact: "'예약 방법' 질의에 대한 직접 답변 소스가 됩니다.",
      thresholds: { ...P100, source: "운영 기준 — 전환 페이지 예약 동선 필수", sourceUrl: undefined },
      weight: 2,
      fix: {
        method: ["예약 버튼·전화·카카오톡/LINE 등 채널별 안내", "외국어 예약 동선 별도 안내"],
        example: "온라인 예약 / 전화 02-000-0000 / LINE: @clinic (日本語OK)",
        difficulty: "low",
        effort: "0.5일",
      },
    },
    (def, ctx) =>
      presenceCheck(def, ctx, (p) => p.patterns.reservation.matched, (p) => p.patterns.reservation.samples, "예약 안내", "예약·문의 안내를 찾지 못했습니다."),
  ),
  make(
    {
      id: "related-questions",
      category: "aeo",
      label: "관련 질문 커버리지",
      description: "페이지당 질문형 소제목이 3개 이상인지 검사합니다 (관련 질문 확장).",
      why: "하나의 주제에 연관 질문들을 함께 다루면 토픽 커버리지가 높아져 상위 노출에 유리합니다.",
      aeoImpact: "PAA·후속 질문 체인에 계속 인용될 수 있는 구조를 만듭니다.",
      thresholds: { ...P100, source: "AEO 실무 표준 — 연관 질문 클러스터", sourceUrl: undefined },
      weight: 2,
      fix: {
        method: ["주제당 연관 질문 3~7개를 소제목으로 배치", "실제 검색어(자동완성·PAA) 기반 질문 선정"],
        example: "메인 질문 + '비용은?', '아픈가요?', '유지 기간은?', '주의사항은?'",
        difficulty: "medium",
        effort: "페이지당 1시간",
      },
      aiActions: ["faq", "h2-structure"],
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => p.patterns.questionHeadings.count >= 3, "관련 질문 3개 이상", (p) => `질문형 제목 ${p.patterns.questionHeadings.count}개`),
  ),
  make(
    {
      id: "entity-consistency",
      category: "aeo",
      label: "Entity 명칭 일관성",
      description: "브랜드·기관 명칭이 title 전반에 일관되게 사용되는지 검사합니다.",
      why: "명칭이 일관돼야 검색엔진이 브랜드 엔티티를 단일 개체로 인식합니다.",
      aeoImpact: "AI 지식그래프에서 엔티티 통합이 잘 될수록 브랜드 언급·인용이 정확해집니다.",
      thresholds: { ...P100, source: "Google — 지식 패널·엔티티 인식 관행", sourceUrl: undefined },
      weight: 3,
      fix: {
        method: ["og:site_name 지정", "title 접미사에 동일 브랜드명 일관 사용", "Organization schema의 name 통일"],
        example: "모든 페이지: '… | K:ZIP' + og:site_name='K:ZIP'",
        difficulty: "low",
        effort: "0.5일",
      },
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length < 2) return unmeasured(def, "비교할 페이지가 부족합니다.");
      const brand = detectBrand(ctx.crawl);
      if (!brand) return measured(def, 30, "브랜드 불명확", ["og:site_name 및 title 공통 접미사에서 일관된 브랜드명을 찾지 못했습니다."], pages.map((p) => p.finalUrl));
      const withBrand = pages.filter((p) => (p.title || "").includes(brand) || (p.ogTags["og:site_name"] || "") === brand);
      const score = pct(withBrand.length, pages.length);
      return measured(def, score, `"${brand}" ${score}%`, [
        `감지된 브랜드명: "${brand}"`,
        `${pages.length}페이지 중 ${withBrand.length}페이지 title/og:site_name에 브랜드 포함`,
      ], pages.filter((p) => !withBrand.includes(p)).map((p) => p.finalUrl));
    },
  ),
  make(
    {
      id: "citable-sentences",
      category: "aeo",
      label: "인용 용이 문장 구조",
      description: "첫 단락 문장이 간결한지(평균 100자 이내) 검사합니다.",
      why: "짧고 자기완결적인 문장은 스니펫으로 그대로 발췌되기 쉽습니다.",
      aeoImpact: "생성형 AI는 한 문장으로 완결되는 사실 진술을 우선 인용합니다.",
      thresholds: { ...P100, source: "추천 스니펫 발췌 관행 — 간결한 정의형 문장", sourceUrl: "https://developers.google.com/search/docs/appearance/featured-snippets" },
      weight: 2,
      fix: {
        method: ["핵심 문장을 60~100자 단문으로 재작성", "'~는 ~입니다' 정의형 문장 활용"],
        example: "'감천문화마을은 부산 사하구에 있는 계단식 마을로, 알록달록한 벽화 골목으로 유명합니다.'",
        difficulty: "low",
        effort: "페이지당 30분",
      },
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl).filter((p) => p.firstParagraph);
      if (pages.length === 0) return unmeasured(def, "본문 단락이 있는 페이지가 없습니다.");
      const pass = pages.filter((p) => {
        const sentences = p.firstParagraph!.split(/(?<=[.!?。！？])\s+|(?<=다\.)\s*/).filter((s) => s.length > 5);
        if (sentences.length === 0) return false;
        const avg = sentences.reduce((a, s) => a + s.length, 0) / sentences.length;
        return avg <= 110;
      });
      const score = pct(pass.length, pages.length);
      return measured(def, score, `${score}%`, [
        `첫 단락 문장 평균 길이 110자 이내 페이지 ${pass.length}/${pages.length}`,
      ], pages.filter((p) => !pass.includes(p)).map((p) => p.finalUrl));
    },
  ),
  make(
    {
      id: "answer-evidence",
      category: "aeo",
      label: "답변·근거 분리 구조",
      description: "직접 답변(상단 단락)과 근거(수치·출처)가 함께 있는지 검사합니다.",
      why: "결론과 근거가 분리된 문서는 사용자·검색엔진 모두 신뢰도 평가가 쉽습니다.",
      aeoImpact: "AI는 '답변 + 뒷받침 데이터' 구조를 가장 안전하게 인용합니다.",
      thresholds: { ...P100, source: "AEO 실무 표준 — Answer-first, Evidence-second 구조", sourceUrl: undefined },
      weight: 3,
      fix: {
        method: ["상단: 요약 답변 / 본문: 수치·출처·상세 근거 배치", "통계는 출처와 기준 시점 명시"],
        example: "답: 2박3일이 적당합니다. → 근거: 주요 명소 12곳 평균 이동시간 기준…",
        difficulty: "medium",
        effort: "페이지당 1시간",
      },
    },
    (def, ctx) =>
      ratioCheck(
        def,
        ctx,
        (p) => !!p.firstParagraph && p.firstParagraph.length >= 40 && (p.patterns.statistics.matched || p.patterns.externalCitations.matched),
        "답변+근거 구조",
        (p) => (!p.firstParagraph || p.firstParagraph.length < 40 ? "상단 답변 없음" : "수치·출처 근거 없음"),
      ),
  ),

  /* ───────────── 신뢰도·최신성 ───────────── */
  make(
    {
      id: "author-info",
      category: "trust",
      label: "작성자 정보",
      description: "작성자·감수자 표기 또는 Person schema가 있는지 검사합니다.",
      why: "E-E-A-T의 핵심 — 누가 썼는지 불명확한 콘텐츠는 YMYL(의료·금융) 영역에서 특히 불리합니다.",
      aeoImpact: "AI는 저자 명시 콘텐츠를 전문성 있는 출처로 우선 취급합니다.",
      thresholds: { ...P100, source: "Google 검색품질평가 가이드라인 — E-E-A-T", sourceUrl: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content" },
      weight: 4,
      fix: {
        method: ["글 하단 작성자·감수자 바이라인 추가", "의료 콘텐츠는 의료진 감수 표기", "Person schema 연결"],
        example: "작성: K:ZIP 편집팀 · 감수: ○○○ 피부과 전문의 (2026.07 업데이트)",
        difficulty: "low",
        effort: "페이지당 15분",
      },
    },
    (def, ctx) => {
      const persons = findSchemaNodes(ctx.crawl, ["Person"]);
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(def, "정상 페이지가 없습니다.");
      const withAuthor = pages.filter((p) => p.patterns.authorInfo.matched || persons.some((n) => n.page === p));
      const score = pct(withAuthor.length, pages.length);
      return measured(def, score, `${score}%`, [
        `${pages.length}페이지 중 작성자 표기/Person schema ${withAuthor.length}페이지`,
        ...(persons.length ? [`Person schema ${persons.length}건 발견`] : []),
      ], pages.filter((p) => !withAuthor.includes(p)).map((p) => p.finalUrl));
    },
  ),
  make(
    {
      id: "content-dates",
      category: "trust",
      label: "게시일·수정일 표기",
      description: "게시일/수정일이 본문 또는 schema에 표기되는지 검사합니다.",
      why: "날짜 없는 콘텐츠는 최신성 평가가 불가능해 시의성 질의에서 배제됩니다.",
      aeoImpact: "AI는 최신 확인일이 명시된 정보를 우선 인용합니다 (특히 가격·운영시간).",
      thresholds: { ...P100, source: "Google — 날짜 메타데이터 관행 (datePublished/dateModified)", sourceUrl: "https://developers.google.com/search/docs/appearance/publication-dates" },
      weight: 3,
      fix: {
        method: ["게시일·최종 수정일 표기", "Article schema datePublished/dateModified 추가", "정보 유효 시점 명시 ('2026년 7월 기준')"],
        example: "최종 업데이트: 2026.07.20 (요금 정보 2026년 7월 기준)",
        difficulty: "low",
        effort: "템플릿 수정 0.5일",
      },
    },
    (def, ctx) =>
      ratioCheck(
        def,
        ctx,
        (p) => p.patterns.visibleDates.matched || p.jsonLd.some((b) => /datePublished|dateModified/.test(b.raw)),
        "날짜 표기 존재",
        () => "게시일·수정일 표기 없음",
      ),
  ),
  make(
    {
      id: "freshness",
      category: "trust",
      label: "콘텐츠 최신성",
      description: "발견된 가장 최근 날짜(schema·본문)를 기준으로 최신성을 검사합니다.",
      why: "오래된 정보(요금·운영시간)는 사용자 신뢰와 순위를 함께 잃습니다.",
      aeoImpact: "AI는 오래된 콘텐츠의 인용을 회피하는 경향이 있습니다.",
      thresholds: { ...P100, source: "운영 기준 — 핵심 정보 6개월 이내 갱신 (여행·의료 정보 특성 반영)", sourceUrl: undefined },
      weight: 3,
      fix: {
        method: ["핵심 페이지 분기별 정보 갱신", "갱신 시 dateModified 업데이트"],
        example: "요금·운영시간 분기 점검 → '최종 확인: 2026.07' 표기",
        difficulty: "medium",
        effort: "분기당 1일",
      },
    },
    (def, ctx) => {
      const latest = latestVisibleDate(ctx.crawl);
      if (!latest) return unmeasured(def, "본문·schema에서 날짜를 찾지 못해 최신성을 측정할 수 없습니다. '게시일·수정일 표기' 항목을 먼저 개선하세요.");
      const days = Math.floor((Date.now() - latest.date.getTime()) / 86400000);
      const score = bandScore(days, 180, 365, 1095);
      return measured(def, score, `${days}일 전`, [
        `가장 최근 날짜: ${latest.date.toISOString().slice(0, 10)} (${days}일 경과)`,
        `근거: ${latest.source}`,
        "기준: 180일 이내 최적, 365일 이내 양호",
      ]);
    },
  ),
  make(
    {
      id: "external-sources",
      category: "trust",
      label: "공식 출처 인용",
      description: "공공기관·공식 기관 등 권위 있는 외부 출처 링크가 있는지 검사합니다.",
      why: "출처 명시는 정보 신뢰성의 기본이며 E-E-A-T 평가 요소입니다.",
      aeoImpact: "근거 출처가 있는 문장은 AI가 '검증 가능한 정보'로 우선 인용합니다.",
      thresholds: { ...P100, source: "Google 품질 가이드라인 — 신뢰할 수 있는 출처 인용", sourceUrl: undefined },
      weight: 2,
      fix: {
        method: ["통계·제도 정보에 공식 출처 링크 추가 (관광공사·정부·학회)", "출처명 + 발행연도 병기"],
        example: "출처: 한국관광공사 방한 관광객 통계 (2026)",
        difficulty: "low",
        effort: "페이지당 20분",
      },
    },
    (def, ctx) =>
      presenceCheck(def, ctx, (p) => p.patterns.externalCitations.matched, (p) => p.patterns.externalCitations.samples, "공식 출처 링크", "공공·공식 기관으로의 외부 출처 링크를 찾지 못했습니다."),
  ),
  make(
    {
      id: "contact-transparency",
      category: "trust",
      label: "연락처·소재 투명성",
      description: "전화번호·주소 등 실체 정보가 확인되는지 검사합니다.",
      why: "운영 주체가 확인되는 사이트는 신뢰도 평가에서 유리합니다 (YMYL 필수).",
      aeoImpact: "실체가 확인되는 조직의 콘텐츠가 AI 추천에서 우선됩니다.",
      thresholds: { ...P100, source: "Google 품질 가이드라인 — 사이트 운영 주체 정보", sourceUrl: undefined },
      weight: 3,
      fix: {
        method: ["푸터에 상호·주소·연락처 명시", "회사소개 페이지 운영"],
        example: "푸터: 상호 / 대표 / 주소 / 사업자번호 / 연락처",
        difficulty: "low",
        effort: "0.5일",
      },
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(def, "정상 페이지가 없습니다.");
      const hasPhone = pages.some((p) => p.patterns.phone.matched);
      const hasAddress = pages.some((p) => p.patterns.address.matched);
      const score = (hasPhone ? 50 : 0) + (hasAddress ? 50 : 0);
      return measured(def, score, [hasPhone && "전화", hasAddress && "주소"].filter(Boolean).join("·") || "미확인", [
        `전화번호 ${hasPhone ? "발견" : "미발견"}, 텍스트 주소 ${hasAddress ? "발견" : "미발견"} (크롤 표본 기준)`,
      ]);
    },
  ),
  make(
    {
      id: "external-mentions",
      category: "trust",
      label: "외부 사이트 언급 (백링크)",
      description: "다른 사이트에서의 언급·백링크 규모입니다.",
      why: "외부 언급은 권위(Authority) 평가의 핵심 신호입니다.",
      aeoImpact: "여러 출처에서 언급되는 엔티티는 AI 답변에 등장할 확률이 높습니다.",
      thresholds: { ...P100, source: "외부 백링크 API 연동 필요 (Search Console 링크 보고서 등)", sourceUrl: undefined },
      weight: 2,
      fix: {
        method: ["Search Console 연결 시 링크 보고서 기반 측정", "언론·제휴·디렉터리 등록으로 언급 확대"],
        example: "관광공사·지자체 관광 포털에 사이트 등록",
        difficulty: "high",
        effort: "지속 활동",
      },
    },
    (def) => notConnected(def, "외부 언급·백링크 데이터는 Search Console 또는 백링크 API 연결 후 측정됩니다."),
  ),
];

/** GEO 검사에서 재사용하는 공용 신호 */
export const contentSignals = { presenceCheck, schemaTypesPresent };
