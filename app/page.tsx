import {
  getAllTricks,
  pickClassics,
  groupAlphabetically,
  jsonLdScript,
} from "@/lib/tricks";
import { APP_URL, FONT_DISPLAY, FONT_MONO } from "@/components/ui";
import { SiteHeader, SiteFooter } from "@/components/chrome";
import { TrickCard } from "@/components/TrickCard";
import { TrickSearch } from "@/components/TrickSearch";

const GRID: React.CSSProperties = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 12,
};

export default async function Page() {
  const tricks = await getAllTricks();
  const classics = pickClassics(tricks);
  const { groups, letters } = groupAlphabetically(tricks);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "The wakeboard trick list",
    description:
      "The complete wakeboard trick list — every trick, with descriptions and clips, one click from its own page.",
    url: "https://www.wakeboard.com",
    isPartOf: { "@type": "WebSite", name: "wakeboard.com", url: "https://www.wakeboard.com" },
    about: { "@type": "Thing", name: "Wakeboarding tricks" },
    numberOfItems: tricks.length,
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />

      {/* Short strip — this is the list; the app is where you log it. */}
      <section style={{ position: "relative", overflow: "hidden", borderBottom: "1px solid #e2e8f0" }}>
        <div
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(circle at 15% 0%, color-mix(in oklch, var(--td-primary) 12%, transparent) 0%, transparent 45%)",
          }}
        />
        <div className="container" style={{ position: "relative", padding: "48px 0 40px", maxWidth: 760 }}>
          <p style={{ margin: 0, fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--td-primary)", fontWeight: 600 }}>
            The wakeboard trick list
          </p>
          <h1 style={{ margin: "12px 0 0", fontFamily: FONT_DISPLAY, fontSize: "clamp(30px, 4.5vw, 46px)", lineHeight: 1.04, letterSpacing: "-0.03em", fontWeight: 700, color: "#0f172a", textWrap: "balance" }}>
            Every wakeboard trick, in one place.
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: 17, lineHeight: 1.5, color: "#475569", maxWidth: 560 }}>
            This is the list. <a href={APP_URL} style={{ color: "var(--td-primary)", fontWeight: 600, textDecoration: "none" }}>The app</a> is where you log it —
            track what you’re learning, landing and stomping, and log your sessions, trick bags and competition plans.
          </p>
        </div>
      </section>

      <div style={{ height: 32 }} />

      <section className="container" style={{ padding: "8px 0 96px" }}>
        <TrickSearch total={tricks.length} />

        {/* Start here — well-known classics for first-time visitors. */}
        {classics.length > 0 && (
          <div id="classics-strip" style={{ marginBottom: 44 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a" }}>
                Start here
              </h2>
              <span style={{ fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase" }}>
                the classics
              </span>
            </div>
            <ul style={GRID}>
              {classics.map((t) => (
                <TrickCard key={t.trickId} trick={t} />
              ))}
            </ul>
          </div>
        )}

        {/* A–Z jump links. */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a" }}>
            All tricks A–Z
          </h2>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase" }}>
            {tricks.length} tricks
          </span>
        </div>
        <nav id="az-nav" aria-label="Jump to letter" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 28 }}>
          {letters.map((l) => (
            <a
              key={l}
              className="jump-link"
              href={`#letter-${l === "#" ? "num" : l}`}
              aria-label={l === "#" ? "Jump to tricks starting with a number" : `Jump to tricks starting with ${l}`}
              style={{
                minWidth: 34, height: 34, padding: "0 8px", borderRadius: 8,
                border: "1px solid #e2e8f0", background: "#fff", color: "#0f172a",
                fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600, textDecoration: "none",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {l}
            </a>
          ))}
        </nav>

        {/* Full A–Z list — real static <a> links, one click to every trick page. */}
        {groups.map((g) => (
          <section
            key={g.letter}
            data-letter-section
            id={`letter-${g.letter === "#" ? "num" : g.letter}`}
            aria-label={g.letter === "#" ? "Tricks starting with a number" : `Tricks starting with ${g.letter}`}
            style={{ marginBottom: 36, scrollMarginTop: 80 }}
          >
            <p aria-hidden="true" style={{ margin: "0 0 14px", fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a", borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
              {g.letter === "#" ? "0–9" : g.letter}
            </p>
            <ul style={GRID}>
              {g.tricks.map((t) => (
                <TrickCard key={t.trickId} trick={t} />
              ))}
            </ul>
          </section>
        ))}
      </section>

      <SiteFooter />
    </>
  );
}
