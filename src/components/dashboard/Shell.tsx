"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_SECTIONS } from "./nav";
import { useDashboard } from "./DashboardProvider";
import { formatDateTime, Icon } from "./ui";
import { SITE_TYPE_LABEL } from "@/lib/seo/types";

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col overflow-y-auto pb-6">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-5 pb-2 pt-5" onClick={onNavigate}>
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[15px] font-extrabold text-white"
          style={{ background: "var(--d-grad-sky)" }}
        >
          K
        </span>
        <span className="leading-tight">
          <span className="block text-[14.5px] font-extrabold tracking-tight">K:ZIP Search Lab</span>
          <span className="block text-[10.5px] font-medium" style={{ color: "var(--d-text-mute)" }}>
            SEO · AEO · GEO 분석 대시보드
          </span>
        </span>
      </Link>
      <nav className="px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="d-side-section">{section.title}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link href={item.href} className="d-side-link" data-active={active} onClick={onNavigate}>
                      <Icon name={item.icon} size={17} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const { sites, activeSite, setActiveSiteId, latestScan, scanning, scanError, runScan, ready } = useDashboard();
  const [drawer, setDrawer] = useState(false);
  const pathname = usePathname();

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [drawer]);

  return (
    <div className="dash flex min-h-dvh">
      {/* 데스크톱 사이드바 */}
      <aside
        className="sticky top-0 hidden h-dvh w-[248px] shrink-0 border-r lg:block"
        style={{ borderColor: "var(--d-border)", background: "var(--d-surface)" }}
      >
        <Sidebar />
      </aside>

      {/* 모바일 드로어 */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-black/30"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[270px] shadow-2xl" style={{ background: "var(--d-surface)" }}>
            <Sidebar onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* 상단 바 */}
        <header
          className="sticky top-0 z-40 border-b backdrop-blur"
          style={{ borderColor: "var(--d-border)", background: "rgba(255,255,255,0.85)" }}
        >
          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 md:px-6">
            <button
              className="d-btn d-btn-ghost -ml-2 !p-2 lg:hidden"
              aria-label="메뉴 열기"
              onClick={() => setDrawer(true)}
            >
              <Icon name="menu" size={20} />
            </button>

            {/* 사이트 선택 */}
            {ready && sites.length > 0 ? (
              <div className="flex min-w-0 items-center gap-2">
                <select
                  className="d-select !w-auto max-w-[210px] !rounded-full !py-1.5 text-[13px] font-semibold"
                  value={activeSite?.id || ""}
                  onChange={(e) => setActiveSiteId(e.target.value)}
                  aria-label="분석 대상 사이트 선택"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({SITE_TYPE_LABEL[s.type]})
                    </option>
                  ))}
                </select>
                <span className="hidden truncate text-[12px] md:block" style={{ color: "var(--d-text-mute)" }}>
                  {activeSite?.url}
                </span>
              </div>
            ) : ready ? (
              <Link href="/dashboard/sites" className="d-btn d-btn-secondary d-btn-sm">
                <Icon name="plus" size={15} /> 사이트 등록
              </Link>
            ) : null}

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden text-[11.5px] sm:block" style={{ color: "var(--d-text-mute)" }}>
                마지막 검사{" "}
                <strong style={{ color: "var(--d-text-soft)" }}>{formatDateTime(latestScan?.scannedAt)}</strong>
              </span>
              {activeSite && (
                <button
                  className="d-btn d-btn-primary d-btn-sm"
                  disabled={!!scanning}
                  onClick={() => runScan(activeSite)}
                >
                  {scanning ? <span className="d-spinner" /> : <Icon name="refresh" size={15} />}
                  {scanning ? "분석 중…" : "분석 실행"}
                </button>
              )}
            </div>
          </div>
          {scanning && (
            <div className="px-4 pb-2 text-[12px] md:px-6" style={{ color: "var(--d-sky-deep)" }}>
              {scanning.stage}
            </div>
          )}
          {scanError && !scanning && (
            <div className="px-4 pb-2 text-[12px] md:px-6" style={{ color: "var(--d-red)" }}>
              ⚠ {scanError}
            </div>
          )}
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>

        <footer className="px-6 pb-6 pt-2 text-[11px]" style={{ color: "var(--d-text-mute)" }}>
          K:ZIP Search Lab — 내부 운영 도구 · 모든 점수는 실제 크롤링·API 데이터 기반으로만 산출되며, 미연결 데이터는
          &ldquo;데이터 미연결&rdquo;로 표시됩니다.
        </footer>
      </div>
    </div>
  );
}
