/** 병원 전용 · 관광 전용 검사 항목 */

import {
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

/* ───────── 병원 전용 ───────── */

export const HOSPITAL_CHECKS: CheckSpec[] = [
  make(
    {
      id: "medical-org-schema",
      category: "hospital",
      label: "MedicalOrganization Schema",
      description: "의료기관 schema 선언 여부를 검사합니다.",
      why: "의료기관임을 기계가 읽을 수 있게 선언해야 로컬·의료 검색에서 정확히 분류됩니다.",
      aeoImpact: "AI가 '병원'으로 확정 인식해야 진료과·위치 기반 추천에 포함됩니다.",
      thresholds: { ...P100, source: "schema.org MedicalOrganization", sourceUrl: "https://schema.org/MedicalOrganization" },
      weight: 4,
      fix: {
        method: ["레이아웃에 MedicalOrganization schema 추가 (name·address·telephone·medicalSpecialty)"],
        example: '{"@type":"MedicalOrganization","name":"○○의원","medicalSpecialty":"Dermatology","address":{…},"telephone":"+82-2-…"}',
        difficulty: "low",
        effort: "0.5일",
      },
      aiActions: ["json-ld"],
      siteTypes: ["hospital"],
    },
    (def, ctx) => {
      const nodes = findSchemaNodes(ctx.crawl, ["MedicalOrganization", "MedicalClinic", "Hospital", "Dentist", "Physician"]);
      return measured(def, nodes.length > 0 ? 100 : 0, nodes.length ? "선언됨" : "미선언", [
        nodes.length
          ? `의료기관 계열 schema ${nodes.length}건: ${[...new Set(nodes.map((n) => n.type))].join(", ")}`
          : "MedicalOrganization/Physician 등 의료 schema를 찾지 못했습니다.",
      ], nodes.length ? [] : okPages(ctx.crawl).slice(0, 3).map((p) => p.finalUrl));
    },
  ),
  make(
    {
      id: "physician-schema",
      category: "hospital",
      label: "Physician(의료진) Schema",
      description: "의료진 개인 schema 선언 여부를 검사합니다.",
      why: "의료진 정보의 구조화는 의료 YMYL 신뢰도의 핵심입니다.",
      aeoImpact: "'○○ 전문의' 검색·추천에서 의료진 단위 인용이 가능해집니다.",
      thresholds: { ...P100, source: "schema.org Physician", sourceUrl: "https://schema.org/Physician" },
      weight: 3,
      fix: {
        method: ["의료진 소개 페이지에 Physician schema (name·medicalSpecialty·worksFor)"],
        example: '{"@type":"Physician","name":"홍길동","medicalSpecialty":"PlasticSurgery","worksFor":{"@type":"MedicalOrganization",…}}',
        difficulty: "low",
        effort: "의료진당 30분",
      },
      aiActions: ["json-ld"],
      siteTypes: ["hospital"],
    },
    (def, ctx) => {
      const nodes = findSchemaNodes(ctx.crawl, ["Physician"]);
      return measured(def, nodes.length > 0 ? 100 : 0, nodes.length ? `${nodes.length}건` : "미선언", [
        nodes.length ? `Physician schema ${nodes.length}건 발견` : "Physician schema를 찾지 못했습니다.",
      ]);
    },
  ),
  make(
    {
      id: "staff-introduction",
      category: "hospital",
      label: "의료진·원장 소개",
      description: "의료진/원장 약력·학회·논문 등 소개 콘텐츠가 있는지 검사합니다.",
      why: "누가 진료하는지에 대한 상세 정보는 의료 사이트 E-E-A-T의 최우선 요소입니다.",
      aeoImpact: "AI는 의료 정보 인용 시 의료진 실명·자격 명시 콘텐츠를 우선합니다.",
      thresholds: { ...P100, source: "Google 품질 가이드라인 — YMYL·E-E-A-T", sourceUrl: "https://developers.google.com/search/docs/fundamentals/creating-helpful-content" },
      weight: 4,
      fix: {
        method: ["의료진별 페이지: 약력·학력·학회 활동·논문·전문 분야", "원장 인사말에 실명·경력 명시"],
        example: "홍길동 원장 — 피부과 전문의 / ○○대 의대 / 대한피부과학회 정회원 / SCI 논문 ○편",
        difficulty: "medium",
        effort: "2일",
      },
      siteTypes: ["hospital"],
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(def, "정상 페이지가 없습니다.");
      const found = pages.filter((p) => p.patterns.medicalStaff.count >= 3);
      const partial = pages.filter((p) => p.patterns.medicalStaff.matched);
      const score = found.length > 0 ? Math.min(100, 75 + pct(found.length, pages.length) / 4) : partial.length > 0 ? 50 : 0;
      return measured(def, score, found.length ? "발견" : partial.length ? "일부" : "미발견", [
        `의료진 관련 표현(원장·전문의·약력·학회 등) 밀도 높은 페이지 ${found.length}개, 일부 언급 ${partial.length}개`,
        ...found.slice(0, 3).flatMap((p) => p.patterns.medicalStaff.samples.slice(0, 1).map((s) => `${shortUrl(p.finalUrl)} — "${s.slice(0, 60)}"`)),
      ], found.length === 0 ? pages.map((p) => p.finalUrl) : []);
    },
  ),
  make(
    {
      id: "hospital-nap",
      category: "hospital",
      label: "병원 NAP (주소·전화·진료시간)",
      description: "주소·전화번호·진료시간 3요소가 텍스트로 확인되는지 검사합니다.",
      why: "로컬 검색(지역+진료과)의 기본 매칭 요소입니다.",
      aeoImpact: "'○○역 피부과 진료시간' 류 질의의 직접 답변 소스입니다.",
      thresholds: { ...P100, source: "로컬 SEO 표준 — NAP 일관성", sourceUrl: undefined },
      weight: 4,
      fix: {
        method: ["푸터·오시는길에 주소/전화/진료시간 텍스트 명시", "tel: 링크 적용", "일본어 페이지에 일본어 표기 병행"],
        example: "진료시간: 평일 10:00~19:00 / 토 10:00~14:00 · 02-000-0000 · 서울 강남구 …",
        difficulty: "low",
        effort: "0.5일",
      },
      siteTypes: ["hospital"],
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(def, "정상 페이지가 없습니다.");
      const has = {
        address: pages.some((p) => p.patterns.address.matched),
        phone: pages.some((p) => p.patterns.phone.matched),
        hours: pages.some((p) => p.patterns.businessHours.matched),
      };
      const count = Object.values(has).filter(Boolean).length;
      const score = Math.round((count / 3) * 100);
      return measured(def, score, `${count}/3 확인`, [
        `주소 ${has.address ? "✓" : "✗"} · 전화 ${has.phone ? "✓" : "✗"} · 진료시간 ${has.hours ? "✓" : "✗"} (크롤 표본 기준)`,
      ]);
    },
  ),
  make(
    {
      id: "treatment-pages",
      category: "hospital",
      label: "진료과목·시술 랜딩페이지",
      description: "시술·진료 상세 페이지 규모를 사이트맵 기준으로 검사합니다.",
      why: "시술별 전용 페이지가 있어야 '시술명+지역' 롱테일 검색을 흡수합니다.",
      aeoImpact: "시술별 상세 정보(원리·시간·주의사항)는 AI 상담형 질의의 인용 단위입니다.",
      thresholds: { ...P100, source: "의료 SEO 실무 표준 — 시술 단위 랜딩", sourceUrl: undefined },
      weight: 3,
      fix: {
        method: ["주요 시술마다 전용 페이지: 원리·시술시간·회복기간·권장/비권장 대상·부작용·가격·FAQ"],
        example: "/treatment/botox, /treatment/filler, /ja/treatment/botox …",
        difficulty: "high",
        effort: "시술당 1일",
      },
      aiActions: ["content-brief"],
      siteTypes: ["hospital"],
    },
    (def, ctx) => {
      const urls = ctx.crawl.sitemap.sampleUrls;
      if (urls.length === 0) return unmeasured(def, "사이트맵이 없어 페이지 구성을 측정할 수 없습니다.");
      const treatment = urls.filter((u) => /(시술|진료|treatment|clinic|procedure|botox|filler|lifting|skin|dental|implant|surgery)/i.test(u));
      const score = Math.min(100, treatment.length * 12);
      return measured(def, score, `${treatment.length}개 감지`, [
        `사이트맵 표본 ${urls.length}개 중 시술·진료 관련 URL ${treatment.length}개`,
        ...treatment.slice(0, 4).map((u) => `· ${shortUrl(u)}`),
        "기준: 시술 URL 6개 이상 양호, 8개 이상 최적 (표본 기준)",
      ]);
    },
  ),
  make(
    {
      id: "side-effects-info",
      category: "hospital",
      label: "부작용·주의사항 안내",
      description: "부작용·주의사항·회복기간 안내가 있는지 검사합니다.",
      why: "균형 잡힌 의료 정보 제공은 의료법 취지에 부합하고 신뢰도를 높입니다.",
      aeoImpact: "AI는 장점만 나열한 의료 콘텐츠보다 리스크를 함께 다루는 콘텐츠를 신뢰합니다.",
      thresholds: { ...P100, source: "의료 콘텐츠 품질 기준 — 리스크 고지 (YMYL)", sourceUrl: undefined },
      weight: 3,
      fix: {
        method: ["시술 페이지마다 부작용·주의사항·회복기간 섹션 추가", "발생 가능 증상과 대처법 명시"],
        example: "시술 후 2~3일간 붓기가 있을 수 있으며, 심한 통증 시 내원이 필요합니다.",
        difficulty: "medium",
        effort: "페이지당 1시간",
      },
      siteTypes: ["hospital"],
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => p.patterns.sideEffects.matched, "부작용·주의사항 언급", () => "부작용·주의사항·회복기간 안내 없음"),
  ),
  make(
    {
      id: "medical-ad-expressions",
      category: "hospital",
      label: "의료광고 검토 필요 표현",
      description: "과장·보장성 표현(100%, 완치, 부작용 없음, 최고 등)을 탐지합니다. 법률 판단이 아닌 '검토 필요' 표시입니다.",
      why: "의료광고 심의 기준상 문제가 될 수 있는 표현은 사전 검토가 필요합니다.",
      aeoImpact: "과장 표현은 AI 신뢰도 평가에서도 감점 요인으로 작용합니다.",
      thresholds: { good: 70, best: 95, unit: "%", source: "의료법 제56조(의료광고 금지 유형) 취지 기반 키워드 탐지 — 자동 법률 판단 아님", sourceUrl: "https://www.law.go.kr/법령/의료법/제56조" },
      weight: 3,
      fix: {
        method: ["⚠ 탐지된 표현은 '검토 필요'입니다 — 의료광고 심의 담당자/전문가 확인 필수", "치료 효과 보장·비교 우위 표현을 사실 서술로 교체"],
        example: "'100% 만족' → '시술 결과는 개인에 따라 다를 수 있습니다'",
        difficulty: "low",
        effort: "표현당 10분 + 심의 검토",
      },
      siteTypes: ["hospital"],
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(def, "정상 페이지가 없습니다.");
      const flagged = pages.filter((p) => p.patterns.medicalRiskExpressions.matched);
      const totalHits = pages.reduce((a, p) => a + p.patterns.medicalRiskExpressions.count, 0);
      const score = pct(pages.length - flagged.length, pages.length);
      return measured(def, score, flagged.length ? `검토 필요 ${totalHits}건` : "미탐지", [
        flagged.length
          ? `과장·보장성 의심 표현 ${totalHits}건 (${flagged.length}페이지) — 자동 법률 판단이 아닌 검토 필요 표시입니다`
          : "과장·보장성 의심 표현이 탐지되지 않았습니다 (키워드 기반 표본 검사)",
        ...flagged.slice(0, 4).flatMap((p) => p.patterns.medicalRiskExpressions.samples.slice(0, 2).map((s) => `⚠ ${shortUrl(p.finalUrl)} — "…${s.slice(0, 50)}…"`)),
      ], flagged.map((p) => p.finalUrl));
    },
  ),
  make(
    {
      id: "hospital-multilingual",
      category: "hospital",
      label: "외국인 환자 다국어 대응",
      description: "일본어·영어 페이지와 다국어 예약 동선을 검사합니다.",
      why: "외국인 환자 유치는 다국어 페이지 없이는 검색 단계에서 차단됩니다.",
      aeoImpact: "일본어 질의('江南 皮膚科')에 인용되려면 일본어 콘텐츠가 필수입니다.",
      thresholds: { ...P100, source: "다국어 SEO 표준 (hreflang + 현지어 콘텐츠)", sourceUrl: "https://developers.google.com/search/docs/specialty/international/localized-versions" },
      weight: 3,
      fix: {
        method: ["일본어·영어 랜딩 및 예약 페이지 구축", "hreflang 연결", "외국어 상담 채널(LINE 등) 안내"],
        example: "/ja/ 디렉터리 + LINE 상담 + 日本語対応 표기",
        difficulty: "high",
        effort: "2주+",
      },
      aiActions: ["japanese-seo", "english-seo"],
      siteTypes: ["hospital"],
    },
    (def, ctx) => {
      const locales = Object.keys(ctx.crawl.sitemap.localeBreakdown || {}).filter((k) => k !== "(root)");
      const hreflangs = new Set(okPages(ctx.crawl).flatMap((p) => p.hreflang.map((h) => h.lang.toLowerCase().slice(0, 2))));
      const hasJa = locales.includes("ja") || hreflangs.has("ja");
      const hasEn = locales.includes("en") || hreflangs.has("en");
      const score = (hasJa ? 50 : 0) + (hasEn ? 50 : 0);
      return measured(def, score, [hasJa && "일본어", hasEn && "영어"].filter(Boolean).join("·") || "미구축", [
        `일본어 페이지 ${hasJa ? "감지" : "미감지"} · 영어 페이지 ${hasEn ? "감지" : "미감지"} (사이트맵 경로·hreflang 기준)`,
      ]);
    },
  ),
  make(
    {
      id: "medical-content-dates",
      category: "hospital",
      label: "의료 콘텐츠 수정일",
      description: "의료 정보 페이지의 작성·수정일 표기를 검사합니다.",
      why: "의료 정보의 시점 명시는 YMYL 신뢰도 필수 요소입니다.",
      aeoImpact: "AI는 시점이 명시된 의료 정보를 우선 인용합니다.",
      thresholds: { ...P100, source: "Google — YMYL 콘텐츠 최신성 관행", sourceUrl: "https://developers.google.com/search/docs/appearance/publication-dates" },
      weight: 2,
      fix: {
        method: ["의료 콘텐츠에 작성일·최종 검수일 표기", "의료진 감수 표기와 병행"],
        example: "작성 2026.05 · 최종 검수 2026.07 (홍길동 전문의)",
        difficulty: "low",
        effort: "템플릿 0.5일",
      },
      siteTypes: ["hospital"],
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => p.patterns.visibleDates.matched, "날짜 표기", () => "작성·수정일 표기 없음"),
  ),
  make(
    {
      id: "gbp-connection",
      category: "hospital",
      label: "Google Business Profile",
      description: "Google 비즈니스 프로필 연동 상태입니다.",
      why: "지도·로컬 팩 노출의 핵심 채널입니다.",
      aeoImpact: "AI 로컬 추천은 GBP 데이터를 주요 소스로 사용합니다.",
      thresholds: { ...P100, source: "Google Business Profile API 연동 필요", sourceUrl: "https://developers.google.com/my-business" },
      weight: 2,
      fix: {
        method: ["GBP 등록·인증 후 API 연동", "리뷰·사진·진료시간 관리"],
        example: "Business Profile API 연동 → 리뷰 수·평점 자동 수집",
        difficulty: "medium",
        effort: "API 연동 1일",
      },
      siteTypes: ["hospital"],
    },
    (def) => notConnected(def, "Google Business Profile API가 연결되지 않았습니다. 설정에서 연동 후 리뷰·평점·노출 데이터가 표시됩니다."),
  ),
  make(
    {
      id: "naver-place",
      category: "hospital",
      label: "네이버 플레이스",
      description: "네이버 플레이스 연동 상태입니다.",
      why: "국내 환자 유입의 주요 채널입니다.",
      aeoImpact: "국내 AI 검색(네이버 Cue: 등)의 로컬 데이터 소스입니다.",
      thresholds: { ...P100, source: "네이버 API 연동 필요", sourceUrl: undefined },
      weight: 1,
      fix: {
        method: ["네이버 플레이스 등록 확인 후 데이터 연동"],
        example: "스마트플레이스 관리 → 예약·리뷰 데이터",
        difficulty: "medium",
        effort: "1일",
      },
      siteTypes: ["hospital"],
    },
    (def) => notConnected(def, "네이버 플레이스 데이터가 연결되지 않았습니다."),
  ),
];

/* ───────── 관광 전용 ───────── */

export const TOURISM_CHECKS: CheckSpec[] = [
  make(
    {
      id: "tourist-schema",
      category: "tourism",
      label: "TouristAttraction·Place Schema",
      description: "관광지·장소 schema 선언 여부를 검사합니다.",
      why: "장소 정보의 구조화는 여행 검색·지도 노출의 기본입니다.",
      aeoImpact: "AI 여행 플래너가 장소를 정확히 인식·추천하는 근거가 됩니다.",
      thresholds: { ...P100, source: "schema.org TouristAttraction", sourceUrl: "https://schema.org/TouristAttraction" },
      weight: 4,
      fix: {
        method: ["관광지 상세 페이지에 TouristAttraction schema (name·address·geo·openingHours)"],
        example: '{"@type":"TouristAttraction","name":"감천문화마을","address":{…},"geo":{"latitude":35.09,"longitude":129.01}}',
        difficulty: "medium",
        effort: "템플릿 1일",
      },
      aiActions: ["json-ld"],
      siteTypes: ["tourism"],
    },
    (def, ctx) => {
      const nodes = findSchemaNodes(ctx.crawl, ["TouristAttraction", "TouristDestination", "Place", "LandmarksOrHistoricalBuildings"]);
      return measured(def, nodes.length > 0 ? Math.min(100, 75 + nodes.length * 5) : 0, nodes.length ? `${nodes.length}건` : "미선언", [
        nodes.length ? `장소 계열 schema ${nodes.length}건: ${[...new Set(nodes.map((n) => n.type))].join(", ")}` : "TouristAttraction/Place schema를 찾지 못했습니다.",
      ]);
    },
  ),
  make(
    {
      id: "event-restaurant-schema",
      category: "tourism",
      label: "Event·Restaurant Schema",
      description: "이벤트·맛집 schema 선언 여부를 검사합니다.",
      why: "축제·이벤트·맛집은 리치 결과(일정·별점) 노출이 가능한 타입입니다.",
      aeoImpact: "'이번 주말 축제' 류 시의성 질의의 인용 소스가 됩니다.",
      thresholds: { ...P100, source: "Google 리치결과 — Event 구조화데이터", sourceUrl: "https://developers.google.com/search/docs/appearance/structured-data/event" },
      weight: 2,
      fix: {
        method: ["축제·이벤트 페이지에 Event schema (name·startDate·location)", "맛집 페이지에 Restaurant schema"],
        example: '{"@type":"Event","name":"부산불꽃축제","startDate":"2026-11-01","location":{…}}',
        difficulty: "medium",
        effort: "템플릿 1일",
      },
      aiActions: ["json-ld"],
      siteTypes: ["tourism"],
    },
    (def, ctx) => {
      const nodes = findSchemaNodes(ctx.crawl, ["Event", "Festival", "Restaurant", "FoodEstablishment"]);
      return measured(def, nodes.length > 0 ? 100 : 0, nodes.length ? `${nodes.length}건` : "미선언", [
        nodes.length ? `Event/Restaurant 계열 ${nodes.length}건 발견` : "Event·Restaurant schema를 찾지 못했습니다.",
      ]);
    },
  ),
  make(
    {
      id: "place-details",
      category: "tourism",
      label: "장소 상세정보 완성도",
      description: "운영시간·입장료·주소·교통 4요소의 페이지 커버리지를 검사합니다.",
      why: "방문 결정에 필요한 실용 정보 4종은 관광 콘텐츠의 완성도 기준입니다.",
      aeoImpact: "AI 여행 답변은 '시간·요금·위치·가는법'을 한 번에 요구합니다. 4요소가 갖춰진 페이지가 인용됩니다.",
      thresholds: { ...P100, source: "관광 콘텐츠 실무 표준 — 방문 정보 4요소", sourceUrl: undefined },
      weight: 4,
      fix: {
        method: ["장소 페이지마다 정보 박스: 운영시간·요금·주소·교통", "표 형태 권장 + 최신 확인일 표기"],
        example: "운영시간 09:00~18:00 / 입장료 무료 / 주소 부산 사하구… / 지하철 1호선 괴정역",
        difficulty: "medium",
        effort: "페이지당 30분",
      },
      siteTypes: ["tourism"],
    },
    (def, ctx) => {
      const pages = okPages(ctx.crawl);
      if (pages.length === 0) return unmeasured(def, "정상 페이지가 없습니다.");
      const scorePage = (p: (typeof pages)[number]) =>
        [p.patterns.businessHours.matched, p.patterns.admission.matched || p.patterns.price.matched, p.patterns.address.matched, p.patterns.transport.matched].filter(Boolean).length;
      const avg = pages.reduce((a, p) => a + scorePage(p), 0) / pages.length;
      const score = Math.round((avg / 4) * 100);
      const weak = pages.filter((p) => scorePage(p) <= 1);
      return measured(def, score, `평균 ${avg.toFixed(1)}/4 요소`, [
        `페이지당 평균 ${avg.toFixed(1)}개 요소 확인 (운영시간·요금·주소·교통)`,
        ...weak.slice(0, 4).map((p) => `✗ ${shortUrl(p.finalUrl)} — ${scorePage(p)}/4 요소`),
      ], weak.map((p) => p.finalUrl));
    },
  ),
  make(
    {
      id: "map-integration",
      category: "tourism",
      label: "지도 연결",
      description: "Google Maps 등 지도 링크·임베드 존재를 검사합니다.",
      why: "지도 연결은 방문 전환의 마지막 단계입니다.",
      aeoImpact: "AI가 위치 좌표·지도 링크를 함께 제공할 수 있게 합니다.",
      thresholds: { ...P100, source: "관광 UX 실무 표준", sourceUrl: undefined },
      weight: 2,
      fix: {
        method: ["장소 페이지에 Google Maps 링크 또는 임베드 추가", "Schema geo 좌표 병행"],
        example: '<a href="https://maps.app.goo.gl/…">Google Maps로 보기</a>',
        difficulty: "low",
        effort: "페이지당 10분",
      },
      siteTypes: ["tourism"],
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => p.patterns.mapEmbed.matched, "지도 연결", () => "지도 링크·임베드 없음"),
  ),
  make(
    {
      id: "tourism-multilingual",
      category: "tourism",
      label: "다국어 구성 (일본어·영어)",
      description: "일본어·영어 버전과 hreflang 연결을 검사합니다.",
      why: "방한 관광의 주력 시장(일본·영어권) 검색 대응의 기본입니다.",
      aeoImpact: "일본어 질의는 일본어 페이지만 인용됩니다. 언어별 콘텐츠가 곧 인용 자격입니다.",
      thresholds: { ...P100, source: "Google — 다국어 사이트 관리", sourceUrl: "https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites" },
      weight: 4,
      fix: {
        method: ["ja/en 디렉터리 구축", "hreflang 상호 연결", "기계번역 그대로 게시 지양 — 현지어 검색어 기반 리라이트"],
        example: "/ja/spots/gamcheon + hreflang ko↔ja↔en↔x-default",
        difficulty: "high",
        effort: "언어당 2주+",
      },
      aiActions: ["japanese-seo", "english-seo"],
      siteTypes: ["tourism"],
    },
    (def, ctx) => {
      const locales = Object.keys(ctx.crawl.sitemap.localeBreakdown || {}).filter((k) => k !== "(root)");
      const hreflangs = new Set(okPages(ctx.crawl).flatMap((p) => p.hreflang.map((h) => h.lang.toLowerCase().slice(0, 2))));
      const hasJa = locales.includes("ja") || hreflangs.has("ja");
      const hasEn = locales.includes("en") || hreflangs.has("en");
      const hreflangOk = okPages(ctx.crawl).some((p) => p.hreflang.length >= 2);
      const score = (hasJa ? 40 : 0) + (hasEn ? 30 : 0) + (hreflangOk ? 30 : 0);
      return measured(def, score, [hasJa && "ja", hasEn && "en", hreflangOk && "hreflang"].filter(Boolean).join("·") || "미구축", [
        `일본어 ${hasJa ? "✓" : "✗"} · 영어 ${hasEn ? "✓" : "✗"} · hreflang 연결 ${hreflangOk ? "✓" : "✗"}`,
        `사이트맵 언어 경로: ${locales.join(", ") || "없음"}`,
      ]);
    },
  ),
  make(
    {
      id: "seasonal-content",
      category: "tourism",
      label: "계절·이벤트 콘텐츠",
      description: "계절·축제·이벤트 관련 콘텐츠가 있는지 검사합니다.",
      why: "시즌 콘텐츠는 검색 수요가 몰리는 시기의 트래픽을 흡수합니다.",
      aeoImpact: "'봄 벚꽃 명소' 류 시즌 질의의 인용 소스입니다.",
      thresholds: { ...P100, source: "관광 콘텐츠 실무 표준", sourceUrl: undefined },
      weight: 2,
      fix: {
        method: ["계절별 추천·축제 일정 콘텐츠 발행", "매년 갱신 (연도 표기)"],
        example: "2026 부산 벚꽃 명소 5곳 — 개화 시기·명당 위치",
        difficulty: "medium",
        effort: "시즌당 2일",
      },
      aiActions: ["content-brief"],
      siteTypes: ["tourism"],
    },
    (def, ctx) =>
      ratioCheck(def, ctx, (p) => p.patterns.seasonal.matched, "계절·이벤트 요소", () => "계절·축제·이벤트 콘텐츠 미발견"),
  ),
  make(
    {
      id: "itinerary-content",
      category: "tourism",
      label: "일정·코스 콘텐츠",
      description: "여행 일정·코스형 콘텐츠(단계 구조)를 검사합니다.",
      why: "코스 콘텐츠는 체류시간이 길고 내부 링크 허브 역할을 합니다.",
      aeoImpact: "AI 여행 플래너 질의('2박3일 코스 짜줘')의 최우선 인용 대상입니다.",
      thresholds: { ...P100, source: "관광 콘텐츠 실무 표준 — 일정형 콘텐츠", sourceUrl: undefined },
      weight: 3,
      fix: {
        method: ["일차별 일정 구조(오전/오후/저녁)로 코스 콘텐츠 작성", "각 장소는 상세 페이지로 링크", "ItemList schema 적용"],
        example: "1일차: 해운대(오전) → 광안리(오후) → 밀면(저녁)",
        difficulty: "medium",
        effort: "코스당 1일",
      },
      aiActions: ["content-brief", "json-ld"],
      siteTypes: ["tourism"],
    },
    (def, ctx) => {
      const urls = ctx.crawl.sitemap.sampleUrls;
      const coursePages = okPages(ctx.crawl).filter((p) => p.patterns.steps.matched && p.orderedListCount >= 1);
      const courseUrls = urls.filter((u) => /(course|itinerary|일정|코스|plan|day)/i.test(u));
      const found = coursePages.length + courseUrls.length;
      const score = Math.min(100, found * 25);
      return measured(def, score, found ? `${found}개 감지` : "미발견", [
        `코스형 구조 페이지 ${coursePages.length}개, 코스 관련 URL ${courseUrls.length}개`,
        ...courseUrls.slice(0, 3).map((u) => `· ${shortUrl(u)}`),
      ]);
    },
  ),
  make(
    {
      id: "regional-landing",
      category: "tourism",
      label: "지역·도시별 랜딩 구성",
      description: "지역 단위 랜딩페이지 구성을 사이트맵 경로 다양성으로 검사합니다.",
      why: "'도시+여행' 검색을 흡수하려면 지역 단위 허브가 필요합니다.",
      aeoImpact: "지역 엔티티(부산·서울·제주) 단위의 커버리지가 AI 추천 범위를 결정합니다.",
      thresholds: { ...P100, source: "관광 포털 IA 실무 표준", sourceUrl: undefined },
      weight: 2,
      fix: {
        method: ["지역·도시별 허브 페이지 구축", "지역 내 관광지·맛집·숙소로 연결"],
        example: "/ja/busan (허브) → 해운대·광안리·서면 상세",
        difficulty: "high",
        effort: "지역당 2일",
      },
      siteTypes: ["tourism"],
    },
    (def, ctx) => {
      const urls = ctx.crawl.sitemap.sampleUrls;
      if (urls.length === 0) return unmeasured(def, "사이트맵이 없어 측정할 수 없습니다.");
      const regions = ["seoul", "busan", "jeju", "incheon", "daegu", "gyeongju", "jeonju", "gangneung", "sokcho", "서울", "부산", "제주", "경주", "전주"];
      const found = new Set<string>();
      for (const u of urls) for (const r of regions) if (u.toLowerCase().includes(r)) found.add(r);
      const score = Math.min(100, found.size * 25);
      return measured(def, score, `${found.size}개 지역 감지`, [
        `사이트맵 URL에서 감지된 지역 키워드: ${[...found].join(", ") || "없음"}`,
        "기준: 3개 지역 이상 양호, 4개 이상 최적 (표본 기준)",
      ]);
    },
  ),
  make(
    {
      id: "itemlist-breadcrumb",
      category: "tourism",
      label: "ItemList·BreadcrumbList",
      description: "목록형 schema와 탐색 경로 schema 적용을 검사합니다.",
      why: "리스트 리치 결과·경로 표시로 검색 결과 점유 면적을 넓힙니다.",
      aeoImpact: "AI가 'TOP N' 목록을 그대로 인용할 수 있는 구조입니다.",
      thresholds: { ...P100, source: "Google — Carousel(ItemList)·Breadcrumb 구조화데이터", sourceUrl: "https://developers.google.com/search/docs/appearance/structured-data/carousel" },
      weight: 2,
      fix: {
        method: ["목록 페이지에 ItemList", "전 페이지에 BreadcrumbList"],
        example: '{"@type":"ItemList","itemListElement":[{"@type":"ListItem","position":1,"name":"해운대"…}]}',
        difficulty: "low",
        effort: "1일",
      },
      aiActions: ["json-ld"],
      siteTypes: ["tourism"],
    },
    (def, ctx) => {
      const types = schemaTypesPresent(ctx.crawl);
      const hasList = types.has("ItemList");
      const hasBread = types.has("BreadcrumbList");
      const score = (hasList ? 50 : 0) + (hasBread ? 50 : 0);
      return measured(def, score, [hasList && "ItemList", hasBread && "Breadcrumb"].filter(Boolean).join("·") || "없음", [
        `ItemList ${hasList ? "✓" : "✗"} · BreadcrumbList ${hasBread ? "✓" : "✗"}`,
      ]);
    },
  ),
];
