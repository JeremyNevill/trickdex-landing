import type { MetadataRoute } from "next";

// Required for output: "export" — emit robots.txt as a static file.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://www.wakeboard.com/sitemap.xml",
  };
}
