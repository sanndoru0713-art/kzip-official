"use client";

import Reveal from "@/components/Reveal";
import { useScrollSpy } from "@/components/useScrollSpy";

export type Capability = {
  number: string;
  title: string;
  description: string;
};

/**
 * 일본·글로벌 페이지 타임라인 — 스크롤에 따라 현재 항목만 파란색으로 활성화.
 * 마크업·타이포는 기존과 동일합니다.
 */
export default function GlobalPageTimeline({ items }: { items: Capability[] }) {
  const { active, setRef } = useScrollSpy<HTMLLIElement>(items.length);

  return (
    <ol className="relative border-l border-line pl-10 md:pl-14">
      {items.map((item, i) => {
        const isActive = i === active;
        return (
          <li
            key={item.number}
            ref={setRef(i)}
            data-spy-index={i}
            className={i === 0 ? "" : "mt-16 md:mt-20"}
          >
            <Reveal delay={(i % 3) * 60}>
              <span
                aria-hidden
                className={`absolute -left-[5px] mt-2.5 block h-[9px] w-[9px] rounded-full transition-all duration-500 ${
                  isActive ? "scale-110 bg-accent" : "bg-[#d7dbe3]"
                }`}
              />
              <p
                className={`text-[12px] font-bold tracking-[0.2em] transition-colors duration-500 ${
                  isActive ? "text-accent" : "text-ink-mute"
                }`}
              >
                {item.number}
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.015em] md:text-[1.7rem]">
                {item.title}
              </h3>
              <p
                className={`mt-4 max-w-lg text-[15px] leading-[1.8] transition-colors duration-500 ${
                  isActive ? "text-ink" : "text-ink-soft"
                }`}
              >
                {item.description}
              </p>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
