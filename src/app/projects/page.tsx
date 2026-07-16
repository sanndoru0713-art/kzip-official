import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import { type PlaceholderKind } from "@/components/PlaceholderImage";
import CmsImage from "@/components/CmsImage";
import CTABand from "@/components/CTABand";
import { getProjects } from "@/lib/notion/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "프로젝트",
  description:
    "K:ZIP가 수행한 전략, 디지털 마케팅, 일본·글로벌 프로젝트를 소개합니다. 공개 가능한 시점에 실제 이미지와 성과로 업데이트됩니다.",
};

const caseKinds: PlaceholderKind[] = ["global", "strategy", "meeting", "office"];

export default async function ProjectsPage() {
  const projects = await getProjects();
  const [featured, ...rest] = projects;

  return (
    <>
      <PageHero
        overline="Projects"
        titleLines={["전략이 실행으로", "옮겨진 기록"]}
        description="프로젝트별 이미지와 성과는 공개 가능한 범위가 확정되는 대로 업데이트됩니다. 계약상 공개가 어려운 프로젝트는 비공개로 표시됩니다."
      />

      <section>
        <div className="container-k py-20 md:py-28">
          {/* 피처드 케이스 — 풀와이드 */}
          {featured && (
            <Reveal className="reveal-img">
              <Link href={`/projects/${featured.slug}`} className="group hover-zoom block">
                <Parallax speed={0.05}>
                  <CmsImage
                    src={featured.imageUrl}
                    alt={featured.title}
                    kind="global"
                    figure="CASE.01"
                    ratio="aspect-[16/9] md:aspect-[21/9]"
                  />
                </Parallax>
                <div className="grid gap-4 py-8 md:grid-cols-[1fr_auto] md:items-end md:py-10">
                  <div>
                    <p className="overline-k text-accent">{featured.category}</p>
                    <h2 className="mt-3 max-w-3xl text-2xl font-bold tracking-[-0.02em] transition-colors group-hover:text-accent md:text-4xl">
                      {featured.title}
                    </h2>
                    <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
                      {featured.summary}
                    </p>
                    <p className="mt-3 text-[13px] text-ink-mute">
                      {featured.results || "[공개 가능한 성과 입력 필요]"}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="hidden text-2xl text-ink-mute transition-all duration-300 group-hover:translate-x-2 group-hover:text-accent md:block"
                  >
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          )}

          {/* 교차 케이스스터디 행 */}
          <div className="mt-8 space-y-24 border-t border-line pt-20 md:mt-12 md:space-y-32 md:pt-28">
            {rest.map((project, i) => {
              const reversed = i % 2 === 1;
              return (
                <Reveal key={project.slug}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group grid items-center gap-8 lg:grid-cols-12 lg:gap-12"
                  >
                    <div
                      className={`hover-zoom overflow-hidden lg:col-span-7 ${
                        reversed ? "lg:order-2 lg:col-start-6" : ""
                      }`}
                    >
                      <CmsImage
                        src={project.imageUrl}
                        alt={project.title}
                        kind={caseKinds[(i + 1) % caseKinds.length]}
                        figure={`CASE.0${i + 2}`}
                        ratio="aspect-[16/10]"
                      />
                    </div>
                    <div
                      className={`lg:col-span-5 ${
                        reversed ? "lg:order-1 lg:col-start-1" : ""
                      }`}
                    >
                      <p className="overline-k flex flex-wrap items-center gap-3 text-accent">
                        {project.category}
                        {project.confidential && (
                          <span className="rounded-full border border-line px-2.5 py-0.5 text-[10px] normal-case tracking-normal text-ink-mute">
                            비공개 프로젝트
                          </span>
                        )}
                      </p>
                      <h2 className="mt-4 text-2xl font-bold leading-snug tracking-[-0.02em] transition-colors group-hover:text-accent md:text-3xl">
                        {project.title}
                      </h2>
                      <p className="mt-4 text-[15px] leading-[1.8] text-ink-soft">
                        {project.summary}
                      </p>
                      <p className="mt-4 text-[13px] text-ink-mute">
                        {project.results || "[공개 가능한 성과 입력 필요]"}
                      </p>
                      <span className="link-slide mt-7 inline-block text-[15px] font-semibold">
                        케이스 보기 →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <Reveal>
            <p className="mt-24 border-t border-line pt-8 text-[13px] leading-relaxed text-ink-mute">
              이 페이지의 프로젝트는 구조 확인용 자리표시자입니다. 실제 실적이
              확정되면 <code className="text-xs">src/data/projects.ts</code>에서
              내용과 이미지를 교체하세요.
            </p>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
