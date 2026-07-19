/**
 * JSON-LD 구조화 데이터 빌더.
 *
 * 원칙:
 * - 실제 페이지에 존재하는 정보만 출력합니다. 가격·리뷰·별점 등
 *   존재하지 않는 정보를 만들지 않습니다.
 * - CMS 미입력 placeholder("[…입력 필요]")는 realValue()로 걸러
 *   구조화 데이터에 노출하지 않습니다.
 * - 사이트에 검색 기능이 없으므로 SearchAction은 출력하지 않습니다.
 *   (검색 페이지가 생기면 webSiteSchema에 potentialAction을 추가하세요.)
 */
import { site } from "@/data/site";
import { absoluteUrl, realValue, SITE_LANG } from "@/lib/seo";
import type { SiteInfo } from "@/types/notion";

type JsonLdObject = Record<string, unknown>;

const ORG_ID = `${absoluteUrl("/")}#organization`;

/** Organization — 사이트 운영 주체. 레이아웃에서 전 페이지에 출력됩니다. */
export function organizationSchema(siteInfo?: SiteInfo): JsonLdObject {
  const email = realValue(siteInfo?.email);
  const phone = realValue(siteInfo?.phone);
  const address = realValue(siteInfo?.address);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    alternateName: site.nameKo,
    url: absoluteUrl("/"),
    description: site.description,
    logo: absoluteUrl("/icon.svg"),
    ...(email ? { email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(address ? { address } : {}),
    ...(email
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email,
            availableLanguage: ["Korean", "Japanese", "English"],
          },
        }
      : {}),
  };
}

/** WebSite — 사이트 엔터티. 레이아웃에서 전 페이지에 출력됩니다. */
export function webSiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: absoluteUrl("/"),
    inLanguage: SITE_LANG,
    publisher: { "@id": ORG_ID },
  };
}

export type BreadcrumbItem = { name: string; path: string };

/** BreadcrumbList — 홈부터 현재 페이지까지의 경로. */
export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "홈", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** BlogPosting — 인사이트 글. 실제 발행일만 사용하고 임의 값을 만들지 않습니다. */
export function articleSchema({
  title,
  description,
  path,
  datePublished,
  category,
}: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
  category?: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    inLanguage: SITE_LANG,
    mainEntityOfPage: absoluteUrl(path),
    url: absoluteUrl(path),
    ...(datePublished ? { datePublished } : {}),
    ...(category ? { articleSection: category } : {}),
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

/** Service — 서비스 상세. 제공 주체는 Organization을 참조합니다. */
export function serviceSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    ...(description ? { description } : {}),
    url: absoluteUrl(path),
    provider: { "@id": ORG_ID },
    areaServed: ["KR", "JP"],
  };
}

/** ItemList — 목록 페이지(서비스·프로젝트·인사이트)의 항목 나열. */
export function itemListSchema(
  name: string,
  items: { name: string; path: string }[],
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  };
}
