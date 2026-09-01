---
inclusion: always
---

# Engineering Standards

How work gets done here. Domain rules are in `medicaid-domain-knowledge.md`. Orientation and commands are
in `getting-started.md`.

## Verification discipline

This project's planning documents were independently reviewed in August 2026. The review found the legal
analysis sound and the **bookkeeping around it unreliable**: every summary count in the gap analysis was
wrong, a state was missing from a list of states, and an unverifiable assumption was carrying two
destructive decisions. `docs/audit/validation-findings-2026-08.md` is the record. Each rule below was
earned by a specific mistake.

- **Don't state a count you didn't compute.** "16 rows" means something printed 16. Estimating? Write
  "roughly."
- **Re-read the target before claiming a change is done.** The file, not the diff.
- **A sub-agent's summary is a lead, not a finding.** Verify against the primary source before it enters a
  document.
- **Label the source tier.** Regulatory text beats preamble beats secondary source. The IFC's
  *characterization* of § 435.603 is not § 435.603.
- **An assumption used as justification gets checked or withdrawn.** If it can't be checked, it can't
  justify anything. "No production users" was withdrawn on exactly this ground.
- **Acceptance criteria name an observable** — something you can run, read, or see. Every negative
  criterion needs a positive twin: "no copy says X" is satisfiable by deleting the section, along with
  whatever was true in it.
- **Say what you didn't verify.** Flagged, an unverified claim costs nothing. Unflagged, it costs a rewrite.

## Three hard rules

**1. Test the math first.** Five modules decide whether someone believes they will keep their health
coverage:

`lib/calculations.ts` · `lib/utils/payPeriodConversion.ts` · `lib/storage/income.ts` ·
`lib/exemptions/calculator.ts` · `lib/assessment/recommendationEngine.ts`

— plus the policy profile, status resolver, review-period model, and combination logic once they exist.
**Failing test before the change**, and the test name carries the citation:

```ts
it("§ 435.552(d): converts 6 credit hours to 77.94 monthly hours", () => { ... });
```

Elsewhere tests are optional. ADR-0007 has the tiers.

**2. No policy value outside `src/lib/policy/`.** `80`, `580`, `7.25`, `4.33`, every lookback and
review-period length. All of them are either statutory-but-dynamic or state elections. ADR-0001.

**3. Every domain claim carries a citation** — the CFR section, plus the Federal Register page when the
source is preamble rather than rule text. In code, tests, docs, and copy. If you can't cite it, you don't
know it.

## Never assert status

HourKeep assembles evidence. States determine status. Every user-facing number is **Computed**,
**Conditional**, or **Deferred**; ADR-0003 defines them and `compliance-copy-standards.md` operationalizes
them. Legal status is always Deferred.

This constrains types and return values, not only copy. `isCompliant: boolean` is a verdict regardless of
what renders it. So is removing a feature — suppressing tracking UI for an apparently-excluded user
asserts more strongly than a sentence would, so it always needs a way back.

## Which doc applies

`compliance-copy-standards.md` is **always on**, because user-facing strings are spread across `src/content/`,
`src/lib/exemptions/`, `src/lib/assessment/`, `src/components/`, and `src/app/` — no single file pattern
catches them.

Two more load on demand:

| Editing | Loads |
|---|---|
| `src/lib/**`, especially `db.ts` and `storage/` | `data-migration-standards.md` |
| `src/components/**` | `component-standards.md` |

`src/theme/theme.ts` doesn't match either pattern; read `component-standards.md` by hand when you touch it.

## Done means

`npx tsc --noEmit` clean · `npm run lint` clean · `npm run format:check` clean · `npm test` green ·
**`npm run test:e2e` green when the wave touched anything a browser can see** — UI, layout, the document
head, build output, or storage; ADR-0007 Tier 3b. Not in the CI deploy gate, so nothing forces it: run it
deliberately. It is the only gate that sees hydration, real `Blob` bytes, or a 375px viewport ·
`npm run build` succeeds · **`npm ci` succeeds** · each acceptance criterion checked against an
observable · the review protocol (`.kiro/hooks/wave-review.kiro.hook`) run before a wave closes.

Commit when verified. Don't push unless asked.

**Why `npm ci` is on that list.** It was added on 2026-08-17 after a CI break: the W0-slice's
`npm install` produced a lockfile that npm reported as `invalid`, and *every other gate passed anyway* —
type check, lint, tests, format, build. None of them read the lockfile. The break only appeared on a
runner, whose npm was a major version behind the one used locally.

Two rules follow:

- **If you add a dependency, run `npm ci` before you call it done.** `npm install` can leave a tree that
  works while writing a lockfile that a different npm rejects. Optional peer dependencies are the usual
  cause, since npm versions resolve them differently.
- **Pin devDependency tooling exactly; don't use caret ranges for linters or formatters.** A fresh install
  otherwise changes what "clean" means. Regenerating the lockfile once bumped `prettier` and
  `eslint-plugin-react-hooks` by a patch and a minor, and produced 11 lint errors in files nobody had
  touched. A quality gate that moves on its own is not a gate.

Check the runner's Node and npm against your own when a build fails only in CI. `EBADENGINE` is a warning
that npm does not fail on, so an unsupported Node version installs cleanly and breaks at runtime.
