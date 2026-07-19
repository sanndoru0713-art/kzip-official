import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/**
 * robots.txt — 공개 콘텐츠는 모두 허용하고,
 * 크롤링이 불필요한 서버 엔드포인트(/api/)만 차단합니다.
 * CSS·JS·이미지 등 렌더링 리소스는 차단하지 않습니다.
 */
export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
