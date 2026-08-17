# ADR-0009 — Dependency Modernization Timing

**Status:** Accepted
**Date:** 2026-08-16

## Context

The last commit was January 2026. Current gaps as of 2026-08-16:

| Package | Current | Latest | Gap |
|---|---|---|---|
| `@mui/material`, `@mui/icons-material` | 7.3.4 | 9.3.1 | **1 major** (there is no v8) |
| `next`, `eslint-config-next` | 16.0.1 | 16.3.1 | 3 minors |
| `eslint` | 9.39.0 | 10.8.1 | 1 major |
| `@types/node` | 20.19.24 | 26.2.0 | 6 majors |
| `dexie` | 4.2.1 | 4.4.5 | minors |
| `date-fns` | 4.1.0 | 4.4.0 | minors |
| `react`, `react-dom` | 19.2.0 | 19.2.8 | patches |
| `prettier` | 3.6.2 | 3.9.6 | minors |
| `tailwindcss`, `@tailwindcss/postcss` | 4.1.16 | 4.3.3 | **removing entirely** |

MUI went 7 → 9 deliberately to realign with MUI X versioning; **there is no v8**. So it is one major, not
two. Its content is favorable: accessibility and semantics improvements, `sx` performance, and removal of
deprecated system props in favor of `sx` — which is the only styling approach HourKeep uses. The main
watch item is the "native color" migration affecting `alpha`, `lighten`, and `darken`; the theme does use
`rgba()` shadow strings.

**Tailwind is vestigial and actively harmful.** `src/app/globals.css` is untouched create-next-app
boilerplate. It imports Tailwind, then sets a `prefers-color-scheme: dark` block giving `--background:
#0a0a0a` and hardcodes `font-family: Arial` on `body`, under a theme designed around `#FAF9F7`. It also
references `--font-geist-sans`, which is never defined. Nothing in `src/` uses a Tailwind utility class.

**Related discovery:** the theme declares Inter, but nothing loads the Inter webfont — no `next/font`, no
stylesheet link. The app has never rendered in Inter. It falls through Roboto to Helvetica to Arial, and
`globals.css` pins Arial explicitly.

## Decision

**Modernize early, in its own wave (W1), immediately after dead-code deletion and before any new UI.**

Ordering rationale:

1. **Delete first (W0), upgrade second (W1).** ~2,500 lines of dead code includes a parallel unused
   exemption flow and three unused document/definition components. Deleting first means 2,500 fewer lines
   to carry through the MUI 9 migration and re-verify.
2. **Upgrade before new UI.** Waves 3 onward add substantial new interface. Migrating after would mean
   migrating the new work too.
3. **Upgrade after the test harness.** W0 establishes Vitest and characterization tests, so the upgrade
   has a regression signal beyond "the build passed."

**Tailwind and PostCSS are removed, not upgraded.** `globals.css` is replaced with a minimal file that
does not fight the MUI theme. Two dependencies and one config file disappear.

**Inter is actually loaded**, via `next/font/local` or `next/font/google`, so the design renders as
intended. `next/font` self-hosts, which preserves offline-first — a Google Fonts `<link>` would not.

Isolation rules for the wave:

- One package group per commit, with `npm run build` and `npm test` between each.
- MUI 9 last, since it is the only major with real surface area.
- No behavior changes bundled in. If the upgrade requires a code change, that change is mechanical.

## Consequences

**Good**

- Removes a real dark-mode rendering bug and an unloaded-font bug as a side effect.
- MUI 9's accessibility work lands before Wave 10's accessibility pass, reducing that wave's scope.
- Two fewer dependencies, one fewer config file.
- All subsequent UI is written once, against current APIs.

**Costs**

- A wave with no user-visible feature progress. Justified by the compounding cost of deferring.
- MUI 9 may surface `alpha`/`lighten`/`darken` breakage in the theme's shadow definitions.
- `eslint` 9 → 10 and `@types/node` 20 → 26 may produce new warnings to triage.

**Accepted risk**

- Upgrading before the accessibility audit means we can't fully attribute later a11y improvements to
  either MUI 9 or our own work. Acceptable; the outcome matters more than the attribution.

## Alternatives rejected

- **Defer all upgrades until after January 1, 2027.** Every new component gets written twice, and the
  a11y wave loses MUI 9's improvements.
- **Upgrade continuously alongside features.** Mixes mechanical and behavioral changes in the same
  commits, making regressions hard to attribute.
- **Upgrade MUI but keep Tailwind.** Keeps a dependency with no consumers and leaves the dark-mode bug.
