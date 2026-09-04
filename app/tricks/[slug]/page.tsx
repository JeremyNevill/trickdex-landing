import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllTricks,
  getTrick,
  isExcludedTrick,
  jsonLdScript,
  resolveMedia,
  trickIdFromSlug,
  trickPath,
  type Trick,
} from "@/lib/tricks";
import { relatedTricks } from "@/lib/related";
import { FONT_DISPLAY, FONT_MONO, Icon, appTrickUrl } from "@/components/ui";
import { SiteHeader, SiteFooter } from "@/components/chrome";
import { accentByFamily } from "@/lib/trickColor";

// Reading-column width for the trick detail article. The page frame is the full
// 1180px container (like the header and home page); the article is left-pinned
// to this narrower width so it keeps a comfortable line length while sharing the
// same left edge as the logo and the rest of the site.
const COLUMN = 760;

// Emit one static page per trick at build time.
export async function generateStaticParams() {
  const tricks = await getAllTricks();
  return tricks.map((t) => ({ slug: `wkb${t.trickId}-${t.slug}` }));
}

async function loadTrick(routeSlug: string): Promise<Trick | null> {
  const id = trickIdFromSlug(routeSlug);
  if (id == null) return null;
  try {
    const trick = await getTrick(id);
    // Excluded (BB drill) entries are not part of the public list — 404 even if
    // someone hits the id directly.
    if (isExcludedTrick(trick.name)) return null;
    return trick;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trick = await loadTrick(slug);
  if (!trick) return { title: "Trick not found — wakeboard.com" };
  const title = `${trick.displayName} — wakeboard.com trick list`;
  const description =
    trick.description ??
    `${trick.displayName} — wakeboard trick WKB${trick.trickId} on the wakeboard.com trick list.`;
  const canonical = trickPath(trick.trickId, trick.slug);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function TrickPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const id = trickIdFromSlug(slug);
  if (id == null) notFound();

  const trick = await loadTrick(slug);
  if (!trick) notFound();

  // Slug can change but the id is canonical. Only canonical slugs are generated
  // (generateStaticParams); a stale slug 404s. Every page carries rel=canonical
  // (see generateMetadata) so search engines consolidate on the right URL —
  // static export can't issue a runtime 301.

  const resolvedMedia = resolveMedia(trick.media);

  // Related tricks — computed from the full set (see lib/related.ts).
  const allTricks = await getAllTricks();
  const related = relatedTricks(trick, allTricks);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: trick.displayName,
    identifier: `WKB${trick.trickId}`,
    description: trick.description ?? undefined,
    alternateName: trick.aliases.length ? trick.aliases : undefined,
    about: {
      "@type": "Thing",
      name: trick.displayName,
      description: trick.description ?? undefined,
    },
    isPartOf: {
      "@type": "WebSite",
      name: "wakeboard.com",
      url: "https://www.wakeboard.com",
    },
    relatedLink: related.map(
      (r) => `https://www.wakeboard.com${trickPath(r.trickId, r.slug)}`,
    ),
  };

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <main className="container" style={{ padding: "40px 0 96px" }}>
       <div style={{ maxWidth: COLUMN }}>
        <a
          href="/"
          className="footer-link"
          style={{ fontFamily: FONT_MONO, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}>{Icon.arrow(13)}</span>
          All tricks
        </a>

        <div style={{ marginTop: 24, display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <h1
            style={{
              margin: 0, fontFamily: FONT_DISPLAY, fontSize: "clamp(34px, 5vw, 52px)",
              lineHeight: 1.02, letterSpacing: "-0.03em", fontWeight: 700, color: "#0f172a",
            }}
          >
            {trick.displayName}
          </h1>
          <span
            style={{
              fontFamily: FONT_MONO, fontSize: 13, fontWeight: 600, color: "var(--td-primary)",
              background: "color-mix(in oklch, var(--td-primary) 10%, white)",
              padding: "4px 10px", borderRadius: 999, whiteSpace: "nowrap",
            }}
          >
            WKB{trick.trickId}
          </span>
        </div>

        {trick.aliases.length > 0 && (
          <p style={{ margin: "12px 0 0", fontSize: 15, color: "#64748b" }}>
            Also known as{" "}
            {trick.aliases.map((a, i) => (
              <span key={a}>
                <strong style={{ color: "#334155" }}>{a}</strong>
                {i < trick.aliases.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        )}

        {trick.description && (
          <p style={{ margin: "24px 0 0", fontSize: 18, lineHeight: 1.55, color: "#334155", textWrap: "pretty" }}>
            {trick.description}
          </p>
        )}

        {trick.landedByCount > 0 && (
          <p style={{ margin: "20px 0 0", fontFamily: FONT_MONO, fontSize: 12, letterSpacing: "0.06em", color: "#64748b", textTransform: "uppercase" }}>
            Landed by {trick.landedByCount} rider{trick.landedByCount === 1 ? "" : "s"}
          </p>
        )}

        {resolvedMedia.length > 0 && (
          <div style={{ marginTop: 36 }}>
            {resolvedMedia.map((rm) => {
              const m = rm.media;
              const caption =
                m.title || m.photographer ? (
                  <figcaption style={{ margin: "8px 2px 0", fontSize: 12, color: "#64748b" }}>
                    {m.title}
                    {m.photographer ? ` — ${m.photographer}` : ""}
                  </figcaption>
                ) : null;

              if (rm.kind === "youtube" || rm.kind === "vimeo") {
                return (
                  <figure key={m.mediaId} style={{ margin: "0 0 24px" }}>
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 16, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                      <iframe
                        src={rm.embed}
                        title={m.title ?? trick.displayName}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                      />
                    </div>
                    {caption}
                  </figure>
                );
              }

              if (rm.kind === "photo") {
                return (
                  <figure key={m.mediaId} style={{ margin: "0 0 24px" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rm.src}
                      alt={m.title ?? trick.displayName}
                      loading="lazy"
                      style={{ display: "block", width: "100%", height: "auto", borderRadius: 16, border: "1px solid #e2e8f0" }}
                    />
                    {caption}
                  </figure>
                );
              }

              // PDF — quiet document link, not an embed.
              return (
                <p key={m.mediaId} style={{ margin: "0 0 16px" }}>
                  <a
                    href={rm.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                    style={{ fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}
                  >
                    View {m.title ?? "diagram"} (PDF) {Icon.arrow(13)}
                  </a>
                </p>
              );
            })}
          </div>
        )}

        {/* Quiet conversion point: signup happens in the app, at the moment of intent. */}
        <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid #e2e8f0" }}>
          <a
            className="btn-primary"
            href={appTrickUrl(trick.trickId)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 20px",
              background: "var(--td-primary)", color: "#fff", borderRadius: 999,
              fontSize: 14, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 6px 16px rgba(37, 99, 235, 0.22)",
            }}
          >
            Track this trick in the free app {Icon.arrow(14)}
          </a>
          <p style={{ margin: "12px 0 0", fontSize: 13, color: "#64748b" }}>
            Mark it learning, landed or consistent — and log your sessions on wakeboard.com.
          </p>
        </div>

        {related.length > 0 && (
          <div style={{ marginTop: 44, paddingTop: 28, borderTop: "1px solid #e2e8f0" }}>
            <h2 style={{ margin: "0 0 16px", fontFamily: FONT_MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--td-primary)", fontWeight: 600 }}>
              Related tricks
            </h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
              {related.map((r) => (
                <li key={r.trickId}>
                  <a
                    className="card-link"
                    href={trickPath(r.trickId, r.slug)}
                    style={{
                      display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10,
                      padding: "12px 16px", borderRadius: 12, border: "1px solid #e2e8f0",
                      borderLeft: `4px solid ${accentByFamily(r).border}`,
                      background: "#fff", textDecoration: "none",
                    }}
                  >
                    <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em", color: "#0f172a" }}>
                      {r.displayName}
                    </span>
                    <span
                      style={{
                        fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600, color: "#475569",
                        background: "#f1f5f9", border: "1px solid #e8edf3",
                        padding: "2px 6px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0,
                      }}
                    >
                      WKB{r.trickId}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
       </div>
      </main>
      <SiteFooter />
    </>
  );
}
