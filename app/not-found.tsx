import type { Metadata } from "next";
import { FONT_DISPLAY, FONT_MONO, Icon } from "@/components/ui";
import { SiteHeader, SiteFooter } from "@/components/chrome";

export const metadata: Metadata = {
  title: "Trick not found — wakeboard.com",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container" style={{ padding: "80px 0 120px", maxWidth: 640, textAlign: "center" }}>
        <p style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--td-primary)", fontWeight: 600 }}>
          404
        </p>
        <h1 style={{ margin: "14px 0 0", fontFamily: FONT_DISPLAY, fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05, letterSpacing: "-0.03em", fontWeight: 700, color: "#0f172a" }}>
          We couldn’t find that trick.
        </h1>
        <p style={{ margin: "16px 0 32px", fontSize: 17, lineHeight: 1.5, color: "#475569" }}>
          The link may be out of date, or the trick isn’t on the list. Browse the
          full wakeboard trick list to find what you’re after.
        </p>
        <a
          className="btn-primary"
          href="/"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 24px",
            background: "var(--td-primary)", color: "#fff", borderRadius: 999,
            fontSize: 15, fontWeight: 700, textDecoration: "none",
            boxShadow: "0 6px 16px rgba(37, 99, 235, 0.22)",
          }}
        >
          Browse all tricks {Icon.arrow(15)}
        </a>
      </main>
      <SiteFooter />
    </>
  );
}
