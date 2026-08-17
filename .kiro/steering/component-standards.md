---
inclusion: fileMatch
fileMatchPattern: 'src/components/**'
---

# Component Standards

MUI, currently v7 with a v9 upgrade planned in W1 (there is no v8 — MUI went 7 → 9, so it's one major hop).
Theme is `src/theme/theme.ts`. Styling is MUI's `sx`; **Tailwind is installed but unused and is being
removed** — don't add classes.

## Get the responsive syntax right

The archived guidelines in `.kiro/archive-steering/` contain a form that **does not work**. Bare breakpoint
keys are not valid `sx` — they're treated as CSS properties and silently ignored.

```tsx
// Wrong — silently does nothing
<Box sx={{ padding: 2, md: { padding: 3 } }} />

// Right — value objects keyed by breakpoint
<Box sx={{ padding: { xs: 2, md: 3 } }} />
```

Mobile-first: `xs` is the base case, larger keys are enhancements. Breakpoints in this theme are
`xs: 0, sm: 600, md: 960, lg: 1280, xl: 1920` — note `md: 960`, not MUI's default 900.

## Current API, not v5

`inputProps`, `InputProps`, and `InputLabelProps` are deprecated in favor of `slotProps`. Four files still
use the old form; don't add more.

```tsx
// Deprecated
<TextField inputProps={{ min: 0 }} InputLabelProps={{ shrink: true }} />

// Current
<TextField
  slotProps={{ htmlInput: { min: 0 }, inputLabel: { shrink: true } }}
/>
```

Also: `Typography`'s `paragraph` prop is deprecated — use `sx={{ mb: 2 }}`. React 19 removed the global
`JSX` namespace, so don't annotate returns as `JSX.Element`; let inference handle it.

## React Compiler is on

`babel-plugin-react-compiler` is enabled. Skip manual `useMemo`, `useCallback`, and `React.memo` unless
profiling shows a specific need, and ignore the archived advice about hoisting `sx` objects out of render —
the compiler handles that. Inline `sx` is fine and reads better.

## Accessibility floor

Non-negotiable. A large share of users qualify through disability-related exceptions, so the people most
dependent on this app are the ones most affected by getting it wrong.

**Contrast — WCAG 2.2 AA, and the thresholds differ:**

| What | Ratio | Criterion |
|---|---|---|
| Body text | **4.5:1** | 1.4.3 |
| Large text (18pt+, or 14pt+ bold) | **3:1** | 1.4.3 |
| UI components, icons, focus indicators, chart colors | **3:1** | 1.4.11 |

A blanket "4.5:1 everywhere" is the wrong rule — it over-applies to large text and, more importantly, tends
to leave non-text contrast unchecked entirely. Status chips, the progress bar, and the offline indicator are
1.4.11 cases.

**Touch targets:** WCAG 2.2 AA (SC 2.5.8) requires 24×24 CSS px; 44×44 is the AAA level (SC 2.5.5) and this
project's standard. The theme sets no minimum today, so `MuiButton` and `MuiIconButton` overrides are the
fix — not `sx={{ minHeight: 44 }}` repeated at every call site.

**Also:**

- Every interactive element reachable and operable by keyboard, in a sensible tab order, with a visible
  focus indicator.
- `aria-label` on every icon-only control.
- Semantic elements: `<Typography variant="h2" component="h2">`. Heading *levels* must nest correctly
  regardless of visual size.
- Form fields get a real `<label>` via `label`, errors announced through `error` + `helperText`, and
  `aria-describedby` wired to the help text.
- Never encode meaning in color alone — pair it with text or an icon.
- Announce async state changes in a live region. A spinner replaced by content is silent to a screen reader.
- `useMediaQuery` needs an SSR-safe default; this app statically exports, so a hook that returns `false` on
  first paint causes a hydration flash.

## Mobile reality

Primary device is a phone, often an older one, often on a poor connection.

- Numeric entry sets `inputMode="numeric"` (or `"decimal"`) so the right keypad appears.
- Full-screen `Dialog` on small viewports.
- Respect safe-area insets on fixed headers and bottom navigation.
- Nothing important within a thumb's reach of the bottom edge without padding.
- Lazy-load anything heavy — the camera capture and document viewer especially.

## States, every time

Four states per data-driven view, and the empty state is the one that gets skipped: **loading**, **empty**,
**error**, **populated**. Empty states say what to do next, not just that there's nothing there. Errors say
what failed and what to try.

## Verdicts are not a rendering concern

`compliance-copy-standards.md` binds here too. A component must not compose a determination out of neutral
data — no `{meetsThreshold ? "You're all set" : "You're behind"}`. Render the number, the threshold, and the
difference. If a prop is named like a verdict, that's a signal the type upstream is wrong.

Same for hiding things: suppressing tracking UI because a user looks excluded asserts a status. Always leave
a visible way back to screening.

## Conventions

One component per file, PascalCase filename matching the export. Named exports, not default. Props typed
with an explicit `interface`; no `any`. Reads and writes go through `src/lib/storage/` — components never
touch Dexie.
