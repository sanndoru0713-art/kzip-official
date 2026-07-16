const KIND_LABEL = {
  architecture: "ARCHITECTURE",
  office: "OFFICE",
  meeting: "MEETING",
  strategy: "STRATEGY",
  global: "GLOBAL",
} as const;

export type PlaceholderKind = keyof typeof KIND_LABEL;

/**
 * 실사 이미지가 준비되기 전까지 디자인 요소로 기능하는 에디토리얼 플레이스홀더.
 * 도판(figure) 스타일 — 파인 그리드 + 크롭마크 + 캡션.
 * 실제 이미지 교체: /public/images/ 에 추가 후 데이터 파일에서 경로 지정.
 */
export default function PlaceholderImage({
  label = "이미지 교체 필요",
  ratio = "aspect-[4/3]",
  kind = "architecture",
  figure,
  tone = "light",
  className = "",
}: {
  label?: string;
  ratio?: string;
  kind?: PlaceholderKind;
  /** 도판 번호 표기 (예: "FIG.01") */
  figure?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const isDark = tone === "dark";
  return (
    <div
      role="img"
      aria-label={`자리표시자: ${label}`}
      className={`relative overflow-hidden ${ratio} ${
        isDark ? "bg-night-soft" : "bg-paper-deep"
      } ${className}`}
    >
      {/* 파인 그리드 — 건축 도면 느낌 */}
      <div
        aria-hidden
        className="media-scale absolute inset-0"
        style={{
          backgroundImage: isDark
            ? "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)"
            : "linear-gradient(rgba(17,24,39,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* 대각 헤어라인 */}
      <svg
        aria-hidden
        className={`absolute inset-0 h-full w-full ${isDark ? "opacity-[0.08]" : "opacity-[0.06]"}`}
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="0.2" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="currentColor" strokeWidth="0.2" />
      </svg>

      {/* 도판 번호 (좌상단) */}
      {figure && (
        <span
          className={`absolute left-4 top-4 text-[10px] font-semibold tracking-[0.2em] ${
            isDark ? "text-white/40" : "text-ink-mute"
          }`}
        >
          {figure}
        </span>
      )}
      {/* 크롭마크 (우상단) */}
      <span
        aria-hidden
        className={`absolute right-4 top-4 block h-2.5 w-2.5 border-r border-t ${
          isDark ? "border-white/30" : "border-ink-mute/60"
        }`}
      />
      <span
        aria-hidden
        className={`absolute bottom-4 left-4 block h-2.5 w-2.5 border-b border-l ${
          isDark ? "border-white/30" : "border-ink-mute/60"
        }`}
      />

      {/* 중앙 캡션 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <p
          className={`text-[clamp(0.9rem,2vw,1.4rem)] font-bold tracking-[0.3em] ${
            isDark ? "text-white/25" : "text-ink/15"
          }`}
        >
          {KIND_LABEL[kind]}
        </p>
        <p
          className={`mt-2 text-[11px] tracking-wider ${
            isDark ? "text-white/40" : "text-ink-mute"
          }`}
        >
          [{label}]
        </p>
      </div>

      {/* 하단 캡션 바 */}
      <div
        className={`absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-2.5 text-[10px] tracking-[0.15em] ${
          isDark ? "text-white/30" : "text-ink-mute"
        }`}
      >
        <span>K:ZIP — PHOTOGRAPHY</span>
        <span className="uppercase">{kind}</span>
      </div>
    </div>
  );
}
