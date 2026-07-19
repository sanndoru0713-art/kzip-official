import Script from "next/script";

/**
 * 분석 도구 로더 — 환경변수가 설정된 경우에만 렌더링됩니다.
 *
 * - NEXT_PUBLIC_GTM_ID  : Google Tag Manager (설정 시 GA4는 GTM 안에서 관리 권장)
 * - NEXT_PUBLIC_GA4_ID  : GA4 gtag.js 직접 설치 (GTM 미사용 시)
 *
 * 개인정보 보호:
 * - 이 컴포넌트와 trackEvent()는 이메일·연락처 등 개인정보를 전송하지 않습니다.
 * - 이벤트 파라미터에 폼 입력값(개인정보)을 넣지 마세요.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

export default function Analytics() {
  if (!GTM_ID && !GA4_ID) return null;

  return (
    <>
      {GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}
      {!GTM_ID && GA4_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}

/** GTM 사용 시 스크립트 차단 환경 대비 noscript — body 최상단에 배치합니다. */
export function AnalyticsNoScript() {
  if (!GTM_ID) return null;
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
