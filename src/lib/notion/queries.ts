/**
 * 홈페이지에서 사용하는 CMS 조회 함수.
 *
 * 동작 원칙:
 * 1. 환경변수가 없으면 즉시 로컬 데이터(src/data/*)를 사용합니다.
 * 2. Notion 조회 성공 시 "공개 여부"가 체크된 행만 노출하고 순서로 정렬합니다.
 * 3. Notion 데이터는 slug 기준으로 로컬 데이터와 병합됩니다
 *    (Notion에 없는 필드는 로컬 값 유지 — 예: 서비스의 '진행 방식').
 * 4. 공개된 행이 하나도 없거나 API 오류가 발생하면 로컬 데이터로 폴백하고,
 *    오류는 서버 로그에만 남깁니다 (사용자 화면에는 노출하지 않음).
 * 5. 결과는 unstable_cache로 5분(300초)간 캐싱됩니다 —
 *    Notion 수정 내용은 최대 5분 내에 홈페이지에 반영됩니다.
 */
import { unstable_cache } from "next/cache";
import { getPageBlocks, isNotionConfigured, notionEnv, queryDatabase } from "./client";
import {
  isPublished,
  mapInsight,
  mapProfile,
  mapProject,
  mapService,
  mapSiteInfo,
  type CmsInsight,
} from "./mappers";
import { services as localServices, type Service } from "@/data/services";
import { projects as localProjects, type Project } from "@/data/projects";
import { insights as localInsights, type Insight } from "@/data/insights";
import { site as localSite } from "@/data/site";
import type { CeoProfile, SiteInfo } from "@/types/notion";

const REVALIDATE_SECONDS = 300;

function logNotionError(scope: string, error: unknown) {
  console.error(`[notion-cms] ${scope} 조회 실패 — 로컬 데이터로 폴백합니다.`, error);
}

/** Notion 응답 요약을 서버 로그에 남깁니다 (Vercel Logs에서 확인 가능). */
function logNotionResult(scope: string, total: number, published: number) {
  if (published > 0) {
    console.log(
      `[notion-cms] ${scope}: Notion ${total}행 조회 → 공개 ${published}건 사용 (source: notion)`,
    );
  } else {
    console.warn(
      `[notion-cms] ${scope}: Notion ${total}행 조회 → 공개된 행이 없어 로컬 데이터 사용 (source: fallback)`,
    );
  }
}

// ————— 서비스 —————

export type ServiceWithImage = Service & { imageUrl?: string };

const fetchServices = unstable_cache(
  async (databaseId: string) => queryDatabase(databaseId),
  ["notion-services"],
  { revalidate: REVALIDATE_SECONDS, tags: ["notion-cms"] },
);

export async function getServices(): Promise<ServiceWithImage[]> {
  const databaseId = notionEnv.servicesDb();
  if (!isNotionConfigured(databaseId)) return localServices;
  try {
    const pages = await fetchServices(databaseId);
    const rows = pages
      .filter(isPublished)
      .map(mapService)
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => a.order - b.order);
    logNotionResult("서비스", pages.length, rows.length);
    if (rows.length === 0) return localServices;

    return rows.map((row, i) => {
      const base = localServices.find((s) => s.slug === row.slug);
      return {
        number: base?.number ?? String(i + 1).padStart(2, "0"),
        problems: [],
        scope: [],
        process: base?.process ?? [],
        deliverables: [],
        short: "",
        title: row.slug,
        ...base,
        ...row,
      } as ServiceWithImage;
    });
  } catch (error) {
    logNotionError("서비스", error);
    return localServices;
  }
}

export async function getServiceBySlug(slug: string): Promise<ServiceWithImage | undefined> {
  const services = await getServices();
  return services.find((s) => s.slug === slug);
}

// ————— 프로젝트 —————

export type ProjectWithImage = Project & { imageUrl?: string };

const fetchProjects = unstable_cache(
  async (databaseId: string) => queryDatabase(databaseId),
  ["notion-projects"],
  { revalidate: REVALIDATE_SECONDS, tags: ["notion-cms"] },
);

export async function getProjects(): Promise<ProjectWithImage[]> {
  const databaseId = notionEnv.projectsDb();
  if (!isNotionConfigured(databaseId)) return localProjects;
  try {
    const pages = await fetchProjects(databaseId);
    const rows = pages
      .filter(isPublished)
      .map(mapProject)
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .sort((a, b) => a.order - b.order);
    logNotionResult("프로젝트", pages.length, rows.length);
    if (rows.length === 0) return localProjects;

    return rows.map((row) => {
      const base = localProjects.find((p) => p.slug === row.slug);
      return {
        title: row.slug,
        category: "프로젝트",
        summary: "",
        confidential: false,
        overview: base?.overview ?? row.summary ?? "",
        challenge: base?.challenge ?? "",
        approach: base?.approach ?? "",
        execution: [],
        deliverables: base?.deliverables ?? [],
        results: "",
        role: "",
        period: "",
        relatedServices: base?.relatedServices ?? [],
        ...base,
        ...row,
      } as ProjectWithImage;
    });
  } catch (error) {
    logNotionError("프로젝트", error);
    return localProjects;
  }
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithImage | undefined> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug);
}

