import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import CTABand from "@/components/CTABand";
import { insightCategories, insights } from "@/data/insights";

export const metadata: Metadata = {
  title: "인사이트",
  description:
    "전략, 디지털 마케팅, 일본 시장, 글로벌 비즈니스, 데이터·AI — 시장과 실행에 대한 K:ZIP의 관점을 기록합니다.",
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function InsightsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const activeCategory = insightCategories.find((c) => c === category);
  const filtered = activeCategory
    ? insights.filter((post) => post.category === activeCategory)
    : insights;

  return (
    <>
      <PageHero
        overline="Insights"
        title="시장과 실행에 대한 관점"
        description="K:ZIP가 프로젝트에서 확인한 것들을 기록합니다. 검증된 내용만 공개합니다."
      />

      <section>
        <div className="container-k py-12 md:py-16">
          {/* 카테고리 필터 */}
          <Reveal>
            <nav aria-label="카테고리 필터" className="flex flex-wrap gap-2">
              <Link
                href="/insights"
                className={`border px-4 py-2 text-sm transition-colors ${
                  !activeCategory
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                전체
              </Link>
              {insightCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/insights?category=${encodeURIComponent(cat)}`}
                  className={`border px-4 py-2 text-sm transition-colors ${
                    activeCategory === cat
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </Reveal>

          {/* 게시물 목록 */}
          {filtered.length > 0 ? (
            <ul className="mt-10 border-t border-line">
              {filtered.map((post, i) => (
                <li key={post.slug} className="border-b border-line">
                  <Reveal delay={(i % 4) * 50}>
                    <Link
                      href={`/insights/${post.slug}`}
                      className="group grid gap-2 py-8 md:grid-cols-[140px_1fr_120px] md:items-baseline md:gap-8"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-accent">
                        {post.category}
                      </p>
                      <div>
                        <h2 className="text-xl font-bold leading-snug transition-colors group-hover:text-accent md:text-2xl">
                          {post.title}
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
                          {post.summary}
                        </p>
                      </div>
                      <time
                        dateTime={post.date}
                        className="text-xs text-ink-mute md:justify-self-end"
                      >
                        {post.date.replaceAll("-", ".")}
                      </time>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-16 border-t border-line pt-10 text-sm text-ink-mute">
              이 카테고리에는 아직 게시물이 없습니다. 곧 채워질 예정입니다.
            </p>
          )}

          <Reveal>
            <p className="mt-16 text-xs leading-relaxed text-ink-mute">
              새 글은 <code>src/data/insights.ts</code>에 항목을 추가하면 목록과
              상세 페이지에 자동 반영됩니다.
            </p>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
