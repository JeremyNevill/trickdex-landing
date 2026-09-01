"use client";

import { useEffect, useRef, useState } from "react";
import { FONT_MONO, Icon } from "./ui";

/**
 * Progressive-enhancement search. The full A–Z list is real static <a> markup
 * in the page (crawlable, works with JS off). This only filters what's already
 * there: it shows/hides trick <li>s and their letter sections by matching the
 * data-search attribute, and updates a live count. No list data lives here.
 */
export function TrickSearch({ total }: { total: number }) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(total);
  const rootFound = useRef(false);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    const items = document.querySelectorAll<HTMLElement>("[data-trick]");
    const sections = document.querySelectorAll<HTMLElement>("[data-letter-section]");
    const classics = document.getElementById("classics-strip");
    const azNav = document.getElementById("az-nav");
    rootFound.current = items.length > 0;

    let visible = 0;
    items.forEach((el) => {
      const hay = el.getAttribute("data-search") ?? "";
      const match = q === "" || hay.includes(q);
      el.style.display = match ? "" : "none";
      if (match) visible++;
    });

    // Hide a letter section whose items are all filtered out.
    sections.forEach((sec) => {
      const anyVisible = sec.querySelector<HTMLElement>(
        '[data-trick]:not([style*="display: none"])',
      );
      sec.style.display = anyVisible ? "" : "none";
    });

    // While searching, the "start here" strip and A–Z nav are noise.
    const searching = q !== "";
    if (classics) classics.style.display = searching ? "none" : "";
    if (azNav) azNav.style.display = searching ? "none" : "";

    setShown(visible);
  }, [query]);

  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
          {Icon.search(18)}
        </span>
        <input
          className="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tricks by name, alias or WKB number…"
          aria-label="Search tricks"
          style={{
            width: "100%", padding: "15px 18px 15px 48px", borderRadius: 14,
            border: "1px solid #e2e8f0", background: "#fff", fontSize: 15,
            color: "#0f172a",
          }}
        />
      </div>
      {query.trim() !== "" && (
        <p style={{ margin: "12px 2px 0", fontFamily: FONT_MONO, fontSize: 12, color: "#64748b" }}>
          {shown === 0
            ? `No tricks match “${query}”.`
            : `${shown} of ${total} tricks`}
        </p>
      )}
    </div>
  );
}
