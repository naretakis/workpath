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
- **Dexie v7 migration.** New `complianceStatus` table keyed `[userId+month]`. Add `userId` to `Activity`
  and compound indexes (also needed by W5). Drop the dead `exemptions`, `exemptionHistory`, and
  `complianceModes` tables. Migration test with realistic v6 fixture data.
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
