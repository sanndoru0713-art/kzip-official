/**
 * 클라이언트 이벤트 추적 헬퍼.
 *
 * GTM(dataLayer)과 GA4(gtag) 어느 쪽이 설치되어 있든 동작하며,
 * 둘 다 없으면 아무 것도 하지 않습니다(no-op).
 *
 * ⚠️ 개인정보 금지: params에 이메일·이름·연락처·문의 본문 등
 * 개인정보/민감정보를 절대 넣지 마세요. 유형·카테고리 같은
 * 비식별 값만 사용합니다.
 */
type EventParams = Record<string, string | number | boolean>;

/** 사이트에서 사용하는 이벤트 이름 — 새 이벤트는 여기에 추가해 관리합니다. */
export type AnalyticsEvent =
  | "contact_submit" // 문의 접수 성공
  | "contact_submit_error" // 문의 접수 실패
  | "contact_mailto_fallback"; // 메일 앱 폴백 사용

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(name: AnalyticsEvent, params: EventParams = {}) {
  if (typeof window === "undefined") return;
  // gtag.js 직접 설치 환경에서는 gtag()가 정식 경로입니다.
  // (dataLayer.push 이벤트는 GTM 없이는 GA4 이벤트로 수집되지 않음)
  if (window.gtag) {
    window.gtag("event", name, params);
  } else if (window.dataLayer) {
    window.dataLayer.push({ event: name, ...params });
  }
}
