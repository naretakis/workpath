---
inclusion: fileMatch
fileMatchPattern: 'src/lib/**'
---

# Data and Migration Standards

There is no server and no backup. A user's records exist in one browser's IndexedDB and nowhere else. A
migration bug is unrecoverable for them — and the records are what they hand the agency to keep their health
coverage.

Schema lives in `src/lib/db.ts`, currently at **Dexie version 6**. Decisions:
`docs/hr1-readiness/decisions/ADR-0002-three-tier-status-model.md`.

## Migrations preserve data

Not "unless there are users." **Always.**

The plan previously justified destructive migrations with "there are no production users." That was
withdrawn on 2026-08-16 as structurally unverifiable: data lives in per-browser IndexedDB and analytics can
report page views but not whether anyone completed onboarding. The question cannot be answered, so it cannot
carry a decision.

So:

- **Never drop a table** with user data. Add the new shape, backfill, leave the old one until a later
  version retires it deliberately.
- **Never rename a field in place.** Add, backfill, migrate readers, then remove — across versions.
- **Every `.upgrade()` transforms; none discards.** If a field has no new home, that's a design gap, not a
  reason to delete it.
- **Deriving a value doesn't license deleting its input.** Recomputation needs the input to still be there.
- **A destructive change needs an explicit decision in the wave file** naming what is lost and why it's
  acceptable. No silent drops.

## The migration test is the gate

Tier 2 in ADR-0007, but promoted to Tier 1 for the v6 → v7 step, because it is the one place where being
wrong destroys data irreversibly and where correct behavior *is* "nothing changed."

Before any version bump ships:

1. Seed a **v6 fixture** with realistic data in every table — activities across months, income entries with
   mixed pay periods, seasonal flags, documents with blobs, exemption answers, a profile.
2. Open at the new version. Run the upgrade.
3. Assert **row counts match** per table, every seeded field is still reachable, new fields hold their
   intended defaults, and blobs survived.
4. Assert the **upgrade is idempotent** — reopening doesn't double-apply.

Uses `fake-indexeddb`. A migration without this test is not done.

## Version ownership

One version per wave, owned by exactly one wave. Concurrent version claims were a real defect in an earlier
draft of this plan; three consecutive waves each thought they owned v7.

| Version | Owner | Scope |
|---|---|---|
| v7 | **W3** | One consolidated bump: status model tables plus month-scoping columns |
| v8 | **W6b** | Activity model remainder, including the education backfill |

`complianceMode` stays until **W7b**. Four files reference it — `src/lib/db.ts`,
`src/lib/storage/income.ts`, `src/app/tracking/page.tsx`, `src/app/export/page.tsx` — and removing it before
unified compliance exists breaks reads. Don't tidy it early.

If a wave needs schema before its owning version, extend that version rather than adding one.

## Individual, per-month, month-explicit

Three shape rules that come from the domain.

- **Individual-level, never household-level.** Household aggregation caused real eligibility errors in
  state systems. HourKeep stores one person's records.
- **Month is a required parameter.** Not optional with a "current month" default — an optional month
  argument hides the bug where a caller forgets to pass one and silently gets today. ADR-0005.
- **Status resolves per month, not per profile.** Someone can be excluded in March, applicable in April.
  A single flag on the profile can't express that.

## Storage layer rules

- **Reads and writes go through `src/lib/storage/`.** No component touches Dexie directly.
- **Deletes cascade explicitly.** An activity with documents, an income entry with pay stubs — name the
  dependents and remove them, or deliberately orphan them with a comment saying why. Orphaned blobs are
  invisible and unbounded.
- **Store the input, derive the output.** Persist hours logged and pay-period amounts; compute totals,
  conversions, and averages at read time. Cached derived values go stale the moment a policy value or
  formula changes, and both will change.
- **Dates: store an ISO date string, compare with `date-fns`.** Never `new Date(...)` arithmetic across
  month boundaries, and never a bare `Date` where a calendar month is meant. Timezone drift at month edges
  is the exact bug class that miscounts a month's hours.
- **Any type carrying a verdict is a design error.** `isCompliant: boolean` in a stored record persists a
  determination the app isn't allowed to make. Store the facts.

## Before you ship a schema change

`npx tsc --noEmit` clean · migration test green against a v6 fixture · opened the app on a database created
by the *previous* version and confirmed the data is intact in DevTools → Application → IndexedDB · every
reader of a changed field found and updated (`grep` for the field name, not just the type).
