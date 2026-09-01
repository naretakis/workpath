/**
 * Update manifest.json with correct basePath for production builds
 * This script runs after the build to update paths in the manifest
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

/**
 * No base path — the site is served from the root of a custom domain (hourkeep.app).
 *
 * This was `process.env.NODE_ENV === "production" ? "/hourkeep" : ""`, left over from
 * GitHub Pages project-site hosting. It disagreed with `src/app/layout.tsx` in a way
 * that hid the bug: `next build` sets NODE_ENV=production for the app, so layout.tsx
 * emitted `/hourkeep/...` links, while this post-build script runs in a plain node
 * process where NODE_ENV is unset — so it logged "basePath: (none)" and wrote a
 * CORRECT manifest that nothing could reach, because the link to it was 404.
 *
 * Two files, one constant, opposite answers. Both now say the same thing.
 */
const basePath = "";

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
