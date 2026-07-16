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
    { key: "A", title: "해결하는 문제", items: service.problems, numbered: false },
    { key: "B", title: "수행 범위", items: service.scope, numbered: false },
    { key: "C", title: "진행 방식", items: service.process, numbered: true },
    { key: "D", title: "주요 산출물", items: service.deliverables, numbered: false },
  ];

  return (
    <>
      <section>
        <div className="container-k grid gap-14 py-20 md:py-28 lg:grid-cols-12">
          {/* 좌측 스티키 헤더 */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal className="reveal-mask">
                <p className="overline-k">
                  <span className="text-accent">Service {service.number}</span>
                </p>
                <h1 className="display-2 mt-6">
                  <span className="mask-line">
                    <span>{service.title}</span>
                  </span>
                </h1>
              </Reveal>
              <Reveal delay={150}>
                <p className="mt-7 max-w-md text-[17px] leading-[1.8] text-ink-soft">
                  {service.short}
                </p>
                <Link
                  href={`/contact?type=${encodeURIComponent("프로젝트 문의")}`}
                  className="group mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-[15px] font-semibold text-white transition-colors hover:bg-accent-deep"
                >
                  이 서비스 문의하기
                  <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </Reveal>
            </div>
          </div>

          {/* 우측 콘텐츠 블록 */}
          <div className="lg:col-span-6 lg:col-start-7">
            {blocks.map((block, blockIndex) => (
              <Reveal key={block.title}>
                <div
                  className={`border-t border-line py-12 md:py-14 ${
                    blockIndex === blocks.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-baseline gap-5">
                    <span className="text-[13px] font-bold tracking-[0.15em] text-accent">
                      {block.key}
                    </span>
                    <h2 className="text-2xl font-bold tracking-[-0.015em] md:text-[1.7rem]">
                      {block.title}
                    </h2>
                  </div>
                  <ul className="mt-8 space-y-5">
                    {block.items.map((item, i) => (
                      <li key={item} className="flex items-baseline gap-5">
                        {block.numbered ? (
                          <span className="shrink-0 text-[12px] font-bold tracking-[0.1em] text-ink-mute">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        ) : (
                          <span
                            aria-hidden
                            className="mt-2 block h-[5px] w-[5px] shrink-0 rounded-full bg-accent"
                          />
                        )}
                        <span className="text-[16px] leading-[1.75] md:text-[17px]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}

            <Reveal>
              <Link
                href={`/services/${next.slug}`}
                className="group mt-12 flex items-center justify-between border border-line px-7 py-6 transition-colors hover:border-ink md:px-9 md:py-7"
              >
                <div>
                  <p className="overline-k">Next Service</p>
                  <p className="mt-2 text-lg font-bold tracking-[-0.01em] transition-colors group-hover:text-accent md:text-xl">
                    {next.title}
                  </p>
                </div>
                <span
                  aria-hidden
                  className="text-xl text-ink-mute transition-all duration-300 group-hover:translate-x-1.5 group-hover:text-accent"
                >
                  →
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
