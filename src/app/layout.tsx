import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Analytics, { AnalyticsNoScript } from "@/components/Analytics";
import { site } from "@/data/site";
import { SITE_LANG, SITE_LOCALE, absoluteUrl } from "@/lib/seo";
import { organizationSchema, webSiteSchema } from "@/lib/schema";
import { getSiteInfo } from "@/lib/notion/queries";

// 검색엔진 소유 확인용 메타 태그 — 환경변수 설정 시에만 출력됩니다.
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const naverVerification = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION;
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — 전략을 설계하고, 성장을 실행합니다`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: [
    "K:ZIP",
    "디지털 마케팅",
    "마케팅 전략",
    "일본 마케팅",
    "글로벌 마케팅",
    "브랜드 콘텐츠",
    "프로젝트 매니지먼트",
  ],
  openGraph: {
    type: "website",
    locale: SITE_LOCALE,
    siteName: site.name,
    title: `${site.name} — 전략을 설계하고, 성장을 실행합니다`,
    description: site.description,
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — 전략을 설계하고, 성장을 실행합니다`,
    description: site.description,
  },
  robots: { index: true, follow: true },
  ...(googleVerification || naverVerification || bingVerification
    ? {
        verification: {
          ...(googleVerification ? { google: googleVerification } : {}),
          other: {
            ...(naverVerification
              ? { "naver-site-verification": naverVerification }
              : {}),
            ...(bingVerification ? { "msvalidate.01": bingVerification } : {}),
          },
        },
      }
    : {}),
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const siteInfo = await getSiteInfo();
  return (
    <html lang={SITE_LANG}>
      <head>
        {/* 폰트 CDN 사전 연결 — 렌더 차단 시간 단축 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 사이트 엔터티 구조화 데이터 — AI 검색엔진·크롤러의 운영 주체 이해용 */}
        <JsonLd data={organizationSchema(siteInfo)} />
        <JsonLd data={webSiteSchema()} />
      </head>
      <body className="flex min-h-screen flex-col">
        <AnalyticsNoScript />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          본문으로 건너뛰기
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
