import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import CTABand from "@/components/CTABand";

export const metadata: Metadata = {
  title: "일본·글로벌",
  description:
    "K:ZIP의 일본어 역량은 번역 서비스가 아니라 시장 전략과 사업개발 역량입니다. 일본 시장 전략, 로컬라이제이션, SNS 운영, 플랫폼 입점, 글로벌 파트너 커뮤니케이션을 소개합니다.",
};

const japanCapabilities = [
  {
    number: "01",
    title: "일본 시장 전략",
    description:
      "일본 소비자가 신뢰를 확인하는 방식은 다릅니다. 시장·경쟁·고객 분석을 바탕으로 브랜드가 일본 시장에서 작동하는 진입 전략을 설계합니다.",
  },
  {
    number: "02",
    title: "콘텐츠 로컬라이제이션",
    description:
      "직역이 아니라 재설계입니다. 일본 고객의 언어 감각, 정보 탐색 습관, 구매 결정 방식에 맞춰 콘텐츠의 구조와 표현을 다시 만듭니다.",
  },
  {
    number: "03",
    title: "일본 SNS 운영",
    description:
      "일본 시장의 채널 문법에 맞춘 콘텐츠 편성과 계정 운영으로, 브랜드가 현지 고객과 관계를 쌓아가는 구조를 만듭니다.",
  },
  {
    number: "04",
    title: "일본 고객 예약 동선",
    description:
      "콘텐츠 접점에서 문의·예약까지, 일본 고객이 익숙한 방식으로 이동할 수 있는 전환 동선을 설계하고 운영합니다.",
  },
  {
    number: "05",
    title: "일본 인플루언서",
    description:
      "브랜드와 캠페인 목적에 맞는 일본 크리에이터를 발굴하고, 제안부터 계약, 콘텐츠 검수, 성과 정리까지 협업 전 과정을 관리합니다.",
  },
  {
    number: "06",
    title: "일본 플랫폼 입점 및 제휴",
    description:
      "일본 현지 플랫폼 입점과 제휴 파트너십을 지원합니다. 입점 요건 분석부터 커뮤니케이션, 운영 정착까지 함께합니다.",
  },
  {
    number: "07",
    title: "의료·관광 연계",
    description:
      "의료서비스와 관광 산업의 접점에서 일본어권 고객의 방문·예약 여정을 설계한 경험을 바탕으로, 규제와 신뢰가 중요한 분야의 마케팅을 수행합니다.",
  },
  {
    number: "08",
    title: "글로벌 파트너 커뮤니케이션",
    description:
      "해외 파트너와의 협상, 계약 조율, 실무 커뮤니케이션을 대행·지원합니다. 언어가 아니라 비즈니스가 통하게 만드는 것이 목표입니다.",
  },
  {
    number: "09",
    title: "다국어 콘텐츠",
    description:
      "한국어·일본어·영어 콘텐츠를 하나의 브랜드 체계 안에서 관리합니다. 언어가 늘어나도 브랜드의 목소리는 하나로 유지됩니다.",
  },
];

export default function GlobalPage() {
  return (
    <>
      <PageHero
        overline="Japan · Global"
        title="언어가 아니라, 시장을 현지화합니다"
        description="K:ZIP의 일본·글로벌 역량은 번역 서비스가 아닙니다. 현지 시장 분석, 고객 행동 이해, 플랫폼과 파트너십 구축까지 — 시장 전략과 사업개발의 영역입니다."
      />

      {/* 관점 */}
      <section className="border-b border-line bg-paper-deep/60">
        <div className="container-k py-20 md:py-28">
          <Reveal>
            <blockquote className="mx-auto max-w-3xl text-center font-serif text-2xl font-semibold leading-[1.65] md:text-3xl">
              “언어만 바꾸는 것이 아니라,
              <br />
              시장이 반응하는 방식에 맞춰
              <br />
              전략을 다시 설계합니다.”
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* 역량 목록 */}
      <section className="border-b border-line">
        <div className="container-k py-20 md:py-28">
          <SectionHeading
            overline="Capabilities"
            title="일본·글로벌 수행 영역"
            description="일본 시장 진입부터 글로벌 파트너십까지, 아홉 개 영역을 프로젝트 목표에 맞게 조합합니다."
          />
          <ul className="mt-12 grid gap-x-12 gap-y-12 border-t border-line pt-12 md:grid-cols-2 lg:grid-cols-3">
            {japanCapabilities.map((item, i) => (
              <li key={item.number}>
                <Reveal delay={(i % 3) * 60}>
                  <p className="text-xs font-semibold text-accent">{item.number}</p>
                  <h2 className="mt-2 text-xl font-bold">{item.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                    {item.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 일하는 방식 강조 */}
      <section className="border-b border-line">
        <div className="container-k grid gap-10 py-20 md:grid-cols-[1fr_1.6fr] md:py-28">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Why K:ZIP
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight">
              번역 회사가 아니라,
              <br />
              시장을 여는 파트너
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <div className="space-y-6 text-sm leading-relaxed text-ink-soft md:text-base">
              <p>
                일본 시장에서의 마케팅은 “일본어를 할 줄 아는 것”과 “일본
                시장에서 일할 줄 아는 것”의 차이에서 갈립니다. K:ZIP는 후자를
                제공합니다.
              </p>
              <p>
                고객 분석과 시장 전략에서 출발해, 콘텐츠·채널·인플루언서·플랫폼
                운영을 거쳐, 해외 파트너와의 사업 커뮤니케이션까지 —
                일본어권과 글로벌 시장에서 브랜드가 실제로 성장하는 구조를
                만듭니다.
              </p>
              <p>
                의료서비스처럼 신뢰와 정확성이 중요한 분야의 일본어권 마케팅
                운영 경험은 K:ZIP의 수행 기준이 어디에 맞춰져 있는지를
                보여줍니다.
              </p>
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-accent"
              >
                관련 프로젝트 보기
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
