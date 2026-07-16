import Link from "next/link";
import Reveal from "@/components/Reveal";

/** 섹션 헤딩 — 인덱스 번호 + 오버라인 + 대형 타이틀. */
export default function SectionHeading({
  index,
  overline,
  title,
  description,
  link,
  tone = "light",
}: {
  /** 섹션 인덱스 표기 (예: "01") */
  index?: string;
  overline: string;
  title: string;
  description?: string;
  link?: { label: string; href: string };
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <Reveal>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="overline-k flex items-center gap-3">
            {index && <span className="text-accent">{index}</span>}
            <span className={isDark ? "text-white/40" : undefined}>{overline}</span>
          </p>
          <h2 className={`display-2 mt-5 ${isDark ? "text-white" : "text-ink"}`}>
            {title}
          </h2>
          {description && (
            <p
              className={`mt-6 max-w-xl text-[17px] leading-relaxed md:text-lg ${
                isDark ? "text-white/60" : "text-ink-soft"
              }`}
            >
              {description}
            </p>
          )}
        </div>
        {link && (
          <Link
            href={link.href}
            className={`group inline-flex shrink-0 items-center gap-2 text-[15px] font-semibold ${
              isDark ? "text-white/80 hover:text-white" : "text-ink hover:text-accent"
            } transition-colors`}
          >
            {link.label}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        )}
      </div>
    </Reveal>
  );
}
