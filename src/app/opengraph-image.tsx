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
          backgroundColor: "#faf8f4",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#22252e" }}>
          K<span style={{ color: "#b04e28" }}>:</span>ZIP
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#22252e",
              lineHeight: 1.25,
            }}
          >
            전략을 설계하고,
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#22252e",
              lineHeight: 1.25,
            }}
          >
            성장을 실행합니다.
          </div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#52565f" }}>
            전략 중심의 디지털 마케팅 및 글로벌 프로젝트 수행 기업
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#8a8e97",
          }}
        >
          <div>Strategy · Content · Digital · Global</div>
          <div style={{ color: "#b04e28" }}>kzip</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
