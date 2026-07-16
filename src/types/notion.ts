/**
 * Notion CMS 관련 타입.
 * 콘텐츠 타입(Service, Project, Insight)은 기존 src/data/*의 타입을 그대로 사용하고,
 * 여기에는 Notion 원본 응답과 CMS 전용 엔티티 타입만 정의합니다.
 */

/** Notion API 페이지 객체(필요한 부분만) */
export type NotionPage = {
  id: string;
  properties: Record<string, NotionPropertyValue>;
};

export type NotionPropertyValue = {
  type: string;
  title?: { plain_text: string }[];
  rich_text?: { plain_text: string }[];
  number?: number | null;
  checkbox?: boolean;
  select?: { name: string } | null;
  multi_select?: { name: string }[];
  email?: string | null;
  phone_number?: string | null;
  url?: string | null;
  date?: { start: string } | null;
  files?: {
    type: "file" | "external";
    file?: { url: string };
    external?: { url: string };
  }[];
};

export type NotionQueryResponse = {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
};

export type NotionBlock = {
  type: string;
  paragraph?: { rich_text: { plain_text: string }[] };
  heading_2?: { rich_text: { plain_text: string }[] };
  heading_3?: { rich_text: { plain_text: string }[] };
  bulleted_list_item?: { rich_text: { plain_text: string }[] };
};

export type NotionBlocksResponse = {
  results: NotionBlock[];
  has_more: boolean;
  next_cursor: string | null;
};

/** 사이트 기본정보 (Notion "K:ZIP 사이트 기본정보" 1행) */
export type SiteInfo = {
  ceo: string;
  email: string;
  phone: string;
  address: string;
  businessNumber: string;
  description: string;
  /** 메인 카피 — 줄 단위 배열 (히어로 마스크 리빌 라인) */
  mainCopyLines: string[];
  subCopy: string;
  snsUrl?: string;
};

/** 대표 프로필 (Notion "K:ZIP 대표 프로필" 1행) */
export type CeoProfile = {
  name: string;
  role: string;
  intro: string;
  expertise: string[];
  career: string;
  education: string;
  imageUrl?: string;
} | null;
