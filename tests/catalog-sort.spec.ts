import { test, expect } from "@playwright/test";
import {
  alphaKey,
  catalogSortKey,
  compareCatalogOrder,
  getAllTricks,
  groupAlphabetically,
} from "../lib/tricks";

/**
 * Catalog A–Z order ignores leading stance words (switch / heelside / toeside)
 * so families cluster. Display titles stay intact. See catalogSortKey in
 * lib/tricks.ts — app lists should reuse that key if they share this order.
 */

test.describe("catalogSortKey", () => {
  test("strips leading switch / heelside / toeside, including stacked prefixes", () => {
    expect(catalogSortKey("Switch Backroll")).toBe("Backroll");
    expect(catalogSortKey("Heelside Backroll")).toBe("Backroll");
    expect(catalogSortKey("Toeside Backroll")).toBe("Backroll");
    expect(catalogSortKey("Switch Heelside Backroll")).toBe("Backroll");
    expect(catalogSortKey("Switch Toeside Backroll")).toBe("Backroll");
    expect(catalogSortKey("switch HEELSIDE backroll")).toBe("backroll");
  });

  test("does not strip a name that is only a stance word", () => {
    expect(catalogSortKey("Heelside")).toBe("Heelside");
    expect(catalogSortKey("Toeside")).toBe("Toeside");
    expect(catalogSortKey("Switch Heelside")).toBe("Heelside");
    expect(catalogSortKey("Switch Toeside")).toBe("Toeside");
  });

  test("leaves unrelated names and mid-string stance words alone", () => {
    expect(catalogSortKey("Raley")).toBe("Raley");
    expect(catalogSortKey("Back Mobe")).toBe("Back Mobe");
    expect(catalogSortKey("Ollie Heelside Backside 180")).toBe(
      "Ollie Heelside Backside 180",
    );
  });

  test("alphaKey follows the sort key, not the display prefix", () => {
    expect(alphaKey("Switch Backroll")).toBe("B");
    expect(alphaKey("Heelside Backroll")).toBe("B");
    expect(alphaKey("Toeside Raley")).toBe("R");
    expect(alphaKey("Switch 009")).toBe("#");
    expect(alphaKey("Heelside")).toBe("H");
    expect(alphaKey("Scarecrow")).toBe("S");
  });
});

test.describe("catalog list order (snapshot)", () => {
  test("Backroll family is a contiguous B-section block, including Switch / Heelside / Toeside", async () => {
    const all = await getAllTricks();
    const { groups } = groupAlphabetically(all);
    const b = groups.find((g) => g.letter === "B");
    expect(b, "B section exists").toBeTruthy();

    const names = b!.tricks.map((t) => t.displayName);
    const family = names.filter((n) =>
      /^backroll\b/i.test(catalogSortKey(n)),
    );
    expect(family.length).toBeGreaterThan(1);
    expect(family.some((n) => /^switch\b/i.test(n))).toBe(true);
    expect(family.some((n) => /^heelside\b/i.test(n))).toBe(true);
    expect(family.some((n) => /^toeside\b/i.test(n))).toBe(true);

    // Contiguous in catalog order: nothing else sorts between the first and
    // last Backroll-key trick in the B list.
    const idxs = family.map((n) => names.indexOf(n));
    expect(Math.max(...idxs) - Math.min(...idxs) + 1).toBe(family.length);

    for (const n of family) {
      expect(alphaKey(n)).toBe("B");
    }
  });

  test("Heelside / Toeside 180 variants cluster on the numeric sort key", async () => {
    const all = await getAllTricks();
    const family = all.filter((t) => catalogSortKey(t.displayName) === "180");
    expect(family.length).toBeGreaterThan(1);
    expect(family.some((t) => /^heelside\b/i.test(t.displayName))).toBe(true);
    expect(family.some((t) => /^toeside\b/i.test(t.displayName))).toBe(true);
    expect(family.every((t) => alphaKey(t.displayName) === "#")).toBe(true);

    const idxs = family.map((t) => all.indexOf(t));
    expect(Math.max(...idxs) - Math.min(...idxs) + 1).toBe(family.length);
  });

  test("getAllTricks is ordered by catalogSortKey", async () => {
    const all = await getAllTricks();
    for (let i = 1; i < all.length; i++) {
      expect(
        compareCatalogOrder(all[i - 1].displayName, all[i].displayName),
      ).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("Homepage A–Z markup", () => {
  test("Switch Backroll is under B (not S) and the title still shows Switch", async ({
    request,
  }) => {
    const html = await request.get("/").then((r) => r.text());
    const section = (id: string) => {
      const re = new RegExp(
        `id="${id}"[\\s\\S]*?(?=<section[^>]+id="letter-|$)`,
      );
      return html.match(re)?.[0] ?? "";
    };
    const b = section("letter-B");
    const s = section("letter-S");
    expect(b.length).toBeGreaterThan(0);

    // Match the card title span so descriptions cannot false-positive.
    // Snapshot names are "Switch Heelside Backroll" / "Switch Toeside Backroll"
    // rather than a bare "Switch Backroll".
    const switchBackrollTitle =
      />Switch (?:Heelside |Toeside )?Backroll<\/span>/;
    expect(b).toMatch(switchBackrollTitle);
    expect(s).not.toMatch(switchBackrollTitle);
    expect(b).toMatch(/>Heelside Backroll<\/span>/);
    expect(b).toMatch(/>Toeside Backroll<\/span>/);
  });
});
