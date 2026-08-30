import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export — deploys as plain files to Vercel (or any static host).
  output: "export",
  // Landing is a single route; keep trailing slashes off to match vercel.json.
  trailingSlash: false,
  images: {
    // Static export can't use the Next.js image optimizer.
    unoptimized: true,
  },
};

export default nextConfig;
