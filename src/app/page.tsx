import Link from "next/link";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import SectionHeading from "@/components/SectionHeading";
import PlaceholderImage from "@/components/PlaceholderImage";
import CTABand from "@/components/CTABand";
import CmsImage from "@/components/CmsImage";
import GlobalTimeline from "@/components/home/GlobalTimeline";
import ProcessSteps from "@/components/home/ProcessSteps";
import { homeServices } from "@/data/services";
import { getInsights, getProjects, getSiteInfo } from "@/lib/notion/queries";

// Notion CMS 수정 사항이 최대 5분 내 반영되도록 ISR 적용
export const revalidate = 300;

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

/** 서비스 매거진 그리드 배치 — 스팬·오프셋·이미지 유무를 항목별로 다르게 */
const serviceGridLayout = [
  { span: "md:col-span-2 lg:col-span-7", offset: "", image: "architecture" as const },
  { span: "lg:col-span-5", offset: "lg:mt-24", image: null },
  { span: "lg:col-span-4", offset: "", image: null },
  { span: "lg:col-span-4", offset: "md:mt-10 lg:mt-16", image: "strategy" as const },
  { span: "md:col-span-2 lg:col-span-4", offset: "lg:mt-32", image: null },
];

export default async function HomePage() {
  const [projects, insights, siteInfo] = await Promise.all([
    getProjects(),
    getInsights(),
    getSiteInfo(),
  ]);
  const [featuredProject, ...restProjects] = projects;

  return (
    <>
      {/* ————— HERO: 좌측 대형 카피 + 우측 풀 이미지 ————— */}
      <section className="relative">
        <div className="container-k grid gap-14 pb-20 pt-16 md:pt-24 lg:grid-cols-12 lg:gap-10 lg:pb-28">
          <div className="flex flex-col justify-center lg:col-span-6">
            <Reveal className="reveal-mask">
              <p className="overline-k flex items-center gap-3">
                <span className="inline-block h-[7px] w-[7px] rounded-full bg-accent" />
                Strategy-driven Marketing Company
              </p>
              <h1 className="display-1 mt-9">
                {siteInfo.mainCopyLines.map((line) => (
                  <span key={line} className="mask-line">
                    <span>{line}</span>
                  </span>
                ))}
              </h1>
            </Reveal>
            <Reveal delay={250}>
              <p className="mt-9 max-w-lg text-[17px] leading-[1.8] text-ink-soft md:text-lg">
                {siteInfo.subCopy}
              </p>
              <div className="mt-11 flex flex-wrap items-center gap-4">
                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent"
                >
                  프로젝트 보기
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
                <Link
                  href="/contact"
                  className="link-slide text-[15px] font-semibold text-ink"
                >
                  문의하기
                </Link>
              </div>
            </Reveal>
          </div>

          {/* 우측 풀 이미지 — 클립 리빌 + 패럴랙스 */}
          <div className="lg:col-span-6">
            <Reveal className="reveal-img h-full">
              <Parallax speed={0.06} className="h-full">
                <PlaceholderImage
                  kind="architecture"
                  figure="FIG.01"
                  ratio="aspect-[4/3] md:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[560px]"
                />
              </Parallax>
            </Reveal>
          </div>
        </div>

        {/* 하단 키워드 스트립 */}
        <div className="border-y border-line">
          <div className="container-k flex flex-wrap items-center gap-x-8 gap-y-2 py-5 text-[12px] uppercase tracking-[0.22em] text-ink-mute">
            <span>Strategy</span>
            <span aria-hidden className="text-line">/</span>
            <span>Digital Marketing</span>
            <span aria-hidden className="text-line">/</span>
            <span>Brand Content</span>
            <span aria-hidden className="text-line">/</span>
            <span>Japan · Global</span>
            <span aria-hidden className="text-line">/</span>
            <span>Project Management</span>
          </div>
        </div>
      </section>

      {/* ————— 소개: 초대형 스테이트먼트 ————— */}
      <section className="bg-paper">
        <div className="container-k py-28 md:py-40">
          <div className="grid gap-10 lg:grid-cols-12">
            <Reveal className="lg:col-span-3">
              <p className="overline-k flex items-center gap-3">
                <span className="text-accent">01</span> About K:ZIP
              </p>
            </Reveal>
            <div className="lg:col-span-9">
              <Reveal className="reveal-mask">
                <blockquote className="display-3 font-bold leading-[1.45] text-ink">
                  <span className="mask-line">
                    <span>좋은 마케팅은 콘텐츠 하나에서 끝나지 않습니다.</span>
                  </span>
                  <span className="mask-line">
                    <span>시장에 대한 이해, 명확한 전략, 일관된 실행,</span>
                  </span>
                  <span className="mask-line">
                    <span>
                      그리고 <span className="text-accent">데이터를 통한 개선</span>이
                      연결되어야 합니다.
                    </span>
                  </span>
                </blockquote>
              </Reveal>
              <Reveal delay={200}>
                <Link
                  href="/about"
                  className="group mt-12 inline-flex items-center gap-2 text-[15px] font-semibold transition-colors hover:text-accent"
                >
                  회사소개 보기
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">
                    →
                  </span>
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ————— 주요 서비스: 매거진 스태거 그리드 ————— */}
      <section className="border-t border-line">
        <div className="container-k py-24 md:py-36">
          <SectionHeading
            index="02"
            overline="Services"
            title="주요 서비스"
            description="전략에서 실행까지, 흩어진 마케팅 활동을 하나의 성장 구조로 연결합니다."
            link={{ label: "서비스 전체 보기", href: "/services" }}
          />

          <div className="mt-16 grid gap-x-10 gap-y-16 md:mt-24 md:grid-cols-2 lg:grid-cols-12">
            {homeServices.map((service, i) => {
              const layout = serviceGridLayout[i];
              return (
                <Reveal
                  key={service.number}
                  delay={(i % 3) * 80}
                  className={`${layout.span} ${layout.offset}`}
                >
                  <Link href={service.href} className="group block">
                    {layout.image && (
                      <div className="hover-zoom mb-7 overflow-hidden">
                        <PlaceholderImage
                          kind={layout.image}
                          figure={`FIG.0${i + 2}`}
                          ratio={i === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}
                        />
                      </div>
                    )}
                    <div className="relative pt-6">
                      {/* 진입 시 좌→우로 그려지는 상단 구분선 */}
                      <span
                        aria-hidden
                        className="line-grow absolute inset-x-0 top-0 h-px bg-ink"
                      />
                      {/* hover 시 확장되는 블루 포인트 선 */}
                      <span
                        aria-hidden
                        className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-x-100"
                      />
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold text-accent">
                          {service.number}
                        </span>
                        <span
                          aria-hidden
                          className="text-ink-mute transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent"
                        >
                          →
                        </span>
                      </div>
                      <h3 className={`mt-4 font-bold tracking-[-0.02em] transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-accent ${i === 0 ? "text-3xl md:text-4xl" : "text-2xl md:text-[1.7rem]"}`}>
                        {service.title}
                      </h3>
                      <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
                        {service.description}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ————— 대표 프로젝트: 빅 카드 + 스몰 카드 ————— */}
      <section className="border-t border-line bg-paper-deep/50">
        <div className="container-k py-24 md:py-36">
          <SectionHeading
            index="03"
            overline="Projects"
            title="대표 프로젝트"
            description="실적 공개가 가능한 시점에 실제 프로젝트 이미지와 성과로 교체됩니다."
            link={{ label: "프로젝트 전체 보기", href: "/projects" }}
          />

          {/* 빅 카드 */}
          {featuredProject && (
            <Reveal className="reveal-img mt-16 md:mt-24">
              <Link
                href={`/projects/${featuredProject.slug}`}
                className="group hover-zoom block bg-paper"
              >
                <CmsImage
                  src={featuredProject.imageUrl}
                  alt={featuredProject.title}
                  kind="global"
                  figure="CASE.01"
                  ratio="aspect-[16/9] md:aspect-[21/9]"
                />
                <div className="flex flex-col gap-4 border border-t-0 border-line px-7 py-8 md:flex-row md:items-end md:justify-between md:px-10 md:py-10">
                  <div>
                    <p className="overline-k text-accent">
                      {featuredProject.category}
                    </p>
                    <h3 className="mt-3 max-w-2xl text-2xl font-bold tracking-[-0.02em] transition-colors group-hover:text-accent md:text-3xl">
                      {featuredProject.title}
                    </h3>
                    <p className="mt-3 text-[13px] text-ink-mute">
                      {featuredProject.results || "[공개 가능한 성과 입력 필요]"}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="hidden shrink-0 text-2xl text-ink-mute transition-all duration-300 group-hover:translate-x-2 group-hover:text-accent md:block"
                  >
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          {/* 스몰 카드 3 */}
          <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
            {restProjects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 100}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group hover-zoom block"
                >
                  <div className="overflow-hidden">
                    <CmsImage
                      src={project.imageUrl}
                      alt={project.title}
                      kind={(["office", "meeting", "strategy"] as const)[i % 3]}
                      figure={`CASE.0${i + 2}`}
                      ratio="aspect-[4/3]"
                    />
                  </div>
                  <div className="pt-6">
                    <p className="overline-k flex flex-wrap items-center gap-2 text-accent">
                      {project.category}
                      {project.confidential && (
                        <span className="rounded-full border border-line px-2.5 py-0.5 text-[10px] normal-case tracking-normal text-ink-mute">
                          비공개 프로젝트
                        </span>
                      )}
                    </p>
                    <h3 className="mt-3 text-lg font-bold leading-snug tracking-[-0.01em] transition-colors group-hover:text-accent md:text-xl">
                      {project.title}
                    </h3>
                    <p className="mt-2.5 text-[13px] text-ink-mute">
                      {project.results || "[공개 가능한 성과 입력 필요]"}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ————— 일본·글로벌: 스티키 이미지 + 타임라인 ————— */}
      <section className="border-t border-line">
        <div className="container-k py-24 md:py-36">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
            {/* 좌측 스티키 */}
            <div className="lg:col-span-6">
              <div className="lg:sticky lg:top-32">
                <Reveal>
                  <p className="overline-k flex items-center gap-3">
                    <span className="text-accent">04</span> Japan · Global
                  </p>
                  <h2 className="display-2 mt-6">
                    언어가 아니라,
                    <br />
                    시장을 현지화합니다
                  </h2>
                  <p className="mt-7 max-w-md text-[17px] leading-[1.8] text-ink-soft">
                    “언어만 바꾸는 것이 아니라, 시장이 반응하는 방식에 맞춰
                    전략을 다시 설계합니다.” K:ZIP의 일본·글로벌 역량은 번역
                    서비스가 아니라 시장 전략과 사업개발 역량입니다.
                  </p>
                </Reveal>
                <Reveal className="reveal-img mt-10" delay={150}>
                  <Parallax speed={0.05}>
                    <PlaceholderImage
                      kind="global"
                      figure="FIG.07"
                      ratio="aspect-[16/10]"
                    />
                  </Parallax>
                </Reveal>
              </div>
            </div>

            {/* 우측 타임라인 — 스크롤에 따라 현재 단계 활성화 */}
            <div className="lg:col-span-5 lg:col-start-8">
              <GlobalTimeline items={globalCapabilities} />
            </div>
          </div>
        </div>
      </section>

      {/* ————— 업무 수행 방식: 스티키 타이틀 + 스텝 스크롤 ————— */}
      <section className="border-t border-line bg-night text-white">
        <div className="container-k py-24 md:py-36">
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <Reveal>
                  <p className="overline-k flex items-center gap-3 text-white/40">
                    <span className="text-accent">05</span> How We Work
                  </p>
                  <h2 className="display-2 mt-6 text-white">
                    업무 수행 방식
                  </h2>
                  <p className="mt-7 max-w-sm text-[17px] leading-[1.8] text-white/55">
                    모든 프로젝트는 다섯 단계의 일관된 수행 구조로 진행됩니다.
                    단계마다 산출물과 품질 기준이 정의되어 있습니다.
                  </p>
                </Reveal>
              </div>
            </div>
            {/* 스크롤 진행에 따라 단계별 활성화 + 진행선 채움 */}
            <ProcessSteps steps={workingSteps} />
          </div>
        </div>
      </section>

      {/* ————— 인사이트: 에디토리얼 피드 ————— */}
      <section>
        <div className="container-k py-24 md:py-36">
          <SectionHeading
            index="06"
            overline="Insights"
            title="인사이트"
            description="시장, 전략, 실행에 대한 K:ZIP의 관점을 기록합니다."
            link={{ label: "인사이트 전체 보기", href: "/insights" }}
          />
          <div className="mt-16 border-t border-line md:mt-24">
            {insights.slice(0, 4).map((post, i) => (
              <Reveal key={post.slug} delay={(i % 4) * 50}>
                <Link
                  href={`/insights/${post.slug}`}
                  className="group relative grid gap-3 border-b border-line py-9 transition-colors md:grid-cols-[90px_150px_1fr_48px] md:items-baseline md:gap-8 md:py-11"
                >
                  <span className="hidden text-[13px] font-bold tracking-[0.15em] text-ink-mute md:block">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="overline-k text-accent">{post.category}</p>
                  <div>
                    <h3 className="text-xl font-bold leading-snug tracking-[-0.015em] transition-[color,transform] duration-300 group-hover:translate-x-1.5 group-hover:text-accent md:text-2xl">
                      {post.title}
                    </h3>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
                      {post.summary}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="hidden text-xl text-ink-mute transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-accent md:block"
                  >
                    →
                  </span>
                  {/* hover 시 우측에 나타나는 썸네일 — 레이아웃에 영향 없음 */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute right-24 top-1/2 z-10 hidden w-44 -translate-y-1/2 xl:block"
                  >
                    <span className="block translate-y-2 opacity-0 shadow-sm transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                      <PlaceholderImage
                        kind={(["strategy", "office", "meeting", "global"] as const)[i % 4]}
                        label="썸네일"
                        ratio="aspect-[16/10]"
                      />
                    </span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ————— 문의 CTA ————— */}
      <CTABand />
    </>
  );
}
