/** 기술 SEO 검사 항목 */

import type { CheckResult } from "../types";
import {
  bandScore,
  binaryCheck,
  CheckSpec,
  measured,
  okPages,
  pct,
  ratioCheck,
  shortUrl,
  unmeasured,
} from "./helpers";

const P100 = { good: 70, best: 90, unit: "%" };

export const TECHNICAL_CHECKS: CheckSpec[] = [
  {
    id: "https",
    category: "technical",
    label: "HTTPS 적용",
    description: "사이트가 HTTPS로 제공되는지 검사합니다.",
    why: "Google은 2014년부터 HTTPS를 랭킹 신호로 사용하며, 브라우저는 HTTP 사이트에 '안전하지 않음' 경고를 표시합니다.",
    aeoImpact: "AI 검색 크롤러도 보안 연결을 신뢰 신호로 사용하며, HTTP 페이지는 인용 우선순위가 낮아집니다.",
    thresholds: { ...P100, source: "Google 검색 센터 — HTTPS를 랭킹 신호로 사용", sourceUrl: "https://developers.google.com/search/blog/2014/08/https-as-ranking-signal" },
    weight: 4,
    fix: {
      method: ["SSL/TLS 인증서 적용 (Let's Encrypt 무료 발급 가능)", "HTTP → HTTPS 301 리다이렉트 설정", "혼합 콘텐츠(http 리소스) 제거"],
      example: "server { listen 443 ssl; ... }  # 또는 호스팅/Vercel의 자동 HTTPS 사용",
      difficulty: "low",
      effort: "0.5일",
    },
    evaluate: (ctx) =>
      binaryCheck(
        TECHNICAL_CHECKS[0],
        ctx.crawl.https,
        ctx.crawl.https ? "적용됨" : "미적용",
        [`시작 URL 프로토콜: ${ctx.crawl.https ? "https" : "http"} (${ctx.crawl.startUrl})`],
        ctx.crawl.https ? [] : [ctx.crawl.startUrl],
      ),
  },
  {
    id: "http-status",
    category: "technical",
    label: "HTTP 상태코드 정상률",
    description: "크롤한 페이지가 200 응답을 반환하는지 검사합니다.",
    why: "4xx/5xx 페이지는 색인에서 제외되고, 잦은 오류는 크롤 예산을 낭비시킵니다.",
    aeoImpact: "AI 크롤러는 오류 페이지를 수집하지 못하므로 해당 콘텐츠는 인용 대상에서 제외됩니다.",
    thresholds: { ...P100, source: "Google 검색 센터 — HTTP 상태 코드가 검색에 미치는 영향", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/http-network-errors" },
    weight: 4,
    fix: {
      method: ["오류 페이지 원인 파악 후 수정 또는 301 리다이렉트", "삭제된 페이지는 410 처리 후 내부 링크 제거"],
      example: "깨진 URL → 유사 콘텐츠 페이지로 301 리다이렉트",
      difficulty: "medium",
      effort: "페이지당 10분",
    },
    evaluate: (ctx) => {
      const pages = ctx.crawl.pages;
      if (pages.length === 0) return unmeasured(TECHNICAL_CHECKS[1], "크롤한 페이지가 없습니다.");
      const ok = pages.filter((p) => p.status === 200);
      const bad = pages.filter((p) => p.status !== 200);
      const score = pct(ok.length, pages.length);
      return measured(
        TECHNICAL_CHECKS[1],
        score,
        `${score}%`,
        [
          `크롤 시도 ${pages.length}페이지 중 ${ok.length}페이지 정상(200)`,
          ...bad.slice(0, 5).map((p) => `✗ ${shortUrl(p.url)} — 상태 ${p.status || p.error || "응답 없음"}`),
        ],
        bad.map((p) => p.url),
      );
    },
  },
  {
    id: "robots-txt",
    category: "technical",
    label: "robots.txt",
    description: "robots.txt 존재 여부와 전체 차단 여부, Sitemap 선언을 검사합니다.",
    why: "robots.txt는 크롤러 접근 제어의 표준이며, 잘못된 전체 차단(Disallow: /)은 색인 전체를 막습니다.",
    aeoImpact: "GPTBot·ClaudeBot 등 AI 크롤러도 robots.txt를 따르므로, 설정에 따라 AI 검색 노출이 결정됩니다.",
    thresholds: { ...P100, source: "Google 검색 센터 — robots.txt 소개", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/robots/intro" },
    weight: 3,
    fix: {
      method: ["루트에 robots.txt 생성", "Sitemap: 줄 추가", "의도치 않은 Disallow 규칙 제거"],
      example: "User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml",
      difficulty: "low",
      effort: "0.5시간",
    },
    evaluate: (ctx) => {
      const r = ctx.crawl.robotsTxt;
      if (r.disallowAll)
        return measured(TECHNICAL_CHECKS[2], 0, "전체 차단", [`robots.txt가 Disallow: / 로 전체 크롤을 차단하고 있습니다 (상태 ${r.status})`], [`${ctx.crawl.origin}/robots.txt`]);
      if (!r.fetched)
        return measured(TECHNICAL_CHECKS[2], 60, "없음", [`robots.txt를 찾을 수 없습니다 (상태 ${r.status ?? "응답 없음"}). 없으면 전체 허용으로 동작하지만 명시적 파일 생성을 권장합니다.`], [`${ctx.crawl.origin}/robots.txt`]);
      const hasSitemap = r.sitemaps.length > 0;
      return measured(
        TECHNICAL_CHECKS[2],
        hasSitemap ? 100 : 85,
        hasSitemap ? "정상" : "Sitemap 미선언",
        [
          `robots.txt 존재 (상태 200), Disallow 규칙 ${r.disallowRules.length}개`,
          hasSitemap ? `Sitemap 선언 ${r.sitemaps.length}건: ${r.sitemaps[0]}` : "Sitemap: 선언이 없습니다 — 추가 권장",
        ],
        hasSitemap ? [] : [`${ctx.crawl.origin}/robots.txt`],
      );
    },
  },
  {
    id: "sitemap",
    category: "technical",
    label: "sitemap.xml",
    description: "XML 사이트맵 존재 여부와 등록 URL 수를 검사합니다.",
    why: "사이트맵은 검색엔진이 페이지를 발견하는 가장 확실한 경로이며, 대규모·다국어 사이트에서 특히 중요합니다.",
    aeoImpact: "AI 검색 크롤러의 페이지 발견율을 높여 인용 가능한 콘텐츠 풀을 넓힙니다.",
    thresholds: { ...P100, source: "Google 검색 센터 — 사이트맵 개요", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview" },
    weight: 3,
    fix: {
      method: ["sitemap.xml 자동 생성 (Next.js sitemap.ts 등)", "robots.txt와 Search Console에 등록", "다국어 URL 포함"],
      example: '<url><loc>https://example.com/ja/page</loc><lastmod>2026-07-01</lastmod></url>',
      difficulty: "low",
      effort: "0.5일",
    },
    evaluate: (ctx) => {
      const s = ctx.crawl.sitemap;
      if (!s.fetched)
        return measured(TECHNICAL_CHECKS[3], 0, "없음", [`sitemap.xml을 찾을 수 없습니다 (상태 ${s.status ?? "응답 없음"})`], [`${ctx.crawl.origin}/sitemap.xml`]);
      return measured(TECHNICAL_CHECKS[3], 100, `${s.urlCount ?? "?"}개 URL`, [
        `사이트맵 확인: ${s.url}`,
        `등록 URL ${s.urlCount ?? 0}개${s.isIndex ? " (사이트맵 인덱스 — 첫 하위 사이트맵 기준)" : ""}`,
        s.localeBreakdown ? `경로 구성: ${Object.entries(s.localeBreakdown).map(([k, v]) => `${k} ${v}개`).join(", ")}` : "",
      ].filter(Boolean));
    },
  },
  {
    id: "canonical",
    category: "technical",
    label: "Canonical 태그",
    description: "각 페이지에 rel=canonical이 선언되어 있는지 검사합니다.",
    why: "canonical 부재 시 중복 URL이 각각 색인되어 랭킹 신호가 분산됩니다.",
    aeoImpact: "AI 검색이 대표 URL을 식별하는 데 사용됩니다. 중복 URL은 인용 신뢰도를 떨어뜨립니다.",
    thresholds: { ...P100, source: "Google 검색 센터 — 표준 URL 지정", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls" },
    weight: 3,
    fix: {
      method: ["모든 페이지 head에 self-referencing canonical 추가", "파라미터 URL은 대표 URL로 canonical 지정"],
      example: '<link rel="canonical" href="https://example.com/page" />',
      difficulty: "low",
      effort: "템플릿 수정 0.5일",
    },
    evaluate: (ctx) =>
      ratioCheck(TECHNICAL_CHECKS[4], ctx, (p) => !!p.canonical, "canonical 선언", () => "canonical 태그 없음"),
  },
  {
    id: "noindex",
    category: "technical",
    label: "noindex 오설정",
    description: "공개 페이지에 noindex가 잘못 설정되어 있지 않은지 검사합니다.",
    why: "noindex가 있으면 해당 페이지는 검색 결과에서 완전히 제외됩니다.",
    aeoImpact: "noindex 페이지는 AI 검색 학습·인용 대상에서도 제외되는 것이 일반적입니다.",
    thresholds: { ...P100, source: "Google 검색 센터 — noindex로 색인 차단", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/block-indexing" },
    weight: 4,
    fix: {
      method: ["의도치 않은 noindex 메타태그 제거", "스테이징 설정이 프로덕션에 남지 않았는지 배포 파이프라인 점검"],
      example: '<meta name="robots" content="index, follow" /> 또는 태그 자체 제거',
      difficulty: "low",
      effort: "0.5시간",
    },
    evaluate: (ctx) =>
      ratioCheck(
        TECHNICAL_CHECKS[5],
        ctx,
        (p) => !(p.metaRobots || "").toLowerCase().includes("noindex"),
        "색인 허용",
        (p) => `meta robots: "${p.metaRobots}"`,
      ),
  },
  {
    id: "title-presence",
    category: "technical",
    label: "Title 적용률",
    description: "모든 페이지에 title 태그가 있는지 검사합니다.",
    why: "title은 검색 결과 제목으로 표시되는 가장 강력한 온페이지 신호입니다.",
    aeoImpact: "AI 검색은 title로 페이지 주제를 1차 판단합니다.",
    thresholds: { ...P100, source: "Google 검색 센터 — 제목 링크 권장사항", sourceUrl: "https://developers.google.com/search/docs/appearance/title-link" },
    weight: 4,
    fix: {
      method: ["누락 페이지에 고유 title 작성", "핵심 키워드를 앞쪽에, 브랜드명은 뒤쪽에 배치"],
      example: "<title>강남 피부과 보톡스 비용·시술시간 안내 | ○○의원</title>",
      difficulty: "low",
      effort: "페이지당 5분",
    },
    aiActions: ["title"],
    evaluate: (ctx) =>
      ratioCheck(TECHNICAL_CHECKS[6], ctx, (p) => !!p.title && p.title.length > 0, "title 존재", () => "title 태그 없음"),
  },
  {
    id: "title-length",
    category: "technical",
    label: "Title 길이 적정률",
    description: "title이 15~60자(표시 한도) 범위인지 검사합니다.",
    why: "너무 짧으면 정보가 부족하고, 60자 초과는 검색 결과에서 잘립니다. Google은 고정 글자 제한을 두지 않지만 표시 폭 기준 약 50~60자가 실무 기준입니다.",
    aeoImpact: "명확한 길이의 title은 AI가 주제를 요약·인용할 때 그대로 활용됩니다.",
    thresholds: { ...P100, source: "Google — 제목 링크 작성 권장사항 (표시 한도 기준 실무 관례)", sourceUrl: "https://developers.google.com/search/docs/appearance/title-link" },
    weight: 2,
    fix: {
      method: ["60자 초과 title 축약", "15자 미만 title에 핵심 키워드·지역명 보강"],
      example: "'홈' → '부산 여행 코스 추천 — 해운대·광안리 1박2일 일정 | K:ZIP'",
      difficulty: "low",
      effort: "페이지당 5분",
    },
    aiActions: ["title"],
    evaluate: (ctx) =>
      ratioCheck(
        TECHNICAL_CHECKS[7],
        ctx,
        (p) => !!p.title && p.title.length >= 15 && p.title.length <= 60,
        "적정 길이(15~60자)",
        (p) => `title ${p.title ? `${p.title.length}자` : "없음"}: "${(p.title || "").slice(0, 40)}"`,
      ),
  },
  {
    id: "title-duplicates",
    category: "technical",
    label: "Title 중복",
    description: "크롤한 페이지 간 title 중복 여부를 검사합니다.",
    why: "중복 title은 어떤 페이지를 노출할지 검색엔진이 판단하지 못하게 만들어 순위가 분산됩니다.",
    aeoImpact: "AI가 동일 제목의 페이지를 구분하지 못해 잘못된 페이지를 인용할 수 있습니다.",
    thresholds: { ...P100, source: "Google 검색 센터 — 페이지마다 고유한 제목 사용 권장", sourceUrl: "https://developers.google.com/search/docs/appearance/title-link" },
    weight: 3,
    fix: {
      method: ["페이지별 고유 title 작성", "템플릿 자동 생성 시 페이지 특성 변수 포함"],
      example: "'{시술명} 비용·후기 | {병원명}' 처럼 페이지 변수를 조합",
      difficulty: "low",
      effort: "0.5일",
    },
    aiActions: ["title"],
    evaluate: (ctx) => {
      const pages = okPages(ctx.crawl).filter((p) => p.title);
      if (pages.length < 2) return unmeasured(TECHNICAL_CHECKS[8], "비교할 페이지가 2개 미만입니다.");
      const seen = new Map<string, string[]>();
      for (const p of pages) seen.set(p.title!, [...(seen.get(p.title!) || []), p.finalUrl]);
      const dups = [...seen.entries()].filter(([, urls]) => urls.length > 1);
      const dupPages = dups.reduce((a, [, u]) => a + u.length, 0);
      const score = pct(pages.length - dupPages, pages.length);
      return measured(
        TECHNICAL_CHECKS[8],
        score,
        dups.length ? `중복 ${dups.length}건` : "중복 없음",
        [
          `${pages.length}페이지 중 고유 title ${seen.size}개`,
          ...dups.slice(0, 3).map(([t, urls]) => `"${t.slice(0, 40)}" — ${urls.length}페이지 중복`),
        ],
        dups.flatMap(([, urls]) => urls),
      );
    },
  },
  {
    id: "meta-description",
    category: "technical",
    label: "Meta Description 적용률",
    description: "각 페이지에 meta description이 있는지 검사합니다.",
    why: "검색 결과 스니펫으로 사용되어 CTR에 직접 영향을 줍니다.",
    aeoImpact: "AI Overviews·챗봇이 페이지 요약을 만들 때 참조하는 1차 텍스트입니다.",
    thresholds: { good: 70, best: 95, unit: "%", source: "Google 검색 센터 — 스니펫 관리 (메타 설명 권장)", sourceUrl: "https://developers.google.com/search/docs/appearance/snippet" },
    weight: 4,
    fix: {
      method: ["누락 페이지에 고유 description 작성 (70~160자)", "페이지 핵심 답변을 요약해 작성"],
      example: '<meta name="description" content="강남역 3번 출구 도보 2분. 보톡스 5만원부터, 당일 예약 가능. 일본어 상담 지원." />',
      difficulty: "low",
      effort: "페이지당 5분",
    },
    aiActions: ["meta-description"],
    evaluate: (ctx) =>
      ratioCheck(TECHNICAL_CHECKS[9], ctx, (p) => !!p.metaDescription, "description 존재", () => "meta description 없음"),
  },
  {
    id: "meta-description-length",
    category: "technical",
    label: "Meta Description 길이",
    description: "description이 70~160자 범위인지 검사합니다.",
    why: "160자 초과는 잘리고, 너무 짧으면 검색엔진이 임의 발췌문으로 대체합니다.",
    aeoImpact: "적정 길이의 요약문은 AI 답변 스니펫으로 그대로 채택되기 쉽습니다.",
    thresholds: { ...P100, source: "Google — 스니펫 길이는 가변이며 표시 한도 기준 실무 관례 70~160자", sourceUrl: "https://developers.google.com/search/docs/appearance/snippet" },
    weight: 2,
    fix: {
      method: ["길이 초과/미달 description 재작성", "핵심 답변 + 차별점 + 행동 유도 순서로 구성"],
      example: "70~160자: 핵심 정보(무엇·어디·비용)를 앞 80자 안에 배치",
      difficulty: "low",
      effort: "페이지당 5분",
    },
    aiActions: ["meta-description"],
    evaluate: (ctx) => {
      const withDesc = okPages(ctx.crawl).filter((p) => p.metaDescription);
      if (withDesc.length === 0) return unmeasured(TECHNICAL_CHECKS[10], "meta description이 있는 페이지가 없어 길이를 측정할 수 없습니다. 먼저 적용률을 개선하세요.");
      return ratioCheck(
        TECHNICAL_CHECKS[10],
        { ...ctx, crawl: { ...ctx.crawl, pages: withDesc } },
        (p) => (p.metaDescription || "").length >= 70 && (p.metaDescription || "").length <= 160,
        "적정 길이(70~160자)",
        (p) => `${(p.metaDescription || "").length}자`,
      );
    },
  },
  {
    id: "meta-description-duplicates",
    category: "technical",
    label: "Description 중복",
    description: "페이지 간 meta description 중복을 검사합니다.",
    why: "중복 설명은 페이지 개별성 신호를 약화시키고 스니펫 품질을 떨어뜨립니다.",
    aeoImpact: "서로 다른 질문에 같은 요약이 반복되면 AI가 페이지 차이를 학습하지 못합니다.",
    thresholds: { ...P100, source: "Google — 페이지별 고유 설명 권장", sourceUrl: "https://developers.google.com/search/docs/appearance/snippet" },
    weight: 2,
    fix: {
      method: ["중복 description을 페이지 내용 기반으로 개별 작성"],
      example: "목록 페이지: 카테고리 요약 / 상세 페이지: 개별 항목 핵심 정보",
      difficulty: "low",
      effort: "페이지당 5분",
    },
    aiActions: ["meta-description"],
    evaluate: (ctx) => {
      const pages = okPages(ctx.crawl).filter((p) => p.metaDescription);
      if (pages.length < 2) return unmeasured(TECHNICAL_CHECKS[11], "description이 있는 페이지가 2개 미만입니다.");
      const seen = new Map<string, string[]>();
      for (const p of pages) seen.set(p.metaDescription!, [...(seen.get(p.metaDescription!) || []), p.finalUrl]);
      const dups = [...seen.entries()].filter(([, urls]) => urls.length > 1);
      const dupPages = dups.reduce((a, [, u]) => a + u.length, 0);
      const score = pct(pages.length - dupPages, pages.length);
      return measured(TECHNICAL_CHECKS[11], score, dups.length ? `중복 ${dups.length}건` : "중복 없음",
        [`${pages.length}페이지 중 고유 description ${seen.size}개`, ...dups.slice(0, 3).map(([d, urls]) => `"${d.slice(0, 40)}…" — ${urls.length}페이지 중복`)],
        dups.flatMap(([, urls]) => urls));
    },
  },
  {
    id: "h1",
    category: "technical",
    label: "H1 단일 사용",
    description: "각 페이지에 H1이 정확히 1개 있는지 검사합니다.",
    why: "H1은 페이지 주제를 선언하는 최상위 구조 신호입니다. 없거나 여러 개면 주제가 불명확해집니다.",
    aeoImpact: "AI는 H1을 페이지의 '질문/주제'로 해석하므로 명확한 단일 H1이 인용 정확도를 높입니다.",
    thresholds: { ...P100, source: "Google 검색 센터 — 제목과 구조의 중요성 (SEO 기본 가이드)", sourceUrl: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" },
    weight: 3,
    fix: {
      method: ["페이지당 H1 1개로 정리", "로고·장식 텍스트의 H1 남용 제거", "H1에 페이지 핵심 키워드 포함"],
      example: "<h1>부산 2박 3일 여행 코스 — 해운대·감천문화마을 일정표</h1>",
      difficulty: "low",
      effort: "템플릿 수정 0.5일",
    },
    aiActions: ["h1"],
    evaluate: (ctx) =>
      ratioCheck(TECHNICAL_CHECKS[12], ctx, (p) => p.h1.length === 1, "H1 1개", (p) => `H1 ${p.h1.length}개`),
  },
  {
    id: "heading-structure",
    category: "technical",
    label: "H2·H3 구조화",
    description: "본문이 H2/H3 소제목으로 구조화되어 있는지 검사합니다.",
    why: "구조화된 제목 계층은 사용자와 검색엔진 모두의 문서 이해도를 높입니다.",
    aeoImpact: "AI는 H2/H3 단위로 콘텐츠를 분해해 답변을 추출합니다. 구조 없는 긴 본문은 인용되기 어렵습니다.",
    thresholds: { ...P100, source: "Google SEO 기본 가이드 — 의미 있는 제목 계층 구성", sourceUrl: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" },
    weight: 2,
    fix: {
      method: ["본문을 주제 단위로 나누고 H2 부여", "세부 항목은 H3로 계층화", "질문형 소제목 활용"],
      example: "<h2>보톡스 시술 시간은 얼마나 걸리나요?</h2>",
      difficulty: "medium",
      effort: "페이지당 20분",
    },
    aiActions: ["h2-structure"],
    evaluate: (ctx) =>
      ratioCheck(
        TECHNICAL_CHECKS[13],
        ctx,
        (p) => p.h2.length >= 2 || p.h2.length + p.h3.length >= 3,
        "소제목 구조 충족(H2 2개 이상)",
        (p) => `H2 ${p.h2.length}개 · H3 ${p.h3.length}개`,
      ),
  },
  {
    id: "image-alt",
    category: "technical",
    label: "이미지 ALT 적용률",
    description: "이미지에 대체 텍스트(alt)가 작성되어 있는지 검사합니다.",
    why: "ALT는 이미지 검색 노출과 접근성의 기본이며, 이미지가 로드되지 않을 때 맥락을 제공합니다.",
    aeoImpact: "AI는 ALT로 이미지 내용을 이해합니다. ALT 없는 이미지는 멀티모달 검색에서 제외됩니다.",
    thresholds: { good: 80, best: 95, unit: "%", source: "Google 이미지 SEO 권장사항 + WCAG 2.1 (1.1.1 텍스트 대안)", sourceUrl: "https://developers.google.com/search/docs/appearance/google-images" },
    weight: 3,
    fix: {
      method: [
        "페이지 주요 키워드와 이미지 내용을 조합한 ALT 작성",
        "동일 ALT 문구 반복 금지",
        "장식용 이미지는 빈 alt=\"\" 사용",
        "일본어 페이지에는 일본어 ALT 작성",
        "의료 이미지는 과장·보장성 표현 제외",
      ],
      example: '<img src="jeju-hallasan.webp" alt="한라산 백록담 정상에서 본 가을 단풍 전경" />',
      difficulty: "medium",
      effort: "이미지 30개당 1시간",
    },
    aiActions: ["image-alt"],
    evaluate: (ctx) => {
      const pages = okPages(ctx.crawl);
      const imgs = pages.flatMap((p) => p.images.map((i) => ({ ...i, page: p.finalUrl })));
      if (imgs.length === 0) return unmeasured(TECHNICAL_CHECKS[14], "크롤한 페이지에서 이미지를 찾지 못했습니다.");
      const missing = imgs.filter((i) => i.alt === null);
      const empty = imgs.filter((i) => i.alt === "");
      const withAlt = imgs.filter((i) => i.alt && i.alt.trim().length > 0);
      const altTexts = new Map<string, number>();
      for (const i of withAlt) altTexts.set(i.alt!, (altTexts.get(i.alt!) || 0) + 1);
      const dupAlt = [...altTexts.entries()].filter(([, c]) => c > 2);
      const score = pct(withAlt.length + empty.length, imgs.length); // 빈 alt는 장식용 의도로 간주
      return measured(
        TECHNICAL_CHECKS[14],
        score,
        `${score}%`,
        [
          `이미지 ${imgs.length}개 중 ALT 작성 ${withAlt.length}개, 빈 ALT(장식용) ${empty.length}개, ALT 속성 없음 ${missing.length}개`,
          ...(dupAlt.length ? [`동일 ALT 3회 이상 반복: ${dupAlt.slice(0, 3).map(([a, c]) => `"${a.slice(0, 25)}" ×${c}`).join(", ")}`] : []),
          ...missing.slice(0, 5).map((i) => `✗ ${shortUrl(i.page)} — ${i.src.split("/").pop()?.slice(0, 40)}`),
        ],
        [...new Set(missing.map((i) => i.page))],
      );
    },
  },
  {
    id: "modern-image-format",
    category: "technical",
    label: "WebP·AVIF 적용률",
    description: "이미지가 차세대 포맷(WebP/AVIF)으로 제공되는지 검사합니다.",
    why: "차세대 포맷은 JPEG 대비 25~50% 작아 LCP 개선에 직접 기여합니다.",
    aeoImpact: "페이지 속도 개선을 통해 크롤 예산·사용자 신호에 간접 기여합니다.",
    thresholds: { good: 50, best: 80, unit: "%", source: "web.dev — 최신 이미지 포맷 제공 권장", sourceUrl: "https://web.dev/articles/serve-images-webp" },
    weight: 1,
    fix: {
      method: ["이미지 파이프라인에서 WebP/AVIF 자동 변환", "Next.js next/image 등 이미지 최적화 컴포넌트 사용"],
      example: "<picture><source type=\"image/avif\" …><source type=\"image/webp\" …><img …></picture>",
      difficulty: "medium",
      effort: "1~2일",
    },
    evaluate: (ctx) => {
      const imgs = okPages(ctx.crawl).flatMap((p) => p.images);
      if (imgs.length === 0) return unmeasured(TECHNICAL_CHECKS[15], "이미지를 찾지 못했습니다.");
      const modern = imgs.filter((i) => /\.(webp|avif)(\?|$)/i.test(i.src) || /image\/(webp|avif)/i.test(i.src) || /(_next\/image|\/cdn-cgi\/image)/i.test(i.src));
      const score = pct(modern.length, imgs.length);
      return measured(TECHNICAL_CHECKS[15], score, `${score}%`, [
        `이미지 ${imgs.length}개 중 차세대 포맷(또는 최적화 프록시) ${modern.length}개`,
      ]);
    },
  },
  {
    id: "internal-links",
    category: "technical",
    label: "내부 링크",
    description: "페이지당 평균 내부 링크 수를 검사합니다.",
    why: "내부 링크는 크롤 경로와 페이지 중요도 신호를 만듭니다. 고립 페이지는 색인·순위가 어렵습니다.",
    aeoImpact: "주제 간 연결(토픽 클러스터)은 AI가 사이트 전문성을 판단하는 근거입니다.",
    thresholds: { ...P100, source: "Google SEO 기본 가이드 — 링크로 사이트 계층 구성", sourceUrl: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" },
    weight: 2,
    fix: {
      method: ["본문 내 관련 페이지 링크 추가 (탐색 메뉴 외 본문 링크)", "허브 페이지 → 상세 페이지 구조 구축"],
      example: "여행 코스 글 → 개별 관광지 상세 페이지로 문맥 링크",
      difficulty: "medium",
      effort: "페이지당 15분",
    },
    aiActions: ["internal-links"],
    evaluate: (ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(TECHNICAL_CHECKS[16], "정상 페이지가 없습니다.");
      const avg = pages.reduce((a, p) => a + p.links.filter((l) => l.internal).length, 0) / pages.length;
      // 페이지당 내부링크: 10개 이상 최적, 5개 이상 양호 기준으로 선형 매핑
      const score = Math.min(100, Math.round((avg / 10) * 90 + (avg >= 10 ? 10 : 0)));
      const low = pages.filter((p) => p.links.filter((l) => l.internal).length < 5);
      return measured(TECHNICAL_CHECKS[16], score, `평균 ${avg.toFixed(1)}개/페이지`, [
        `페이지당 평균 내부 링크 ${avg.toFixed(1)}개 (양호 기준 5개, 최적 기준 10개)`,
        ...low.slice(0, 4).map((p) => `✗ ${shortUrl(p.finalUrl)} — 내부 링크 ${p.links.filter((l) => l.internal).length}개`),
      ], low.map((p) => p.finalUrl));
    },
  },
  {
    id: "broken-links",
    category: "technical",
    label: "깨진 링크",
    description: "링크 대상이 4xx/5xx 또는 무응답인지 샘플 검사합니다.",
    why: "깨진 링크는 사용자 경험과 크롤 효율을 해치고 링크 자산을 낭비합니다.",
    aeoImpact: "깨진 참조가 많은 사이트는 신뢰도 평가에서 불리합니다.",
    thresholds: { good: 90, best: 100, unit: "%", source: "Google — 크롤 오류 최소화 권장 (실무 기준: 깨진 링크 0)", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/http-network-errors" },
    weight: 2,
    fix: {
      method: ["깨진 링크 제거 또는 대체 URL로 수정", "외부 링크 정기 점검 자동화"],
      example: "404 대상 링크 → 최신 URL로 교체 또는 링크 제거",
      difficulty: "low",
      effort: "링크당 5분",
    },
    evaluate: (ctx) => {
      const b = ctx.crawl.brokenLinks;
      if (b.checkedCount === 0) return unmeasured(TECHNICAL_CHECKS[17], "검사할 링크가 없었습니다.");
      const score = pct(b.checkedCount - b.brokenCount, b.checkedCount);
      return measured(TECHNICAL_CHECKS[17], score, b.brokenCount ? `${b.brokenCount}개 깨짐` : "정상", [
        `샘플 ${b.checkedCount}개 링크 검사, ${b.brokenCount}개 오류${b.skipped ? " (전수 검사 아님 — 표본 기준)" : ""}`,
        ...b.broken.slice(0, 5).map((x) => `✗ ${shortUrl(x.url)} — 상태 ${x.status ?? "응답 없음"} (발견: ${shortUrl(x.foundOn)})`),
      ], b.broken.map((x) => x.foundOn));
    },
  },
  {
    id: "redirects",
    category: "technical",
    label: "리다이렉트 체인",
    description: "페이지 도달까지 리다이렉트가 몇 번 발생하는지 검사합니다.",
    why: "2회 이상의 체인은 크롤 지연과 링크 신호 손실을 만듭니다.",
    aeoImpact: "크롤러가 최종 URL 확정에 실패하면 인용 URL이 불안정해집니다.",
    thresholds: { ...P100, source: "Google — 리다이렉트와 검색 (301 체인 최소화 권장)", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/301-redirects" },
    weight: 1,
    fix: {
      method: ["체인 중간 단계 제거 — 최초 URL이 최종 URL로 한 번에 이동", "내부 링크를 최종 URL로 직접 수정"],
      example: "A → B → C 체인을 A → C 단일 301로 정리",
      difficulty: "low",
      effort: "0.5일",
    },
    evaluate: (ctx) => {
      const pages = ctx.crawl.pages.filter((p) => p.status > 0);
      if (pages.length === 0) return unmeasured(TECHNICAL_CHECKS[18], "측정할 페이지가 없습니다.");
      const chained = pages.filter((p) => p.redirectChain.length >= 2);
      const score = pct(pages.length - chained.length, pages.length);
      return measured(TECHNICAL_CHECKS[18], score, chained.length ? `체인 ${chained.length}건` : "정상", [
        `${pages.length}페이지 중 2회 이상 리다이렉트 ${chained.length}건`,
        ...chained.slice(0, 3).map((p) => `✗ ${shortUrl(p.url)} — ${p.redirectChain.join(" ")}`),
      ], chained.map((p) => p.url));
    },
  },
  {
    id: "viewport",
    category: "technical",
    label: "모바일 Viewport",
    description: "반응형 viewport 메타태그가 설정되어 있는지 검사합니다.",
    why: "viewport가 없으면 모바일에서 데스크톱 레이아웃이 축소 표시되며, Google 모바일 우선 색인에 불리합니다.",
    aeoImpact: "모바일 최적화는 AI 검색이 참조하는 페이지 경험 신호의 기본입니다.",
    thresholds: { ...P100, source: "web.dev — 반응형 디자인 기본 (viewport 설정)", sourceUrl: "https://web.dev/articles/responsive-web-design-basics" },
    weight: 3,
    fix: {
      method: ["모든 페이지 head에 viewport 메타태그 추가"],
      example: '<meta name="viewport" content="width=device-width, initial-scale=1" />',
      difficulty: "low",
      effort: "0.5시간",
    },
    evaluate: (ctx) =>
      ratioCheck(TECHNICAL_CHECKS[19], ctx, (p) => !!p.viewport && p.viewport.includes("width"), "viewport 설정", () => "viewport 메타태그 없음"),
  },
  {
    id: "lang-attr",
    category: "technical",
    label: "HTML lang 속성",
    description: "html 태그에 언어 속성이 선언되어 있는지 검사합니다.",
    why: "언어 선언은 검색엔진의 언어 타겟팅과 스크린리더 접근성의 기본입니다.",
    aeoImpact: "AI가 콘텐츠 언어를 정확히 식별해 해당 언어 질의에 매칭합니다.",
    thresholds: { ...P100, source: "W3C i18n — HTML 언어 선언", sourceUrl: "https://www.w3.org/International/questions/qa-html-language-declarations" },
    weight: 1,
    fix: {
      method: ["페이지 언어에 맞는 lang 속성 선언 (ko/ja/en)", "다국어 페이지는 각 언어 버전에 해당 언어 선언"],
      example: '<html lang="ja"> (일본어 페이지)',
      difficulty: "low",
      effort: "0.5시간",
    },
    evaluate: (ctx) =>
      ratioCheck(TECHNICAL_CHECKS[20], ctx, (p) => !!p.langAttr, "lang 선언", () => "lang 속성 없음"),
  },
  {
    id: "og-tags",
    category: "technical",
    label: "Open Graph 태그",
    description: "og:title, og:description, og:image 적용을 검사합니다.",
    why: "SNS·메신저 공유 시 미리보기를 결정하며, 공유 유입 CTR에 직접 영향을 줍니다.",
    aeoImpact: "일부 AI 크롤러는 OG 메타데이터를 페이지 요약 신호로 활용합니다.",
    thresholds: { ...P100, source: "Open Graph Protocol 사양", sourceUrl: "https://ogp.me/" },
    weight: 2,
    fix: {
      method: ["템플릿에 og:title/description/image 추가", "페이지별 대표 이미지 지정 (1200×630 권장)"],
      example: '<meta property="og:image" content="https://example.com/og/tour-busan.jpg" />',
      difficulty: "low",
      effort: "0.5일",
    },
    evaluate: (ctx) =>
      ratioCheck(
        TECHNICAL_CHECKS[21],
        ctx,
        (p) => !!p.ogTags["og:title"] && !!p.ogTags["og:description"] && !!p.ogTags["og:image"],
        "OG 3종(title·description·image) 적용",
        (p) => `누락: ${["og:title", "og:description", "og:image"].filter((k) => !p.ogTags[k]).join(", ")}`,
      ),
  },
  {
    id: "twitter-card",
    category: "technical",
    label: "Twitter Card",
    description: "twitter:card 메타태그 적용을 검사합니다.",
    why: "X(트위터) 공유 미리보기를 제어합니다.",
    aeoImpact: "소셜 신호 노출 확대에 간접 기여합니다.",
    thresholds: { ...P100, source: "X Developer — Cards 마크업", sourceUrl: "https://developer.x.com/en/docs/x-for-websites/cards/overview/markup" },
    weight: 1,
    fix: {
      method: ["twitter:card 메타태그 추가 (summary_large_image 권장)"],
      example: '<meta name="twitter:card" content="summary_large_image" />',
      difficulty: "low",
      effort: "0.5시간",
    },
    evaluate: (ctx) =>
      ratioCheck(TECHNICAL_CHECKS[22], ctx, (p) => !!p.twitterTags["twitter:card"], "twitter:card 적용", () => "twitter:card 없음"),
  },
  {
    id: "hreflang",
    category: "technical",
    label: "hreflang",
    description: "다국어 페이지 간 hreflang 상호 연결을 검사합니다.",
    why: "hreflang이 없으면 일본어 사용자에게 한국어 페이지가 노출되는 등 언어 미스매치가 발생합니다.",
    aeoImpact: "AI 검색이 질의 언어에 맞는 버전을 인용하도록 돕습니다. 다국어 사이트의 핵심 신호입니다.",
    thresholds: { ...P100, source: "Google 검색 센터 — 페이지의 현지화된 버전 알리기", sourceUrl: "https://developers.google.com/search/docs/specialty/international/localized-versions" },
    weight: 3,
    fix: {
      method: ["각 언어 버전에 상호 hreflang 선언 (자기 참조 포함)", "x-default 추가", "ISO 언어코드 사용 (ko, ja, en)"],
      example: '<link rel="alternate" hreflang="ja" href="https://example.com/ja/page" />\n<link rel="alternate" hreflang="x-default" href="https://example.com/" />',
      difficulty: "medium",
      effort: "1일",
    },
    evaluate: (ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(TECHNICAL_CHECKS[23], "정상 페이지가 없습니다.");
      const locales = ctx.crawl.sitemap.localeBreakdown || {};
      const localeKeys = Object.keys(locales).filter((k) => k !== "(root)");
      const startHasLocale = /^\/[a-z]{2}(-[a-z]{2})?\//i.test(new URL(ctx.crawl.startUrl).pathname + "/");
      const multilingual = localeKeys.length > 0 || startHasLocale || pages.some((p) => p.hreflang.length > 0);
      if (!multilingual)
        return unmeasured(TECHNICAL_CHECKS[23], "다국어 구성이 감지되지 않아 해당 없음으로 처리합니다. (언어 경로·hreflang 미발견)");
      const withHreflang = pages.filter((p) => p.hreflang.length >= 2);
      const withXDefault = pages.filter((p) => p.hreflang.some((h) => h.lang.toLowerCase() === "x-default"));
      const score = Math.round(pct(withHreflang.length, pages.length) * 0.8 + pct(withXDefault.length, pages.length) * 0.2);
      return measured(TECHNICAL_CHECKS[23], score, `${pct(withHreflang.length, pages.length)}%`, [
        `다국어 구성 감지 (${localeKeys.length ? `경로: ${localeKeys.join(", ")}` : "hreflang 존재"})`,
        `${pages.length}페이지 중 hreflang 2개 이상 선언 ${withHreflang.length}페이지, x-default 포함 ${withXDefault.length}페이지`,
        ...pages.filter((p) => p.hreflang.length < 2).slice(0, 4).map((p) => `✗ ${shortUrl(p.finalUrl)} — hreflang ${p.hreflang.length}개`),
      ], pages.filter((p) => p.hreflang.length < 2).map((p) => p.finalUrl));
    },
  },
  {
    id: "url-structure",
    category: "technical",
    label: "URL 구조",
    description: "URL이 짧고 읽기 쉬운 구조인지(파라미터·언더스코어·대문자·과도한 길이) 검사합니다.",
    why: "설명적인 URL은 CTR과 공유성에 유리하고, 파라미터 남용은 중복 색인을 만듭니다.",
    aeoImpact: "AI가 URL 경로에서 콘텐츠 주제를 추론합니다.",
    thresholds: { ...P100, source: "Google — 간단한 URL 구조 유지 권장", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/url-structure" },
    weight: 1,
    fix: {
      method: ["언더스코어 대신 하이픈", "불필요한 쿼리 파라미터 제거", "100자 이내 소문자 경로"],
      example: "/ja/tour/busan-2day-course (권장) vs /page?id=1234&cat=7 (지양)",
      difficulty: "medium",
      effort: "리라이트 규칙 1일",
    },
    evaluate: (ctx) =>
      ratioCheck(
        TECHNICAL_CHECKS[24],
        ctx,
        (p) => {
          try {
            const u = new URL(p.finalUrl);
            return !u.search && !u.pathname.includes("_") && u.pathname === u.pathname.toLowerCase() && u.href.length <= 110;
          } catch {
            return false;
          }
        },
        "권장 URL 구조",
        (p) => {
          try {
            const u = new URL(p.finalUrl);
            const issues = [u.search && "쿼리 파라미터", u.pathname.includes("_") && "언더스코어", u.pathname !== u.pathname.toLowerCase() && "대문자", u.href.length > 110 && "길이 초과"].filter(Boolean);
            return issues.join(", ") || "구조 확인 필요";
          } catch {
            return "URL 파싱 불가";
          }
        },
      ),
  },
  {
    id: "crawlability",
    category: "technical",
    label: "크롤 가능 여부",
    description: "robots.txt가 주요 페이지 크롤을 차단하지 않는지 검사합니다.",
    why: "차단된 페이지는 검색엔진이 내용을 읽지 못해 노출이 불가능합니다.",
    aeoImpact: "AI 크롤러 접근이 차단되면 생성형 검색 인용이 원천적으로 불가능합니다.",
    thresholds: { ...P100, source: "Google — robots.txt 규칙 작성", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing/robots/create-robots-txt" },
    weight: 3,
    fix: {
      method: ["의도치 않게 차단된 경로의 Disallow 규칙 제거", "관리자·검색결과 페이지 등만 선별 차단"],
      example: "Disallow: /admin/ (선별 차단은 유지, 콘텐츠 경로 차단은 제거)",
      difficulty: "low",
      effort: "0.5시간",
    },
    evaluate: (ctx) => {
      const blocked = ctx.crawl.pagesBlockedByRobots;
      const attempted = ctx.crawl.pagesAttempted + blocked.length;
      if (attempted === 0) return unmeasured(TECHNICAL_CHECKS[25], "측정할 페이지가 없습니다.");
      const score = pct(attempted - blocked.length, attempted);
      return measured(TECHNICAL_CHECKS[25], score, blocked.length ? `${blocked.length}건 차단` : "정상", [
        blocked.length
          ? `robots.txt가 크롤 대상 ${blocked.length}개 URL을 차단`
          : `크롤 대상 ${attempted}개 URL 모두 크롤 허용`,
        ...blocked.slice(0, 5).map((u) => `✗ ${shortUrl(u)}`),
      ], blocked);
    },
  },
  {
    id: "indexability",
    category: "technical",
    label: "색인 가능 여부",
    description: "상태 200 + noindex 없음 + canonical 자기참조 조건을 종합해 색인 가능성을 검사합니다.",
    why: "세 조건 중 하나라도 어긋나면 해당 페이지는 색인되지 않거나 다른 URL로 통합됩니다.",
    aeoImpact: "색인 불가 페이지는 모든 검색·AI 노출의 출발점에서 배제됩니다.",
    thresholds: { ...P100, source: "Google — 색인 생성 관리 종합 가이드", sourceUrl: "https://developers.google.com/search/docs/crawling-indexing" },
    weight: 4,
    fix: {
      method: ["오류 상태코드 수정", "noindex 제거", "canonical이 다른 URL을 가리키는 경우 의도 확인"],
      example: "색인 원하는 페이지: 200 + robots meta 없음(또는 index) + self canonical",
      difficulty: "medium",
      effort: "페이지당 15분",
    },
    evaluate: (ctx) => {
      const pages = ctx.crawl.pages.filter((p) => !p.error);
      if (pages.length === 0) return unmeasured(TECHNICAL_CHECKS[26], "측정할 페이지가 없습니다.");
      const indexable = pages.filter((p) => {
        if (p.status !== 200) return false;
        if ((p.metaRobots || "").toLowerCase().includes("noindex")) return false;
        if (p.canonical) {
          try {
            const c = new URL(p.canonical, p.finalUrl).href.replace(/\/$/, "");
            const f = p.finalUrl.replace(/\/$/, "");
            if (c !== f) return false;
          } catch {
            /* canonical 파싱 불가 시 무시 */
          }
        }
        return true;
      });
      const notIdx = pages.filter((p) => !indexable.includes(p));
      const score = pct(indexable.length, pages.length);
      return measured(TECHNICAL_CHECKS[26], score, `${score}%`, [
        `${pages.length}페이지 중 색인 가능 ${indexable.length}페이지`,
        ...notIdx.slice(0, 5).map((p) => {
          const reason = p.status !== 200 ? `상태 ${p.status}` : (p.metaRobots || "").includes("noindex") ? "noindex" : "canonical이 다른 URL 지정";
          return `✗ ${shortUrl(p.finalUrl)} — ${reason}`;
        }),
      ], notIdx.map((p) => p.finalUrl));
    },
  },
  {
    id: "page-depth",
    category: "technical",
    label: "페이지 깊이",
    description: "사이트맵 URL의 경로 깊이 분포를 검사합니다 (클릭 깊이의 근사치).",
    why: "루트에서 3~4단계를 넘는 깊은 페이지는 크롤 빈도와 링크 신호가 급감합니다.",
    aeoImpact: "얕은 구조는 AI 크롤러의 콘텐츠 수집 완성도를 높입니다.",
    thresholds: { ...P100, source: "실무 기준 — 주요 콘텐츠는 3클릭 이내 도달 권장 (크롤 효율)", sourceUrl: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide" },
    weight: 1,
    fix: {
      method: ["주요 콘텐츠를 3단계 이내로 재배치", "허브 페이지에서 심층 페이지로 직접 링크"],
      example: "/ja/spots/haeundae (3단계) 권장 — /ja/area/busan/beach/spots/haeundae (5단계) 지양",
      difficulty: "high",
      effort: "IA 재설계 3일+",
    },
    evaluate: (ctx) => {
      const urls = ctx.crawl.sitemap.sampleUrls.length
        ? ctx.crawl.sitemap.sampleUrls
        : okPages(ctx.crawl).map((p) => p.finalUrl);
      if (urls.length === 0) return unmeasured(TECHNICAL_CHECKS[27], "URL 표본이 없습니다.");
      const depths = urls.map((u) => {
        try {
          return new URL(u).pathname.split("/").filter(Boolean).length;
        } catch {
          return 0;
        }
      });
      const shallow = depths.filter((d) => d <= 4).length;
      const maxDepth = Math.max(...depths);
      const score = pct(shallow, depths.length);
      return measured(TECHNICAL_CHECKS[27], score, `최대 ${maxDepth}단계`, [
        `URL 표본 ${depths.length}개 중 4단계 이내 ${shallow}개 (${score}%), 최대 깊이 ${maxDepth}단계`,
      ]);
    },
  },
];

/** self 참조 문제를 피하기 위한 id 기반 재바인딩 */
for (const spec of TECHNICAL_CHECKS) {
  const original = spec.evaluate;
  spec.evaluate = (ctx): CheckResult => {
    const r = original(ctx);
    return { ...r, checkId: spec.id };
  };
}
