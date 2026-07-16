# K:ZIP 공식 홈페이지

전략 중심의 디지털 마케팅 및 글로벌 프로젝트 수행 기업 **K:ZIP**의 공식 웹사이트입니다.

- 프레임워크: **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4**
- 애니메이션: CSS 전환만 사용 (외부 애니메이션 라이브러리 없음)
- 콘텐츠: `src/data/` 의 TypeScript 데이터 파일에서 관리 (CMS 없이 코드로 관리)

---

## 1. 실행 방법

```bash
npm install       # 의존성 설치
npm run dev       # 개발 서버 → http://localhost:3000
npm run build     # 프로덕션 빌드
npm start         # 빌드 결과 실행
```

## 2. 페이지 구조

| 경로 | 내용 |
| --- | --- |
| `/` | 홈 (메인 비주얼, 소개, 서비스, 프로젝트, 일본·글로벌, 수행 방식, 인사이트, CTA) |
| `/about` | 회사소개 (비전·미션·핵심가치·대표·철학·협업 방식·여성기업·회사 정보) |
| `/services` | 서비스 목록 (12개 영역) |
| `/services/[slug]` | 서비스 상세 (해결하는 문제 → 수행 범위 → 진행 방식 → 산출물 → 문의) |
| `/projects` | 프로젝트 목록 (비공개 프로젝트 표시 지원) |
| `/projects/[slug]` | 프로젝트 상세 (개요·과제·전략·수행·결과물·KPI·역할·기간·관련 서비스) |
| `/global` | 일본·글로벌 (9개 수행 영역) |
| `/insights` | 인사이트 목록 + 카테고리 필터 (`?category=일본 시장`) |
| `/insights/[slug]` | 인사이트 상세 |
| `/contact` | 문의 폼 (`?type=일본 마케팅` 으로 유형 사전 선택 가능) |
| `/privacy` | 개인정보처리방침 (초안) |

SEO: 페이지별 메타데이터, Open Graph 이미지(자동 생성), `sitemap.xml`, `robots.txt`, 404 페이지 포함.

## 3. 콘텐츠 수정 위치

| 수정할 내용 | 파일 |
| --- | --- |
| 회사 정보·연락처·도메인 | `src/data/site.ts` |
| 서비스 12종 | `src/data/services.ts` |
| 프로젝트 (추가/수정/비공개 처리) | `src/data/projects.ts` |
| 인사이트 글 (추가 시 목록·상세·사이트맵 자동 반영) | `src/data/insights.ts` |
| 메뉴 구성 | `src/data/site.ts` 의 `nav` |
| 색상·폰트 토큰 | `src/app/globals.css` 의 `@theme` |

### 새 인사이트 글 추가

`src/data/insights.ts` 의 배열에 객체를 추가하면 끝입니다.

```ts
{
  slug: "my-new-post",          // URL이 됩니다
  title: "글 제목",
  category: "일본 시장",         // insightCategories 중 하나
  summary: "목록에 노출될 요약",
  date: "2026-08-01",
  body: ["첫 문단", "둘째 문단"], // 생략하면 "본문 준비 중"으로 표시
}
```

### 새 프로젝트 추가 / 비공개 처리

`src/data/projects.ts` 에 객체를 추가하세요. `confidential: true` 로 설정하면
목록과 상세에 **"비공개 프로젝트"** 배지와 안내문이 표시됩니다.

## 4. 반드시 교체해야 할 자리표시자

사이트 곳곳에 `[…입력 필요]` 형태로 표시되어 있습니다. 배포 전 확인 목록:

- [ ] `src/data/site.ts` — 이메일, 전화번호, 주소, 사업자등록번호, **실제 도메인(url)**
- [ ] `src/data/projects.ts` — 4개 프로젝트의 개요·과제·전략·수행 내용·성과(KPI)·역할·기간
- [ ] 프로젝트 이미지 — `public/images/README.md` 참고 (`[이미지 교체 필요]` 표시 위치)
- [ ] `/about` — 대표 프로필, 회사 연혁, 보유 인증·확인서(여성기업 확인서 등)
- [ ] `/privacy` — 폼 처리 서비스 확정 후 위탁 항목, 시행일 (법률 검토 권장)
- [ ] 인사이트 본문 — 검증된 원고 확보 후 `body` 채우기

> 없는 실적·수치를 임의로 넣지 마세요. 검증 가능한 내용만 게시합니다.

## 5. 문의 폼 설정

폼은 백엔드 없이 안전하게 동작하도록 두 가지 모드를 지원합니다.

1. **기본 (설정 없음)** — 제출 시 방문자의 메일 앱이 열리고 내용이 자동으로 채워집니다.
2. **폼 엔드포인트 연결 (권장)** — 무료/저비용 폼 서비스를 연결하면 사이트에서 바로 전송됩니다.
   - [Formspree](https://formspree.io) 무료 플랜(월 50건) 등에서 폼을 만들고,
   - 프로젝트 루트에 `.env.local` 파일 생성:
     ```
     NEXT_PUBLIC_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
     ```
   - 배포 환경(Vercel 등)에도 같은 환경변수를 등록하세요.

스팸 방지용 honeypot 필드와 개인정보 동의 체크가 포함되어 있습니다.
실제 이메일 발송 설정(폼 서비스 가입)은 별도 승인 후 진행하세요.

## 6. 배포 가이드

정적·서버리스 어디든 배포 가능합니다. 가장 간단한 방법은 **Vercel 무료 플랜**:

1. GitHub 저장소를 Vercel에 연결 (Import Project)
2. 환경변수 등록: `NEXT_PUBLIC_SITE_URL=https://실제도메인`, (선택) `NEXT_PUBLIC_FORM_ENDPOINT`
3. 기본 빌드 설정 그대로 Deploy

> 도메인 구매·연결과 외부 배포는 승인 후 진행하세요.

## 7. 다국어 확장 (한국어 → 영어·일본어)

향후 확장을 고려한 구조입니다.

- 모든 화면 문구가 `src/data/` 와 각 페이지 상단의 데이터 배열에 모여 있어,
  로케일별 데이터 파일(`services.ja.ts` 등)로 분리하기 쉽습니다.
- Next.js App Router의 `[locale]` 세그먼트(`app/[locale]/…`)로 마이그레이션하면
  URL 기반 다국어(`/ja`, `/en`)를 적용할 수 있습니다.
- `<html lang>` 은 `src/app/layout.tsx` 에서 관리합니다.

## 8. 디자인 시스템 요약

- 배경 `--color-paper #faf8f4` (웜 화이트) / 텍스트 `--color-ink #22252e` (딥 차콜)
- 포인트 컬러 `--color-accent #b04e28` (테라코타) — 한 가지만 사용
- 다크 밴드 `--color-night #1b202d` — CTA 섹션 한 곳에만 사용
- 본문 Pretendard, 인용구 Noto Serif KR (CDN 로드)
- 카드 대신 헤어라인(1px) 구분선 기반의 편집형(매거진) 레이아웃
- 애니메이션은 스크롤 페이드업 한 종류만, `prefers-reduced-motion` 지원
