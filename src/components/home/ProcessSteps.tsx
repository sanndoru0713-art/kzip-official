"use client";

import Reveal from "@/components/Reveal";
import { useScrollSpy } from "@/components/useScrollSpy";

export type ProcessStep = {
  step: string;
  name: string;
  description: string;
};

/**
 * 홈 업무 수행 방식 — 스크롤 진행에 따라 단계가 차례로 활성화되고,
 * 각 단계의 상단 선이 파란색으로 채워집니다. 레이아웃은 기존과 동일합니다.
 */
export default function ProcessSteps({ steps }: { steps: ProcessStep[] }) {
  const { active, setRef } = useScrollSpy<HTMLLIElement>(steps.length);

  return (
    <ol className="lg:col-span-6 lg:col-start-7">
      {steps.map((item, i) => {
        const isActive = i === active;
        const isPassed = i <= active;
        return (
          <li
            key={item.step}
            ref={setRef(i)}
            data-spy-index={i}
            className={`relative border-t border-night-line py-10 md:py-12 ${
              i === steps.length - 1 ? "border-b" : ""
            }`}
          >
            {/* 단계 진행선 — 활성화된 단계까지 파란색으로 채움 */}
            <span
              aria-hidden
              className={`absolute inset-x-0 -top-px h-px origin-left bg-accent transition-transform duration-700 ${
                isPassed ? "scale-x-100" : "scale-x-0"
              }`}
              style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
            />
            <Reveal delay={i * 60}>
              <div className="flex items-start gap-8">
                <span
                  className={`text-[13px] font-bold tracking-[0.15em] transition-colors duration-500 ${
                    isActive
                      ? "text-accent"
                      : isPassed
                        ? "text-white/60"
                        : "text-white/35"
                  }`}
                >
                  {item.step}
                </span>
                <div>
                  <h3
                    className={`text-2xl font-bold tracking-[-0.01em] transition-colors duration-500 md:text-3xl ${
                      isActive ? "text-white" : "text-white/75"
                    }`}
                  >
                    {item.name}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/55">
                    {item.description}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        );
      })}
    </ol>
  );
}
