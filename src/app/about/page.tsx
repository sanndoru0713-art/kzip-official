import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import CTABand from "@/components/CTABand";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "회사소개",
  description:
    "K:ZIP는 전략 중심의 디지털 마케팅 및 글로벌 프로젝트 수행 기업입니다. 비전, 미션, 핵심가치와 일하는 방식을 소개합니다.",
};

const coreValues = [
  { en: "Strategy", ko: "근거 있는 전략" },
  { en: "Execution", ko: "실행 가능한 제안" },
  { en: "Connection", ko: "시장과 사람을 연결" },
  { en: "Accountability", ko: "결과와 과정에 대한 책임" },
  { en: "Improvement", ko: "데이터 기반 지속 개선" },
];

const workingSteps = [
  { step: "01", name: "Discover", description: "시장과 과제를 파악합니다." },
  { step: "02", name: "Define", description: "목표, 타깃과 핵심 전략을 정리합니다." },
  { step: "03", name: "Design", description: "콘텐츠, 채널과 실행 구조를 설계합니다." },
  { step: "04", name: "Deliver", description: "전문 인력과 함께 실행하고 품질을 관리합니다." },
  { step: "05", name: "Improve", description: "성과를 분석하고 지속적으로 개선합니다." },
];

const collaboration = [
  {
    title: "하나의 창구",
    description:
      "전략, 콘텐츠, 채널, 데이터가 분리되지 않도록 프로젝트 전체를 하나의 창구에서 관리합니다.",
  },
  {
    title: "투명한 진행",
    description:
      "주간 단위로 진행 상황, 이슈, 다음 단계를 공유합니다. 고객이 프로젝트의 현재 위치를 항상 알 수 있게 합니다.",
  },
  {
    title: "문서로 남는 협업",
    description:
      "합의, 산출물, 성과를 문서로 남깁니다. 담당자가 바뀌어도 프로젝트의 맥락이 유지됩니다.",
  },
  {
    title: "품질과 위험의 사전 관리",
    description:
      "품질 기준과 위험 요소를 착수 단계에 정의하고, 문제가 커지기 전에 대응합니다.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        overline="About"
        title="시장과 브랜드 사이, K:ZIP가 연결합니다"
        description={site.description}
      />

      {/* 소개 + 비전/미션 */}
      <section className="border-b border-line">
        <div className="container-k grid gap-14 py-20 md:grid-cols-2 md:py-28">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Vision
            </p>
            <p className="mt-5 font-serif text-2xl font-semibold leading-[1.6] md:text-[1.7rem]">
              “브랜드와 시장 사이의 간격을
              <br />
              전략과 실행으로 연결합니다.”
            </p>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Mission
            </p>
            <p className="mt-5 font-serif text-2xl font-semibold leading-[1.6] md:text-[1.7rem]">
              “복잡한 문제를 구조화하고,
              <br />
              실행 가능한 마케팅과
              <br />
              프로젝트 시스템으로 전환합니다.”
            </p>
          </Reveal>
        </div>
      </section>

      {/* 핵심가치 */}
      <section className="border-b border-line">
        <div className="container-k py-20 md:py-28">
          <SectionHeading
            overline="Core Values"
            title="핵심가치"
            description="K:ZIP의 모든 제안과 실행은 다섯 가지 기준 위에서 이루어집니다."
          />
          <ul className="mt-12 grid gap-y-10 border-t border-line pt-10 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-5">
            {coreValues.map((value, i) => (
              <li key={value.en}>
                <Reveal delay={i * 60}>
                  <p className="text-xs font-semibold text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-lg font-bold">{value.en}</h3>
                  <p className="mt-1.5 text-sm text-ink-soft">{value.ko}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 대표 소개 */}
      <section className="border-b border-line bg-paper-deep/60">
        <div className="container-k grid gap-10 py-20 md:grid-cols-[1fr_2fr] md:py-28">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Leadership
            </p>
            <h2 className="mt-3 text-3xl font-bold">대표 소개</h2>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-xl font-bold">
              대표 {site.ceo}
            </p>
            <div className="mt-5 border border-dashed border-ink-mute/50 bg-paper px-6 py-8 text-sm leading-relaxed text-ink-mute">
              [대표 프로필 입력 필요]
              <br />
              경력, 전문 분야, 대표 프로젝트 경험 등 공개 가능한 프로필을
              입력하세요.
            </div>
          </Reveal>
        </div>
      </section>

      {/* 업무 철학 */}
      <section className="border-b border-line">
        <div className="container-k grid gap-8 py-20 md:grid-cols-[1fr_2.2fr] md:py-28">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Philosophy
            </p>
            <h2 className="mt-3 text-3xl font-bold">업무 철학</h2>
          </Reveal>
          <Reveal delay={100}>
            <blockquote className="font-serif text-xl font-semibold leading-[1.7] md:text-2xl">
              “좋은 마케팅은 콘텐츠 하나에서 끝나지 않습니다. 시장에 대한 이해,
              명확한 전략, 일관된 실행, 그리고 데이터를 통한 개선이 연결되어야
              합니다.”
            </blockquote>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-soft">
              그래서 K:ZIP는 단발성 제작물이 아니라 구조를 만듭니다. 프로젝트의
              시작은 언제나 시장과 고객에 대한 분석이며, 끝은 데이터로 확인된
              개선입니다. AI를 포함한 새로운 도구는 적극적으로 활용하되, 품질의
              최종 기준은 언제나 사람이 지킵니다.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 업무 수행 방식 */}
      <section id="way-of-working" className="scroll-mt-24 border-b border-line">
        <div className="container-k py-20 md:py-28">
          <SectionHeading
            overline="How We Work"
            title="업무 수행 방식"
            description="모든 프로젝트는 다섯 단계의 일관된 수행 구조로 진행됩니다."
          />
          <ol className="mt-12 grid gap-y-10 md:grid-cols-3 md:gap-x-8 lg:grid-cols-5">
            {workingSteps.map((item, i) => (
              <li key={item.step}>
                <Reveal delay={i * 70}>
                  <div className="border-t-2 border-ink pt-5">
                    <p className="text-xs font-semibold text-accent">{item.step}</p>
                    <h3 className="mt-2 text-lg font-bold">{item.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 협업 방식 */}
      <section className="border-b border-line">
        <div className="container-k py-20 md:py-28">
          <SectionHeading
            overline="Collaboration"
            title="협업 방식"
            description="K:ZIP와 함께 일하면 프로젝트가 이렇게 진행됩니다."
          />
          <ul className="mt-12 grid gap-10 border-t border-line pt-10 md:grid-cols-2 md:gap-x-16">
            {collaboration.map((item, i) => (
              <li key={item.title}>
                <Reveal delay={i * 60}>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-soft">
                    {item.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 여성기업 · 회사 정보 */}
      <section className="border-b border-line bg-paper-deep/60">
        <div className="container-k grid gap-14 py-20 md:grid-cols-2 md:py-28">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Certification
            </p>
            <h2 className="mt-3 text-2xl font-bold">여성기업 정보</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
              K:ZIP는 여성 대표가 이끄는 기업으로, 관련 인증 및 확인서 보유
              현황은 아래에 표기됩니다.
            </p>
            <div className="mt-6 border border-dashed border-ink-mute/50 bg-paper px-6 py-8 text-sm leading-relaxed text-ink-mute">
              [보유 인증 및 확인서 입력 필요]
              <br />
              여성기업 확인서 등 보유 인증의 명칭과 발급기관을 입력하세요.
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Company
            </p>
            <h2 className="mt-3 text-2xl font-bold">회사 기본 정보</h2>
            <dl className="mt-6 divide-y divide-line border-y border-line text-sm">
              {[
                ["회사명", site.name],
                ["대표자", site.ceo],
                ["이메일", site.contact.email],
                ["전화", site.contact.phone],
                ["주소", site.contact.address],
                ["사업자등록번호", site.contact.businessNumber],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[130px_1fr] gap-4 py-3.5">
                  <dt className="font-medium text-ink-mute">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 border border-dashed border-ink-mute/50 bg-paper px-6 py-8 text-sm leading-relaxed text-ink-mute">
              [회사 연혁 입력 필요]
              <br />
              설립 이후 주요 연혁을 연도별로 입력하세요.
            </div>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
