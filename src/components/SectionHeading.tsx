import Link from "next/link";
import Reveal from "@/components/Reveal";

/** 섹션 상단 공통 헤딩 — 오버라인 + 제목 + 선택적 설명/링크. */
export default function SectionHeading({
  overline,
  title,
  description,
  link,
  tone = "light",
}: {
  overline: string;
  title: string;
  description?: string;
  link?: { label: string; href: string };
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <Reveal>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              isDark ? "text-white/50" : "text-accent"
            }`}
          >
            {overline}
          </p>
          <h2
            className={`mt-3 text-3xl font-bold leading-tight md:text-4xl ${
              isDark ? "text-white" : "text-ink"
            }`}
          >
            {title}
          </h2>
          {description && (
            <p
              className={`mt-4 text-base leading-relaxed ${
                isDark ? "text-white/65" : "text-ink-soft"
              }`}
            >
              {description}
            </p>
          )}
        </div>
        {link && (
          <Link
            href={link.href}
            className={`group inline-flex shrink-0 items-center gap-2 text-sm font-medium ${
              isDark ? "text-white/80 hover:text-white" : "text-ink hover:text-accent"
            } transition-colors`}
          >
            {link.label}
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        )}
      </div>
    </Reveal>
  );
}
