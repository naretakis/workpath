# HourKeep HR1 Readiness

**The holistic home for this effort.** Open this file to remember where we are.

**Last updated:** 2026-09-02 (W5 closed out)
**Current wave:** none in progress — **W2b (Policy Profile)** is next. W5 landed 2026-09-02

> A first version of this line said W1 was next. Wrong: ADR-0009's reordering moved **W1 to the very end**,
> after the December date. `waves/README.md` § Sequence is authoritative — the pre-date order is
> W0-slice → W2a → **W0** → **W5** → W2b → W6a → W8a → W7a.

> ### Carried forward — three items still open
>
> Recorded here because they are the kind of thing that disappears if it only lives in a closed wave file.
>
> 1. **Offline behaviour, and a human read of the copy on a phone.** Reduced 2026-09-01. The
>    **phone-viewport half is now automated** — `@playwright/test` runs every route at 375×812 and drives
>    the destructive delete-all flow there (ADR-0007 Tier 3b). What remains: no spec exercises the
>    **service worker offline** yet, and nobody has read W2a's corrected copy on a phone with a human eye.
>    Setting this up found two bugs that had been shipping — see the Playwright section below.
> 2. ~~**The review protocol has now failed twice, and is getting worse.**~~ — **CLOSED
>    2026-09-02. All four reviewers ran independently on W5**, including data integrity and
>    semantic review, which had never once run independently across W2a and W0.
>
>    It was worth the wait. The four found **four blocking defects** in work that had
>    already passed 509 tests, six mechanical gates and a manual browser pass — including
>    one that told income-pathway users they were failing to meet an hours threshold they
>    were not using, which is the harm ADR-0003 § Context names in as many words. Two of
>    the four were verdicts I had introduced *while fixing verdicts*.
>
>    Two lessons for the next run, both in `waves/wave-5-month-scoping.md`:
>    **a sub-agent finding really is a lead** — two of the fourteen were dropped after
>    checking, one of them a confidently-cited claim about functions that do not exist in
>    the file named. And **the most valuable finding was structural, not textual**: W5
>    created five components and put none of them in the no-verdict render guard, which is
>    why two verdicts got through. Fix the guard, not just the copy.
> 3. **Ten React Compiler errors are suppressed by a version pin**, deferred from W0 to W1 deliberately.
>    Measured: 11 errors across 8 files under `eslint-plugin-react-hooks` 7.1.1 with inline disables
>    respected; W0 removed one by deleting `DocumentMetadataForm.tsx`. `package.json`'s `overrides` pins
>    7.0.1, which is what keeps them invisible. **W1 owns lifting the pin — and W1 is sequenced last**, so
>    the pin stays put for most of this plan. Worth knowing that `set-state-in-effect` and `immutability`
>    violations in `ActivityForm`, `IncomeEntryForm`, `DocumentViewer`, `IncomeDashboard` and
>    `StorageInfo` will go unreported while W5, W6a and W7a rewrite exactly those files. Details in
>    [`waves/wave-0-safety-net.md`](waves/wave-0-safety-net.md) § Handoffs.
>
> ### Both things W0 inherited from W2a are now closed
>
> 1. **The dead-chain allowlist is empty by construction.** Deleting the chain turned the suite red exactly
>    as designed, with a message naming the fix. `DEAD_FILE_ALLOWLIST` and `DEAD_CHAIN` are both empty, and
>    the meta-test inverted to assert emptiness rather than being deleted with the entries.
> 2. **`npm test` gates deployment**, and now runs 423 tests rather than 196.
>
> ### What W2b should read first — added 2026-09-02
>
> W5's **Found during execution** and **Review protocol outcome** sections in
> [`waves/wave-5-month-scoping.md`](waves/wave-5-month-scoping.md). Directly load-bearing
> for W2b:
>
> - **`FEDERAL_DEFAULT_REVIEW_PERIOD` in `src/lib/reviewPeriod.ts` is the constant to
>   move.** One object, one export, every consumer already takes it as an optional
>   parameter, so the move is a two-line diff. It carries a `source` string *and* a
>   separate `renewalPeriodMonthsSource`, because that one value has worse provenance than
>   the rest — the IFC amends § 435.916 to say 12-month renewals while its own preamble
>   says 6 for the adult group under § 1902(e)(14)(L). Keep them separate.
> - **`monthlyThreshold` is derived, not literal — and that is a trick, not a fix.**
>   `tracking/page.tsx` computes it as `calculateMonthlySummary([], month).hoursNeeded`,
>   which avoids writing `80` but only works because `hoursNeeded` is
>   `isCompliant ? 0 : 80 - totalHours`. **W2b should export a named threshold from the
>   policy profile and delete that derivation.** The real `80` still lives at
>   `calculations.ts:78,81`.
> - **`Dashboard` now takes `threshold` as a required prop**, so W2b reaches it without
>   editing it. Three literals of `80` went with it.
> - **Three `/ 80 hours` literals remain in `e2e/month-scoping.spec.ts`** and will fail
>   when the threshold changes. That is the intended signal, but budget for it.
> - **The compliance-gate script scans five files for policy literals and `reviewPeriod.ts`
>   is not one of them.** Worth adding when W2b creates `src/lib/policy/`.
> - **A policy value can hide as an English word.** W5 shipped "We've assumed six" in
>   user-facing copy, invisible to every numeric scan, and review caught it. Grep for spelt
>   numbers as well as digits.
>
> ### W5's two blockers are resolved — 2026-09-01
>
> Both are written up at the top of [`waves/wave-5-month-scoping.md`](waves/wave-5-month-scoping.md).
> In short: **W5 bumps no Dexie version** (the compound indexes moved to W3's v7, since
> `data-migration-standards.md` assigns v7 to W3), and **W5 does not wait for the policy profile** — it
> derives `ReviewPeriod` from one named federal-default constant that W2b later moves into
> `src/lib/policy/`. Both problems had the same root cause: W5's header predated W2 being split into W2a
> and W2b, and nobody revisited it.
>
> ### Playwright is available, and you should use it
>
> `npm run test:e2e` — 62 specs against the real static export (ADR-0007 **Tier 3b**). The rule for adding
> one: only if it is impossible in jsdom. W5 rewrites month navigation and makes `Calendar` controlled,
> which is heavily visual, so this is the wave where a browser earns its keep. The Playwright MCP also
> lets you *look* at the app while building rather than after.
>
> Setting it up found two bugs that had been shipping and were invisible to all 423 Vitest tests and to
> `next dev`: a dead PWA manifest link (`/hourkeep/manifest.json` → 404, so the app was not installable)
> and a React #418 hydration failure on most routes. Both fixed.
>
> ### What W5 should read first
>
> W0's **Found during execution** section in [`waves/wave-0-safety-net.md`](waves/wave-0-safety-net.md).
> Ten places the planning documents were wrong, three of them audit claims. Directly relevant to W5:
>
> - **`calculations.ts`'s `month` parameter is optional and falls back to the wall clock**, and
>   `tracking/page.tsx:138` is the caller that forgets — it passes no month at all. Both are pinned by
>   characterization tests that assert the *current* wrong behaviour, including one proving identical
>   input gives different output depending on today's date. W5's diff should turn those red; that is the
>   signal the fix landed.
> - **The `startsWith` month filter is immune to timezone drift**, and a test records that as a property
>   to preserve. Whatever replaces it must keep it — this is the bug class
>   `data-migration-standards.md` names.
> - **W5 needs no Dexie version bump.** `data-migration-standards.md` puts month-scoping columns in
>   **W3's** consolidated v7, and `wave-5-month-scoping.md:33` says W5 does in-memory `userId` filtering
>   precisely because the column is not there yet. Note `waves/README.md:98` justifies W5's dependency on
>   W0 as "migration test before touching the schema", which reads as though W5 touches schema — it does
>   not. Minor doc tension, flagged rather than silently edited.
>
> Load-bearing for waves after that: `INCOME_THRESHOLD` is **not** unused, so W2b needs its three real
> importers; `storage/income.ts` has **three** `monthlyEquivalent` summing sites rather than one (W7a);
> and there are three `fake-indexeddb` limitations W3's migration test must work around, the most
> important being that **it does not preserve `Blob` at all**.
**Operative date:** **December 1, 2026** — see [`PRD.md`](PRD.md) § 10

