import type { Metadata } from "next";
import { jsonLdScript } from "@/lib/tricks";
import { APP_URL, FONT_DISPLAY, FONT_MONO, Icon } from "@/components/ui";
import { SiteHeader, SiteFooter } from "@/components/chrome";

const SITE = "https://www.wakeboard.com";
const PATH = "/Compares";
const CANONICAL = `${SITE}${PATH}`;
const TITLE = "Wakeboard boat compare — wakeboard.com";
const DESCRIPTION =
  "Wakeboard boat compare used to live at this address. wakeboard.com is now the global wakeboard trick list — browse every trick, or open the app.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "wakeboard boat compare",
    "wakeboard boats",
    "boat compare",
    "wakeboard",
    "wakeboard trick list",
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: "website",
    url: CANONICAL,
    siteName: "wakeboard.com",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true },
};

export default function ComparesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    isPartOf: {
      "@type": "WebSite",
      name: "wakeboard.com",
      url: SITE,
    },
    about: { "@type": "Thing", name: "Wakeboard boat compare" },
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <main
        className="container"
        style={{ padding: "80px 0 120px", maxWidth: 640 }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: FONT_MONO,
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--td-primary)",
            fontWeight: 600,
          }}
        >
          Wakeboard boat compare
        </p>
        <h1
          style={{
            margin: "14px 0 0",
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(30px, 5vw, 46px)",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            fontWeight: 700,
            color: "#0f172a",
            textWrap: "balance",
          }}
        >
          Boat compare used to live here.
        </h1>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 17,
            lineHeight: 1.5,
            color: "#475569",
          }}
        >
          This was the old wakeboard.com boat compare. The site is now the
          global wakeboard trick list — every trick, with descriptions and
          clips. Boat listings aren’t coming back.
        </p>
        <div
          style={{
            marginTop: 32,
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            alignItems: "center",
          }}
        >
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 15,
              fontWeight: 700,
              color: "var(--td-primary)",
              textDecoration: "none",
            }}
          >
            Browse the trick list {Icon.arrow(15)}
          </a>
          <a
            href={APP_URL}
            className="footer-link"
            style={{ fontSize: 15, fontWeight: 600 }}
          >
            Open the app
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
