/** GEO(생성형 검색)·구조화데이터·모바일/속도 검사 항목 */

import type { CheckDefinition, CheckResult, CrawlResult } from "../types";
import {
  bandScore,
  CheckSpec,
  findSchemaNodes,
  measured,
  notConnected,
  okPages,
  pct,
  ratioCheck,
  schemaTypesPresent,
  shortUrl,
  unmeasured,
} from "./helpers";
import { make } from "./content";

const P100 = { good: 70, best: 90, unit: "%" };

/* ───────── Schema 필수/권장 속성 정의 (schema.org + Google 리치결과 문서 기준) ───────── */

export const SCHEMA_RULES: Record<string, { required: string[]; recommended: string[] }> = {
  Organization: { required: ["name"], recommended: ["url", "logo", "sameAs", "contactPoint"] },
  WebSite: { required: ["name", "url"], recommended: ["potentialAction"] },
  WebPage: { required: ["name"], recommended: ["description", "url"] },
  BreadcrumbList: { required: ["itemListElement"], recommended: [] },
  Article: { required: ["headline"], recommended: ["image", "datePublished", "dateModified", "author"] },
  NewsArticle: { required: ["headline"], recommended: ["image", "datePublished", "author"] },
  BlogPosting: { required: ["headline"], recommended: ["image", "datePublished", "author"] },
  FAQPage: { required: ["mainEntity"], recommended: [] },
  LocalBusiness: { required: ["name", "address"], recommended: ["telephone", "openingHours", "geo", "priceRange"] },
  MedicalOrganization: { required: ["name", "address"], recommended: ["telephone", "medicalSpecialty", "url"] },
  Physician: { required: ["name"], recommended: ["medicalSpecialty", "worksFor", "image"] },
  TouristAttraction: { required: ["name"], recommended: ["address", "geo", "openingHours", "image", "description"] },
  TouristDestination: { required: ["name"], recommended: ["includesAttraction", "description"] },
  Place: { required: ["name"], recommended: ["address", "geo"] },
  Restaurant: { required: ["name", "address"], recommended: ["servesCuisine", "openingHours", "telephone", "priceRange"] },
  Event: { required: ["name", "startDate", "location"], recommended: ["endDate", "image", "offers", "description"] },
  ItemList: { required: ["itemListElement"], recommended: [] },
  Product: { required: ["name"], recommended: ["image", "description", "offers", "aggregateRating"] },
  Offer: { required: ["price", "priceCurrency"], recommended: ["availability"] },
  Person: { required: ["name"], recommended: ["jobTitle", "sameAs", "image"] },
};

export interface SchemaAudit {
  type: string;
  page: string;
  status: "ok" | "warning" | "error";
  missingRequired: string[];
  missingRecommended: string[];
  note: string;
}

export function auditSchemas(crawl: CrawlResult): { audits: SchemaAudit[]; syntaxErrors: { page: string; error: string }[] } {
  const audits: SchemaAudit[] = [];
  const syntaxErrors: { page: string; error: string }[] = [];
  for (const page of okPages(crawl)) {
    for (const block of page.jsonLd) {
      if (block.parseError) {
        syntaxErrors.push({ page: page.finalUrl, error: block.parseError });
      }
    }
  }
  const nodes = findSchemaNodes(crawl, Object.keys(SCHEMA_RULES));
  for (const { page, node, type } of nodes) {
    const rules = SCHEMA_RULES[type] || SCHEMA_RULES[Object.keys(SCHEMA_RULES).find((k) => k.toLowerCase() === type.toLowerCase()) || ""];
    if (!rules) continue;
    const missingRequired = rules.required.filter((k) => node[k] === undefined || node[k] === null || node[k] === "");
    const missingRecommended = rules.recommended.filter((k) => node[k] === undefined || node[k] === null || node[k] === "");
    // 콘텐츠 일치 간단 검증
    let mismatch = "";
    if (type === "FAQPage" && !page.patterns.faqSection.matched && !page.patterns.questionHeadings.matched) {
      mismatch = "FAQPage schema가 있으나 본문에서 FAQ 콘텐츠가 확인되지 않음";
    }
    const name = node["name"];
    if (typeof name === "string" && page.title && !page.title.includes(name.slice(0, 8)) && ["WebPage", "Article"].includes(type)) {
      // 참고 수준 — 오류로 처리하지 않음
    }
    const status: SchemaAudit["status"] = missingRequired.length > 0 || mismatch ? "error" : missingRecommended.length > 0 ? "warning" : "ok";
    audits.push({
      type,
      page: page.finalUrl,
      status,
      missingRequired,
      missingRecommended,
      note: mismatch || (missingRequired.length ? `필수 속성 누락: ${missingRequired.join(", ")}` : missingRecommended.length ? `권장 속성 누락: ${missingRecommended.join(", ")}` : "정상"),
    });
  }
  return { audits, syntaxErrors };
}

/* ───────── GEO 검사 ───────── */

