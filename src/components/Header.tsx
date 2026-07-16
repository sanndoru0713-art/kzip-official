"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/data/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 페이지 이동 시 모바일 메뉴 닫기
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm">
      {/* 슬림 유틸리티 바 */}
      <div className="border-b border-line bg-paper-deep/60">
        <div className="container-k flex h-8 items-center justify-between text-[11px] tracking-widest text-ink-mute">
          <p className="uppercase">Strategy · Content · Digital · Global</p>
          <p className="hidden sm:block">한국어 · 日本語 · English 프로젝트 대응</p>
        </div>
      </div>

      <div className="container-k flex h-16 items-center justify-between md:h-[72px]">
        <Link href="/" className="text-xl font-extrabold tracking-tight md:text-2xl">
          K<span className="text-accent">:</span>ZIP
        </Link>

        {/* 데스크톱 내비게이션 */}
        <nav aria-label="주요 메뉴" className="hidden items-center gap-7 lg:flex">
          {nav.map((item) =>
            item.href === "/contact" ? (
              <Link
                key={item.href}
                href={item.href}
                className="border border-ink px-4 py-2 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
              >
                {item.label}
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors hover:text-accent ${
                  isActive(item.href) ? "font-semibold text-accent" : "text-ink-soft"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
        >
          <span
            className={`h-[1.5px] w-5 bg-ink transition-transform ${open ? "translate-y-[6.5px] rotate-45" : ""}`}
          />
          <span className={`h-[1.5px] w-5 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-[1.5px] w-5 bg-ink transition-transform ${open ? "-translate-y-[6.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="모바일 메뉴"
          className="border-t border-line bg-paper lg:hidden"
        >
          <ul className="container-k divide-y divide-line py-2">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block py-4 text-base ${
                    isActive(item.href) ? "font-semibold text-accent" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