> **This plan was independently validated on 2026-08-16** by five adversarial reviews. The legal analysis
> held; the **scope, the deadline, the wave ordering, and one ADR formula did not.** All findings are
> recorded in [`../audit/validation-findings-2026-08.md`](../audit/validation-findings-2026-08.md) and the
> corrections are folded in. Read that document before trusting any pre-validation figure you may have
> cached.
>
> **The five things that changed:**
> 1. **44 jurisdictions**, not 43 — Tennessee was missing, and DC was double-counted.
> 2. **The date is ~December 1, 2026**, because the application review period assesses the months
>    *preceding* application. Three provisions soften it for existing enrollees; none soften it for new
>    applicants or for Nebraska, Montana, Arkansas, or Iowa.
> 3. **Wave order inverted.** Copy corrections first, month scoping third, dependency modernization last.
> 4. **ADR-0004's proxy guard was a bug** that broke CMS's own worked example.
> 5. **An hours calendar is the wrong primary surface** for a large share of users.

---

## The situation in five sentences

CMS issued CMS-2454-IFC on June 3, 2026. It took effect July 31, 2026, and 44 jurisdictions must implement the
community engagement requirement by **January 1, 2027**. The rule is far more specific than the statute
HourKeep was built from, and in several places it contradicts what HourKeep currently tells users — most
seriously about income, which is **MAGI-based household income**, not individual earned income. HourKeep
also has no concept of the three-tier status model, the review period, short-term hardship, or the notice
response workflow. This effort makes the app factually correct and repositions it from *deciding* status to
*assembling evidence*.