export const GEO_CHECKS: CheckSpec[] = [
  make(
    {
      id: "brand-entity",
      category: "geo",
      label: "브랜드 Entity 명확성",
      description: "Organization/WebSite schema와 og:site_name으로 브랜드 엔티티가 선언되는지 검사합니다.",
      why: "브랜드가 기계가 읽을 수 있는 형태로 선언돼야 지식그래프에 등록됩니다.",
      aeoImpact: "AI가 '이 사이트는 누구인가'를 확정할 수 있어야 브랜드명으로 인용·추천됩니다.",
      thresholds: { ...P100, source: "schema.org Organization + Google 지식패널 관행", sourceUrl: "https://schema.org/Organization" },
      weight: 4,
      fix: {
        method: ["전 페이지에 Organization schema 적용", "og:site_name 지정", "로고·sameAs(SNS·공식 채널) 연결"],
        example: '{"@type":"Organization","name":"K:ZIP","url":"…","logo":"…","sameAs":["https://instagram.com/…"]}',
        difficulty: "low",
        effort: "0.5일",
      },
      aiActions: ["json-ld"],
    },
    (def, ctx) => {
      const orgs = findSchemaNodes(ctx.crawl, ["Organization", "LocalBusiness", "MedicalOrganization"]);
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(def, "정상 페이지가 없습니다.");
      const withSiteName = pages.filter((p) => p.ogTags["og:site_name"]);
      const score = Math.round(pct(orgs.length > 0 ? 1 : 0, 1) * 0.6 + pct(withSiteName.length, pages.length) * 0.4);
      return measured(def, score, orgs.length ? "선언됨" : "미선언", [
        orgs.length ? `Organization 계열 schema ${orgs.length}건 발견 (${[...new Set(orgs.map((o) => o.type))].join(", ")})` : "Organization schema 미발견",
        `og:site_name 적용 ${withSiteName.length}/${pages.length}페이지`,
      ], orgs.length ? [] : pages.slice(0, 5).map((p) => p.finalUrl));
    },
  ),
  make(
    {
      id: "sameas-links",
      category: "geo",
      label: "sameAs 외부 연결",
      description: "Organization schema의 sameAs로 공식 채널이 연결되는지 검사합니다.",
      why: "sameAs는 동일 주체의 여러 채널을 하나의 엔티티로 묶는 표준 방법입니다.",
      aeoImpact: "AI가 SNS·지도·위키 정보를 교차 검증해 브랜드 신뢰도를 높입니다.",
      thresholds: { ...P100, source: "schema.org sameAs 속성", sourceUrl: "https://schema.org/sameAs" },
      weight: 2,
      fix: {
        method: ["Organization schema에 sameAs 배열 추가 (인스타그램·유튜브·지도 프로필 등)"],
        example: '"sameAs":["https://www.instagram.com/…","https://maps.google.com/…"]',
        difficulty: "low",
        effort: "1시간",
      },
      aiActions: ["json-ld"],
    },
    (def, ctx) => {
      const orgs = findSchemaNodes(ctx.crawl, ["Organization", "LocalBusiness", "MedicalOrganization"]);
      if (orgs.length === 0) return measured(def, 0, "Organization 없음", ["Organization schema가 없어 sameAs도 없습니다."], []);
      const withSameAs = orgs.filter((o) => Array.isArray(o.node["sameAs"]) && (o.node["sameAs"] as unknown[]).length > 0);
      const count = withSameAs.length ? (withSameAs[0].node["sameAs"] as unknown[]).length : 0;
      return measured(def, withSameAs.length ? Math.min(100, 70 + count * 10) : 0, withSameAs.length ? `${count}개 연결` : "없음", [
        withSameAs.length ? `sameAs ${count}개 채널 연결` : "Organization schema에 sameAs 속성이 없습니다.",
      ]);
    },
  ),
  make(
    {
      id: "statistics-evidence",
      category: "geo",
      label: "통계·수치 근거",
      description: "본문에 수치·통계 표현이 사용되는지 검사합니다.",
      why: "구체적 수치가 있는 콘텐츠는 정보성 평가와 체류시간에서 유리합니다.",
      aeoImpact: "생성형 AI는 구체적 수치가 포함된 문장을 근거로 인용하는 빈도가 높습니다.",
      thresholds: { ...P100, source: "GEO 연구 관행 — 통계 포함 콘텐츠의 생성형 검색 가시성 (Princeton GEO 연구, 2023)", sourceUrl: "https://arxiv.org/abs/2311.09735" },
      weight: 3,
      fix: {
        method: ["주장에 수치 근거 추가 (기간·비용·거리·비율)", "출처와 기준 시점 병기"],
        example: "'가깝습니다' → '지하철로 15분, 4.2km 거리입니다'",
        difficulty: "low",
        effort: "페이지당 30분",
      },
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => p.patterns.statistics.count >= 3, "수치 표현 3개 이상", (p) => `수치 표현 ${p.patterns.statistics.count}개`),
  ),
  make(
    {
      id: "qa-structure",
      category: "geo",
      label: "질문·답변 구조",
      description: "질문형 소제목 + 직접 답변 조합이 갖춰졌는지 검사합니다.",
      why: "Q&A 구조는 추천 스니펫·PAA·AI 답변의 공통 추출 단위입니다.",
      aeoImpact: "생성형 검색에서 인용되는 콘텐츠의 대표 형식입니다.",
      thresholds: { ...P100, source: "GEO 실무 표준 — Q&A 구조", sourceUrl: undefined },
      weight: 4,
      fix: {
        method: ["질문형 H2 + 바로 아래 2~3문장 답변 구조로 재편"],
        example: "<h2>입장료는 얼마인가요?</h2><p>성인 5,000원입니다. 온라인 예매 시 10% 할인됩니다.</p>",
        difficulty: "medium",
        effort: "페이지당 1시간",
      },
      aiActions: ["faq", "h2-structure"],
    },
    (def, ctx) =>
      ratioCheck(
        def,
        ctx,
        (p) => p.patterns.questionHeadings.count >= 1 && !!p.firstParagraph && p.firstParagraph.length >= 40,
        "Q&A 구조",
        (p) => (p.patterns.questionHeadings.count === 0 ? "질문형 제목 없음" : "직접 답변 단락 없음"),
      ),
  ),
  make(
    {
      id: "topic-consistency",
      category: "geo",
      label: "주제 일관성",
      description: "페이지 title들이 공통 주제 키워드를 공유하는지 검사합니다.",
      why: "일관된 주제는 사이트의 토픽 권위(topical authority)를 만듭니다.",
      aeoImpact: "특정 주제의 전문 사이트로 인식될수록 해당 주제 질의에서 인용 확률이 높아집니다.",
      thresholds: { ...P100, source: "토픽 권위 실무 표준", sourceUrl: undefined },
      weight: 2,
      fix: {
        method: ["핵심 주제 축(예: 한국 여행·K뷰티) 중심으로 콘텐츠 계획", "주제 이탈 콘텐츠는 별도 섹션 분리"],
        example: "여행 사이트에 무관한 주제 글 혼재 시 서브 디렉터리 분리",
        difficulty: "medium",
        effort: "콘텐츠 전략 재정비",
      },
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl).filter((p) => p.title);
      if (pages.length < 3) return unmeasured(def, "표본 페이지가 3개 미만이라 주제 일관성을 측정할 수 없습니다.");
      const tokens = new Map<string, number>();
      for (const p of pages) {
        const words = (p.title || "").toLowerCase().split(/[\s|\-–—:·,/]+/).filter((w) => w.length >= 2);
        for (const w of new Set(words)) tokens.set(w, (tokens.get(w) || 0) + 1);
      }
      const top = [...tokens.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
      if (top.length === 0) return unmeasured(def, "title에서 키워드를 추출하지 못했습니다.");
      const coverage = pct(top[0][1], pages.length);
      return measured(def, coverage, `핵심어 커버리지 ${coverage}%`, [
        `상위 공통 키워드: ${top.map(([w, c]) => `"${w}"(${c}페이지)`).join(", ")}`,
        `가장 많은 키워드가 ${pages.length}페이지 중 ${top[0][1]}페이지 title에 등장`,
      ]);
    },
  ),
  make(
    {
      id: "topic-cluster",
      category: "geo",
      label: "Topic Cluster (내부 연결)",
      description: "본문 내부 링크 밀도와 BreadcrumbList로 주제 클러스터 구조를 검사합니다.",
      why: "허브-스포크 연결 구조는 주제 권위와 크롤 효율을 동시에 높입니다.",
      aeoImpact: "AI가 사이트의 주제 커버리지를 클러스터 단위로 파악합니다.",
      thresholds: { ...P100, source: "토픽 클러스터 실무 표준 + BreadcrumbList schema", sourceUrl: "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb" },
      weight: 3,
      fix: {
        method: ["주제별 허브 페이지 구축", "상세 페이지 간 상호 링크", "BreadcrumbList schema 적용"],
        example: "허브 '부산 여행' → 스포크 '해운대', '광안리', '감천문화마을' 상호 링크",
        difficulty: "medium",
        effort: "주제당 1일",
      },
      aiActions: ["internal-links"],
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(def, "정상 페이지가 없습니다.");
      const avgInternal = pages.reduce((a, p) => a + p.links.filter((l) => l.internal).length, 0) / pages.length;
      const hasBreadcrumb = schemaTypesPresent(ctx.crawl).has("BreadcrumbList");
      const linkScore = Math.min(70, Math.round((avgInternal / 10) * 70));
      const score = linkScore + (hasBreadcrumb ? 30 : 0);
      return measured(def, score, `내부링크 평균 ${avgInternal.toFixed(1)}개`, [
        `페이지당 평균 내부 링크 ${avgInternal.toFixed(1)}개`,
        hasBreadcrumb ? "BreadcrumbList schema 적용됨" : "BreadcrumbList schema 미적용",
      ]);
    },
  ),
  make(
    {
      id: "content-uniqueness",
      category: "geo",
      label: "콘텐츠 독창성 (내부)",
      description: "표본 페이지 간 첫 단락 중복으로 템플릿 복제 여부를 검사합니다.",
      why: "복제된 설명문은 페이지별 고유 가치를 없애 순위 경쟁력을 낮춥니다.",
      aeoImpact: "AI는 동일 문구가 반복되는 사이트의 개별 페이지 인용을 회피합니다.",
      thresholds: { ...P100, source: "Google — 자동 생성·복제 콘텐츠 정책", sourceUrl: "https://developers.google.com/search/docs/essentials/spam-policies" },
      weight: 2,
      fix: {
        method: ["페이지별 고유 도입부 작성", "템플릿 반복 문구 최소화"],
        example: "관광지마다 다른 관점의 도입부 (역사·풍경·활동 등)",
        difficulty: "medium",
        effort: "페이지당 30분",
      },
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl).filter((p) => p.firstParagraph);
      if (pages.length < 2) return unmeasured(def, "비교할 본문이 부족합니다.");
      const seen = new Map<string, string[]>();
      for (const p of pages) {
        const key = p.firstParagraph!.slice(0, 80);
        seen.set(key, [...(seen.get(key) || []), p.finalUrl]);
      }
      const dups = [...seen.values()].filter((v) => v.length > 1);
      const dupCount = dups.reduce((a, v) => a + v.length - 1, 0);
      const score = pct(pages.length - dupCount, pages.length);
      return measured(def, score, dupCount ? `중복 도입부 ${dupCount}건` : "고유", [
        `${pages.length}페이지 첫 단락 비교 — 중복 그룹 ${dups.length}개`,
        ...dups.slice(0, 2).map((v) => `동일 도입부: ${v.map(shortUrl).join(" = ")}`),
      ], dups.flat());
    },
  ),
  make(
    {
      id: "ai-crawler-access",
      category: "geo",
      label: "AI 크롤러 접근성",
      description: "robots.txt가 GPTBot·ClaudeBot·PerplexityBot 등 AI 크롤러를 차단하는지 검사합니다.",
      why: "AI 크롤러가 차단되면 해당 AI 검색·챗봇에서 콘텐츠가 인용될 수 없습니다.",
      aeoImpact: "생성형 검색 노출의 전제 조건입니다. 차단 여부는 운영 정책에 따라 의도적 선택일 수도 있습니다.",
      thresholds: { ...P100, source: "각 AI 크롤러 공식 문서 (GPTBot·ClaudeBot·Google-Extended 등)", sourceUrl: "https://platform.openai.com/docs/bots" },
      weight: 3,
      fix: {
        method: ["AI 노출을 원하면 robots.txt에서 AI 크롤러 차단 규칙 제거", "선별 차단이 필요하면 경로 단위로 제한"],
        example: "User-agent: GPTBot\nAllow: /  (노출 원할 때)",
        difficulty: "low",
        effort: "0.5시간",
      },
    },
    (def, ctx) => {
      const raw = ctx.crawl.robotsTxt.raw;
      if (raw === null) return measured(def, 100, "차단 없음", ["robots.txt가 없어 모든 AI 크롤러가 기본 허용됩니다."]);
      const bots = ["GPTBot", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "CCBot", "anthropic-ai", "Bytespider"];
      const blocked: string[] = [];
      const sections = raw.split(/(?=user-agent\s*:)/i);
      for (const bot of bots) {
        for (const sec of sections) {
          if (new RegExp(`user-agent\\s*:\\s*${bot}`, "i").test(sec) && /disallow\s*:\s*\/\s*$/im.test(sec)) blocked.push(bot);
        }
      }
      const score = pct(bots.length - blocked.length, bots.length);
      return measured(def, score, blocked.length ? `${blocked.length}개 차단` : "전체 허용", [
        blocked.length ? `차단된 AI 크롤러: ${blocked.join(", ")}` : `주요 AI 크롤러 ${bots.length}종 모두 허용 (robots.txt 기준)`,
        "참고: AI 크롤러 차단은 의도적 정책일 수 있습니다. 노출 전략에 맞게 판단하세요.",
      ]);
    },
  ),
  make(
    {
      id: "ai-citation-likelihood",
      category: "geo",
      label: "예상 AI 인용 가능성",
      description: "측정된 GEO·AEO 신호를 종합한 예상치입니다. 실제 인용 여부는 각 AI 서비스 데이터 없이는 확인할 수 없습니다.",
      why: "인용 가능성이 높은 구조를 갖추는 것이 생성형 검색 시대의 핵심 대응입니다.",
      aeoImpact: "이 항목은 Google AI Mode·AI Overviews·Gemini·ChatGPT·Claude·Perplexity·Copilot 공통의 구조 신호를 종합합니다. '예상치'이며 확정 데이터가 아닙니다.",
      thresholds: { ...P100, source: "직접 답변·Q&A·통계·엔티티·최신성 신호의 가중 평균 (산식 공개)", sourceUrl: undefined },
      weight: 4,
      fix: {
        method: ["하위 신호(직접 답변·Q&A 구조·통계 근거·브랜드 엔티티·최신성) 개선 시 자동 상승"],
        example: "개선센터의 GEO·AEO 항목 우선 처리",
        difficulty: "medium",
        effort: "하위 항목에 따름",
      },
    },
    (def, ctx) => {
      // 하위 신호 재계산 (동일 산식) — 측정된 것만 사용
      const sub = ["direct-answer", "question-headings", "statistics-evidence", "brand-entity", "qa-structure"];
      void sub;
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(def, "정상 페이지가 없어 산출할 수 없습니다.");
      const direct = pct(pages.filter((p) => !!p.firstParagraph && p.firstParagraph.length >= 40 && p.firstParagraph.length <= 400).length, pages.length);
      const qh = pct(pages.filter((p) => p.patterns.questionHeadings.count >= 1).length, pages.length);
      const stats = pct(pages.filter((p) => p.patterns.statistics.count >= 3).length, pages.length);
      const org = findSchemaNodes(ctx.crawl, ["Organization", "LocalBusiness", "MedicalOrganization"]).length > 0 ? 100 : 0;
      const dates = pct(pages.filter((p) => p.patterns.visibleDates.matched).length, pages.length);
      const score = Math.round(direct * 0.3 + qh * 0.2 + stats * 0.2 + org * 0.15 + dates * 0.15);
      return measured(def, score, `예상 ${score}%`, [
        "산식: 직접답변 30% + 질문형제목 20% + 통계근거 20% + 조직엔티티 15% + 날짜표기 15%",
        `직접답변 ${direct}% · 질문형제목 ${qh}% · 통계 ${stats}% · 엔티티 ${org === 100 ? "있음" : "없음"} · 날짜 ${dates}%`,
        "⚠ 예상 인용 가능성입니다. 실제 인용 데이터는 각 AI 서비스 API 미제공으로 확정할 수 없습니다.",
      ]);
    },
  ),
  make(
    {
      id: "external-mentions-geo",
      category: "geo",
      label: "타 사이트 언급 (인용 소스)",
      description: "다른 사이트·커뮤니티에서의 브랜드 언급 규모입니다.",
      why: "외부 언급은 AI가 브랜드를 학습하는 주요 경로입니다.",
      aeoImpact: "언급이 많은 엔티티일수록 생성형 답변에 등장할 확률이 높습니다.",
      thresholds: { ...P100, source: "외부 데이터 API 연동 필요", sourceUrl: undefined },
      weight: 1,
      fix: {
        method: ["백링크·브랜드 모니터링 API 연동 후 측정"],
        example: "Search Console 링크 보고서 / Ahrefs·Semrush API",
        difficulty: "high",
        effort: "API 연동 후",
      },
    },
    (def) => notConnected(def, "외부 언급 데이터는 백링크/브랜드 모니터링 API 연결 후 측정됩니다."),
  ),
];

