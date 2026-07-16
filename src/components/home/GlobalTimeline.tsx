"use client";

import Link from "next/link";
import Reveal from "@/components/Reveal";
import { useScrollSpy } from "@/components/useScrollSpy";

/**
 * 홈 일본·글로벌 타임라인 — 스크롤 위치에 따라 현재 단계만 파란색으로 활성화.
 * 레이아웃·타이포는 기존 서버 렌더링 마크업과 동일합니다.
 */
export default function GlobalTimeline({ items }: { items: string[] }) {
  const { active, setRef } = useScrollSpy<HTMLLIElement>(items.length);

  return (
    <>
      <ol className="relative border-l border-line pl-10">
        {items.map((capability, i) => {
          const isActive = i === active;
          return (
            <li
              key={capability}
              ref={setRef(i)}
              data-spy-index={i}
              className={i === 0 ? "" : "mt-14"}
            >
              <Reveal delay={i * 70}>
                <span
                  aria-hidden
                  className={`absolute -left-[5px] mt-2 block h-[9px] w-[9px] rounded-full transition-all duration-500 ${
                    isActive ? "scale-110 bg-accent" : "bg-[#d7dbe3]"
                  }`}
                />
                <p
                  className={`text-[12px] font-bold tracking-[0.2em] transition-colors duration-500 ${
                    isActive ? "text-accent" : "text-ink-mute"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-xl font-bold tracking-[-0.01em] md:text-2xl">
                  {capability}
                </h3>
              </Reveal>
            </li>
          );
        })}
      </ol>
      <Reveal delay={100}>
        <Link
          href="/global"
          className="group ml-10 mt-14 inline-flex items-center gap-2 text-[15px] font-semibold transition-colors hover:text-accent"
        >
          일본·글로벌 자세히 보기
          <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">
            →
          </span>
        </Link>
      </Reveal>
    </>
  );
}
