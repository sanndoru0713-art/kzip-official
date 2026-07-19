# K:ZIP SEO / GEO 운영 가이드

이 문서는 `kzip-official` 저장소에 구축된 SEO(검색엔진 최적화)·GEO(Generative Engine Optimization, AI 검색 최적화) 기반의 구조와 운영 방법을 정리합니다.

## 0. 적용 범위에 대한 중요 안내

- 이 저장소는 **K:ZIP 공식 홈페이지(한국어 기업 사이트)** 의 코드입니다.
- 일본어 여행·라이프스타일 플랫폼 프로토타입(`kzip-research.sanndoru0713.chatgpt.site/ja`)의 코드는 **이 저장소에 존재하지 않습니다.** 해당 프로토타입은 별도 환경(chatgpt.site)에서 생성된 것으로, 이 저장소에서 직접 수정할 수 없습니다.
- 따라서 관광지·호텔·플래너 등 여행 플랫폼 전용 SEO 항목은 이 저장소에서는 구현 대상이 없으며, 대신 **여행 플랫폼 기능이 이 저장소로 이관·개발될 때 바로 적용할 수 있는 공통 기반**(메타데이터 헬퍼, 스키마 빌더, sitemap/robots/llms.txt 자동화, 분석 구조)을 구축했습니다. 이관 시 규칙은 [§7](#7-일본어여행-플랫폼-콘텐츠-도입-시-적용-규칙)을 따르세요.

## 1. 구축된 구조

### 1-1. 페이지별 메타데이터 — `src/lib/seo.ts`

모든 페이지는 `pageMetadata()` 헬퍼를 통해 다음을 출력합니다.

- 고유 title / meta description (레이아웃의 `%s | K:ZIP` 템플릿 적용)
- **self-referencing canonical** (`alternates.canonical`)
- 페이지 고유 Open Graph(title·description·url·locale·type) 및 X(Twitter) 카드
- noindex가 필요한 페이지의 robots 처리 (`/privacy` 적용됨)
- 쿼리 파라미터 페이지(`/insights?category=…`, `/contact?type=…`)는 canonical을 기본 경로로 고정해 중복 수집을 방지

새 페이지를 만들 때는 반드시 `pageMetadata({ title, description, path })`를 사용하세요. 같은 메타데이터를 복사·반복하지 않는 것이 원칙입니다.

### 1-2. 구조화 데이터(JSON-LD) — `src/lib/schema.ts` + `src/components/JsonLd.tsx`

| 스키마 | 출력 위치 | 비고 |
| --- | --- | --- |
| `Organization` | 전 페이지 (레이아웃) | CMS 사이트 기본정보의 이메일·전화·주소가 **실제 값일 때만** 포함 (placeholder `[…입력 필요]` 자동 제외) |
| `WebSite` | 전 페이지 (레이아웃) | 사이트 내 검색 기능이 없어 `SearchAction`은 출력하지 않음 — 검색 페이지가 생기면 추가 |
| `BreadcrumbList` | 목록·상세 전 페이지 | 홈 → 섹션 → 상세 |
| `ItemList` | /services, /projects, /insights | CMS 콘텐츠 자동 반영 |
| `Service` | /services/[slug] | 제공 주체는 Organization 참조 |
| `BlogPosting` | /insights/[slug] | 실제 발행일만 사용, 작성자=K:ZIP(Organization) |

**원칙: 페이지에 존재하지 않는 가격·리뷰·별점·주소를 스키마에 임의로 넣지 않습니다.**

### 1-3. sitemap.xml — `src/app/sitemap.ts`

- 정적 페이지 + CMS(Notion)의 공개된 서비스·프로젝트·인사이트 slug가 **자동 포함**됩니다. CMS에 콘텐츠를 추가하면 별도 작업 없이 sitemap에 반영됩니다(ISR 주기 내).
- noindex 페이지(`/privacy`)와 API 경로는 제외됩니다.

### 1-4. robots.txt — `src/app/robots.ts`

- 전체 공개 콘텐츠 허용, `/api/` 차단, sitemap URL 명시.
- CSS·JS·이미지 등 렌더링 리소스는 차단하지 않습니다.

### 1-5. llms.txt — `src/app/llms.txt/route.ts`

AI 크롤러용 사이트 안내 문서(`/llms.txt`)를 제공합니다. 엔터티 정의(운영 주체·전문 영역·콘텐츠 원칙), 주요 페이지, CMS에서 자동 생성되는 서비스·인사이트 목록, 인용 안내를 포함합니다.

**한계(반드시 인지):** llms.txt는 아직 표준으로 확정되지 않은 제안 규격입니다. 모든 AI 크롤러가 읽는다는 보장이 없으며, 실제 인용 가능성은 본문 품질과 구조화 데이터가 좌우합니다. 이 파일은 보조 수단으로만 유지하세요.

### 1-6. 분석 도구 — `src/components/Analytics.tsx` + `src/lib/analytics.ts`

- 환경변수가 설정된 경우에만 GTM 또는 GA4 스크립트가 로드됩니다(중복 설치 방지 — GTM 설정 시 GA4 직접 설치는 비활성).
- 이벤트: `contact_submit`(문의 접수 성공, 문의 유형만 전송), `contact_submit_error`, `contact_mailto_fallback`.
- **개인정보(이메일·이름·연락처·문의 본문)는 분석 도구로 전송하지 않습니다.** 새 이벤트를 추가할 때도 이 원칙을 지키세요. 이벤트 이름은 `src/lib/analytics.ts`의 `AnalyticsEvent` 타입에 추가해 관리합니다.

### 1-7. 다국어(hreflang) 준비 상태

- 현재 사이트는 **한국어 단일 언어**이므로 hreflang을 출력하지 않습니다(존재하지 않는 번역 페이지를 선언하는 것은 오히려 감점 요인).
- 일본어 등 번역 경로가 생기면 `pageMetadata()`의 `languages` 옵션에 `{ ko: "/about", ja: "/ja/about", "x-default": "/about" }` 형태로 전달하면 hreflang이 출력됩니다.
- 번역 페이지는 각자 self-referencing canonical을 유지하고, canonical을 다른 언어로 합치지 마세요. 언어 자동 감지 강제 리다이렉트도 금지합니다.

## 2. 환경변수

| 변수 | 용도 | 필수 여부 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | canonical·OG·sitemap·robots·llms.txt의 기준 URL | **필수** (미설정 시 example 도메인으로 출력됨) |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager 컨테이너 ID | 선택 |
| `NEXT_PUBLIC_GA4_ID` | GA4 측정 ID (GTM 미사용 시) | 선택 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console 소유 확인 | 선택 |
| `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` | 네이버 서치어드바이저 소유 확인 | 선택 |
| `NEXT_PUBLIC_BING_SITE_VERIFICATION` | Bing Webmaster Tools 소유 확인 | 선택 |

Notion CMS 관련 변수는 README를 참고하세요.

## 3. 검색엔진 등록 절차 (수동 작업)

배포 도메인이 확정된 후 다음을 진행하세요.

1. **Google Search Console** (https://search.google.com/search-console)
   - 속성 추가 → URL 접두어 방식 → HTML 태그 확인 코드의 `content` 값을 `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`에 등록 → 재배포 → 확인
   - Sitemaps 메뉴에 `https://도메인/sitemap.xml` 제출
2. **네이버 서치어드바이저** (https://searchadvisor.naver.com) — 일본 시장 위주라도 한국 유입용으로 등록 권장
   - 사이트 등록 → HTML 태그 방식 → `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` 등록 → 사이트맵 제출
3. **Bing Webmaster Tools** (https://www.bing.com/webmasters)
   - 사이트 추가 → 메타 태그 방식 → `NEXT_PUBLIC_BING_SITE_VERIFICATION` 등록 → 사이트맵 제출
   - 일본 검색 시장 참고: 일본은 Google(및 Google 엔진을 쓰는 Yahoo! JAPAN)이 검색 점유율 대부분을 차지하므로, **Google Search Console 등록이 일본 SEO의 핵심**입니다. Bing 등록은 Copilot 등 Bing 계열 AI 검색 대응을 겸합니다.
4. **GA4 / GTM**
   - GA4 속성 생성 → 측정 ID를 `NEXT_PUBLIC_GA4_ID`에 등록(또는 GTM 컨테이너 생성 후 `NEXT_PUBLIC_GTM_ID` 등록)
   - GTM 사용 시 `contact_submit` 등 dataLayer 이벤트를 GA4 이벤트로 매핑하는 태그를 GTM에서 구성

## 4. 콘텐츠 운영 가이드 (SEO)

새 인사이트·서비스·프로젝트 콘텐츠 작성 시:

1. **페이지당 중심 주제 1개** — 제목(H1)과 첫 문단에서 주제와 독자가 얻을 것을 명확히.
2. **논리적 heading** — H1은 페이지당 1개, 본문은 H2/H3로 구조화. (Notion 본문의 제목2/제목3 블록이 렌더링됩니다.)
3. **요약 우선(answer-first)** — 첫 1~2문단에서 핵심 답을 먼저 제시하고, 상세 설명은 그 뒤에.
4. **모호한 문장 금지** — 대상 독자·지역·기간을 명시. 사실과 의견을 구분하고, 추천에는 기준을 함께 적기.
5. **출처 없는 수치 금지** — 통계·수치는 출처와 함께. 날짜에 따라 변하는 정보는 발행일·갱신일 확인.
6. **의미 있는 앵커 텍스트** — 내부 링크는 "자세히 보기" 반복 대신 대상 페이지의 주제를 담은 문구 사용.
7. **키워드 남용 금지** — 부자연스러운 반복·숨김 텍스트 금지.
8. **발행일 관리** — 인사이트의 작성일은 정확히 입력(구조화 데이터와 sitemap에 사용됨).

## 5. GEO(AI 검색) 운영 원칙

- 엔터티 일관성: 회사 설명·연락처·전문 영역을 About, footer, Organization 스키마, llms.txt에서 **동일하게** 유지하세요. CMS 「사이트 기본정보」가 단일 출처입니다.
- CMS의 이메일·전화·주소가 placeholder(`[…입력 필요]`) 상태이면 구조화 데이터에서 자동 제외됩니다. **실제 값을 입력하는 순간 E-E-A-T 신호가 완성되므로 우선 입력을 권장합니다.**
- 인용 가능한 단위: 중요한 정보는 짧은 단락·표·리스트로 구조화하세요. AI 엔진은 자기완결적인 단락을 인용합니다.
- 향후 보강 권장(콘텐츠 준비 시): 편집·검수 정책 페이지, 작성자 프로필, 이용약관, 광고·제휴 고지.

## 6. 미적용 항목과 사유

| 항목 | 사유 |
| --- | --- |
| hreflang / `lang="ja"` | 번역 페이지가 아직 없음 — 존재하지 않는 URL 선언은 금지. 헬퍼에 확장 지점 준비됨 |
| `SearchAction` | 사이트 내 검색 기능 없음 |
| `TouristAttraction`·`Hotel`·`FAQPage`·`HowTo`·`Event`·`JobPosting` 스키마 | 해당 성격의 페이지가 이 저장소에 없음 — 도입 시 §7 참조 |
| FAQ·요약 영역 UI | 기존 콘텐츠 구조 유지 원칙에 따라 콘텐츠 리뉴얼 시 도입 권장 |
| Next/Image 전환 | CMS 이미지가 Notion 만료성 URL이라 원격 도메인 고정 불가 — 자체 스토리지/CDN 도입 시 전환 권장 (`images.remotePatterns` 설정 필요) |
| 가시적 breadcrumb UI | 디자인 변경 최소화 원칙 — 구조화 데이터로만 제공 중, 도입 시 `BreadcrumbList`와 일치시킬 것 |

## 7. 일본어(여행 플랫폼) 콘텐츠 도입 시 적용 규칙

여행 플랫폼 기능(지역·관광지·호텔·뷰티·플래너 등)이 이 저장소로 이관되면:

1. **URL 구조**: `/ja/...` 프리픽스 또는 별도 도메인. 언어 자동 감지 리다이렉트 금지 — 각 언어 URL을 독립 크롤링 가능하게.
2. **메타데이터**: 각 페이지에서 `pageMetadata()`에 `languages`를 전달해 hreflang + x-default 출력. 일본어 페이지는 `og:locale=ja_JP`가 필요하므로 헬퍼에 locale 옵션을 추가해 확장.
3. **스키마**: `src/lib/schema.ts`에 `touristAttractionSchema`, `hotelSchema`, `faqPageSchema`, `howToSchema` 빌더를 추가. 원칙 동일 — **실재하는 정보만**(가격·별점·리뷰 임의 생성 금지).
4. **템플릿별 규칙**:
   - 지역 랜딩: ItemList(관광지·호텔 링크) + Breadcrumb + answer-first 요약
   - 관광지 상세: TouristAttraction(주소·교통은 실데이터만) + Breadcrumb + 관련 콘텐츠 내부 링크
   - 호텔 상세: Hotel + Breadcrumb (OTA 링크 클릭 이벤트 추적)
   - 가이드·준비물: Article(+ 목차 H2/H3) + 필요 시 FAQPage/HowTo
   - 플래너·마이페이지·로그인 등 개인화 페이지: **noindex** + sitemap 제외 + robots 차단
5. **이벤트**: `AnalyticsEvent`에 `content_view`, `spot_save`, `hotel_save`, `planner_start`, `planner_complete`, `ota_click`, `signup_start`, `signup_complete`, `language_change` 등을 추가해 확장.
6. **이미지**: 의미 있는 일본어 alt, 파일명은 내용을 설명하는 로마자/영문 슬러그 사용(난수 금지), LCP 이미지 `priority` 지정.

## 8. 검증 방법

```bash
npm run build          # 빌드 (타입 오류 포함 검증)
npx tsc --noEmit       # 타입 체크
npm start              # 프로덕션 서버 실행 후:
curl http://localhost:3000/robots.txt
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/llms.txt
curl -s http://localhost:3000/ | grep -o '<link rel="canonical"[^>]*>'
curl -s http://localhost:3000/ | grep -o 'application/ld+json'
```

- 구조화 데이터 검증: https://search.google.com/test/rich-results 또는 https://validator.schema.org
- OG 카드 검증: https://www.opengraph.xyz 등