/* ───────── 구조화데이터 검사 ───────── */

export const SCHEMA_CHECKS: CheckSpec[] = [
  make(
    {
      id: "jsonld-presence",
      category: "schema",
      label: "JSON-LD 적용률",
      description: "페이지에 JSON-LD 구조화데이터가 있는지 검사합니다.",
      why: "구조화데이터는 리치 결과 노출의 전제 조건입니다.",
      aeoImpact: "AI가 페이지 정보를 오해 없이 파싱하는 가장 확실한 방법입니다.",
      thresholds: { ...P100, source: "Google — 구조화된 데이터 소개 (JSON-LD 권장)", sourceUrl: "https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data" },
      weight: 4,
      fix: {
        method: ["페이지 유형별 JSON-LD 템플릿 적용 (Organization·WebSite·페이지 타입)"],
        example: '<script type="application/ld+json">{"@context":"https://schema.org", …}</script>',
        difficulty: "medium",
        effort: "1~2일",
      },
      aiActions: ["json-ld"],
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => p.jsonLd.length > 0, "JSON-LD 존재", () => "JSON-LD 없음"),
  ),
  make(
    {
      id: "jsonld-syntax",
      category: "schema",
      label: "JSON-LD 문법 유효성",
      description: "JSON-LD 블록이 문법 오류 없이 파싱되는지 검사합니다.",
      why: "문법 오류가 있는 구조화데이터는 완전히 무시됩니다.",
      aeoImpact: "파싱 불가 데이터는 AI에게 존재하지 않는 것과 같습니다.",
      thresholds: { good: 90, best: 100, unit: "%", source: "JSON-LD 1.1 사양", sourceUrl: "https://www.w3.org/TR/json-ld11/" },
      weight: 3,
      fix: {
        method: ["Rich Results Test로 검증 후 수정", "JSON 직렬화를 코드로 자동 생성 (수기 작성 지양)"],
        example: "후행 콤마·따옴표 누락 등 JSON 문법 오류 수정",
        difficulty: "low",
        effort: "블록당 10분",
      },
    },
    (def, ctx) => {
      const blocks = okPages(ctx.crawl).flatMap((p) => p.jsonLd.map((b) => ({ b, page: p.finalUrl })));
      if (blocks.length === 0) return unmeasured(def, "JSON-LD 블록이 없어 문법을 검사할 수 없습니다.");
      const errors = blocks.filter(({ b }) => b.parseError);
      const score = pct(blocks.length - errors.length, blocks.length);
      return measured(def, score, errors.length ? `오류 ${errors.length}건` : "정상", [
        `JSON-LD ${blocks.length}블록 중 파싱 오류 ${errors.length}건`,
        ...errors.slice(0, 3).map(({ b, page }) => `✗ ${shortUrl(page)} — ${b.parseError}`),
      ], errors.map(({ page }) => page));
    },
  ),
  make(
    {
      id: "core-schemas",
      category: "schema",
      label: "핵심 Schema (Organization·WebSite·Breadcrumb)",
      description: "사이트 공통 3종 schema 적용 여부를 검사합니다.",
      why: "사이트 정체성(Organization)·검색창(WebSite)·경로(Breadcrumb)는 모든 사이트의 기본 세트입니다.",
      aeoImpact: "AI의 사이트 구조 이해와 브랜드 확정에 필수입니다.",
      thresholds: { ...P100, source: "Google 구조화데이터 갤러리 — 공통 타입", sourceUrl: "https://developers.google.com/search/docs/appearance/structured-data/search-gallery" },
      weight: 4,
      fix: {
        method: ["레이아웃에 Organization·WebSite 삽입", "탐색 경로에 BreadcrumbList 적용"],
        example: '{"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,…}]}',
        difficulty: "low",
        effort: "1일",
      },
      aiActions: ["json-ld"],
    },
    (def, ctx) => {
      const types = schemaTypesPresent(ctx.crawl);
      const wanted = ["Organization", "WebSite", "BreadcrumbList"];
      const found = wanted.filter((w) => types.has(w) || (w === "Organization" && (types.has("LocalBusiness") || types.has("MedicalOrganization"))));
      const score = pct(found.length, wanted.length);
      return measured(def, score, `${found.length}/3 적용`, [
        `적용: ${found.join(", ") || "없음"}`,
        `누락: ${wanted.filter((w) => !found.includes(w)).join(", ") || "없음"}`,
        `발견된 전체 타입: ${[...types].slice(0, 10).join(", ") || "없음"}`,
      ]);
    },
  ),
  make(
    {
      id: "schema-validity",
      category: "schema",
      label: "Schema 속성 유효성",
      description: "발견된 각 schema의 필수·권장 속성 충족 여부를 검사합니다 (정상/경고/오류 구분).",
      why: "필수 속성이 없으면 리치 결과 자격이 없고, 권장 속성 누락은 노출 품질을 낮춥니다.",
      aeoImpact: "완전한 속성 세트가 있어야 AI가 세부 정보(주소·시간·가격)를 정확히 인용합니다.",
      thresholds: { ...P100, source: "Google 리치결과 문서 + schema.org 타입별 속성 정의", sourceUrl: "https://developers.google.com/search/docs/appearance/structured-data/search-gallery" },
      weight: 4,
      fix: {
        method: ["오류(필수 누락) 우선 수정", "경고(권장 누락)는 정보 보강 시 함께 처리", "콘텐츠와 불일치하는 schema 제거"],
        example: "Event: name·startDate·location 필수 → 누락 속성 추가",
        difficulty: "medium",
        effort: "타입당 2시간",
      },
      aiActions: ["json-ld"],
    },
    (def, ctx) => {
      const { audits, syntaxErrors } = auditSchemas(ctx.crawl);
      if (audits.length === 0 && syntaxErrors.length === 0)
        return unmeasured(def, "검사할 schema 노드가 없습니다. 먼저 JSON-LD를 적용하세요.");
      const okCount = audits.filter((a) => a.status === "ok").length;
      const warn = audits.filter((a) => a.status === "warning").length;
      const err = audits.filter((a) => a.status === "error").length + syntaxErrors.length;
      const total = audits.length + syntaxErrors.length;
      const score = total === 0 ? 0 : Math.round(((okCount + warn * 0.6) / total) * 100);
      return measured(def, score, `정상 ${okCount} · 경고 ${warn} · 오류 ${err}`, [
        `schema 노드 ${audits.length}개 검사 — 정상 ${okCount}, 경고(권장 누락) ${warn}, 오류(필수 누락·불일치) ${err - syntaxErrors.length}, 문법 오류 ${syntaxErrors.length}`,
        ...audits.filter((a) => a.status === "error").slice(0, 4).map((a) => `✗ ${a.type} @ ${shortUrl(a.page)} — ${a.note}`),
        ...audits.filter((a) => a.status === "warning").slice(0, 3).map((a) => `△ ${a.type} @ ${shortUrl(a.page)} — ${a.note}`),
      ], [...new Set(audits.filter((a) => a.status !== "ok").map((a) => a.page))]);
    },
  ),
  make(
    {
      id: "page-type-schema",
      category: "schema",
      label: "페이지 타입 Schema 커버리지",
      description: "콘텐츠 페이지에 Article·FAQPage 등 타입별 schema가 적용됐는지 검사합니다.",
      why: "페이지 성격에 맞는 타입 선언이 있어야 해당 리치 결과에 노출됩니다.",
      aeoImpact: "타입 선언은 AI가 콘텐츠 종류(기사·FAQ·장소·이벤트)를 구분하는 기준입니다.",
      thresholds: { ...P100, source: "Google 구조화데이터 갤러리", sourceUrl: "https://developers.google.com/search/docs/appearance/structured-data/search-gallery" },
      weight: 3,
      fix: {
        method: ["콘텐츠 유형별 schema 매핑 (글→Article, 질문→FAQPage, 장소→Place류)"],
        example: "블로그 글에 BlogPosting + 작성자·날짜 속성",
        difficulty: "medium",
        effort: "템플릿당 0.5일",
      },
      aiActions: ["json-ld"],
    },
    (def, ctx) => {
      const contentTypes = ["Article", "NewsArticle", "BlogPosting", "FAQPage", "Product", "Event", "Place", "LocalBusiness", "TouristAttraction", "Restaurant", "MedicalOrganization", "Physician", "ItemList", "WebPage"];
      return ratioCheck(
        def,
        { ...ctx },
        (p) => p.jsonLd.some((b) => b.types.some((t) => contentTypes.includes(t))),
        "페이지 타입 schema 존재",
        (p) => (p.jsonLd.length === 0 ? "JSON-LD 없음" : `타입: ${p.jsonLd.flatMap((b) => b.types).join(",") || "불명"}`),
      );
    },
  ),
];

