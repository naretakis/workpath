import type { NextConfig } from "next";

// @ts-expect-error - next-pwa doesn't have TypeScript definitions
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Add empty turbopack config to silence warning
  turbopack: {},
  // Configure for static export (GitHub Pages)
  output: "export",
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Set base path if deploying to a subdirectory (e.g., /workpath)
  basePath: "/workpath",
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
