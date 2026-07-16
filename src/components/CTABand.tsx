import Link from "next/link";
import Reveal from "@/components/Reveal";

/** 페이지 하단 공통 문의 CTA — 초대형 타이포 중심. */
export default function CTABand() {
  return (
    <section className="border-t border-line bg-paper">
      <div className="container-k py-28 md:py-44">
        <Reveal className="reveal-mask">
          <p className="overline-k">
            <span className="text-accent">Contact</span>
          </p>
          <h2 className="display-1 mt-8 text-ink">
            <span className="mask-line">
              <span>새로운 프로젝트를</span>
            </span>
            <span className="mask-line">
              <span>준비하고 계신가요?</span>
            </span>
          </h2>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-10 flex flex-col gap-8 md:mt-14 md:flex-row md:items-center md:justify-between">
            <p className="max-w-xl text-[17px] leading-relaxed text-ink-soft md:text-lg">
              목표와 현재 고민을 알려주시면 K:ZIP가 필요한 전략과 실행 방식을
              함께 설계합니다.
            </p>
            <Link
              href="/contact"
              className="group inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-accent px-9 py-4.5 text-base font-semibold text-white transition-colors hover:bg-accent-deep"
            >
              프로젝트 문의하기
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