/* ───────── 모바일·속도 검사 ───────── */

function psiUnavailable(def: CheckDefinition): CheckResult {
  return notConnected(def, "PageSpeed Insights 측정을 실행하지 않았습니다. 페이지 속도 메뉴에서 측정을 실행하세요.");
}

export const MOBILE_CHECKS: CheckSpec[] = [
  make(
    {
      id: "mobile-viewport",
      category: "mobile",
      label: "모바일 대응 (Viewport)",
      description: "반응형 viewport 설정 여부 — 모바일 사용성의 1차 관문입니다.",
      why: "Google은 모바일 버전을 기준으로 색인·평가합니다 (모바일 우선 색인).",
      aeoImpact: "모바일 미대응은 페이지 경험 평가 전반을 낮춥니다.",
      thresholds: { ...P100, source: "Google — 모바일 우선 색인", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/mobile/mobile-sites-mobile-first-indexing" },
      weight: 3,
      fix: {
        method: ["viewport 메타태그 적용 + 반응형 CSS"],
        example: '<meta name="viewport" content="width=device-width, initial-scale=1" />',
        difficulty: "low",
        effort: "0.5일",
      },
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => !!p.viewport && p.viewport.includes("width"), "viewport 적용", () => "viewport 없음"),
  ),
  make(
    {
      id: "psi-performance",
      category: "mobile",
      label: "Lighthouse 성능 점수",
      description: "PageSpeed Insights(Lighthouse) 모바일 성능 점수입니다.",
      why: "로딩 성능은 이탈률과 전환율에 직접 영향을 주는 페이지 경험 지표입니다.",
      aeoImpact: "속도는 크롤 효율에도 영향을 줘 콘텐츠 수집 완성도를 좌우합니다.",
      thresholds: { good: 50, best: 90, unit: "점", source: "Lighthouse 점수 구간 (0–49 미달 / 50–89 개선 필요 / 90+ 우수)", sourceUrl: "https://developer.chrome.com/docs/lighthouse/performance/performance-scoring" },
      weight: 4,
      fix: {
        method: ["이미지 최적화·지연 로딩", "미사용 JS 제거", "서버 응답시간(TTFB) 개선"],
        example: "PSI 보고서의 '개선 기회' 항목 순서대로 적용",
        difficulty: "high",
        effort: "1주",
      },
    },
    (def, ctx) => {
      if (!ctx.psi) return psiUnavailable(def);
      if (ctx.psi.performanceScore === null) return unmeasured(def, "PSI가 성능 점수를 반환하지 않았습니다.");
      const s = ctx.psi.performanceScore;
      return measured(def, s, `${s}점`, [
        `Lighthouse ${ctx.psi.strategy} 성능 점수 ${s}점 (측정: ${ctx.psi.fetchedAt.slice(0, 16).replace("T", " ")})`,
      ]);
    },
  ),
  make(
    {
      id: "cwv-lcp",
      category: "mobile",
      label: "LCP (최대 콘텐츠풀 페인트)",
      description: "주요 콘텐츠 표시 시간 — Core Web Vitals 지표.",
      why: "Google 권장: 2.5초 이내 '좋음', 4초 초과 '나쁨'.",
      aeoImpact: "페이지 경험 신호로 랭킹 시스템에 반영됩니다.",
      thresholds: { good: 70, best: 90, unit: "점", source: "web.dev — LCP 기준 (≤2.5s 좋음 / ≤4s 개선 필요)", sourceUrl: "https://web.dev/articles/lcp" },
      weight: 3,
      fix: {
        method: ["LCP 이미지 사전 로드", "이미지 크기 최적화·CDN", "렌더링 차단 리소스 제거"],
        example: '<link rel="preload" as="image" href="hero.webp" />',
        difficulty: "medium",
        effort: "2~3일",
      },
    },
    (def, ctx) => {
      if (!ctx.psi) return psiUnavailable(def);
      const lcp = ctx.psi.fieldData?.lcpMs ?? ctx.psi.labData?.lcpMs;
      if (lcp == null) return unmeasured(def, "PSI 응답에 LCP 데이터가 없습니다 (트래픽 부족으로 실측 데이터 미제공 가능).");
      const src = ctx.psi.fieldData?.lcpMs != null ? "실측(CrUX)" : "Lab(Lighthouse)";
      const score = bandScore(lcp, 2500, 4000, 8000);
      return measured(def, score, `${(lcp / 1000).toFixed(1)}초`, [
        `LCP ${(lcp / 1000).toFixed(2)}초 (${src}) — 기준: ≤2.5s 최적 / ≤4s 양호`,
      ]);
    },
  ),
  make(
    {
      id: "cwv-cls",
      category: "mobile",
      label: "CLS (누적 레이아웃 이동)",
      description: "화면 요소가 예기치 않게 움직이는 정도 — Core Web Vitals 지표.",
      why: "Google 권장: 0.1 이하 '좋음', 0.25 초과 '나쁨'.",
      aeoImpact: "페이지 경험 신호로 반영됩니다.",
      thresholds: { good: 70, best: 90, unit: "점", source: "web.dev — CLS 기준 (≤0.1 좋음 / ≤0.25 개선 필요)", sourceUrl: "https://web.dev/articles/cls" },
      weight: 2,
      fix: {
        method: ["이미지·광고 영역에 크기 예약", "웹폰트 FOUT 최소화 (font-display: optional 등)"],
        example: '<img width="800" height="450" …> 명시로 공간 예약',
        difficulty: "medium",
        effort: "1~2일",
      },
    },
    (def, ctx) => {
      if (!ctx.psi) return psiUnavailable(def);
      const cls = ctx.psi.fieldData?.cls ?? ctx.psi.labData?.cls;
      if (cls == null) return unmeasured(def, "PSI 응답에 CLS 데이터가 없습니다.");
      const src = ctx.psi.fieldData?.cls != null ? "실측(CrUX)" : "Lab(Lighthouse)";
      const score = bandScore(cls * 1000, 100, 250, 600);
      return measured(def, score, cls.toFixed(3), [
        `CLS ${cls.toFixed(3)} (${src}) — 기준: ≤0.1 최적 / ≤0.25 양호`,
      ]);
    },
  ),
  make(
    {
      id: "cwv-inp",
      category: "mobile",
      label: "INP (상호작용 응답성)",
      description: "사용자 입력에 대한 반응 속도 — Core Web Vitals 지표 (실측 데이터 필요).",
      why: "Google 권장: 200ms 이하 '좋음', 500ms 초과 '나쁨'.",
      aeoImpact: "페이지 경험 신호로 반영됩니다.",
      thresholds: { good: 70, best: 90, unit: "점", source: "web.dev — INP 기준 (≤200ms 좋음 / ≤500ms 개선 필요)", sourceUrl: "https://web.dev/articles/inp" },
      weight: 2,
      fix: {
        method: ["메인 스레드 장시간 작업 분할", "불필요한 JS 실행 지연·제거"],
        example: "이벤트 핸들러 내 무거운 연산을 requestIdleCallback으로 이동",
        difficulty: "high",
        effort: "3일+",
      },
    },
    (def, ctx) => {
      if (!ctx.psi) return psiUnavailable(def);
      const inp = ctx.psi.fieldData?.inpMs;
      if (inp == null)
        return unmeasured(def, "INP는 실사용자(CrUX) 데이터가 필요합니다. 트래픽이 적으면 Google이 데이터를 제공하지 않습니다.");
      const score = bandScore(inp, 200, 500, 1200);
      return measured(def, score, `${inp}ms`, [`INP ${inp}ms (실측 CrUX) — 기준: ≤200ms 최적 / ≤500ms 양호`]);
    },
  ),
];
