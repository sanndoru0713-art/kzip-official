import PlaceholderImage, { type PlaceholderKind } from "@/components/PlaceholderImage";

/**
 * CMS 이미지 래퍼 — Notion에서 이미지가 제공되면 실제 이미지를,
 * 없으면 기존 도판 스타일 플레이스홀더를 그대로 렌더링합니다.
 * 컨테이너·비율·인터랙션 클래스는 플레이스홀더와 동일하게 유지됩니다.
 */
export default function CmsImage({
  src,
  alt,
  label = "이미지 교체 필요",
  ratio = "aspect-[4/3]",
  kind = "architecture",
  figure,
  tone = "light",
  className = "",
}: {
  src?: string;
  alt: string;
  label?: string;
  ratio?: string;
  kind?: PlaceholderKind;
  figure?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden ${ratio} ${className}`}>
        {/* Notion Files URL 만료 가능성 대비: 로드 실패 시에도 레이아웃 유지 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="media-scale absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <PlaceholderImage
      label={label}
      ratio={ratio}
      kind={kind}
      figure={figure}
      tone={tone}
      className={className}
    />
  );
}
