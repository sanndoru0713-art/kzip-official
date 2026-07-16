/**
 * 실제 프로젝트 이미지가 준비되기 전까지 사용하는 자리표시자.
 * /public/images/ 에 이미지를 넣고 각 데이터 파일의 image 경로를 지정하면 교체됩니다.
 */
export default function PlaceholderImage({
  label = "이미지 교체 필요",
  ratio = "aspect-[4/3]",
  tone = "light",
  className = "",
}: {
  label?: string;
  ratio?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const isDark = tone === "dark";
  return (
    <div
      role="img"
      aria-label={`자리표시자: ${label}`}
      className={`relative flex items-center justify-center overflow-hidden ${ratio} ${
        isDark ? "bg-night-soft" : "bg-paper-deep"
      } ${className}`}
    >
      <div
        aria-hidden
        className={`absolute inset-0 ${
          isDark
            ? "bg-[repeating-linear-gradient(135deg,transparent,transparent_18px,rgba(255,255,255,0.035)_18px,rgba(255,255,255,0.035)_19px)]"
            : "bg-[repeating-linear-gradient(135deg,transparent,transparent_18px,rgba(34,37,46,0.05)_18px,rgba(34,37,46,0.05)_19px)]"
        }`}
      />
      <p
        className={`relative px-4 text-center text-xs tracking-wide ${
          isDark ? "text-white/50" : "text-ink-mute"
        }`}
      >
        [{label}]
      </p>
    </div>
  );
}
