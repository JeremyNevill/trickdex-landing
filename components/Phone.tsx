import type { ReactNode } from "react";

/**
 * Phone frame — titanium bezel + black rim + dynamic island, wrapping a real
 * app screenshot. Screenshots live in /public/shots and are captured at phone
 * width from app.wakeboard.com (see public/shots/README.md).
 */
export function Phone({
  src,
  alt,
  width = 320,
  height = 660,
  priority = false,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  const scale = width / 390;
  return (
    <div
      style={{
        width, height, position: "relative",
        filter:
          "drop-shadow(0 30px 40px rgba(15, 23, 42, 0.18)) drop-shadow(0 8px 12px rgba(15,23,42,0.08))",
      }}
    >
      {/* Outer titanium bezel */}
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: 52 * scale,
          background:
            "linear-gradient(160deg, #d1d5db 0%, #f1f5f9 25%, #cbd5e1 55%, #e2e8f0 100%)",
          padding: 3 * scale, boxSizing: "border-box",
        }}
      >
        {/* Inner black rim */}
        <div
          style={{
            width: "100%", height: "100%", borderRadius: 49 * scale,
            background: "#0a0a0c", padding: 8 * scale, boxSizing: "border-box",
            position: "relative", overflow: "hidden",
          }}
        >
          {/* Screen */}
          <div
            style={{
              width: "100%", height: "100%", borderRadius: 41 * scale,
              overflow: "hidden", position: "relative", background: "#f8fafc",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              loading={priority ? "eager" : "lazy"}
              style={{
                display: "block", width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "top center",
              }}
            />
            {/* Dynamic Island */}
            <div
              style={{
                position: "absolute", top: 12 * scale, left: "50%",
                transform: "translateX(-50%)", width: 116 * scale, height: 30 * scale,
                background: "#0a0a0c", borderRadius: 999, zIndex: 30,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
