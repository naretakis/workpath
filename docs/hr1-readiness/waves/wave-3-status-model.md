# Wave 3 — Three-Tier Status Model

**Depends on:** W2 (status resolution reads the policy profile)
**Blocks:** W4, W7
**Decision record:** ADR-0002
**Detail level:** goals and scope. Task breakdown when the wave starts.

## Goal

Replace `isExempt: boolean` with the three legally distinct statuses the IFC defines, resolved **per
month**, and stop showing tracking obligations to users who appear excluded.

## Scope

- **Types.** `MonthlyStatus` as a discriminated union — `excluded` / `excepted` / `hardship` /
  `applicable` — per ADR-0002. Every variant carries a CFR `citation`. `excluded` carries
  `durability: "permanent" | "reviewable"` and optional `expiresAfter`.
- **Resolver.** `resolveMonthlyStatus(month, responses, profile): MonthlyStatus`, honoring the
  § 435.557(c)(2) precedence order: excluded → excepted → hardship → applicable.
- **Prior-exclusion deeming.** § 435.553(a)(4): a month in which the user held excluded status resolves to
  `excepted` with category `was-excluded`. This is the transition protection that matters — a parent whose
  child turns 14 mid-period must see it.
- **Recent-inmate window.** § 435.553(b): excepted if an inmate at any point in the 3-month period ending
  on the first day of the assessed month. Requires a date, not a boolean.
- **Consolidated Dexie v7 migration.** New `complianceStatus` table keyed `[userId+month]`. Add `userId` to
  `Activity`. Add **all** compound indexes, so W5 needs no migration of its own. Drop **only** `exemptions`
  and `exemptionHistory` — the two tables that provably never had a writer.
  **`complianceModes` stays until W7b** (it has five live readers including `lib/storage/income.ts`, and
  dropping it here would break the W0 test suite that W2b, W5, W6a, and W7 depend on).
  **Preserve everything else** — the "no production users" justification is withdrawn as unverifiable; see
  ADR-0002. Fixture-based migration test is the gate, not a follow-up.
- **Persistence that actually runs.** The old `saveScreening` / `archiveScreening` had zero callers;
  replace them and wire the write path into the screening flow. Surface results in Settings, which
  currently shows a permanent empty state.
- **Suppress tracking for excluded users** (§ 435.556(c)). Replace the mode selector and progress UI with
  an explanation: you likely don't need to track, here's what to keep anyway, here's what could change
  this. Do not hide the ability to log — some users will want to anyway.
- **Evaluation is status-aware.** Compliance functions take status as input rather than ignoring it.
- **Re-screen prompting.** Use `expiresAfter` to deliver on what `nextSteps` copy already promises.
  Permanent statuses (American Indian, § 435.554(c)(2)) must never prompt.

## Acceptance criteria

- [ ] Status resolves per month with correct precedence, proven by tests citing § 435.557(c)(2)
- [ ] A user losing exclusion mid-period is `excepted` for the months held, per § 435.553(a)(4)
- [ ] Recent-inmate exception evaluates the correct 3-month window
- [ ] v6 → v7 migration preserves all activities, income, documents, and assessment results
- [ ] Screening results persist and appear in Settings
- [ ] An apparently-excluded user sees no tracking obligation, but can still log if they choose
- [ ] American Indian status never triggers a re-screen prompt
- [ ] All status displays are hedged per ADR-0003 and show their citation

## Risks

| Risk | Mitigation |
|---|---|
| Migration drops data | Fixture-based migration test is a gate, not a follow-up |
| Suppressing tracking strands a user who is wrong about their status | Always offer "this doesn't sound right" leading back to screening |
| Four rendered states balloon UI complexity | One shared status card component, four content variants |

---

## Inherited 2026-09-01 — two things folded into v7

### From W5: the compound indexes

W5's scope originally included `[userId+date]` on `activities` and `incomeEntries`, and
`[userId+month]` on the status tables. Those need a `.stores()` change and therefore a version
bump, and `.kiro/steering/data-migration-standards.md` assigns **v7 to W3** — explicitly
including "month-scoping columns". Giving W5 a version would have recreated the defect that
table exists to prevent: three waves once each believed they owned v7.

So **v7 adds these indexes** alongside the `userId` column it already adds to `Activity`. Until
then W5 filters `userId` in memory, which is correct for a single-profile app and is what its own
scope bullet already assumed.

### From W0: the migration test needs BOTH harnesses

W0's handoff told W3 that a migration test cannot assert blobs survived — only that a row is
reachable — because `fake-indexeddb` returns a stored `Blob` as a plain empty object with
`instanceof Blob` false and no `size`, `type`, `text()` or `arrayBuffer()`. It said to confirm by
hand in DevTools.

**Do not do that.** Playwright landed after W0 closed. `e2e/browser-capabilities.spec.ts` already
proves a real `Blob` survives both a round trip *and* a version upgrade with its bytes intact, and
includes a miniature write-at-v1 / upgrade-to-v2 / read-back test that is the shape of the real
one. Split the migration test:

| Harness | Asserts | When it runs |
|---|---|---|
| Vitest + `fake-indexeddb` | row counts per table, every seeded field reachable, new fields hold defaults, upgrade is idempotent | every change, ~5s |
| Playwright | a photographed pay stub still decodes to the same bytes after v6 → v7 | on demand, `npm run test:e2e` |

Worth running in two places because there is no server and no backup, and those blobs are the
evidence a user hands an agency under 42 CFR 435.557. ADR-0007 Tier 2 is amended to match.

Two `fake-indexeddb` facts for the Vitest half: `clear()` does **not** reset autoincrement
counters and tables advance independently, so use explicit ids when a fixture needs a collision;
and jsdom needs stubs for `URL.createObjectURL`, `URL.revokeObjectURL` and `ResizeObserver`.
