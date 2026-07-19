# K:ZIP 공식 홈페이지

전략 중심의 디지털 마케팅 및 글로벌 프로젝트 수행 기업 **K:ZIP**의 공식 웹사이트입니다.

- 프레임워크: **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4**
- 콘텐츠 관리: **Notion CMS** (비개발자 운영자용) + 코드 내 fallback 데이터
- 문의 접수: 홈페이지 폼 → **Notion 문의 CRM** 자동 저장

---

## 1. 실행 방법

```bash
npm install       # 의존성 설치
npm run dev       # 개발 서버 → http://localhost:3000
npm run build     # 프로덕션 빌드
npm start         # 빌드 결과 실행
```

Notion 환경변수가 없어도 사이트는 **코드에 내장된 fallback 데이터로 정상 동작**합니다.
Notion을 연결하면 아래 콘텐츠를 코드 수정 없이 Notion에서 관리할 수 있습니다.

## 2. Notion CMS 구조

Notion의 **「K:ZIP 홈페이지 관리」** 페이지 아래 6개 데이터베이스가 준비되어 있습니다.

| 데이터베이스 | 관리 내용 | Database ID |
| --- | --- | --- |
| K:ZIP 사이트 기본정보 | 대표자·연락처·주소·사업자번호·메인/서브 카피·회사 소개 문구 | `5c20edbd0bcd4396877d62b10bb24c52` |
| K:ZIP 서비스 | 서비스 12종 (요약·상세·수행 범위·산출물·순서) | `577f0887ee4c43a89a95a4ca8fbda51c` |
| K:ZIP 프로젝트 | 프로젝트 목록·상세 (비공개 표시 지원) | `6bf880721aed437a976e087390ebb336` |
| K:ZIP 인사이트 | 인사이트 글 (본문은 각 행의 페이지 본문에 작성) | `64e00ee725de482b93ddb82e786e0852` |
| K:ZIP 대표 프로필 | 회사소개 페이지 대표 소개 | `0238e4a96f1e440da70ea9bea5084efa` |
| K:ZIP 문의 CRM | 홈페이지 문의 접수·영업 파이프라인 관리 | `26785326655141bb9754aab921651bfc` |

동작 원칙:

- **공개 여부**가 체크된 행만 홈페이지에 노출됩니다.
- **순서/노출 순서** 숫자가 작은 것부터 정렬됩니다.
- **슬러그**가 상세 페이지 주소가 됩니다 (예: `digital-marketing` → `/services/digital-marketing`). 영문 소문자와 하이픈만 사용하세요.
- Notion 수정 사항은 **약 5분 이내** 홈페이지에 반영됩니다 (ISR 300초).
- Notion 장애·미설정·빈 데이터 시 코드 내 fallback 데이터(`src/data/*`)로 자동 전환되며, 방문자 화면에는 오류가 노출되지 않고 서버 로그에만 기록됩니다.

> 별도 `src/data/fallback/` 폴더 대신 기존 `src/data/*` 파일을 그대로 fallback으로 사용합니다 — 같은 콘텐츠를 두 곳에서 관리하며 생기는 불일치를 막기 위한 선택입니다.

## 3. Notion 연동 설정 (최초 1회)

### 3-1. Notion Integration 만들기

1. https://www.notion.so/my-integrations 접속 → **New integration**
2. 이름: `K:ZIP 홈페이지` (자유), Workspace: K:ZIP 워크스페이스 선택
3. Capabilities에서 **Read content**, **Insert content** 체크 → 저장
4. 발급된 **Internal Integration Secret**(`ntn_...` 또는 `secret_...`)을 복사해 두세요. 이것이 `NOTION_API_KEY`입니다.

### 3-2. 데이터베이스를 Integration에 공유하기

1. Notion에서 **「K:ZIP 홈페이지 관리」** 페이지를 엽니다.
2. 우측 상단 **⋯ 메뉴 → 연결(Connections) → 연결 추가** 에서 위에서 만든 Integration을 선택합니다.
3. 상위 페이지에 연결하면 **하위 6개 데이터베이스에 자동으로 권한이 상속**됩니다.

### 3-3. Database ID 확인 방법

위 표에 이미 정리되어 있습니다. 직접 확인하려면: Notion에서 데이터베이스를 **전체 페이지로 열고** 브라우저 주소창을 보세요.

```
https://www.notion.so/워크스페이스명/{이_32자리가_Database_ID}?v=...
```

### 3-4. 로컬 .env.local 설정

```bash
cp .env.example .env.local
```

`.env.local`을 열어 값을 채웁니다:

