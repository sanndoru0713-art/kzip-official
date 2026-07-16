import Link from "next/link";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import PlaceholderImage from "@/components/PlaceholderImage";
import CTABand from "@/components/CTABand";
import { homeServices } from "@/data/services";
import { projects } from "@/data/projects";
import { insights } from "@/data/insights";

const heroQuickLinks = [
  {
    label: "서비스",
    description: "전략부터 실행까지 12개 영역",
    href: "/services",
  },
  {
    label: "일본·글로벌",
    description: "현지 시장에 맞춘 전략 재설계",
    href: "/global",
  },
  {
    label: "업무 수행 방식",
    description: "Discover에서 Improve까지",
    href: "/about#way-of-working",
  },
];

const globalCapabilities = [
  "일본 시장 및 고객 분석",
  "일본어 콘텐츠 기획",
  "SNS와 인플루언서 운영",
  "일본 플랫폼 입점 지원",
  "해외 파트너 커뮤니케이션",
  "다국어 고객 여정 설계",
];

const workingSteps = [
  { step: "01", name: "Discover", description: "시장과 과제를 파악합니다." },
  { step: "02", name: "Define", description: "목표, 타깃과 핵심 전략을 정리합니다." },
  { step: "03", name: "Design", description: "콘텐츠, 채널과 실행 구조를 설계합니다." },
  { step: "04", name: "Deliver", description: "전문 인력과 함께 실행하고 품질을 관리합니다." },
  { step: "05", name: "Improve", description: "성과를 분석하고 지속적으로 개선합니다." },
];

