import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import PlaceholderImage from "@/components/PlaceholderImage";
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

  const [featured, ...feed] = filtered;

  return (
    <>
      <PageHero
        overline="Insights"
        titleLines={["시장과 실행에", "대한 관점"]}
        description="K:ZIP가 프로젝트에서 확인한 것들을 기록합니다. 검증된 내용만 공개합니다."
      />

      <section>
        <div className="container-k py-14 md:py-20">
          {/* 카테고리 필터 */}
          <Reveal>
            <nav aria-label="카테고리 필터" className="flex flex-wrap gap-2.5">
              <Link
                href="/insights"
                className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                  !activeCategory
                    ? "border-ink bg-ink text-white"
                    : "border-line text-ink-soft hover:border-ink hover:text-ink"
                }`}
              >
                전체
              </Link>
              {insightCategories.map((cat) => (
                <Link
                  key={cat}
                  href={`/insights?category=${encodeURIComponent(cat)}`}
                  className={`rounded-full border px-5 py-2.5 text-sm transition-colors ${
                    activeCategory === cat
                      ? "border-ink bg-ink text-white"
                      : "border-line text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  {cat}
                </Link>
              ))}
            </nav>
          </Reveal>

          {filtered.length > 0 ? (
            <>
              {/* 피처드 아티클 */}
              {featured && (
                <Reveal>
                  <Link
                    href={`/insights/${featured.slug}`}
                    className="group mt-14 grid gap-8 border-t border-ink pt-10 lg:grid-cols-12 lg:gap-12 md:mt-20"
                  >
                    <div className="hover-zoom overflow-hidden lg:col-span-5">
                      <PlaceholderImage
                        kind="strategy"
                        figure="FEATURED"
                        label="아티클 대표 이미지 교체 가능"
                        ratio="aspect-[16/10]"
                      />
                    </div>
                    <div className="flex flex-col justify-center lg:col-span-7">
                      <p className="overline-k flex items-center gap-4">
                        <span className="text-accent">{featured.category}</span>
                        <time dateTime={featured.date} className="tracking-[0.15em]">
                          {featured.date.replaceAll("-", ".")}
                        </time>
                      </p>
                      <h2 className="mt-5 text-[clamp(1.6rem,3.4vw,2.6rem)] font-bold leading-[1.25] tracking-[-0.025em] transition-colors group-hover:text-accent">
                        {featured.title}
                      </h2>
                      <p className="mt-5 max-w-xl text-[16px] leading-[1.8] text-ink-soft">
                        {featured.summary}
                      </p>
                      <span className="link-slide mt-8 inline-block w-fit text-[15px] font-semibold">
                        읽기 →
                      </span>
                    </div>
                  </Link>
                </Reveal>
              )}

              {/* 피드 */}
              <div className="mt-16 border-t border-line md:mt-20">
                {feed.map((post, i) => (
                  <Reveal key={post.slug} delay={(i % 4) * 50}>
                    <Link
                      href={`/insights/${post.slug}`}
                      className="group grid gap-3 border-b border-line py-9 md:grid-cols-[120px_150px_1fr_48px] md:items-baseline md:gap-8 md:py-12"
                    >
                      <time
                        dateTime={post.date}
                        className="text-[13px] tracking-[0.1em] text-ink-mute"
                      >
                        {post.date.replaceAll("-", ".")}
                      </time>
                      <p className="overline-k text-accent">{post.category}</p>
                      <div>
                        <h3 className="text-xl font-bold leading-snug tracking-[-0.015em] transition-colors group-hover:text-accent md:text-2xl">
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
                    </Link>
                  </Reveal>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-20 border-t border-line pt-10 text-[15px] text-ink-mute">
              이 카테고리에는 아직 게시물이 없습니다. 곧 채워질 예정입니다.
            </p>
          )}

          <Reveal>
            <p className="mt-20 text-[13px] leading-relaxed text-ink-mute">
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