---

## Read in this order

| # | Document | What it gives you |
|---|---|---|
| 1 | [`PRD.md`](PRD.md) | What HourKeep must become and why. Product position, users, goals, requirements |
| 2 | [`gap-analysis.md`](gap-analysis.md) | Every delta between the app and the rule, classified by gap type and impact |
| 3 | [`waves/README.md`](waves/README.md) | Dependency graph and wave summaries |
| 4 | [`decisions/`](decisions/) | The nine architectural decisions and their reasoning |

**Source material**

| Document | Purpose |
|---|---|
| [`../domain/cms-2454-ifc/rule-extract.md`](../domain/cms-2454-ifc/rule-extract.md) | The authoritative cited extract. **The single source of truth for what the law requires** |
| [`../domain/cms-2454-ifc/state-options.md`](../domain/cms-2454-ifc/state-options.md) | The 16 State-configurable parameters, the policy-profile schema, and a per-State tracker |
| [`../domain/cms-2454-ifc/2026-11094.txt`](../domain/cms-2454-ifc/) | The full rule as plain text, plus `SECTION-INDEX.txt` for navigation |
| [`../audit/codebase-audit-2026-08.md`](../audit/codebase-audit-2026-08.md) | Full codebase audit at commit `75d8e7c` — architecture, 14 defect classes, dead code, dependency currency |
| [`../../.kiro/steering/medicaid-domain-knowledge.md`](../../.kiro/steering/medicaid-domain-knowledge.md) | Working domain reference, rewritten against the IFC |

---

## The three rules

Everything else follows from these.

1. **HourKeep does not determine anyone's status.** States determine eligibility, exclusions, and
   compliance. We assemble, organize, and present evidence. Never assert a verdict. (ADR-0003)
2. **Never hardcode a policy value.** Every threshold and lookback is statutory-but-dynamic or a State
   election. All of them live in the policy profile. (ADR-0001)
3. **Test the math first.** Failing test, then fix, for anything in the five compliance-critical modules.
   (ADR-0007)

---

## Wave status

Sequence and dependencies: [`waves/README.md`](waves/README.md).

**Ships by December 1, 2026**

