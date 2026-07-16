"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/data/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 메뉴 오픈 시 스크롤 잠금
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const mainNav = nav.filter((item) => item.href !== "/contact");

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="container-k flex h-[68px] items-center justify-between md:h-20">
        <Link
          href="/"
          className="text-[22px] font-extrabold tracking-[-0.02em] md:text-2xl"
        >
          K<span className="text-accent">:</span>ZIP
        </Link>

        {/* 데스크톱 내비게이션 */}
        <nav aria-label="주요 메뉴" className="hidden items-center gap-9 lg:flex">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`link-slide text-[15px] transition-colors ${
                isActive(item.href)
                  ? "font-semibold text-ink"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-deep"
          >
            문의하기
          </Link>
        </nav>

        {/* 모바일 메뉴 버튼 */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          className="relative z-[70] flex h-10 w-10 flex-col items-center justify-center gap-[6px] lg:hidden"
        >
          <span
            className={`h-[1.5px] w-6 bg-ink transition-transform duration-300 ${open ? "translate-y-[7.5px] rotate-45" : ""}`}
          />
          <span
            className={`h-[1.5px] w-6 bg-ink transition-opacity duration-300 ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`h-[1.5px] w-6 bg-ink transition-transform duration-300 ${open ? "-translate-y-[7.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* 모바일 풀스크린 메뉴 */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-[60] bg-paper transition-opacity duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav
          aria-label="모바일 메뉴"
          className="container-k flex h-full flex-col justify-center"
        >
          <ul className="space-y-2">
            {nav.map((item, i) => (
              <li
                key={item.href}
                className="overflow-hidden"
              >
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block text-4xl font-extrabold tracking-[-0.02em] transition-all duration-500 ${
                    open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  } ${isActive(item.href) ? "text-accent" : "text-ink"}`}
                  style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="overline-k mt-14">
            Strategy · Content · Digital · Global
          </p>
        </nav>
      </div>
    </header>
  );
}
