import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 14,
            borderRadius: 5,
            background: "rgba(255,255,255,0.95)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 4,
              width: 5,
              height: 5,
              borderRadius: 1,
              background: "#7c3aed",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 4,
              top: 3,
              width: 3,
              height: 3,
              borderRadius: 999,
              background: "#06b6d4",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 8,
              bottom: 3,
              width: 3,
              height: 3,
              borderRadius: 999,
              background: "#a78bfa",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
