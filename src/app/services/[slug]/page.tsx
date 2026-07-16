import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import CTABand from "@/components/CTABand";
import { getService, services } from "@/data/services";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: `${service.title} | 서비스`,
    description: service.short,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const index = services.findIndex((s) => s.slug === service.slug);
  const next = services[(index + 1) % services.length];

  const blocks = [
    { title: "해결하는 문제", items: service.problems, numbered: false },
    { title: "수행 범위", items: service.scope, numbered: false },
    { title: "진행 방식", items: service.process, numbered: true },
    { title: "주요 산출물", items: service.deliverables, numbered: false },
  ];

  return (
    <>
      <section className="border-b border-line">
        <div className="container-k py-16 md:py-24">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Service {service.number}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] md:text-5xl">
              {service.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
              {service.short}
            </p>
          </Reveal>
        </div>
      </section>

      <section>
        <div className="container-k py-16 md:py-24">
          <div className="space-y-16 md:space-y-20">
            {blocks.map((block, blockIndex) => (
              <Reveal key={block.title}>
                <div className="grid gap-6 md:grid-cols-[1fr_2.2fr] md:gap-12">
                  <h2 className="text-xl font-bold md:text-2xl">
                    <span className="mr-3 text-sm font-semibold text-accent">
                      {String(blockIndex + 1).padStart(2, "0")}
                    </span>
                    {block.title}
                  </h2>
                  <ul
                    className={`divide-y divide-line border-y border-line ${
                      block.numbered ? "" : ""
                    }`}
                  >
                    {block.items.map((item, i) => (
                      <li key={item} className="flex items-baseline gap-4 py-4">
                        {block.numbered ? (
                          <span className="shrink-0 text-xs font-semibold text-accent">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        ) : (
                          <span aria-hidden className="shrink-0 text-accent">
                            —
                          </span>
                        )}
                        <span className="text-sm leading-relaxed md:text-base">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="mt-20 flex flex-col gap-4 border-t border-line pt-10 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={`/contact?type=${encodeURIComponent("프로젝트 문의")}`}
                className="inline-block border border-ink bg-ink px-7 py-3.5 text-center text-sm font-medium text-paper transition-colors hover:bg-transparent hover:text-ink"
              >
                이 서비스 관련 프로젝트 문의하기
              </Link>
              <Link
                href={`/services/${next.slug}`}
                className="group inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-accent"
              >
                다음 서비스 — {next.title}
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
