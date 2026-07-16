import Link from "next/link";
import Reveal from "@/components/Reveal";

/** 페이지 하단 공통 문의 CTA. */
export default function CTABand() {
  return (
    <section className="bg-night text-white">
      <div className="container-k py-20 md:py-28">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-[1.5fr_1fr] md:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                Contact
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                새로운 프로젝트를
                <br />
                준비하고 계신가요?
              </h2>
              <p className="mt-5 max-w-xl leading-relaxed text-white/65">
                목표와 현재 고민을 알려주시면 K:ZIP가 필요한 전략과 실행 방식을
                함께 설계합니다.
              </p>
            </div>
            <div className="md:justify-self-end">
              <Link
                href="/contact"
                className="inline-block border border-white/80 px-8 py-4 text-sm font-medium tracking-wide transition-colors hover:bg-white hover:text-night"
              >
                프로젝트 문의하기
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
