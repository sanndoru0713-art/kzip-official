import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import PlaceholderImage from "@/components/PlaceholderImage";
import CTABand from "@/components/CTABand";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "프로젝트",
  description:
    "K:ZIP가 수행한 전략, 디지털 마케팅, 일본·글로벌 프로젝트를 소개합니다. 공개 가능한 시점에 실제 이미지와 성과로 업데이트됩니다.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        overline="Projects"
        title="전략이 실행으로 옮겨진 기록"
        description="프로젝트별 이미지와 성과는 공개 가능한 범위가 확정되는 대로 업데이트됩니다. 계약상 공개가 어려운 프로젝트는 비공개로 표시됩니다."
      />

      <section>
        <div className="container-k py-16 md:py-24">
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2">
            {projects.map((project, i) => (
              <Reveal
                key={project.slug}
                delay={(i % 2) * 80}
                className={i % 3 === 0 ? "md:col-span-2" : ""}
              >
                <Link href={`/projects/${project.slug}`} className="group block">
                  <PlaceholderImage
                    label="이미지 교체 필요"
                    ratio={i % 3 === 0 ? "aspect-[21/9]" : "aspect-[16/10]"}
                    className="border border-line"
                  />
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                      {project.category}
                    </p>
                    {project.confidential && (
                      <span className="border border-line px-1.5 py-0.5 text-[10px] font-medium text-ink-mute">
                        비공개 프로젝트
                      </span>
                    )}
                  </div>
                  <h2 className="mt-2 text-xl font-bold leading-snug transition-colors group-hover:text-accent md:text-2xl">
                    {project.title}
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                    {project.summary}
                  </p>
                  <p className="mt-3 text-xs text-ink-mute">
                    [공개 가능한 성과 입력 필요]
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-20 border-t border-line pt-8 text-sm leading-relaxed text-ink-mute">
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
