/**
 * 서버 전용 Notion API 클라이언트.
 * - 브라우저에서 절대 import하지 마세요 (API 키 노출 방지).
 * - 외부 SDK 없이 fetch 기반으로 구현해 의존성을 최소화했습니다.
 */
import type { NotionBlocksResponse, NotionPage, NotionQueryResponse } from "@/types/notion";

// 테스트 환경에서 모의 서버로 대체 가능 (기본값: 실제 Notion API)
const NOTION_API = process.env.NOTION_API_BASE_URL ?? "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export const notionEnv = {
  apiKey: () => process.env.NOTION_API_KEY,
  siteDb: () => process.env.NOTION_SITE_DATABASE_ID,
  servicesDb: () => process.env.NOTION_SERVICES_DATABASE_ID,
  projectsDb: () => process.env.NOTION_PROJECTS_DATABASE_ID,
  insightsDb: () => process.env.NOTION_INSIGHTS_DATABASE_ID,
  profileDb: () => process.env.NOTION_PROFILE_DATABASE_ID,
  crmDb: () => process.env.NOTION_CRM_DATABASE_ID,
};

export function isNotionConfigured(databaseId: string | undefined): databaseId is string {
  return Boolean(notionEnv.apiKey() && databaseId);
}

function headers(): HeadersInit {
  return {
    Authorization: `Bearer ${notionEnv.apiKey()}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

/** 데이터베이스 전체 행 조회 (페이지네이션 포함, 최대 3페이지 = 300행) */
export async function queryDatabase(
  databaseId: string,
  body: Record<string, unknown> = {},
): Promise<NotionPage[]> {
  const pages: NotionPage[] = [];
  let cursor: string | null = null;

  for (let i = 0; i < 3; i++) {
    const res = await fetch(`${NOTION_API}/databases/${databaseId}/query`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(cursor ? { ...body, start_cursor: cursor } : body),
      // POST는 Next 데이터 캐시 대상이 아니므로 호출부에서 unstable_cache로 캐싱합니다.
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Notion query failed (${res.status}): ${await res.text()}`);
    }
    const data = (await res.json()) as NotionQueryResponse;
    pages.push(...data.results);
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return pages;
}

/** 페이지 본문 블록 조회 (인사이트 본문용) */
export async function getPageBlocks(pageId: string): Promise<NotionBlocksResponse["results"]> {
  const res = await fetch(`${NOTION_API}/blocks/${pageId}/children?page_size=100`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Notion blocks fetch failed (${res.status})`);
  }
  const data = (await res.json()) as NotionBlocksResponse;
  return data.results;
}

/** CRM 등 데이터베이스에 페이지(행) 생성 */
export async function createPage(
  databaseId: string,
  properties: Record<string, unknown>,
): Promise<{ id: string }> {
  const res = await fetch(`${NOTION_API}/pages`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Notion page create failed (${res.status}): ${await res.text()}`);
  }
  return (await res.json()) as { id: string };
}
