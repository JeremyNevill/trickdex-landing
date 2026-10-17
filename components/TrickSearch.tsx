"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import { FONT_MONO, Icon } from "./ui";
import { scoreSearch, type SearchFields } from "@/lib/search";

/**
 * Progressive-enhancement search. The full A–Z list is real static <a> markup
 * in the page (crawlable, works with JS off). This filters and reorders those
 * cards: exact names and aliases rank above a description substring, and a
 * short edit distance matches misspellings. Cards move into a list that React
 * does not own, so a re-render cannot wipe them.
 */
export function TrickSearch({ total }: { total: number }) {
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(total);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLElement[] | null>(null);
  const homesRef = useRef(new Map<HTMLElement, { parent: HTMLElement; index: number }>());

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const items = ensureItems(itemsRef, homesRef.current);
    const results = ensureResults(root);
    const catalog = document.getElementById("catalog");

    const restore = () => {
      const byParent = new Map<HTMLElement, { el: HTMLElement; index: number }[]>();
      for (const el of items) {
        const home = homesRef.current.get(el);
        if (!home) continue;
        el.style.display = "";
        const list = byParent.get(home.parent) ?? [];
        list.push({ el, index: home.index });
        byParent.set(home.parent, list);
      }
      for (const [parent, list] of byParent) {
        list.sort((a, b) => a.index - b.index);
        for (const { el } of list) parent.appendChild(el);
      }
    };

    restore();
    const q = query.trim();

    if (q === "") {
      results.replaceChildren();
      results.hidden = true;
      if (catalog) catalog.style.display = "";
      setShown(total);
      return () => {
        restore();
      };
    }

    const ranked: { el: HTMLElement; score: number; index: number }[] = [];
    items.forEach((el, index) => {
      const score = scoreSearch(q, readFields(el));
      if (score == null) {
        el.style.display = "none";
        return;
      }
      el.style.display = "";
      ranked.push({ el, score, index });
    });
    ranked.sort((a, b) => b.score - a.score || a.index - b.index);

    results.replaceChildren();
    for (const { el } of ranked) results.appendChild(el);
    results.hidden = false;
    if (catalog) catalog.style.display = "none";
    setShown(ranked.length);

    return () => {
      restore();
      results.replaceChildren();
      results.hidden = true;
      if (catalog) catalog.style.display = "";
    };
  }, [query, total]);

  return (
    <div ref={rootRef} style={{ marginBottom: 28 }}>
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

function ensureItems(
  itemsRef: MutableRefObject<HTMLElement[] | null>,
  homes: Map<HTMLElement, { parent: HTMLElement; index: number }>,
): HTMLElement[] {
  if (itemsRef.current) return itemsRef.current;
  const items = [...document.querySelectorAll<HTMLElement>("[data-letter-section] [data-trick]")];
  const byParent = new Map<HTMLElement, HTMLElement[]>();
  for (const el of items) {
    const parent = el.parentElement;
    if (!parent) continue;
    const list = byParent.get(parent) ?? [];
    list.push(el);
    byParent.set(parent, list);
  }
  for (const [parent, list] of byParent) {
    const children = [...parent.children];
    for (const el of list) homes.set(el, { parent, index: children.indexOf(el) });
  }
  itemsRef.current = items;
  return items;
}

function ensureResults(root: HTMLElement): HTMLUListElement {
  const existing = document.getElementById("search-results");
  if (existing instanceof HTMLUListElement) return existing;
  const list = document.createElement("ul");
  list.id = "search-results";
  list.className = "trick-grid";
  list.setAttribute("aria-label", "Search results");
  list.hidden = true;
  root.insertAdjacentElement("afterend", list);
  return list;
}

function readFields(el: HTMLElement): SearchFields {
  const split = (value: string | undefined) =>
    (value ?? "").split("|").map((part) => part.trim()).filter(Boolean);
  return {
    name: el.dataset.name ?? "",
    aliases: split(el.dataset.aliases),
    misspellings: split(el.dataset.misspellings),
    description: el.dataset.description ?? "",
    wkb: el.dataset.wkb ?? "",
    trickId: Number(el.dataset.trickId ?? "0"),
  };
}
