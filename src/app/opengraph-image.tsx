import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "K:ZIP — 전략을 설계하고, 성장을 실행합니다";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#111827" }}>
          K<span style={{ color: "#1f3fff" }}>:</span>ZIP
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.22,
              letterSpacing: "-0.03em",
            }}
          >
            전략을 설계하고,
          </div>
          <div
            style={{
              fontSize: 78,
              fontWeight: 800,
              color: "#111827",
              lineHeight: 1.22,
              letterSpacing: "-0.03em",
            }}
          >
            성장을 실행합니다.
          </div>
          <div style={{ marginTop: 30, fontSize: 28, color: "#6b7280" }}>
            전략 중심의 디지털 마케팅 및 글로벌 프로젝트 수행 기업
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "#9ca3af",
            letterSpacing: "0.2em",
          }}
        >
          <div>STRATEGY · CONTENT · DIGITAL · GLOBAL</div>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundColor: "#1f3fff",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
