/**
 * Notion 페이지 → 앱 콘텐츠 타입 매퍼.
 * Notion에 없는 필드는 slug 기준으로 기존 로컬 데이터와 병합됩니다 (queries.ts).
 */
import type { NotionPage, NotionPropertyValue, SiteInfo, CeoProfile } from "@/types/notion";
import type { Service } from "@/data/services";
import type { Project } from "@/data/projects";
import type { Insight, InsightCategory } from "@/data/insights";
import { insightCategories } from "@/data/insights";

// ————— 속성 추출 헬퍼 —————

function prop(page: NotionPage, name: string): NotionPropertyValue | undefined {
  return page.properties[name];
}

function plainText(v?: NotionPropertyValue): string {
  const parts = v?.title ?? v?.rich_text;
  return (parts ?? []).map((t) => t.plain_text).join("").trim();
}

function checkbox(v?: NotionPropertyValue): boolean {
  return v?.checkbox === true;
}

function num(v?: NotionPropertyValue): number {
  return typeof v?.number === "number" ? v.number : 999;
}

function select(v?: NotionPropertyValue): string {
  return v?.select?.name ?? "";
}

function multiSelect(v?: NotionPropertyValue): string[] {
  return (v?.multi_select ?? []).map((o) => o.name);
}

function dateStart(v?: NotionPropertyValue): string {
  return v?.date?.start?.slice(0, 10) ?? "";
}

function fileUrl(v?: NotionPropertyValue): string | undefined {
  const f = v?.files?.[0];
  if (!f) return undefined;
  // 외부 URL은 만료되지 않아 안정적이고, Notion 업로드 파일 URL은 약 1시간 후 만료됩니다.
  // 페이지가 5분 주기로 재검증되므로 실사용에서는 대부분 유효하지만, 가급적 외부 URL을 권장합니다 (README 참고).
  return f.type === "external" ? f.external?.url : f.file?.url;
}

/** 줄바꿈으로 구분된 rich text를 목록으로 변환 */
function lines(v?: NotionPropertyValue): string[] {
  return plainText(v)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isPublished(page: NotionPage): boolean {
  return checkbox(prop(page, "공개 여부"));
}

// ————— 엔티티 매퍼 —————
// 반환 타입은 기존 로컬 타입 + 정렬용 order / 이미지 URL 확장입니다.

export type CmsService = Partial<Service> & {
  slug: string;
  order: number;
  imageUrl?: string;
};

export function mapService(page: NotionPage): CmsService | null {
  const slug = plainText(prop(page, "슬러그"));
  if (!slug) return null;
  const title = plainText(prop(page, "서비스명"));
  const short = plainText(prop(page, "요약"));
  const problems = lines(prop(page, "상세 설명"));
  const scope = lines(prop(page, "주요 수행 범위"));
  const deliverables = lines(prop(page, "주요 산출물"));
  return {
    slug,
    order: num(prop(page, "순서")),
    imageUrl: fileUrl(prop(page, "대표 이미지")),
    ...(title && { title }),
    ...(short && { short }),
    ...(problems.length && { problems }),
    ...(scope.length && { scope }),
    ...(deliverables.length && { deliverables }),
  };
}

export type CmsProject = Partial<Project> & {
  slug: string;
  order: number;
  imageUrl?: string;
};

export function mapProject(page: NotionPage): CmsProject | null {
  const slug = plainText(prop(page, "슬러그"));
  if (!slug) return null;
  const title = plainText(prop(page, "프로젝트명"));
  const summary = plainText(prop(page, "프로젝트 요약"));
  const category = select(prop(page, "카테고리"));
  const execution = lines(prop(page, "수행 내용"));
  const results = plainText(prop(page, "성과"));
  const role = plainText(prop(page, "담당 역할"));
  const period = plainText(prop(page, "프로젝트 기간"));
  return {
    slug,
    order: num(prop(page, "노출 순서")),
    imageUrl: fileUrl(prop(page, "대표 이미지")),
    confidential: checkbox(prop(page, "비공개 프로젝트 여부")),
    ...(title && { title }),
    ...(summary && { summary }),
    ...(category && { category }),
    ...(execution.length && { execution }),
    ...(results && { results }),
    ...(role && { role }),
    ...(period && { period }),
  };
}

export type CmsInsight = Insight & {
  order: number;
  notionPageId: string;
  imageUrl?: string;
};

export function mapInsight(page: NotionPage): CmsInsight | null {
  const slug = plainText(prop(page, "슬러그"));
  const title = plainText(prop(page, "제목"));
  if (!slug || !title) return null;
  const rawCategory = select(prop(page, "카테고리"));
  const category: InsightCategory = (insightCategories as string[]).includes(rawCategory)
    ? (rawCategory as InsightCategory)
    : "전략";
  return {
    slug,
    title,
    category,
    summary: plainText(prop(page, "요약")),
    date: dateStart(prop(page, "작성일")) || new Date().toISOString().slice(0, 10),
    order: num(prop(page, "노출 순서")),
    notionPageId: page.id,
    imageUrl: fileUrl(prop(page, "대표 이미지")),
  };
}

export function mapSiteInfo(page: NotionPage): Partial<SiteInfo> {
  const mainCopy = lines(prop(page, "메인 카피"));
  const out: Partial<SiteInfo> = {};
  const set = (key: keyof SiteInfo, value: string) => {
    if (value && !value.startsWith("[")) (out[key] as string) = value;
  };
  set("ceo", plainText(prop(page, "대표자명")));
  set("email", prop(page, "이메일")?.email ?? "");
  set("phone", prop(page, "연락처")?.phone_number ?? "");
  set("address", plainText(prop(page, "주소")));
  set("businessNumber", plainText(prop(page, "사업자등록번호")));
  set("description", plainText(prop(page, "회사 소개 문구")));
  set("subCopy", plainText(prop(page, "서브 카피")));
  if (mainCopy.length > 0) out.mainCopyLines = mainCopy;
  const sns = prop(page, "SNS 링크")?.url;
  if (sns) out.snsUrl = sns;
  return out;
}

export function mapProfile(page: NotionPage): CeoProfile {
  const name = plainText(prop(page, "이름"));
  if (!name) return null;
  const clean = (s: string) => (s.startsWith("[") ? "" : s);
  return {
    name,
    role: clean(plainText(prop(page, "직함"))) || "대표",
    intro: clean(plainText(prop(page, "대표 소개"))),
    expertise: multiSelect(prop(page, "전문 분야")),
    career: clean(plainText(prop(page, "주요 경력"))),
    education: clean(plainText(prop(page, "학력 및 전문성"))),
    imageUrl: fileUrl(prop(page, "프로필 이미지")),
  };
}
