import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import PlaceholderImage from "@/components/PlaceholderImage";
import CTABand from "@/components/CTABand";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "회사소개",
  description:
    "K:ZIP는 전략 중심의 디지털 마케팅 및 글로벌 프로젝트 수행 기업입니다. 비전, 미션, 핵심가치와 일하는 방식을 소개합니다.",
};

const coreValues = [
  {
    en: "Strategy",
    ko: "근거 있는 전략",
    detail: "감이 아니라 시장과 데이터 위에서 제안합니다.",
  },
  {
    en: "Execution",
    ko: "실행 가능한 제안",
    detail: "실행되지 않는 기획은 만들지 않습니다.",
  },
  {
    en: "Connection",
    ko: "시장과 사람을 연결",
    detail: "브랜드, 고객, 채널, 파트너를 하나의 구조로 잇습니다.",
  },
  {
    en: "Accountability",
    ko: "결과와 과정에 대한 책임",
    detail: "산출물과 성과를 문서로 남기고 책임집니다.",
  },
  {
    en: "Improvement",
    ko: "데이터 기반 지속 개선",
    detail: "끝난 프로젝트에서도 다음 개선점을 찾습니다.",
  },
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
        titleLines={["시장과 브랜드 사이,", "K:ZIP가 연결합니다"]}
        description={site.description}
      />

      {/* 오피스 이미지 밴드 — 풀 블리드 */}
      <section>
        <Reveal className="reveal-img">
          <Parallax speed={0.07}>
            <PlaceholderImage
              kind="office"
              figure="FIG.01"
              ratio="aspect-[16/9] md:aspect-[21/8]"
            />
          </Parallax>
        </Reveal>
      </section>

      {/* Vision / Mission — 오프셋 매니페스토 */}
      <section className="border-b border-line">
        <div className="container-k py-24 md:py-36">
          <Reveal className="reveal-mask">
            <p className="overline-k">
              <span className="text-accent">01</span> Vision
            </p>
            <p className="display-2 mt-7 max-w-3xl">
              <span className="mask-line">
                <span>브랜드와 시장 사이의 간격을</span>
              </span>
              <span className="mask-line">
                <span>전략과 실행으로 연결합니다.</span>
              </span>
            </p>
          </Reveal>
          <div className="mt-20 flex md:mt-28 md:justify-end">
            <Reveal className="reveal-mask md:w-2/3">
              <p className="overline-k">
                <span className="text-accent">02</span> Mission
              </p>
              <p className="display-3 mt-7">
                <span className="mask-line">
                  <span>복잡한 문제를 구조화하고,</span>
                </span>
                <span className="mask-line">
                  <span>실행 가능한 마케팅과</span>
                </span>
                <span className="mask-line">
                  <span>프로젝트 시스템으로 전환합니다.</span>
                </span>
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 핵심가치 — 좌측 스티키 + 대형 번호 리스트 */}
      <section className="border-b border-line">
        <div className="container-k py-24 md:py-36">
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <Reveal>
                  <p className="overline-k">
                    <span className="text-accent">03</span> Core Values
                  </p>
                  <h2 className="display-2 mt-6">핵심가치</h2>
                  <p className="mt-6 max-w-xs text-[17px] leading-relaxed text-ink-soft">
                    K:ZIP의 모든 제안과 실행은 다섯 가지 기준 위에서
                    이루어집니다.
                  </p>
                </Reveal>
              </div>
            </div>
            <ol className="lg:col-span-7 lg:col-start-6">
              {coreValues.map((value, i) => (
                <li
                  key={value.en}
                  className={`border-t border-line py-10 md:py-12 ${
                    i === coreValues.length - 1 ? "border-b" : ""
                  }`}
                >
                  <Reveal delay={i * 60}>
                    <div className="grid gap-4 md:grid-cols-[110px_1fr] md:gap-10">
                      <span className="text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none tracking-[-0.03em] text-[#d7dbe3]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-2xl font-bold tracking-[-0.015em] md:text-3xl">
                          {value.en}
                          <span className="ml-4 text-base font-semibold text-accent md:text-lg">
                            {value.ko}
                          </span>
                        </h3>
                        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                          {value.detail}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 대표 소개 — 포트레이트 + 텍스트 */}
      <section className="border-b border-line bg-paper-deep/50">
        <div className="container-k grid gap-14 py-24 md:py-36 lg:grid-cols-12">
          <Reveal className="reveal-img lg:col-span-5">
            <PlaceholderImage
              kind="office"
              figure="PORTRAIT"
              label="대표 프로필 사진 교체 필요"
              ratio="aspect-[3/4]"
            />
          </Reveal>
          <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="overline-k">
                <span className="text-accent">04</span> Leadership
              </p>
              <h2 className="display-2 mt-6">
                대표 {site.ceo}
              </h2>
              <div className="mt-9 border-l-2 border-accent bg-paper px-7 py-8 text-[15px] leading-relaxed text-ink-mute">
                [대표 프로필 입력 필요]
                <br />
                경력, 전문 분야, 대표 프로젝트 경험 등 공개 가능한 프로필을
                입력하세요.
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 업무 철학 — 중앙 정렬 초대형 인용 */}
      <section className="border-b border-line">
        <div className="container-k py-28 md:py-44">
          <Reveal>
            <p className="overline-k text-center">
              <span className="text-accent">05</span> Philosophy
            </p>
          </Reveal>
          <Reveal className="reveal-mask" delay={100}>
            <blockquote className="display-3 mx-auto mt-10 max-w-4xl text-center leading-[1.5]">
              <span className="mask-line">
                <span>좋은 마케팅은 콘텐츠 하나에서 끝나지 않습니다.</span>
              </span>
              <span className="mask-line">
                <span>시장에 대한 이해, 명확한 전략, 일관된 실행,</span>
              </span>
              <span className="mask-line">
                <span>그리고 데이터를 통한 개선이 연결되어야 합니다.</span>
              </span>
            </blockquote>
          </Reveal>
          <Reveal delay={250}>
            <p className="mx-auto mt-10 max-w-xl text-center text-[15px] leading-[1.8] text-ink-soft">
              그래서 K:ZIP는 단발성 제작물이 아니라 구조를 만듭니다. AI를
              포함한 새로운 도구는 적극적으로 활용하되, 품질의 최종 기준은
              언제나 사람이 지킵니다.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 업무 수행 방식 — 수평 5단 그리드 */}
      <section id="way-of-working" className="scroll-mt-24 border-b border-line">
        <div className="container-k py-24 md:py-36">
          <Reveal>
            <p className="overline-k">
              <span className="text-accent">06</span> How We Work
            </p>
            <h2 className="display-2 mt-6">업무 수행 방식</h2>
          </Reveal>
          <ol className="mt-14 grid gap-y-12 md:mt-20 md:grid-cols-3 md:gap-x-10 lg:grid-cols-5">
            {workingSteps.map((item, i) => (
              <li key={item.step}>
                <Reveal delay={i * 80}>
                  <div className="border-t-2 border-ink pt-6">
                    <p className="text-[13px] font-bold tracking-[0.15em] text-accent">
                      {item.step}
                    </p>
                    <h3 className="mt-3 text-xl font-bold tracking-[-0.01em]">
                      {item.name}
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 협업 방식 — 2×2 그리드 */}
      <section className="border-b border-line">
        <div className="container-k py-24 md:py-36">
          <Reveal>
            <p className="overline-k">
              <span className="text-accent">07</span> Collaboration
            </p>
            <h2 className="display-2 mt-6">협업 방식</h2>
          </Reveal>
          <ul className="mt-14 grid gap-px overflow-hidden border border-line bg-line md:mt-20 md:grid-cols-2">
            {collaboration.map((item, i) => (
              <li key={item.title} className="bg-paper p-8 md:p-12">
                <Reveal delay={(i % 2) * 80}>
                  <span className="text-[13px] font-bold tracking-[0.15em] text-ink-mute">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 text-xl font-bold tracking-[-0.01em] md:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.8] text-ink-soft">
                    {item.description}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 여성기업 · 회사 정보 */}
      <section>
        <div className="container-k grid gap-16 py-24 md:py-36 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <p className="overline-k">
              <span className="text-accent">08</span> Certification
            </p>
            <h2 className="display-3 mt-6">여성기업 정보</h2>
            <p className="mt-6 max-w-md text-[15px] leading-[1.8] text-ink-soft">
              K:ZIP는 여성 대표가 이끄는 기업으로, 관련 인증 및 확인서 보유
              현황은 아래에 표기됩니다.
            </p>
            <div className="mt-8 border-l-2 border-accent bg-paper-deep/60 px-7 py-8 text-[15px] leading-relaxed text-ink-mute">
              [보유 인증 및 확인서 입력 필요]
              <br />
              여성기업 확인서 등 보유 인증의 명칭과 발급기관을 입력하세요.
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="overline-k">
              <span className="text-accent">09</span> Company
            </p>
            <h2 className="display-3 mt-6">회사 기본 정보</h2>
            <dl className="mt-8 divide-y divide-line border-y border-line text-[15px]">
              {[
                ["회사명", site.name],
                ["대표자", site.ceo],
                ["이메일", site.contact.email],
                ["전화", site.contact.phone],
                ["주소", site.contact.address],
                ["사업자등록번호", site.contact.businessNumber],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[140px_1fr] gap-4 py-4">
                  <dt className="font-medium text-ink-mute">{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 border-l-2 border-accent bg-paper-deep/60 px-7 py-8 text-[15px] leading-relaxed text-ink-mute">
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