// ————— 인사이트 —————

export type InsightWithMeta = Insight & { imageUrl?: string; notionPageId?: string };

const fetchInsights = unstable_cache(
  async (databaseId: string) => queryDatabase(databaseId),
  ["notion-insights"],
  { revalidate: REVALIDATE_SECONDS, tags: ["notion-cms"] },
);

export async function getInsights(): Promise<InsightWithMeta[]> {
  const databaseId = notionEnv.insightsDb();
  if (!isNotionConfigured(databaseId)) return localInsights;
  try {
    const pages = await fetchInsights(databaseId);
    const rows = pages
      .filter(isPublished)
      .map(mapInsight)
      .filter((r): r is CmsInsight => r !== null)
      .sort((a, b) => a.order - b.order || b.date.localeCompare(a.date));
    logNotionResult("인사이트", pages.length, rows.length);
    if (rows.length === 0) return localInsights;

    return rows.map((row) => {
      const base = localInsights.find((i) => i.slug === row.slug);
      return { ...base, ...row, summary: row.summary || base?.summary || "" };
    });
  } catch (error) {
    logNotionError("인사이트", error);
    return localInsights;
  }
}

export async function getInsightBySlug(slug: string): Promise<InsightWithMeta | undefined> {
  const insights = await getInsights();
  return insights.find((i) => i.slug === slug);
}

const fetchInsightBlocks = unstable_cache(
  async (pageId: string) => getPageBlocks(pageId),
  ["notion-insight-body"],
  { revalidate: REVALIDATE_SECONDS, tags: ["notion-cms"] },
);

/** 인사이트 본문 — Notion 페이지 본문의 문단·리스트를 텍스트 배열로 변환 */
export async function getInsightBody(insight: InsightWithMeta): Promise<string[] | undefined> {
  if (!insight.notionPageId) return insight.body;
  try {
    const blocks = await fetchInsightBlocks(insight.notionPageId);
    const paragraphs = blocks
      .map((block) => {
        const rich =
          block.paragraph?.rich_text ??
          block.heading_2?.rich_text ??
          block.heading_3?.rich_text ??
          block.bulleted_list_item?.rich_text;
        const text = (rich ?? []).map((t) => t.plain_text).join("").trim();
        return block.type === "bulleted_list_item" && text ? `· ${text}` : text;
      })
      .filter(Boolean);
    // "[본문 준비 중]" 안내만 있는 경우는 본문이 없는 것으로 처리
    const meaningful = paragraphs.filter((p) => !p.startsWith("[본문 준비 중]"));
    return meaningful.length > 0 ? meaningful : insight.body;
  } catch (error) {
    logNotionError("인사이트 본문", error);
    return insight.body;
  }
}

// ————— 사이트 기본정보 —————

const localSiteInfo: SiteInfo = {
  ceo: localSite.ceo,
  email: localSite.contact.email,
  phone: localSite.contact.phone,
  address: localSite.contact.address,
  businessNumber: localSite.contact.businessNumber,
  description: localSite.description,
  mainCopyLines: ["전략을 설계하고,", "성장을 실행합니다."],
  subCopy:
    "K:ZIP는 전략, 콘텐츠, 디지털 채널, 데이터와 글로벌 시장을 연결해 브랜드와 조직의 지속 가능한 성장 구조를 만듭니다.",
};

const fetchSiteInfo = unstable_cache(
  async (databaseId: string) => queryDatabase(databaseId),
  ["notion-site-info"],
  { revalidate: REVALIDATE_SECONDS, tags: ["notion-cms"] },
);

export async function getSiteInfo(): Promise<SiteInfo> {
  const databaseId = notionEnv.siteDb();
  if (!isNotionConfigured(databaseId)) return localSiteInfo;
  try {
    const pages = await fetchSiteInfo(databaseId);
    const published = pages.filter(isPublished);
    logNotionResult("사이트 기본정보", pages.length, published.length);
    if (published.length === 0) return localSiteInfo;
    // 단일 레코드 운영 원칙 — 공개된 첫 번째 행만 사용
    return { ...localSiteInfo, ...mapSiteInfo(published[0]) };
  } catch (error) {
    logNotionError("사이트 기본정보", error);
    return localSiteInfo;
  }
}

// ————— 대표 프로필 —————

const fetchProfile = unstable_cache(
  async (databaseId: string) => queryDatabase(databaseId),
  ["notion-profile"],
  { revalidate: REVALIDATE_SECONDS, tags: ["notion-cms"] },
);

export async function getCeoProfile(): Promise<CeoProfile> {
  const databaseId = notionEnv.profileDb();
  if (!isNotionConfigured(databaseId)) return null;
  try {
    const pages = await fetchProfile(databaseId);
    const published = pages.filter(isPublished);
    logNotionResult("대표 프로필", pages.length, published.length);
    if (published.length === 0) return null;
    return mapProfile(published[0]);
  } catch (error) {
    logNotionError("대표 프로필", error);
    return null;
  }
}
