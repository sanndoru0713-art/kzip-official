import Reveal from "@/components/Reveal";

/** 서브페이지 상단 인트로. */
export default function PageHero({
  overline,
  title,
  description,
}: {
  overline: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-line">
      <div className="container-k py-16 md:py-24">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {overline}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.15] md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-soft md:text-lg">
              {description}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
