"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { EmptyState, Icon, PageHeader, formatDateTime } from "@/components/dashboard/ui";

export default function MonitoringPage() {
  const { activeSite, scans } = useDashboard();

  const diff = useMemo(() => {
    if (scans.length < 2) return null;
    const prev = scans[scans.length - 2];
    const cur = scans[scans.length - 1];
    const pp = prev.crawl.pages[0];
    const cp = cur.crawl.pages[0];
    if (!pp || !cp) return null;
    const changes: { field: string; before: string; after: string; suspicious: boolean }[] = [];
    const cmp = (field: string, before: string | null, after: string | null, suspiciousCheck?: (a: string | null) => boolean) => {
      if ((before || "") !== (after || "")) changes.push({ field, before: before || "(없음)", after: after || "(없음)", suspicious: suspiciousCheck ? suspiciousCheck(after) : false });
    };
    const spamRe = /(카지노|casino|바카라|viagra|비아그라|도박|성인|무료\s*충전|토토|betting)/i;
    cmp("Title", pp.title, cp.title, (a) => spamRe.test(a || ""));
    cmp("Meta Description", pp.metaDescription, cp.metaDescription, (a) => spamRe.test(a || ""));
    cmp("robots meta", pp.metaRobots, cp.metaRobots);
    cmp("Canonical", pp.canonical, cp.canonical);
    // 외부 스크립트 변화
    const extScripts = (pages: typeof pp) => pages.links.filter((l) => !l.internal).length;
    const prevRobots = prev.crawl.robotsTxt.raw?.length ?? 0;
    const curRobots = cur.crawl.robotsTxt.raw?.length ?? 0;
    if (prevRobots !== curRobots) changes.push({ field: "robots.txt 크기", before: `${prevRobots}자`, after: `${curRobots}자`, suspicious: false });
    void extScripts;
    return { prev, cur, changes };
  }, [scans]);

  return (
    <div className="d-fade">
      <PageHeader title="악성코드 · 변조 감시" description="정상 콘텐츠 업데이트와 의심스러운 변경을 구분합니다. 소유 사이트의 검사 스냅샷 간 주요 요소 변화를 비교합니다." />

      {!activeSite ? (
        <EmptyState icon="monitor" title="사이트를 등록하세요" action={<Link href="/dashboard/sites" className="d-btn d-btn-primary">사이트 등록</Link>} />
      ) : !diff ? (
        <EmptyState
          icon="monitor"
          title="비교할 스냅샷이 부족합니다"
          description="변조 감시는 2회 이상의 검사 스냅샷이 필요합니다. 사이트를 두 번 이상 분석하면 이전 스냅샷과의 변화(Title·robots·canonical·스팸 키워드 등)를 비교합니다."
        />
      ) : (
        <>
          <div className="d-card mb-4 flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-[12.5px]" style={{ color: "var(--d-text-soft)" }}>
              비교: <strong>{formatDateTime(diff.prev.scannedAt)}</strong> → <strong>{formatDateTime(diff.cur.scannedAt)}</strong>
            </p>
            <span className="d-badge" style={{ background: diff.changes.some((c) => c.suspicious) ? "var(--d-red-soft)" : diff.changes.length ? "var(--d-orange-soft)" : "var(--d-mint-soft)", color: diff.changes.some((c) => c.suspicious) ? "var(--d-red)" : diff.changes.length ? "var(--d-orange)" : "var(--d-mint)" }}>
              {diff.changes.some((c) => c.suspicious) ? "의심 변경 감지" : diff.changes.length ? `변경 ${diff.changes.length}건` : "변경 없음"}
            </span>
          </div>

          {diff.changes.length === 0 ? (
            <div className="d-card px-5 py-10 text-center">
              <Icon name="check" size={24} className="mx-auto mb-2" style={{ color: "var(--d-mint)" }} />
              <p className="text-[14px] font-bold">주요 요소 변경이 없습니다</p>
              <p className="mt-1 text-[12.5px]" style={{ color: "var(--d-text-mute)" }}>홈페이지 Title·Description·robots·canonical에 변화가 감지되지 않았습니다.</p>
            </div>
          ) : (
            <div className="d-card overflow-x-auto">
              <table className="d-table">
                <thead><tr><th>요소</th><th>이전</th><th>현재</th><th>판정</th></tr></thead>
                <tbody>
                  {diff.changes.map((c, i) => (
                    <tr key={i}>
                      <td className="font-semibold">{c.field}</td>
                      <td className="max-w-[200px] truncate text-[12px]" style={{ color: "var(--d-text-mute)" }}>{c.before}</td>
                      <td className="max-w-[200px] truncate text-[12px]">{c.after}</td>
                      <td>
                        <span className="d-badge" style={{ background: c.suspicious ? "var(--d-red-soft)" : "var(--d-orange-soft)", color: c.suspicious ? "var(--d-red)" : "var(--d-orange)" }}>
                          {c.suspicious ? "⚠ 스팸 의심" : "변경 확인 필요"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-[11.5px]" style={{ color: "var(--d-text-mute)" }}>
            전체 파일 무결성·신규 관리자 계정·리디렉션 감지는 서버 접근 권한이 필요한 항목으로, 소유권 인증 및 정기 스냅샷 자동화(2차 개발) 연동 후 확장됩니다.
          </p>
        </>
      )}
    </div>
  );
}
