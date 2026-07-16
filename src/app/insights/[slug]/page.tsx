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
        {/* 아티클 헤더 — 중앙 정렬 */}
        <header className="border-b border-line">
          <div className="container-k pb-16 pt-20 md:pb-24 md:pt-32">
            <Reveal>
              <p className="overline-k flex items-center justify-center gap-5 text-center">
                <Link
                  href={`/insights?category=${encodeURIComponent(post.category)}`}
                  className="text-accent transition-colors hover:text-accent-deep"
                >
                  {post.category}
                </Link>
                <time dateTime={post.date} className="tracking-[0.15em]">
                  {post.date.replaceAll("-", ".")}
                </time>
              </p>
            </Reveal>
            <Reveal className="reveal-mask" delay={100}>
              <h1 className="display-2 mx-auto mt-8 max-w-4xl text-center">
                <span className="mask-line">
                  <span>{post.title}</span>
                </span>
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <p className="mx-auto mt-8 max-w-2xl text-center text-[17px] leading-[1.8] text-ink-soft md:text-lg">
                {post.summary}
              </p>
            </Reveal>
          </div>
        </header>

        <div className="container-k py-16 md:py-24">
          <Reveal>
            {post.body && post.body.length > 0 ? (
              <div className="mx-auto max-w-2xl space-y-7 text-[17px] leading-[1.9] text-ink md:text-lg">
                {post.body.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-2xl border-l-2 border-accent bg-paper-deep/60 px-8 py-12 text-[15px] leading-[1.8] text-ink-mute">
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
              <aside className="mx-auto mt-24 max-w-2xl border-t border-line pt-12">
                <h2 className="overline-k">다른 인사이트</h2>
                <ul className="mt-8 space-y-6">
                  {others.map((other) => (
                    <li key={other.slug}>
                      <Link href={`/insights/${other.slug}`} className="group block">
                        <span className="overline-k text-accent">
                          {other.category}
                        </span>
                        <span className="mt-1.5 block text-lg font-bold tracking-[-0.01em] transition-colors group-hover:text-accent md:text-xl">
                          {other.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/insights"
                  className="group mt-10 inline-flex items-center gap-2 text-[15px] font-semibold text-ink-soft transition-colors hover:text-ink"
                >
                  <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1.5">
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
