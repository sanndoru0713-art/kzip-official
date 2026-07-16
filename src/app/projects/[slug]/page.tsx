import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import PlaceholderImage from "@/components/PlaceholderImage";
import CTABand from "@/components/CTABand";
import { getProject, projects } from "@/data/projects";
import { getService } from "@/data/services";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} | 프로젝트`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const sections = [
    { title: "프로젝트 개요", content: project.overview },
    { title: "고객 과제", content: project.challenge },
    { title: "접근 전략", content: project.approach },
  ];

  const relatedServices = project.relatedServices
    .map((slug) => getService(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <>
      <section className="border-b border-line">
        <div className="container-k py-16 md:py-24">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {project.category}
              </p>
              {project.confidential && (
                <span className="border border-line px-2 py-0.5 text-[11px] font-medium text-ink-mute">
                  비공개 프로젝트
                </span>
              )}
            </div>
            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.2] md:text-5xl">
              {project.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft">
              {project.summary}
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="container-k py-16 md:py-24">
          <Reveal>
            <PlaceholderImage
              label="이미지 교체 필요"
              ratio="aspect-[21/9]"
              className="border border-line"
            />
          </Reveal>

          {project.confidential && (
            <Reveal>
              <p className="mt-8 border border-line bg-paper-deep/60 px-6 py-5 text-sm leading-relaxed text-ink-soft">
                이 프로젝트는 계약상 상세 내용이 비공개입니다. 공개 가능한
                범위가 확정되면 내용이 업데이트됩니다.
              </p>
            </Reveal>
          )}

          <div className="mt-16 grid gap-16 lg:grid-cols-[2fr_1fr] lg:gap-20">
            {/* 본문 */}
            <div className="space-y-14">
              {sections.map((section) => (
                <Reveal key={section.title}>
                  <h2 className="text-xl font-bold md:text-2xl">{section.title}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-ink-soft md:text-base">
                    {section.content}
                  </p>
                </Reveal>
              ))}

              <Reveal>
                <h2 className="text-xl font-bold md:text-2xl">수행 내용</h2>
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {project.execution.map((item) => (
                    <li key={item} className="flex items-baseline gap-4 py-4">
                      <span aria-hidden className="shrink-0 text-accent">
                        —
                      </span>
                      <span className="text-sm leading-relaxed md:text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal>
                <h2 className="text-xl font-bold md:text-2xl">제작 결과물</h2>
                <ul className="mt-4 space-y-3">
                  {project.deliverables.map((item) => (
                    <li
                      key={item}
                      className="border border-dashed border-ink-mute/50 bg-paper-deep/40 px-5 py-4 text-sm text-ink-mute"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal>
                <h2 className="text-xl font-bold md:text-2xl">성과와 KPI</h2>
                <p className="mt-4 border border-dashed border-ink-mute/50 bg-paper-deep/40 px-5 py-6 text-sm leading-relaxed text-ink-mute">
                  {project.results}
                  <br />
                  검증 가능한 수치만 입력하세요. 확인되지 않은 성과는 게시하지
                  않습니다.
                </p>
              </Reveal>
            </div>

            {/* 사이드 정보 */}
            <aside>
              <Reveal>
                <dl className="divide-y divide-line border-y border-line text-sm">
                  <div className="py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-mute">
                      K:ZIP 담당 역할
                    </dt>
                    <dd className="mt-2 leading-relaxed">{project.role}</dd>
                  </div>
                  <div className="py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-mute">
                      프로젝트 기간
                    </dt>
                    <dd className="mt-2 leading-relaxed">{project.period}</dd>
                  </div>
                  <div className="py-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-mute">
                      관련 서비스
                    </dt>
                    <dd className="mt-2">
                      <ul className="space-y-1.5">
                        {relatedServices.map((service) => (
                          <li key={service.slug}>
                            <Link
                              href={`/services/${service.slug}`}
                              className="text-sm transition-colors hover:text-accent"
                            >
                              {service.title} →
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                </dl>
                <Link
                  href="/contact"
                  className="mt-8 inline-block w-full border border-ink px-6 py-3.5 text-center text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
                >
                  유사한 프로젝트 문의하기
                </Link>
              </Reveal>
            </aside>
          </div>

          <Reveal>
            <div className="mt-20 border-t border-line pt-8">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-accent"
              >
                <span aria-hidden className="transition-transform group-hover:-translate-x-1">
                  ←
                </span>
                프로젝트 목록으로
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
