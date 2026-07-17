import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import CmsImage from "@/components/CmsImage";
import CTABand from "@/components/CTABand";
import { insightCategories } from "@/data/insights";
import { getInsights } from "@/lib/notion/queries";

export const metadata: Metadata = {
  title: "인사이트",
  description:
    "전략, 디지털 마케팅, 일본 시장, 글로벌 비즈니스, 데이터·AI — 시장과 실행에 대한 K:ZIP의 관점을 기록합니다.",
};

type Props = { searchParams: Promise<{ category?: string }> };

export default async function InsightsPage({ searchParams }: Props) {
  const [{ category }, insights] = await Promise.all([searchParams, getInsights()]);
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
            {/* scroll={false} — 필터 전환 시 새로고침·스크롤 점프 없이 목록만 갱신 */}
            <nav aria-label="카테고리 필터" className="flex flex-wrap gap-2.5">
              <Link
                href="/insights"
                scroll={false}
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
                  scroll={false}
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
                      <CmsImage
                        src={featured.imageUrl}
                        alt={featured.title}
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
                      className="group relative grid gap-3 border-b border-line py-9 md:grid-cols-[120px_150px_1fr_48px] md:items-baseline md:gap-8 md:py-12"
                    >
                      <time
                        dateTime={post.date}
                        className="text-[13px] tracking-[0.1em] text-ink-mute"
                      >
                        {post.date.replaceAll("-", ".")}
                      </time>
                      <p className="overline-k text-accent">{post.category}</p>
                      <div>
                        <h3 className="text-xl font-bold leading-snug tracking-[-0.015em] transition-[color,transform] duration-300 group-hover:translate-x-1.5 group-hover:text-accent md:text-2xl">
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
                      {/* hover 시 우측에 나타나는 썸네일 — 레이아웃에 영향 없음 */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute right-24 top-1/2 z-10 hidden w-44 -translate-y-1/2 xl:block"
                      >
                        <span className="block translate-y-2 opacity-0 shadow-sm transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                          <CmsImage
                            src={post.imageUrl}
                            alt=""
                            kind={(["office", "meeting", "global", "strategy"] as const)[i % 4]}
                            label="썸네일"
                            ratio="aspect-[16/10]"
                          />
                        </span>
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
              K:ZIP의 새로운 인사이트가 이곳에 계속 업데이트됩니다.
            </p>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