| Wave | Theme | Status |
|---|---|---|
| **W0-slice** | Test runner only — Vitest, a `test` script, nothing else | **Done** 2026-08-17 |
| **W2a** | Truth in copy | **Done** 2026-08-17 — 10 gap rows closed, 5 partial |
| [W0](waves/wave-0-safety-net.md) | Safety net, deletion, 4 data-loss fixes | **Done** 2026-09-01 — 4 data-loss fixes, delete-all-data, 14 files deleted, 196 → 423 tests. 1 criterion unmet (phone viewport) |
| [W5](waves/wave-5-month-scoping.md) | Month scoping + review periods | **Done** 2026-09-02 — `ReviewPeriod` model, month required and validated, `Calendar` controlled, 423 → 525 tests, 62 → 72 e2e. All 9 live criteria met; 1 struck to W3. First wave with 4/4 reviewers |
| W2b | Policy profile | Not started |
| W6a | Evidence capture | Not started |
| W8a | Print evidence export | Not started |
| W7a | Seasonal + income corrections | Not started |

**After the date**

| Wave | Theme |
|---|---|
| [W3](waves/wave-3-status-model.md) | Three-tier status model (owns the consolidated Dexie v7) |
| [W4](waves/wave-4-screening-rebuild.md) | Screening rebuild |
| W7b | Unified compliance |
| W9a / W9b | Notice response / hardship |
| W8b | ZIP, JSON, import |
| W6b | Activity model remainder |
| [W10](waves/wave-10-accessibility-privacy.md) | Accessibility + privacy |
| [W1](waves/wave-1-modernization.md) | Dependency modernization |

The `wave-2`, `wave-6`, `wave-7`, `wave-8`, and `wave-9` files hold combined scope from before the split;
they are the source for each half. Write the split halves when they start.

---

## Decisions

| ADR | Decision |
|---|---|
| [0001](decisions/ADR-0001-policy-profile-architecture.md) | Policy profile with `FEDERAL_DEFAULT`; per-State support is additive |
| [0002](decisions/ADR-0002-three-tier-status-model.md) | Excluded / excepted / hardship / applicable, resolved per month |
| [0003](decisions/ADR-0003-evidence-not-adjudication.md) | **Evidence organization, not adjudication.** The load-bearing decision |
| [0004](decisions/ADR-0004-unified-compliance-view.md) | Remove the hours/income mode fork; implement combination and the income-to-hours proxy |
| [0005](decisions/ADR-0005-month-scoped-data-model.md) | Month is an explicit required parameter; review periods are first-class |
| [0006](decisions/ADR-0006-evidence-package-export.md) | Period-scoped evidence package: print-ready HTML, ZIP, JSON |
| [0007](decisions/ADR-0007-test-strategy.md) | Vitest, tiered obligation, TDD for domain logic |
| [0008](decisions/ADR-0008-rejected-medicaid-eligibility-api.md) | **Rejected** MAGI in the Cloud as a runtime dependency; harvest its config schema instead |
| [0009](decisions/ADR-0009-dependency-modernization-timing.md) | Modernize early and isolated; remove Tailwind; actually load Inter |

---

## The ten things most worth remembering

1. **Income is MAGI-based household income** (§ 435.552(f)(2)). Includes unearned income, follows **tax
   filing relationships** rather than residence — but **excludes** dependents not required to file. A married
   user whose spouse works may already qualify with zero hours, and HourKeep currently tells them they're
   failing.
2. **Most users may need to do nothing.** $580 is ~32% of the single-person eligibility ceiling, and CMS
   estimates **56% will be verified ex parte**. The residual ~8.8 million are defined by what payroll data
   misses: unpaid and in-kind work, caregiving, community service, unmatched gig income, part-time school.
   **Build for them, not for the calendar.**
3. **Three tiers, not one flag.** Specified excluded (State is *prohibited* from assessing), mandatory
   exception (deemed compliant per month), optional hardship (State election).
4. **Prior exclusion is itself an exception** (§ 435.553(a)(4)), so losing exclusion protects the months you
   held it. The rule's main transition protection. And **exclusion has no monthly-duration requirement.**
5. **Education at least half-time qualifies with zero hours** and cannot be combined. Less than half-time
   converts at `creditHours × 3 × 4.33`.
6. **Hours and income combine** via the income-to-hours proxy (§ 435.552(e)(2)) — but the State must
   **allocate hours between household members**, so any figure we show is an **upper bound**.
7. **Seasonal averaging excludes the assessed month.** HourKeep includes it — off by one. And the
   **reasonably-predictable-changes** alternative can invert the answer for the same person.
