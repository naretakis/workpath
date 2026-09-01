/**
 * Application configuration
 * Centralized place for app-wide constants and URLs
 */

export const APP_CONFIG = {
  name: "HourKeep",
  /**
   * Set at build time from NEXT_PUBLIC_APP_VERSION.
   *
   * The fallback was pinned at "4.2.0" while package.json had moved on to 7.2.0,
   * so any build without that variable set displayed a version three majors stale
   * in Settings → About. It is now "unknown", which is the honest answer: a wrong
   * version number is worse than no version number, because the first thing anyone
   * does with a bug report is check which build it came from.
   *
   * Deliberately NOT read from package.json. That would need an import outside
   * src/, and Next inlines NEXT_PUBLIC_* at build time — the release workflow is
   * where the two should be kept in step. W0 § 0.6.
   */
  version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
  repository: {
    url: "https://github.com/naretakis/hourkeep",
    issuesUrl: "https://github.com/naretakis/hourkeep/issues",
  },
  license: "GPL-3.0-or-later",
  description:
    "Track work, volunteer, and education hours to meet Medicaid work requirements",
} as const;
