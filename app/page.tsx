import { getAllTricks, trickPath } from "@/lib/tricks";
import { APP_URL, FONT_DISPLAY, FONT_MONO } from "@/components/ui";
import { SiteHeader, SiteFooter } from "@/components/chrome";
import { TrickIndex, type IndexTrick } from "@/components/TrickIndex";

export default async function Page() {
  const tricks = await getAllTricks();

  const indexTricks: IndexTrick[] = tricks.map((t) => ({
    trickId: t.trickId,
    displayName: t.displayName,
    aliases: t.aliases,
    description: t.description,
    href: trickPath(t.trickId, t.slug),
    hasMedia: t.mediaCount > 0,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "The wakeboard trick list",
    description:
      "The complete wakeboard trick list — every trick, searchable, with descriptions and clips.",
    url: "https://www.wakeboard.com",
    isPartOf: {
      "@type": "WebSite",
      name: "wakeboard.com",
      url: "https://www.wakeboard.com",
    },
    about: { "@type": "Thing", name: "Wakeboarding tricks" },
    numberOfItems: tricks.length,
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Short strip — this is the list; the app is where you log it. */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid #e2e8f0" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background:
              "radial-gradient(circle at 15% 0%, color-mix(in oklch, var(--td-primary) 12%, transparent) 0%, transparent 45%)",
          }}
        />
        <div className="container" style={{ position: "relative", padding: "48px 0 40px", maxWidth: 760 }}>
          <p style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--td-primary)", fontWeight: 600 }}>
            The wakeboard trick list
          </p>
          <h1
            style={{
              margin: "12px 0 0", fontFamily: FONT_DISPLAY,
              fontSize: "clamp(30px, 4.5vw, 46px)", lineHeight: 1.04, letterSpacing: "-0.03em",
              fontWeight: 700, color: "#0f172a", textWrap: "balance",
            }}
          >
            Every wakeboard trick, in one place.
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: 17, lineHeight: 1.5, color: "#475569", maxWidth: 560 }}>
            This is the list. <a href={APP_URL} style={{ color: "var(--td-primary)", fontWeight: 600, textDecoration: "none" }}>The app</a> is where you log it —
            track what you’re learning, landing and stomping, and log your sessions, trick bags and competition plans.
          </p>
        </div>
      </section>

      <div style={{ height: 32 }} />
      <TrickIndex tricks={indexTricks} />

      <SiteFooter />
    </>
  );
}