8. **Documentation hardening is per-State.** January 1, 2028 federally; **January 2027 in eight States**.
9. **The 30-day window is ~35 days**, and under the State's **Option 2** election a user may get two
   sequential windows — or, if other renewal factors are also unverified, **none at all.**
10. **TDIU veterans qualify** at 100% *compensation* even with a combined rating below 100%. Asking only
    "is your rating 100%?" excludes them.

---

## Known gaps in the plan itself

Deliberately left open. Not defects — decisions to close later.

1. ~~**`§ 435.603` is not extracted.**~~ — **done 2026-08-16, commit `b9b9594`.** Text is at
   [`../domain/supporting-regs/README.md`](../domain/supporting-regs/README.md) § 1. **Cite that, not
   `rule-extract.md`, for household-income claims** — the extract carried CMS's preamble gloss ("the total
   income of everyone in the household"), which overstates income. Found on the W2a dry run and corrected;
   see `rule-extract.md` § 2.6.
2. **PRD requirement-to-wave traceability** has known mismatches (R1.6 → W3 not W4; R6.3 and R6.8 both citing
   gap 8.9; R8.2's TDD clause spanning waves; gaps 2.11 and 2.12 with no acceptance criteria). Cosmetic for
   execution; clean up before W3.
3. **Ten specific acceptance criteria are still weak.** A global rule is in the Definition of Done; the
   individual criteria in W3–W10 were not rewritten. Fix each at its wave's start.
4. **Split wave files don't exist** for W2b, W6a/W6b, W7a/W7b, W8a/W8b, W9a/W9b. The combined `wave-2`,
   `wave-6`, `wave-7`, `wave-8`, `wave-9` files are the source.
   **W2a now has its own file** — [`waves/wave-2a-truth-in-copy.md`](waves/wave-2a-truth-in-copy.md),
   written 2026-08-17. Worth reading before the next split: re-verifying wave-2's § 2.5 site table against
   the code found **nine** errors before any code was written, and running the guard test found **seven
   more**. The table listed a dead file and omitted a live one, and its 11 sites were really 78 lines
   across 14 files. Verify a site list against the tree before trusting it.
5. ~~"No production users" is unverified~~ — **checked 2026-08-16, and the justification is withdrawn.**
   Evidence strongly suggests no real users (site live but the build is dated 2026-01-14; repo has 1 star,
   0 forks, 0 watchers, 0 issues ever, 0 views in 14 days). But the question is **structurally unanswerable**:
   data lives in per-browser IndexedDB, and Plausible can report page views but not whether any visitor
   completed onboarding. **So migrations must preserve data regardless.** See ADR-0002.

## Open questions to watch

1. **A final rule is coming.** 79,718 comments were filed. Interpretations may shift. The policy profile is
   versioned so a change is new data, not a rewrite.
2. **§ 435.916 renewal conflict.** The IFC text says 12-month MAGI renewals; its own preamble says 6 months
   for the adult group under § 1902(e)(14)(L). Separate rulemaking presumably pending.
3. **Most States' elections are unknown**, especially whether hardship is offered — which determines whether
   a whole feature is relevant to a given user.
4. **State medically frail condition lists.** Each State must publish one. None catalogued.
5. **CMS SPA / election templates** were "under development." Once published, they are the authoritative
   source for most of `state-options.md`.
6. **Emmy's survival.** CMS calls it "a prototype… currently being piloted," and there are credible reports
   it may be discontinued — though commit activity through 2026-08-14 is high. ADR-0006 deliberately does not
   depend on it. **Recheck before W8a.**
7. ***Massachusetts v. Oz*** — summary judgment hearing **October 20, 2026**, aimed at the medically-frail
   functional gate. Could land before the deadline.
8. **State medically-frail condition lists.** Only Georgia's is published, and it is **two-tier** (automatic
   plus case-by-case), which means "is my condition on the list?" is not a yes/no question.

---

## Housekeeping

The 13 specs under `.kiro/specs/` predate this effort. Several are superseded by these waves —
`exemption-documentation` (0/12), `exemption-terminology-realignment` (21/16), and
`workpath-enhanced-onboarding` (28/19) most directly. Reconcile or archive them when the relevant wave
starts, rather than leaving two competing plans in the repository.
