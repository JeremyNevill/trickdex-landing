import type { CSSProperties, ReactNode } from "react";

export const APP_URL = "https://app.wakeboard.com";

// Font stacks — resolve to the CSS variables set by next/font in layout.tsx.
export const FONT_DISPLAY = "var(--font-space-grotesk), sans-serif";
export const FONT_BODY = "var(--font-inter), system-ui, sans-serif";
export const FONT_MONO = "var(--font-jetbrains-mono), monospace";

export const Icon = {
  arrow: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  check: (s = 16) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  search: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  pulse: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h4l3-8 5 16 3-8h5" />
    </svg>
  ),
  share: (s = 18) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5L8.6 10.5" />
    </svg>
  ),
};

type BtnProps = {
  href: string;
  children: ReactNode;
  size?: "md" | "lg";
};

export function ButtonPrimary({ href, children, size = "md" }: BtnProps) {
  const pad = size === "lg" ? "14px 24px" : "10px 18px";
  const fs = size === "lg" ? 15 : 13;
  return (
    <a
      href={href}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: pad,
        background: "var(--td-primary)", color: "#fff", borderRadius: 999,
        fontSize: fs, fontWeight: 700, letterSpacing: "-0.01em", textDecoration: "none",
        whiteSpace: "nowrap", flexShrink: 0,
        boxShadow: "0 6px 16px rgba(37, 99, 235, 0.28)",
      }}
    >
      {children}
    </a>
  );
}

export function ButtonSecondary({ href, children, size = "md" }: BtnProps) {
  const pad = size === "lg" ? "14px 24px" : "10px 18px";
  const fs = size === "lg" ? 15 : 13;
  return (
    <a
      href={href}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8, padding: pad,
        background: "#fff", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 999,
        fontSize: fs, fontWeight: 700, letterSpacing: "-0.01em", textDecoration: "none",
        whiteSpace: "nowrap", flexShrink: 0,
      }}
    >
      {children}
    </a>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  const style: CSSProperties = {
    fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: size,
    letterSpacing: "-0.025em", color: "#0f172a",
  };
  return (
    <span style={style}>
      wakeboard<span style={{ color: "var(--td-primary)" }}>.</span>com
    </span>
  );
}
