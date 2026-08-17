# Wave 6 — Activity Model Correction

**Depends on:** W2 (profile), W5 (per-month evaluation)
**Blocks:** W7
**Detail level:** goals and scope. Task breakdown when the wave starts.

## Goal

Make the activity model match § 435.552 — the right activity types, the right questions, and records that
will actually satisfy a verification request.

## Scope

- **Add `workProgram`** to `Activity["type"]`. It already exists in help text, list labels, and colors but
  **cannot be stored**, so job-training hours are currently mis-filed as work or education. Dexie migration
  plus a form option.
- **Broaden work** (§ 435.552(b)) into three sub-kinds: for money, in-kind, and unpaid. Capture the
  distinction, since documentation expectations differ — in-kind and unpaid work are exactly the cases where
  CMS acknowledges documentation may not exist.
- **Education: replace hours with status.** § 435.552(a)(4): at least half-time is qualifying on its own
  with **zero hours** and **cannot be combined**. Ask for enrollment status — which the **school**
  determines — not hours. Only if less than half-time do we ask for credit hours.
- **Credit-hour conversion** (§ 435.552(d)): `creditHours × 3 × 4.33`. Show the arithmetic, because 6
  credits landing at 77.94 rather than 80 will surprise people and needs explaining. Non-credit programs
  count actual class and activity hours 1:1.
- **Enrollment period rules** (§ 435.552(c)): status begins the first day of term, continues through
  vacation and recess at the pre-break status, and ends at month-end on expulsion, withdrawal,
  non-registration, or graduation. Model program type too — higher ed, CTE, high school, State-approved
  equivalency.
- **Community service record schema** (§ 435.552(b) and § II.I.6.b) — the current optional free-text
  `organization` field will not satisfy a verification request. Capture: organization name and address;
  point-of-contact name with phone and/or email **who can confirm the hours**; activity description; dates;
  hours. Note that court-ordered service counts and that the organization need not be a § 501(c)(3).
- **Caregiving hours as unpaid work.** A family caregiver who fails § 435.554(c)(3)(i)(C) — unrelated,
  non-resident, under 80 hours — still counts those hours as unpaid work. CMS's example: 55 caregiving hours
  plus 25 other hours qualifies. Wire this from the W4 screening answers.
- **Document types.** Add VA disability and SNAP/TANF approval notice, both named by CMS as reasonably
  available documentation.
- **Validation.** Per-day cumulative cap so three 10-hour entries on one date don't silently produce `30h`.
  Future-date guards, which activities currently lack entirely. Fix the `IncomeEntryForm` UTC-vs-local
  comparison and the `setMonth` overflow.
- **Fix `captureMethod`**, currently hardcoded `"camera"` at five call sites, so uploads are recorded and
  displayed as camera captures.

## Acceptance criteria

- [ ] `workProgram` is storable, selectable, and counted in totals
- [ ] Work distinguishes paid, in-kind, and unpaid
- [ ] Students are asked enrollment status, not hours; half-time-or-more requires no hours
- [ ] Credit-hour conversion matches the CFR table (6 credits → 77.94), with visible arithmetic
- [ ] Half-time-or-more education cannot be combined with other activities
- [ ] Community service captures organization, address, POC name and contact, activity, dates, hours
- [ ] Sub-threshold caregiving hours flow into work hours
- [ ] VA and SNAP/TANF document types exist
- [ ] Per-day cumulative validation and future-date guards work
- [ ] `captureMethod` reflects reality

## Risks

| Risk | Mitigation |
|---|---|
| Community service form becomes long enough to deter logging | Progressive disclosure: hours and date first, verification detail second, with a clear "why this matters" |
| Users don't know their enrollment status | Say the school decides; offer "I'm not sure" and prompt them to check — never silently guess |
| Existing education entries have hours but no status | Migration marks them as less-than-half-time with hours preserved, and flags them for user review |
