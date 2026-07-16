/**
 * CMS 연동 진단 엔드포인트 — 배포 환경에서 /api/cms-status 로 접속해
 * Notion 연동 상태를 즉시 확인할 수 있습니다.
 *
 * 반환 정보: 환경변수 설정 여부(값은 미노출), DB별 실제 Notion API 호출
 * 결과, 전체/공개 행 수, 현재 데이터 소스(notion/fallback).
 * API 키·행 내용 등 민감 정보는 절대 반환하지 않습니다.
 */
import { NextResponse } from "next/server";
import { notionEnv, queryDatabase } from "@/lib/notion/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DbCheck = {
  name: string;
  envSet: boolean;
  status: "ok" | "env_missing" | "api_key_missing" | "error";
  totalRows?: number;
  publishedRows?: number;
  source?: "notion" | "fallback";
  error?: string;
};

async function checkDb(
  name: string,
  databaseId: string | undefined,
  hasPublishFlag: boolean,
): Promise<DbCheck> {
  if (!databaseId) return { name, envSet: false, status: "env_missing", source: "fallback" };
  if (!notionEnv.apiKey()) {
    return { name, envSet: true, status: "api_key_missing", source: "fallback" };
  }
  try {
    const pages = await queryDatabase(databaseId);
    const published = hasPublishFlag
      ? pages.filter((p) => p.properties["공개 여부"]?.checkbox === true).length
      : pages.length;
    return {
      name,
      envSet: true,
      status: "ok",
      totalRows: pages.length,
      publishedRows: published,
      source: published > 0 ? "notion" : "fallback",
    };
  } catch (error) {
    return {
      name,
      envSet: true,
      status: "error",
      source: "fallback",
      error: String(error).slice(0, 300),
    };
  }
}

export async function GET() {
  const databases = await Promise.all([
    checkDb("사이트 기본정보", notionEnv.siteDb(), true),
    checkDb("서비스", notionEnv.servicesDb(), true),
    checkDb("프로젝트", notionEnv.projectsDb(), true),
    checkDb("인사이트", notionEnv.insightsDb(), true),
    checkDb("대표 프로필", notionEnv.profileDb(), true),
    checkDb("문의 CRM", notionEnv.crmDb(), false),
  ]);

  const allNotion = databases
    .filter((d) => d.name !== "문의 CRM")
    .every((d) => d.source === "notion");

  return NextResponse.json({
    checkedAt: new Date().toISOString(),
    apiKeySet: Boolean(notionEnv.apiKey()),
    overall: allNotion
      ? "모든 콘텐츠를 Notion에서 조회 중"
      : "일부 또는 전체가 fallback(로컬 데이터) 모드",
    databases,
    hint: "status=env_missing → Vercel 환경변수 누락 / status=error → error 필드 확인(권한 공유·ID 확인) / source=fallback(status=ok) → 공개 여부가 체크된 행 없음",
  });
}
