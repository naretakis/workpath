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
  // Set base path only for production (GitHub Pages deployment)
  // In development, access at http://localhost:3000/
  // In production, access at https://username.github.io/hourkeep/
  basePath: process.env.NODE_ENV === "production" ? "/hourkeep" : "",
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig);
