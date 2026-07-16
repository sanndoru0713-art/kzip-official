import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import CTABand from "@/components/CTABand";
import { getServices } from "@/lib/notion/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "서비스",
  description:
    "전략 기획, 디지털 마케팅, 브랜드 콘텐츠, 일본·글로벌 마케팅, 프로젝트 매니지먼트까지 — K:ZIP의 12개 서비스 영역을 소개합니다.",
};

/** 매거진 목차 — 행마다 들여쓰기 리듬을 다르게 */
const indentPattern = ["", "lg:pl-24", "lg:pl-48", "lg:pl-24"];

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        overline="Services"
        titleLines={["전략에서 실행까지,", "12개의 서비스 영역"]}
        description="개별 서비스는 따로 움직이지 않습니다. 프로젝트의 목표에 맞춰 필요한 영역을 조합해 하나의 실행 구조로 설계합니다."
      />

      {/* 매거진 목차형 인덱스 */}
      <section>
        <div className="container-k py-20 md:py-28">
          <Reveal>
            <p className="overline-k">Index — {services.length} Services</p>
          </Reveal>
          <ol className="mt-10 border-t border-line">
            {services.map((service, i) => (
              <li key={service.slug} className="border-b border-line">
                <Reveal delay={(i % 4) * 40}>
                  <Link
                    href={`/services/${service.slug}`}
                    className={`group relative flex items-baseline gap-6 py-8 transition-all duration-300 md:gap-10 md:py-10 ${indentPattern[i % 4]}`}
                  >
                    {/* hover 시 하단에서 확장되는 블루 포인트 선 */}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -bottom-px z-10 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100"
                    />
                    <span className="shrink-0 text-[13px] font-bold tracking-[0.15em] text-ink-mute transition-colors group-hover:text-accent">
                      {service.number}
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-[clamp(1.5rem,3.4vw,2.75rem)] font-bold leading-tight tracking-[-0.025em] transition-colors group-hover:text-accent">
                        {service.title}
                        <span
                          aria-hidden
                          className="ml-4 inline-block text-[0.6em] text-ink-mute opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent group-hover:opacity-100"
                        >
                          →
                        </span>
                      </h2>
                      <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                        {service.short}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CTABand />
    </>
  );
}
