/**
 * 외부 데이터 연동 상태 — Google Search Console · GA4 · Bing Webmaster.
 * 자격증명이 설정되기 전에는 connected:false 를 반환한다.
 * 데모 수치는 절대 반환하지 않는다.
 *
 * 연동 방법 (배포 환경 환경변수):
 *  - GSC:  GOOGLE_SERVICE_ACCOUNT_JSON + GSC_SITE_URL (서비스 계정을 Search Console 속성에 '전체' 권한으로 추가)
 *  - GA4:  GOOGLE_SERVICE_ACCOUNT_JSON + GA4_PROPERTY_ID (서비스 계정을 GA4 속성 뷰어로 추가)
 *  - Bing: BING_WEBMASTER_API_KEY
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const hasServiceAccount = !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  return NextResponse.json({
    searchConsole: {
      connected: hasServiceAccount && !!process.env.GSC_SITE_URL,
      requirement: "GOOGLE_SERVICE_ACCOUNT_JSON + GSC_SITE_URL 환경변수 설정 후, 서비스 계정 이메일을 Search Console 속성 사용자로 추가",
    },
    ga4: {
      connected: hasServiceAccount && !!process.env.GA4_PROPERTY_ID,
      requirement: "GOOGLE_SERVICE_ACCOUNT_JSON + GA4_PROPERTY_ID 환경변수 설정 후, 서비스 계정 이메일을 GA4 속성에 뷰어로 추가",
    },
    bing: {
      connected: !!process.env.BING_WEBMASTER_API_KEY,
      requirement: "BING_WEBMASTER_API_KEY 환경변수 설정",
    },
    psi: {
      keyConfigured: !!process.env.PSI_API_KEY,
      requirement: "PSI_API_KEY 없이도 측정 가능하나 쿼터가 낮음. Google Cloud Console에서 PageSpeed Insights API 키 발급 권장",
    },
    ai: {
      connected: !!process.env.ANTHROPIC_API_KEY,
      requirement: "ANTHROPIC_API_KEY 환경변수 설정 시 AI 수정안 생성 활성화",
    },
  });
}
