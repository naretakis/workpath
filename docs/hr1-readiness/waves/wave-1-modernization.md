# Wave 1 — Dependency Modernization

**Depends on:** W0 (deletion reduces migration surface; tests give a regression signal)
**Blocks:** W10 benefits from MUI 9's accessibility work
**Decision record:** ADR-0009
**User-visible outcome:** the app finally renders in Inter, and stops fighting itself in dark mode.

## Why now

Waves 3 onward add substantial new UI. Migrating after that means migrating the new work too. And W0 just
removed ~2,500 lines, so there is less to carry through.

There is **no MUI v8** — they went 7 → 9 to realign with MUI X. So this is one major, not two, and its
content is favorable: accessibility and semantics improvements, `sx` performance, and removal of
deprecated system props in favor of `sx`, which is the only styling approach HourKeep uses.

## Scope

Sequenced smallest-risk-first. **One package group per commit**, with `npm run build` and `npm test`
between each. No behavior changes bundled in.

### 1.1 Remove Tailwind

`src/app/globals.css` is untouched create-next-app boilerplate that actively conflicts with the theme:

```css
@import "tailwindcss";
@media (prefers-color-scheme: dark) {
  :root { --background: #0a0a0a; --foreground: #ededed; }
}
body { background: var(--background); color: var(--foreground); font-family: Arial, Helvetica, sans-serif; }
```

Nothing in `src/` uses a Tailwind utility class. So: remove `tailwindcss` and `@tailwindcss/postcss`,
delete `postcss.config.mjs`, and replace `globals.css` with a minimal file that does not set `body`
background, color, or font-family — `CssBaseline` and the theme own those. Also drop the dangling
`--font-geist-sans` reference, which was never defined.

### 1.2 Actually load Inter

The theme declares `"Inter", "Roboto", "Helvetica", "Arial"`, but nothing loads Inter — no `next/font`, no
stylesheet link. The app has never rendered in Inter.

Use `next/font` so the font is **self-hosted**, preserving offline-first. A Google Fonts `<link>` would
introduce a network dependency and break the offline promise.

### 1.3 Patch and minor upgrades

`react` + `react-dom` → 19.2.8 · `dexie` → 4.4.5 · `date-fns` → 4.4.0 · `prettier` → 3.9.6 ·
`@types/react`, `@types/react-dom` → current

Run `npm run format` after Prettier moves, and commit the reformat separately so it doesn't obscure real
changes.

### 1.4 Next.js 16.0.1 → 16.3.x

`next` and `eslint-config-next` together. Verify `output: "export"`, `reactCompiler: true`, the
`turbopack: {}` stub, and `next-pwa` still cooperate. `next-pwa` 5.6.0 is the oldest thing in the tree and
the most likely to complain — if it breaks, evaluate `@serwist/next` as a replacement rather than pinning
Next back.

### 1.5 Tooling majors

`eslint` 9 → 10 with `@types/node` 20 → 26. Both will likely surface new warnings; triage rather than
blanket-disable. Note the existing advisory: `baseline-browser-mapping` data is stale and should be
refreshed.

### 1.6 MUI 7 → 9 — last, and the only real work

Watch items, in likely order of appearance:

1. **Native color migration.** `alpha`, `lighten`, and `darken` behavior changed for colors using native
   color syntax. `theme.ts` uses `rgba()` shadow strings in `MuiButton` and `MuiPaper` overrides — verify
   they still render.
2. **Deprecated system props removed.** Low risk since HourKeep uses `sx` throughout, but grep for
   legacy spacing and display props on MUI components.
3. **DOM structure and focus management changes.** Beneficial, but they can shift layout. The surfaces to
   re-verify visually are `Calendar`'s CSS grid, `HelpTooltip`'s tooltip-to-bottom-sheet swap, the
   `Fab` positioning, and every `Dialog`.
4. **`primaryListItemProps` → `slotProps`.** `DefinitionTooltip.tsx` used the deprecated form, but W0
   deleted it. Grep for other occurrences.
5. **Breakpoints.** The theme overrides `md` to 960 while MUI's default is 900. Keep the override —
   changing it would reflow every responsive `sx` object — but confirm v9 still honors it.

## Out of scope

No visual redesign. No accessibility fixes beyond what MUI 9 provides for free — those are W10. No feature
work.

## Acceptance criteria

- [ ] `tailwindcss`, `@tailwindcss/postcss`, and `postcss.config.mjs` are gone
- [ ] `globals.css` no longer sets `body` background, color, or font-family
- [ ] The app renders in Inter, self-hosted, verified in DevTools computed styles
- [ ] Setting the OS to dark mode no longer produces a near-black body behind light surfaces
- [ ] `next`, `react`, `dexie`, `date-fns`, `eslint`, `@types/node`, `prettier` all current
- [ ] MUI at 9.x; `npm run build` succeeds; PWA still installs and works offline
- [ ] `npm test` passes unchanged — this wave alters no behavior
- [ ] Visual check on a phone viewport: calendar grid, help tooltips and bottom sheets, all dialogs, FAB,
      progress bars, chips
- [ ] No new lint warnings left untriaged

## Risks

| Risk | Mitigation |
|---|---|
| `next-pwa` 5.6.0 breaks on Next 16.3 | Isolated commit; fall back to `@serwist/next` rather than pinning Next back |
| MUI 9 native-color change alters theme shadows | Visual diff of elevation-1 and elevation-2 surfaces; the shadows are three lines in `theme.ts` |
| React Compiler interacts badly with MUI 9 internals | Build and smoke test between each step; `reactCompiler` can be toggled off temporarily to isolate |
| Upgrade churn hides a real regression | One package group per commit; tests between each |
