import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "linear-gradient(135deg, #8b5cf6 0%, #22d3ee 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 118,
            height: 72,
            borderRadius: 22,
            background: "rgba(255,255,255,0.96)",
            position: "relative",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
          }}
        >
          {/* D-pad */}
          <div
            style={{
              position: "absolute",
              left: 22,
              width: 28,
              height: 10,
              borderRadius: 3,
              background: "#7c3aed",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 31,
              width: 10,
              height: 28,
              borderRadius: 3,
              background: "#7c3aed",
              display: "flex",
            }}
          />
          {/* Action buttons */}
          <div
            style={{
              position: "absolute",
              right: 28,
              top: 18,
              width: 16,
              height: 16,
              borderRadius: 999,
              background: "#06b6d4",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              right: 46,
              bottom: 18,
              width: 16,
              height: 16,
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
