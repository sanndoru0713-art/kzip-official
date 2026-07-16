import Reveal from "@/components/Reveal";

/** 서브페이지 상단 인트로 — 대형 타이포 + 마스크 리빌. */
export default function PageHero({
  overline,
  title,
  titleLines,
  description,
}: {
  overline: string;
  title?: string;
  /** 줄 단위 마스크 리빌이 필요할 때 사용 */
  titleLines?: string[];
  description?: string;
}) {
  const lines = titleLines ?? (title ? [title] : []);
  return (
    <section className="border-b border-line">
      <div className="container-k pb-16 pt-20 md:pb-24 md:pt-32">
        <Reveal className="reveal-mask">
          <p className="overline-k">
            <span className="text-accent">{overline}</span>
          </p>
          <h1 className="display-1 mt-7 max-w-4xl">
            {lines.map((line) => (
              <span key={line} className="mask-line">
                <span>{line}</span>
              </span>
            ))}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={180}>
            <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-ink-soft md:text-lg">
              {description}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}
