"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav } from "@/data/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // 스크롤 시 헤더 축소 — rAF 스로틀
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > 32);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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
    <header
      // 메뉴 오픈 시 backdrop-filter 제거 — filter가 containing block을 만들어
      // fixed 풀스크린 메뉴가 헤더 영역에 갇히는 것을 방지
      className={`sticky top-0 z-50 border-b border-line transition-colors duration-300 ${
        open
          ? "bg-paper"
          : scrolled
            ? "bg-paper/95 backdrop-blur-md"
            : "bg-paper/90 backdrop-blur-md"
      }`}
    >
      <div
        className={`container-k flex items-center justify-between transition-[height] duration-300 ease-out ${
          scrolled ? "h-14 md:h-16" : "h-[68px] md:h-20"
        }`}
      >
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