export default function HomePage() {
  const [featuredProject, ...restProjects] = projects;

  return (
    <>
      {/* 메인 비주얼 */}
      <section className="border-b border-line">
        <div className="container-k grid gap-12 py-16 md:py-24 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Strategy-driven Marketing Company
            </p>
            <h1 className="mt-6 text-[2.6rem] font-extrabold leading-[1.15] tracking-tight md:text-6xl">
              전략을 설계하고,
              <br />
              성장을 실행합니다.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
              K:ZIP는 전략, 콘텐츠, 디지털 채널, 데이터와 글로벌 시장을 연결해
              브랜드와 조직의 지속 가능한 성장 구조를 만듭니다.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="border border-ink bg-ink px-7 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-transparent hover:text-ink"
              >
                프로젝트 보기
              </Link>
              <Link
                href="/contact"
                className="border border-ink px-7 py-3.5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
              >
                문의하기
              </Link>
            </div>
          </Reveal>

          {/* 사이드 인덱스 — 참고 이미지의 퀵가이드를 편집형 목록으로 재해석 */}
          <Reveal delay={120}>
            <div className="flex h-full flex-col justify-end">
              <ul className="divide-y divide-line border-y border-line">
                {heroQuickLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center justify-between gap-4 py-5 transition-colors hover:text-accent"
                    >
                      <div>
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="mt-1 text-xs text-ink-mute">{item.description}</p>
                      </div>
                      <span
                        aria-hidden
                        className="text-ink-mute transition-transform group-hover:translate-x-1 group-hover:text-accent"
                      >
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs leading-relaxed text-ink-mute">
                마케팅 및 사업 전략 기획 · 디지털 마케팅 · 콘텐츠 제작 ·
                일본·글로벌 마케팅 · 프로젝트 매니지먼트
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* K:ZIP 소개 */}
      <section className="border-b border-line">
        <div className="container-k grid gap-8 py-20 md:grid-cols-[1fr_2.2fr] md:py-28">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              About K:ZIP
            </p>
          </Reveal>
          <Reveal delay={100}>
            <blockquote className="font-serif text-2xl font-semibold leading-[1.6] text-ink md:text-[2rem]">
              “좋은 마케팅은 콘텐츠 하나에서 끝나지 않습니다.
              <br className="hidden md:block" />
              시장에 대한 이해, 명확한 전략, 일관된 실행,
              <br className="hidden md:block" />
              그리고 데이터를 통한 개선이 연결되어야 합니다.”
            </blockquote>
            <Link
              href="/about"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent"
            >
              회사소개 보기
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 주요 서비스 */}
      <section className="border-b border-line">
        <div className="container-k py-20 md:py-28">
          <SectionHeading
            overline="Services"
            title="주요 서비스"
            description="전략에서 실행까지, 흩어진 마케팅 활동을 하나의 성장 구조로 연결합니다."
            link={{ label: "서비스 전체 보기", href: "/services" }}
          />
          <ul className="mt-12 border-t border-line">
            {homeServices.map((service, i) => (
              <li key={service.number} className="border-b border-line">
                <Reveal delay={i * 60}>
                  <Link
                    href={service.href}
                    className="group grid gap-2 py-7 transition-colors md:grid-cols-[80px_1fr_2fr_40px] md:items-baseline md:gap-6 md:py-8"
                  >
                    <span className="text-sm font-semibold text-accent">
                      {service.number}
                    </span>
                    <h3 className="text-xl font-bold transition-colors group-hover:text-accent md:text-2xl">
                      {service.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-soft">
                      {service.description}
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

      {/* 대표 프로젝트 — 매거진형 비대칭 그리드 */}
      <section className="border-b border-line">
        <div className="container-k py-20 md:py-28">
          <SectionHeading
            overline="Projects"
            title="대표 프로젝트"
            description="실적 공개가 가능한 시점에 실제 프로젝트 이미지와 성과로 교체됩니다."
            link={{ label: "프로젝트 전체 보기", href: "/projects" }}
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-8">
            {featuredProject && (
              <Reveal className="lg:col-span-7">
                <Link href={`/projects/${featuredProject.slug}`} className="group block">
                  <PlaceholderImage
                    label="이미지 교체 필요"
                    ratio="aspect-[16/10]"
                    className="border border-line"
                  />
                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                    {featuredProject.category}
                  </p>
                  <h3 className="mt-2 text-2xl font-bold leading-snug transition-colors group-hover:text-accent">
                    {featuredProject.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
                    {featuredProject.summary}
                  </p>
                  <p className="mt-3 text-xs text-ink-mute">[공개 가능한 성과 입력 필요]</p>
                </Link>
              </Reveal>
            )}

            <div className="grid gap-10 lg:col-span-5">
              {restProjects.map((project, i) => (
                <Reveal key={project.slug} delay={i * 80}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group grid grid-cols-[110px_1fr] items-start gap-5 sm:grid-cols-[150px_1fr]"
                  >
                    <PlaceholderImage
                      label="이미지 교체 필요"
                      ratio="aspect-square"
                      className="border border-line"
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                        {project.category}
                        {project.confidential && (
                          <span className="ml-2 border border-line px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-ink-mute">
                            비공개 프로젝트
                          </span>
                        )}
                      </p>
                      <h3 className="mt-2 text-base font-bold leading-snug transition-colors group-hover:text-accent md:text-lg">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-xs text-ink-mute">
                        [공개 가능한 성과 입력 필요]
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 일본·글로벌 전문성 */}
      <section className="border-b border-line bg-paper-deep/60">
        <div className="container-k py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Japan · Global
              </p>
              <blockquote className="mt-6 font-serif text-2xl font-semibold leading-[1.6] md:text-[1.9rem]">
                “언어만 바꾸는 것이 아니라,
                <br />
                시장이 반응하는 방식에 맞춰
                <br />
                전략을 다시 설계합니다.”
              </blockquote>
              <p className="mt-6 max-w-lg text-sm leading-relaxed text-ink-soft">
                K:ZIP의 일본·글로벌 역량은 번역 서비스가 아니라 시장 전략과
                사업개발 역량입니다. 현지 고객의 행동과 플랫폼 문법에 맞춰
                브랜드가 작동하는 방식을 새로 만듭니다.
              </p>
              <Link
                href="/global"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent"
              >
                일본·글로벌 자세히 보기
                <span aria-hidden className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </Reveal>
            <Reveal delay={120}>
              <ul className="divide-y divide-line border-y border-line">
                {globalCapabilities.map((capability, i) => (
                  <li key={capability} className="flex items-baseline gap-4 py-4">
                    <span className="text-xs font-semibold text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium">{capability}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 업무 수행 방식 */}
      <section className="border-b border-line">
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

      {/* 인사이트 */}
      <section className="border-b border-line">
        <div className="container-k py-20 md:py-28">
          <SectionHeading
            overline="Insights"
            title="인사이트"
            description="시장, 전략, 실행에 대한 K:ZIP의 관점을 기록합니다."
            link={{ label: "인사이트 전체 보기", href: "/insights" }}
          />
          <ul className="mt-12 border-t border-line">
            {insights.slice(0, 4).map((post, i) => (
              <li key={post.slug} className="border-b border-line">
                <Reveal delay={i * 60}>
                  <Link
                    href={`/insights/${post.slug}`}
                    className="group grid gap-2 py-7 md:grid-cols-[140px_1fr_40px] md:items-baseline md:gap-8"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                      {post.category}
                    </p>
                    <div>
                      <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-accent md:text-xl">
                        {post.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
                        {post.summary}
                      </p>
                    </div>
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

      {/* 프로젝트 문의 CTA */}
      <CTABand />
    </>
  );
}