```
NOTION_API_KEY=발급받은_시크릿
NOTION_SITE_DATABASE_ID=5c20edbd0bcd4396877d62b10bb24c52
NOTION_SERVICES_DATABASE_ID=577f0887ee4c43a89a95a4ca8fbda51c
NOTION_PROJECTS_DATABASE_ID=6bf880721aed437a976e087390ebb336
NOTION_INSIGHTS_DATABASE_ID=64e00ee725de482b93ddb82e786e0852
NOTION_PROFILE_DATABASE_ID=0238e4a96f1e440da70ea9bea5084efa
NOTION_CRM_DATABASE_ID=26785326655141bb9754aab921651bfc
```

> ⚠️ `.env.local`은 Git에 커밋되지 않습니다(.gitignore 처리됨). **API Key를 코드나 README에 절대 붙여넣지 마세요.**

## 4. Vercel 설정

### 4-1. 환경변수 등록

1. Vercel 대시보드 → 프로젝트 → **Settings → Environment Variables**
2. 위 7개 변수(`NOTION_API_KEY` + DB ID 6개)를 하나씩 추가합니다.
3. 각 변수의 적용 환경을 선택합니다:
   - **Production**: 실제 서비스 도메인 배포에 적용 — 반드시 체크
   - **Preview**: PR·브랜치 미리보기 배포에 적용 — 체크 권장
   - **Development**: `vercel dev` 사용 시에만 필요 — 선택
4. `NEXT_PUBLIC_SITE_URL`에 실제 도메인(예: `https://kzip.co.kr`)도 등록하세요.

### 4-2. 환경변수 변경 후 재배포

환경변수는 **다음 배포부터** 적용됩니다. 변경 후:

- Vercel 대시보드 → **Deployments** → 최신 배포 우측 **⋯ → Redeploy** 클릭
- 또는 저장소에 아무 커밋이나 푸시하면 자동 재배포됩니다.

### 4-3. 연동 상태 진단 — /api/cms-status

배포 후 브라우저에서 `https://도메인/api/cms-status` 를 열면 DB별 연동 상태가 JSON으로 표시됩니다.

- `status: "env_missing"` → 해당 환경변수가 Vercel에 등록되지 않음
- `status: "error"` → error 필드 확인 (401=API 키 오류, 404=Integration에 DB 미공유 또는 ID 오류)
- `status: "ok"` + `source: "fallback"` → 연동은 정상이지만 공개 여부가 체크된 행이 없음
- `source: "notion"` → 정상 — Notion 데이터 사용 중

Notion 응답 요약은 Vercel → Deployments → 배포 선택 → **Logs**에서 `[notion-cms]` 로 검색해 확인할 수 있습니다.

### 4-4. 즉시 반영 — /api/revalidate

Notion 수정은 기본적으로 최대 5분(ISR) 내 반영됩니다. 즉시 반영하려면:

1. Vercel 환경변수에 `REVALIDATE_SECRET`(임의의 긴 문자열) 추가 후 재배포
2. 브라우저에서 `https://도메인/api/revalidate?secret=설정한값` 접속
3. `{"revalidated":true}` 응답 후 새로고침하면 즉시 반영됩니다

### 4-5. 테스트 문의 확인 방법

1. 배포된 사이트의 `/contact`에서 테스트 문의를 제출합니다.
2. "문의가 정상적으로 접수되었습니다" 메시지를 확인합니다.
3. Notion **K:ZIP 문의 CRM**을 열어 새 행이 생겼는지 확인합니다 — 상태 `신규 문의`, 유입경로 `홈페이지`, 접수번호 `KZ-날짜-코드` 형식이면 정상입니다.
4. 확인한 테스트 행은 삭제하면 됩니다.

## 5. Notion에서 콘텐츠 수정하는 방법 (운영자용)

- **회사 정보·메인 카피 수정**: 「K:ZIP 사이트 기본정보」의 행을 열어 값을 수정 → 공개 여부 체크. 메인 카피는 줄바꿈(Shift+Enter)이 홈페이지 히어로의 줄바꿈이 됩니다. 이 DB는 **행 1개만** 유지하세요.
- **서비스 수정**: 「K:ZIP 서비스」에서 해당 행 수정. `주요 수행 범위`, `주요 산출물`, `상세 설명`(=해결하는 문제)은 **줄바꿈으로 항목을 구분**합니다.
- **프로젝트 추가**: 「K:ZIP 프로젝트」에 행 추가 → 슬러그·요약·수행 내용 등 입력 → 공개 여부 체크. 계약상 공개가 어려우면 **비공개 프로젝트 여부**를 체크하면 "비공개 프로젝트" 배지가 표시됩니다.
- **인사이트 글 발행**: 「K:ZIP 인사이트」에 행 추가 → 제목·슬러그·요약·카테고리·작성일 입력 → **행을 열어 페이지 본문에 원고 작성** → 공개 여부 체크.
- **대표 프로필**: 「K:ZIP 대표 프로필」의 행에 소개·경력 입력 → 공개 여부 체크. `[...입력 필요]`로 시작하는 값은 자동으로 무시됩니다. 실제 이력만 입력하세요.
- **공개 여부 / 노출 순서**: 공개 여부 체크 해제 = 홈페이지에서 즉시(최대 5분) 숨김. 노출 순서 숫자를 바꾸면 정렬이 바뀝니다.
- **이미지**: 각 DB의 `대표 이미지`에 업로드하거나 외부 URL을 붙여넣으세요. 이미지가 없으면 기존 도판 스타일 플레이스홀더가 표시됩니다.
  - ⚠️ Notion에 직접 업로드한 파일 URL은 약 1시간 주기로 갱신됩니다. 사이트가 5분마다 재검증하므로 대부분 문제없지만, 방문이 매우 뜸한 페이지에서 간헐적으로 이미지가 늦게 뜰 수 있습니다. 가장 안정적인 방법은 **외부 URL(자체 스토리지·CDN)을 붙여넣는 것**입니다.

