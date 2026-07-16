import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import PlaceholderImage from "@/components/PlaceholderImage";
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
        titleLines={["언어가 아니라,", "시장을 현지화합니다"]}
        description="K:ZIP의 일본·글로벌 역량은 번역 서비스가 아닙니다. 현지 시장 분석, 고객 행동 이해, 플랫폼과 파트너십 구축까지 — 시장 전략과 사업개발의 영역입니다."
      />

      {/* 풀 블리드 이미지 + 오버레이 스테이트먼트 */}
      <section className="relative">
        <Reveal className="reveal-img">
          <Parallax speed={0.08}>
            <PlaceholderImage
              kind="global"
              figure="FIG.01"
              tone="dark"
              ratio="aspect-[16/10] md:aspect-[21/9]"
            />
          </Parallax>
        </Reveal>
        <div className="pointer-events-none absolute inset-0 flex items-end">
          <div className="container-k pb-10 md:pb-16">
            <Reveal delay={300}>
              <blockquote className="display-3 max-w-3xl text-white">
                “언어만 바꾸는 것이 아니라, 시장이 반응하는 방식에 맞춰
                전략을 다시 설계합니다.”
              </blockquote>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 수행 영역 — 이미지 + 타임라인 */}
      <section>
        <div className="container-k py-24 md:py-36">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
            {/* 좌측 스티키: 헤딩 + 이미지 스택 */}
            <div className="lg:col-span-5">
              <div className="space-y-10 lg:sticky lg:top-32">
                <Reveal>
                  <p className="overline-k">
                    <span className="text-accent">Capabilities</span>
                  </p>
                  <h2 className="display-2 mt-6">
                    일본·글로벌
                    <br />
                    수행 영역
                  </h2>
                  <p className="mt-7 max-w-sm text-[17px] leading-[1.8] text-ink-soft">
                    일본 시장 진입부터 글로벌 파트너십까지, 아홉 개 영역을
                    프로젝트 목표에 맞게 조합합니다.
                  </p>
                </Reveal>
                <Reveal className="reveal-img" delay={150}>
                  <PlaceholderImage
                    kind="meeting"
                    figure="FIG.02"
                    ratio="aspect-[4/3]"
                  />
                </Reveal>
              </div>
            </div>

            {/* 우측 타임라인 */}
            <div className="lg:col-span-6 lg:col-start-7">
              <ol className="relative border-l border-line pl-10 md:pl-14">
                {japanCapabilities.map((item, i) => (
                  <li key={item.number} className={i === 0 ? "" : "mt-16 md:mt-20"}>
                    <Reveal delay={(i % 3) * 60}>
                      <span
                        aria-hidden
                        className="absolute -left-[5px] mt-2.5 block h-[9px] w-[9px] rounded-full bg-accent"
                      />
                      <p className="text-[12px] font-bold tracking-[0.2em] text-ink-mute">
                        {item.number}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold tracking-[-0.015em] md:text-[1.7rem]">
                        {item.title}
                      </h3>
                      <p className="mt-4 max-w-lg text-[15px] leading-[1.8] text-ink-soft">
                        {item.description}
                      </p>
                    </Reveal>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Why K:ZIP — 다크 밴드 */}
      <section className="bg-night text-white">
        <div className="container-k grid gap-12 py-24 md:py-36 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="overline-k text-white/40">Why K:ZIP</p>
            <h2 className="display-2 mt-6 text-white">
              번역 회사가 아니라,
              <br />
              시장을 여는 파트너
            </h2>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-6 lg:col-start-7">
            <div className="space-y-7 text-[16px] leading-[1.85] text-white/60 md:text-[17px]">
              <p>
                일본 시장에서의 마케팅은 “일본어를 할 줄 아는 것”과 “일본
                시장에서 일할 줄 아는 것”의 차이에서 갈립니다. K:ZIP는 후자를
                제공합니다.
              </p>
              <p>
                고객 분석과 시장 전략에서 출발해, 콘텐츠·채널·인플루언서·플랫폼
                운영을 거쳐, 해외 파트너와의 사업 커뮤니케이션까지 — 일본어권과
                글로벌 시장에서 브랜드가 실제로 성장하는 구조를 만듭니다.
              </p>
              <p>
                의료서비스처럼 신뢰와 정확성이 중요한 분야의 일본어권 마케팅
                운영 경험은 K:ZIP의 수행 기준이 어디에 맞춰져 있는지를
                보여줍니다.
              </p>
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 pt-2 text-[15px] font-semibold text-white transition-colors hover:text-accent"
              >
                관련 프로젝트 보기
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">
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
