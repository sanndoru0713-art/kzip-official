import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import Parallax from "@/components/Parallax";
import PlaceholderImage from "@/components/PlaceholderImage";
import CmsImage from "@/components/CmsImage";
import CTABand from "@/components/CTABand";
import { projects as localProjects } from "@/data/projects";
import { getService } from "@/data/services";
import { getProjectBySlug } from "@/lib/notion/queries";

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  // 빌드 시에는 로컬 slug 기준으로 생성 — CMS에서 추가된 slug는 요청 시 렌더링됩니다.
  return localProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} | 프로젝트`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const narrative = [
    { key: "01", title: "프로젝트 개요", content: project.overview },
    { key: "02", title: "고객 과제", content: project.challenge },
    { key: "03", title: "접근 전략", content: project.approach },
  ].filter((section) => section.content);

  const relatedServices = project.relatedServices
    .map((slug) => getService(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      {/* 타이틀 */}
      <section className="border-b border-line">
        <div className="container-k pb-14 pt-20 md:pb-20 md:pt-32">
          <Reveal className="reveal-mask">
            <p className="overline-k flex flex-wrap items-center gap-3">
              <span className="text-accent">{project.category}</span>
              {project.confidential && (
                <span className="rounded-full border border-line px-2.5 py-0.5 text-[10px] normal-case tracking-normal text-ink-mute">
                  비공개 프로젝트
                </span>
              )}
            </p>
            <h1 className="display-2 mt-6 max-w-4xl">
              <span className="mask-line">
                <span>{project.title}</span>
              </span>
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-7 max-w-2xl text-[17px] leading-[1.8] text-ink-soft">
              {project.summary}
            </p>
          </Reveal>
        </div>

        {/* 메타 정보 — 헤어라인 테이블 */}
        <div className="border-t border-line">
          <div className="container-k grid grid-cols-2 lg:grid-cols-4">
            {[
              ["담당 역할", project.role],
              ["기간", project.period],
              ["분야", project.category],
              [
                "관련 서비스",
                relatedServices.map((s) => s.title).join(" · ") || "—",
              ],
            ].map(([label, value], i) => {
              const cellBorders = [
                "",
                "border-l border-line pl-6 md:pl-8",
                "border-t border-line lg:border-t-0 lg:border-l lg:pl-8",
                "border-t border-l border-line pl-6 lg:border-t-0 md:pl-8",
              ][i];
              return (
                <div key={label} className={`py-6 md:py-7 ${cellBorders}`}>
                  <p className="overline-k">{label}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-soft md:text-sm">
                    {value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 풀 블리드 히어로 이미지 */}
      <Reveal className="reveal-img">
        <Parallax speed={0.07}>
          <CmsImage
            src={project.imageUrl}
            alt={project.title}
            kind="global"
            figure="HERO"
            ratio="aspect-[16/9] md:aspect-[21/9]"
          />
        </Parallax>
      </Reveal>

      <section>
        <div className="container-k py-20 md:py-28">
          {project.confidential && (
            <Reveal>
              <p className="mb-16 border-l-2 border-accent bg-paper-deep/60 px-7 py-6 text-[15px] leading-relaxed text-ink-soft">
                이 프로젝트는 계약상 상세 내용이 비공개입니다. 공개 가능한
                범위가 확정되면 내용이 업데이트됩니다.
              </p>
            </Reveal>
          )}

          {/* 내러티브 — 번호 사이드 구조 */}
          <div className="space-y-0">
            {narrative.map((section, i) => (
              <Reveal key={section.title}>
                <div
                  className={`grid gap-6 border-t border-line py-12 md:py-16 lg:grid-cols-12 ${
                    i === narrative.length - 1 ? "" : ""
                  }`}
                >
                  <div className="flex items-baseline gap-5 lg:col-span-4">
                    <span className="text-[13px] font-bold tracking-[0.15em] text-accent">
                      {section.key}
                    </span>
                    <h2 className="text-2xl font-bold tracking-[-0.015em] md:text-[1.7rem]">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-[16px] leading-[1.85] text-ink-soft lg:col-span-7 lg:col-start-6 md:text-[17px]">
                    {section.content}
                  </p>
                </div>
              </Reveal>
            ))}

            {/* 수행 내용 */}
            {project.execution.length > 0 && (
            <Reveal>
              <div className="grid gap-6 border-t border-line py-12 md:py-16 lg:grid-cols-12">
                <div className="flex items-baseline gap-5 lg:col-span-4">
                  <span className="text-[13px] font-bold tracking-[0.15em] text-accent">
                    04
                  </span>
                  <h2 className="text-2xl font-bold tracking-[-0.015em] md:text-[1.7rem]">
                    수행 내용
                  </h2>
                </div>
                <ul className="space-y-5 lg:col-span-7 lg:col-start-6">
                  {project.execution.map((item) => (
                    <li key={item} className="flex items-baseline gap-5">
                      <span
                        aria-hidden
                        className="mt-2 block h-[5px] w-[5px] shrink-0 rounded-full bg-accent"
                      />
                      <span className="text-[16px] leading-[1.75] md:text-[17px]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            )}

            {/* 제작 결과물 — 이미지 그리드 */}
            <Reveal>
              <div className="grid gap-6 border-t border-line py-12 md:py-16 lg:grid-cols-12">
                <div className="flex items-baseline gap-5 lg:col-span-4">
                  <span className="text-[13px] font-bold tracking-[0.15em] text-accent">
                    05
                  </span>
                  <h2 className="text-2xl font-bold tracking-[-0.015em] md:text-[1.7rem]">
                    제작 결과물
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <PlaceholderImage
                      kind="strategy"
                      figure="OUT.01"
                      label="결과물 이미지 교체 필요"
                      ratio="aspect-[4/3]"
                    />
                    <PlaceholderImage
                      kind="office"
                      figure="OUT.02"
                      label="결과물 이미지 교체 필요"
                      ratio="aspect-[4/3]"
                    />
                  </div>
                  <ul className="mt-6 space-y-3">
                    {project.deliverables.map((item) => (
                      <li key={item} className="text-[14px] leading-relaxed text-ink-mute">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            {/* 성과와 KPI */}
            <Reveal>
              <div className="grid gap-6 border-y border-line py-12 md:py-16 lg:grid-cols-12">
                <div className="flex items-baseline gap-5 lg:col-span-4">
                  <span className="text-[13px] font-bold tracking-[0.15em] text-accent">
                    06
                  </span>
                  <h2 className="text-2xl font-bold tracking-[-0.015em] md:text-[1.7rem]">
                    성과와 KPI
                  </h2>
                </div>
                <div className="lg:col-span-7 lg:col-start-6">
                  <p className="border-l-2 border-accent bg-paper-deep/60 px-7 py-7 text-[15px] leading-[1.8] text-ink-mute">
                    {project.results}
                    <br />
                    검증 가능한 수치만 입력하세요. 확인되지 않은 성과는
                    게시하지 않습니다.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* 하단 내비게이션 */}
          <Reveal>
            <div className="mt-16 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 text-[15px] font-semibold text-ink-soft transition-colors hover:text-ink"
              >
                <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1.5">
                  ←
                </span>
                프로젝트 목록으로
              </Link>
              <Link
                href="/contact"
                className="group inline-flex w-fit items-center gap-3 rounded-full bg-accent px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent-deep"
              >
                유사한 프로젝트 문의하기
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
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
