import type { MetadataRoute } from "next";
import { getAllTricks, trickPath } from "@/lib/tricks";

// Required for output: "export" — emit sitemap.xml as a static file.
export const dynamic = "force-static";

const SITE = "https://www.wakeboard.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tricks = await getAllTricks();
  return [
    { url: `${SITE}/`, changeFrequency: "weekly", priority: 1 },
    ...tricks.map((t) => ({
      url: `${SITE}${trickPath(t.trickId, t.slug)}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
