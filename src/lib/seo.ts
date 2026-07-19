/**
 * 페이지별 메타데이터 중앙 헬퍼.
 *
 * 모든 페이지는 이 헬퍼를 통해 다음을 일관되게 출력합니다.
 * - self-referencing canonical
 * - 페이지 고유 Open Graph (title / description / url / locale / type)
 * - X(Twitter) 카드
 * - noindex가 필요한 페이지의 robots
 *
 * 다국어 확장 시(예: /ja 경로 추가) `languages`에 언어별 경로를 전달하면
 * hreflang(alternates.languages)이 함께 출력됩니다. 번역 페이지는 각자
 * self-referencing canonical을 유지해야 하며, canonical을 다른 언어로
 * 합치지 않습니다.
 */
import type { Metadata } from "next";
import { site } from "@/data/site";

export const SITE_LOCALE = "ko_KR";
export const SITE_LANG = "ko";

const base = site.url.replace(/\/$/, "");

/** 사이트 기준 절대 URL. path는 "/about" 형태를 사용합니다. */
export function absoluteUrl(path = "/"): string {
  if (path === "/" || path === "") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * CMS·로컬 데이터의 미입력 placeholder("[…입력 필요]" 형태)를 걸러냅니다.
 * 구조화 데이터 등 외부로 나가는 값에 placeholder가 노출되지 않도록 합니다.
 */
export function realValue(value?: string | null): string | undefined {
  const v = value?.trim();
  if (!v || v.startsWith("[")) return undefined;
  return v;
}

type PageMetadataInput = {
  /** 페이지 고유 타이틀. 레이아웃의 "%s | K:ZIP" 템플릿이 적용됩니다. */
  title: string;
  /** 템플릿을 무시하고 title을 그대로 사용할 때 (홈 등) */
  absoluteTitle?: boolean;
  description: string;
  /** "/about" 형태의 경로. canonical과 og:url에 사용됩니다. */
  path: string;
  ogType?: "website" | "article";
  /** 검색 노출이 불필요한 페이지 (개인정보처리방침 등) */
  noindex?: boolean;
  /** ogType이 article일 때의 발행일 (YYYY-MM-DD) */
  publishedTime?: string;
  /** 다국어 경로가 생기면 { ja: "/ja/...", "x-default": "/..." } 형태로 전달 */
  languages?: Record<string, string>;
};

export function pageMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
  ogType = "website",
  noindex = false,
  publishedTime,
  languages,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: {
      canonical: url,
      ...(languages
        ? {
            languages: Object.fromEntries(
              Object.entries(languages).map(([lang, langPath]) => [
                lang,
                absoluteUrl(langPath),
              ]),
            ),
          }
        : {}),
    },
    openGraph: {
      type: ogType,
      locale: SITE_LOCALE,
      siteName: site.name,
      title: fullTitle,
      description,
      url,
      ...(ogType === "article" && publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
