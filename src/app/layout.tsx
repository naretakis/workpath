"use client";

import { ThemeProvider } from "@mui/material/styles";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "@/theme/theme";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { StorageWarning } from "@/components/settings/StorageWarning";
import "./globals.css";

/**
 * No base path. The site is served from the root of a custom domain.
 *
 * This used to be `process.env.NODE_ENV === "production" ? "/hourkeep" : ""`,
 * dating from when the app was hosted at `naretakis.github.io/hourkeep`. The custom
 * domain (`out/CNAME` → hourkeep.app) removed the prefix and `next.config.ts` drops
 * `basePath` accordingly — but this constant was left behind, so every production
 * build emitted links to a directory that does not exist.
 *
 * Verified against the live site before fixing: `hourkeep.app/hourkeep/manifest.json`
 * returned **404** while `hourkeep.app/manifest.json` returned 200. The manifest link
 * had been dead in production, which means no "Add to Home Screen" and no app icon —
 * for an offline-first PWA, the most important non-functional requirement, broken.
 *
 * Invisible to every existing test: dev builds set this to `""` so it never
 * reproduces locally, and jsdom never loads real HTML from a real server. Found by
 * the Playwright work; `e2e/pwa-assets.spec.ts` now asserts every `<link href>`
 * resolves.
 */
const basePath = "";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          No `emotion-insertion-point` meta. AppRouterCacheProvider manages style
          insertion itself; leaving the meta tag here would reintroduce the pages-router
          pattern this replaced. See the comment on the provider below.
        */}
        <meta name="application-name" content="HourKeep" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="HourKeep" />
        <meta
          name="description"
          content="Track your work hours to maintain your Medicaid benefits"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#6B4E71" />
        <link rel="manifest" href={`${basePath}/manifest.json`} />
        <link rel="icon" type="image/svg+xml" href={`${basePath}/icon.svg`} />
        <link rel="icon" type="image/x-icon" href={`${basePath}/favicon.ico`} />
        <link rel="apple-touch-icon" href={`${basePath}/icon-192x192.png`} />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href={`${basePath}/icon-192x192.png`}
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href={`${basePath}/icon-512x512.png`}
        />

        {/* Plausible Analytics - Privacy-first, lightweight analytics */}
        {/* Tracks: anonymous page views, device types, browsers, and regions/states */}
        {/* Does NOT track: personal data, activity logs, documents, or exemption data */}
        {/* Automatically respects "Do Not Track" browser setting */}
        {/* Learn more: https://plausible.io/privacy */}
        <script
          async
          src="https://plausible.io/js/pa-64XPjrue2mBz6ntqkjaaZ.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {/*
          AppRouterCacheProvider, not a hand-rolled `CacheProvider`.
          Fixes React #418 (hydration failed) on every route.

          What was wrong: this layout used the **pages-router** emotion pattern — a
          module-scope `createEmotionCache()` plus a `<meta name="emotion-insertion-point">`
          — inside an **App Router** app. The server HTML already shipped
          `<style data-emotion>` tags, then the client built a fresh cache that did not
          know about them and re-inserted at the meta tag, mutating `<head>` during
          hydration. React saw HTML that did not match, discarded the affected subtree,
          and re-rendered it client-side.

          Symptoms it produced: `Minified React error #418; args[]=HTML` on most routes,
          nondeterministically — whether it fired depended on a race between emotion's
          insertion and React's hydration commit, which is why it appeared on different
          routes in different runs. On the target device, an old phone, the visible
          result is a flash of unstyled or re-rendered content, and it discards the one
          advantage a static export has.

          Found by the Playwright suite (`e2e/console-clean.spec.ts`). Unreachable from
          Vitest — jsdom mounts fresh, so there is no server HTML to disagree with — and
          invisible in `next dev`, which reported zero errors on the same routes.
        */}
        <AppRouterCacheProvider options={{ key: "mui-style" }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <OfflineIndicator />
            <StorageWarning />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
