import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import CTABand from "@/components/CTABand";
import { services } from "@/data/services";

export const metadata: Metadata = {
  title: "서비스",
  description:
    "전략 기획, 디지털 마케팅, 브랜드 콘텐츠, 일본·글로벌 마케팅, 프로젝트 매니지먼트까지 — K:ZIP의 12개 서비스 영역을 소개합니다.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        overline="Services"
        title="전략에서 실행까지, 12개의 서비스 영역"
        description="개별 서비스는 따로 움직이지 않습니다. 프로젝트의 목표에 맞춰 필요한 영역을 조합해 하나의 실행 구조로 설계합니다."
      />

      <section>
        <div className="container-k py-16 md:py-24">
          <ul className="border-t border-line">
            {services.map((service, i) => (
              <li key={service.slug} className="border-b border-line">
                <Reveal delay={(i % 4) * 50}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="group grid gap-2 py-7 md:grid-cols-[80px_1.2fr_2fr_40px] md:items-baseline md:gap-6 md:py-8"
                  >
                    <span className="text-sm font-semibold text-accent">
                      {service.number}
                    </span>
                    <h2 className="text-xl font-bold transition-colors group-hover:text-accent md:text-2xl">
                      {service.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-ink-soft">
                      {service.short}
                    </p>
                    <span
                      aria-hidden
                      className="hidden text-ink-mute transition-transform group-hover:translate-x-1 group-hover:text-accent md:block"
                    >
                      →
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTABand />
    </>
  );
}
