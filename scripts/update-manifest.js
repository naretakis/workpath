/**
 * Update manifest.json with correct basePath for production builds
 * This script runs after the build to update paths in the manifest
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const isProduction = process.env.NODE_ENV === "production";
const basePath = isProduction ? "/hourkeep" : "";

// Read the manifest from the out directory
const manifestPath = path.join(__dirname, "../out/manifest.json");

if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  // Update start_url with basePath
  manifest.start_url = `${basePath}/`;

  // Update icon paths with basePath
  if (manifest.icons) {
    manifest.icons = manifest.icons.map((icon) => ({
      ...icon,
      src: icon.src.startsWith("/") ? `${basePath}${icon.src}` : icon.src,
    }));
  }

  // Write updated manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log("✓ Updated manifest.json with basePath:", basePath || "(none)");
} else {
  console.log("⚠ manifest.json not found in out directory");
}
