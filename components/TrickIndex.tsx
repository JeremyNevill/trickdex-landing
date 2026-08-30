"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FONT_DISPLAY, FONT_MONO, Icon } from "./ui";

export type IndexTrick = {
  trickId: number;
  displayName: string;
  aliases: string[];
  description: string | null;
  href: string;
  hasMedia: boolean;
};

// Tricks per page — 43 spreads the ~338-trick list across 8 pages.
const PAGE_SIZE = 43;

export function TrickIndex({ tricks }: { tricks: IndexTrick[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tricks;
    return tricks.filter((t) => {
      const hay = [
        t.displayName,
        `wkb${t.trickId}`,
        String(t.trickId),
        ...t.aliases,
        t.description ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, tricks]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  // A new search shrinks the result set — snap back to page 1.
  useEffect(() => setPage(1), [query]);
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  function goToPage(next: number) {
    setPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="tricks" ref={topRef} className="container" style={{ padding: "8px 0 96px", scrollMarginTop: 80 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "#0f172a" }}>
          The trick list
        </h2>
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase" }}>
          {filtered.length === tricks.length
            ? `${tricks.length} tricks`
            : `${filtered.length} of ${tricks.length} tricks`}
        </span>
      </div>

      <div style={{ position: "relative", marginBottom: 28 }}>
        <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
          {Icon.search(18)}
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tricks by name, alias or WKB number…"
          aria-label="Search tricks"
          style={{
            width: "100%", padding: "14px 18px 14px 48px", borderRadius: 14,
            border: "1px solid #e2e8f0", background: "#fff", fontSize: 15,
            color: "#0f172a", outline: "none",
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "#64748b", fontSize: 15 }}>
          No tricks match “{query}”. Try a different name or WKB number.
        </p>
      ) : (
        <ul
          style={{
            margin: 0, padding: 0, listStyle: "none",
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12,
          }}
        >
          {pageItems.map((t) => (
            <li key={t.trickId}>
              <a
                href={t.href}
                style={{
                  display: "block", padding: "16px 18px", borderRadius: 14,
                  border: "1px solid #e2e8f0", background: "#fff", textDecoration: "none",
                  height: "100%", transition: "border-color 120ms ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700, letterSpacing: "-0.015em", color: "#0f172a" }}>
                    {t.displayName}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
                    WKB{t.trickId}
                  </span>
                </div>
                {t.aliases.length > 0 && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
                    aka {t.aliases.join(", ")}
                  </p>
                )}
                {t.description && (
                  <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.45, color: "#64748b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {t.description}
                  </p>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}

      {filtered.length > 0 && totalPages > 1 && (
        <nav
          aria-label="Trick list pages"
          style={{ marginTop: 36, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, flexWrap: "wrap" }}
        >
          <PagerButton
            disabled={safePage === 1}
            onClick={() => goToPage(safePage - 1)}
            label="Previous page"
          >
            <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}>{Icon.arrow(14)}</span>
          </PagerButton>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <PagerButton
              key={n}
              active={n === safePage}
              onClick={() => goToPage(n)}
              label={`Page ${n}`}
            >
              {n}
            </PagerButton>
          ))}

          <PagerButton
            disabled={safePage === totalPages}
            onClick={() => goToPage(safePage + 1)}
            label="Next page"
          >
            {Icon.arrow(14)}
          </PagerButton>
        </nav>
      )}
    </section>
  );
}

function PagerButton({
  children, onClick, disabled, active, label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      style={{
        minWidth: 40, height: 40, padding: "0 12px", borderRadius: 10,
        border: "1px solid " + (active ? "var(--td-primary)" : "#e2e8f0"),
        background: active ? "var(--td-primary)" : "#fff",
        color: active ? "#fff" : disabled ? "#cbd5e1" : "#0f172a",
        fontFamily: FONT_MONO, fontSize: 14, fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}
