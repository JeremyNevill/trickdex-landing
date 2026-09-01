import { FONT_DISPLAY, FONT_MONO } from "./ui";
import { trickPath, type Trick } from "@/lib/tricks";

/**
 * A single trick link — real static <a> so it's crawlable and works with JS off.
 * data-search feeds the progressive-enhancement filter (TrickSearch).
 */
export function TrickCard({ trick }: { trick: Trick }) {
  const searchHay = [
    trick.displayName,
    `wkb${trick.trickId}`,
    String(trick.trickId),
    ...trick.aliases,
    trick.description ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return (
    <li data-trick data-search={searchHay}>
      <a
        className="card-link"
        href={trickPath(trick.trickId, trick.slug)}
        style={{
          display: "block", padding: "16px 18px", borderRadius: 14,
          border: "1px solid #e2e8f0", background: "#fff", textDecoration: "none",
          height: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em", color: "#0f172a" }}>
            {trick.displayName}
          </span>
          <span
            style={{
              fontFamily: FONT_MONO, fontSize: 10.5, fontWeight: 600, color: "#64748b",
              background: "#f1f5f9", border: "1px solid #e8edf3",
              padding: "2px 7px", borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            WKB{trick.trickId}
          </span>
        </div>
        {trick.aliases.length > 0 && (
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
            aka {trick.aliases.join(", ")}
          </p>
        )}
        {trick.description && (
          <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.45, color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {trick.description}
          </p>
        )}
      </a>
    </li>
  );
}
