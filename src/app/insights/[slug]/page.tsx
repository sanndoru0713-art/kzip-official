import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import CTABand from "@/components/CTABand";
import { getInsight, insights } from "@/data/insights";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return insights.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) return {};
  return {
    title: `${post.title} | 인사이트`,
    description: post.summary,
  };
}

export default async function InsightDetailPage({ params }: Props) {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) notFound();

  const others = insights.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article>
        <header className="border-b border-line">
          <div className="container-k py-16 md:py-24">
            <Reveal>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href={`/insights?category=${encodeURIComponent(post.category)}`}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-accent hover:underline"
                >
                  {post.category}
                </Link>
                <time dateTime={post.date} className="text-xs text-ink-mute">
                  {post.date.replaceAll("-", ".")}
                </time>
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.25] md:text-5xl">
                {post.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
                {post.summary}
              </p>
            </Reveal>
          </div>
        </header>

        <div className="container-k py-16 md:py-20">
          <Reveal>
            {post.body && post.body.length > 0 ? (
              <div className="max-w-2xl space-y-6 text-base leading-[1.85] text-ink">
                {post.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <div className="max-w-2xl border border-dashed border-ink-mute/50 bg-paper-deep/40 px-6 py-10 text-sm leading-relaxed text-ink-mute">
                [본문 준비 중]
                <br />
                이 글의 전체 내용은 준비되는 대로 공개됩니다. 원고가 확정되면{" "}
                <code>src/data/insights.ts</code>의 body 배열에 문단을
                추가하세요.
              </div>
            )}
          </Reveal>

          {/* 다른 글 */}
          {others.length > 0 && (
            <Reveal>
              <aside className="mt-20 border-t border-line pt-10">
                <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-mute">
                  다른 인사이트
                </h2>
                <ul className="mt-6 space-y-4">
                  {others.map((other) => (
                    <li key={other.slug}>
                      <Link
                        href={`/insights/${other.slug}`}
                        className="group inline-flex flex-wrap items-baseline gap-3"
                      >
                        <span className="text-xs font-semibold text-accent">
                          {other.category}
                        </span>
                        <span className="text-base font-medium transition-colors group-hover:text-accent">
                          {other.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/insights"
                  className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink-soft transition-colors hover:text-accent"
                >
                  <span aria-hidden className="transition-transform group-hover:-translate-x-1">
                    ←
                  </span>
                  인사이트 목록으로
                </Link>
              </aside>
            </Reveal>
          )}
        </div>
      </article>

      <CTABand />
    </>
  );
}