## 6. 문의 CRM 운영

문의 폼 제출 → `/api/contact`(서버) → Notion CRM 자동 저장. API 키는 서버에서만 사용되며 브라우저에 노출되지 않습니다.

자동 저장 규칙: 문의명 `[회사명] 담당자명 문의` / 접수번호 `KZ-YYYYMMDD-XXXX` / 상태 `신규 문의` / 우선순위 `보통` / 유입경로 `홈페이지`

폼 보호 장치: 필수값·이메일 형식·연락처 검증, 개인정보 동의 필수, honeypot 스팸 차단, 요청 크기 제한(20KB), 60초 내 동일 문의 중복 차단, 제출 중 버튼 비활성화. 저장 실패 시 사용자에게 실패로 안내합니다(성공 위장 없음).

CRM에서 운영자는 상태(신규 문의→확인 중→회신 완료→…→계약 완료), 우선순위, 담당자, 후속 연락일, 내부 메모를 관리하세요.

> Notion이 설정되지 않은 환경에서는 폼이 방문자의 메일 앱을 여는 폴백으로 동작합니다.

## 7. 페이지 구조

| 경로 | 내용 | 데이터 소스 |
| --- | --- | --- |
| `/` | 홈 | 사이트 기본정보 + 프로젝트 + 인사이트 |
| `/about` | 회사소개 | 사이트 기본정보 + 대표 프로필 |
| `/services`, `/services/[slug]` | 서비스 목록·상세 | 서비스 DB |
| `/projects`, `/projects/[slug]` | 프로젝트 목록·상세 | 프로젝트 DB |
| `/global` | 일본·글로벌 | 정적 |
| `/insights`, `/insights/[slug]` | 인사이트 목록(필터)·상세 | 인사이트 DB |
| `/contact` | 문의 폼 | CRM DB (저장) |
| `/privacy` | 개인정보처리방침 | 정적 |

SEO/GEO: 페이지별 메타데이터·canonical, OG 이미지 자동 생성, JSON-LD 구조화 데이터(Organization·WebSite·Breadcrumb·Article 등), sitemap.xml(CMS 슬러그 반영), robots.txt, llms.txt, 404, 분석 도구(GA4/GTM)·검색엔진 소유 확인 env 게이트.
자세한 구조와 운영 방법은 **[docs/seo-geo.md](docs/seo-geo.md)** 를 참고하세요.

## 8. 배포 전 확인 목록

- [ ] Notion 「사이트 기본정보」에 실제 이메일·전화·주소·사업자번호 입력 후 공개 체크
- [ ] `NEXT_PUBLIC_SITE_URL`에 실제 도메인 등록
- [ ] 프로젝트 실제 내용·이미지·공개 가능한 성과 입력 (없는 실적·수치 금지)
- [ ] 대표 프로필 실제 이력 입력 (제공된 이력만)
- [ ] `/privacy` 위탁 항목·시행일 확정 (법률 검토 권장)
- [ ] 배포 후 테스트 문의 1건 제출 → CRM 확인 → 삭제

## 9. 기술 구조

```
src/
├── app/                  # 페이지 (App Router) + /api/contact
├── components/           # UI 컴포넌트 (CmsImage = Notion 이미지 ↔ 플레이스홀더 자동 전환)
├── data/                 # fallback 데이터 + 타입 (Notion 장애 시 사용)
├── lib/notion/
│   ├── client.ts         # 서버 전용 Notion API 클라이언트 (fetch 기반, SDK 없음)
│   ├── queries.ts        # 조회 + 5분 캐싱 + fallback 병합
│   └── mappers.ts        # Notion 속성 → 앱 타입 변환
└── types/notion.ts       # Notion 관련 타입
```

- 디자인 시스템: 화이트 `#FFFFFF` / 텍스트 `#111827` / 보조 `#6B7280` / 보더 `#ECECEC` / 포인트 `#1F3FFF`(10% 이하)
- 인터랙션: 마스크 리빌·클립 리빌·패럴랙스·스크롤 스파이·헤더 축소 — `prefers-reduced-motion` 지원
