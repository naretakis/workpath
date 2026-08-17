# ADR-0008 — Rejected: MAGI in the Cloud as a Runtime Dependency

**Status:** Accepted (rejection)
**Date:** 2026-08-16
**Subject:** `medicaideligibilityapi.org` / `github.com/HHSIDEAlab/medicaid_eligibility`

## Context

Given the finding that community engagement income is MAGI-based household income (§ 435.552(f)(2)),
an existing MAGI service was proposed as a way to screen income without HourKeep implementing MAGI itself.

**What it is.** "MAGI in the Cloud" — a Rails rules engine, API, and AngularJS app built by BlueLabs with
HHS IDEA Lab, HHS Entrepreneurs, and the RWJF-funded State Health Reform Assistance Network.
BSD-3-Clause. Live on Heroku. Self-hostable. Genuinely makes determinations without accepting PII.
26 MAGI ruleset modules, a declarative `input`/`config`/`calculated`/`rule` engine, and a
`config/state_config.json` covering 38 States plus a `default`. Last pushed January 2024.

A shallow clone was inspected and removed.

## Decision

**Do not call it, hosted or self-hosted. Harvest specific artifacts from it under BSD-3 attribution.**

### Why not use it

Reasons reordered on validation. The offline-first argument previously led, and that was the ADR's
**weakest** point — it's a self-imposed constraint, so the rejection would have been one policy reversal
from void. If correctness genuinely required a network call, the right answer would be to change the
promise, not to stay wrong. These are the reasons that actually settle it.

1. **It answers a different question.** It determines whether household MAGI falls *under* the eligibility
   **ceiling** (133% FPL). Community engagement needs the **floor** — `federalMinimumWage × 80`. A grep for
   "community engagement", "work requirement", "1902(xx)", and "80 hours" returns nothing. It predates HR1
   by a decade.
2. **It doesn't solve the hard part.** `Medicaid Household` and `Calculated Income` are **inputs**. The
   caller must already have done householding and income summation. It cannot take three screener questions
   and return a figure — which is precisely the work we needed done.
3. **It disclaims authority.** The README states it is "provided as a reference implementation" and "is not
   currently used in any federal systems."
4. **Partial coverage.** 38 States plus default — missing roughly 13, including California, New York,
   Colorado, Washington, Oregon, and Massachusetts.
5. **It would break the product's promise** — static export, offline-first, and a privacy notice that tells
   users their data stays local. Supporting, not dispositive.

**Dropped on validation:** the stale-FPL-table reason. This ADR itself concedes community engagement keys on
minimum wage rather than FPL, so that reason was doing no work.

**The rejection survives dropping offline-first entirely.** Reasons 1 and 2 mean a "clearly-labeled optional
online screener" built on this would add a network dependency, a privacy exception, and an unmaintained
third party in exchange for a computation we would still have to perform ourselves.

### A federal alternative exists and should be evaluated instead

Found during validation: **CMS's Emmy App**
([cms.gov](https://www.cms.gov/medicaid-chip/community-engagement-support/eligibility-made-easy), repo
[DSACMS/iv-cbv-payroll](https://github.com/DSACMS/iv-cbv-payroll)) is open source, federal, free, actively
developed, and piloted by multiple States. Its stated output is a **standardized, audit-ready evidence
package for the State** — the same artifact ADR-0006 designs. **Emmy API** connects States to VA Lighthouse
and the National Student Clearinghouse and was folded into the Federal Data Services Hub in July 2026.

This does not change the rejection above, but it does change ADR-0006: **read Emmy's docs before freezing
the export schema, and target its package shape where a State has adopted it** rather than inventing a
format. Tracked as a follow-up on ADR-0006.

### What we take

Under BSD-3-Clause, which permits reuse with attribution.

| Artifact | Use |
|---|---|
| **`config/state_config.json` shape** | Validated pattern for per-State options with a `default` fallback — exactly ADR-0001. Its `Option Caretaker Relative Relationship` maps to § 435.554(a)(iv); `Foster Care Age Threshold` and `In-State Foster Care Required` map to § 435.554(c)(1) |
| **`former_foster_care.rb`** | Reference logic for an exclusion HourKeep has no question for |
| **`parent_caretaker_relative.rb`** | Relationship taxonomy behind the caregiver cluster |
| **The declarative ruleset pattern** | Named inputs, named configs, named outputs, discrete `rule` blocks. A good model for auditable, citable compliance logic — close to what ADR-0001 and ADR-0007 propose anyway |

Attribution goes in a `NOTICE` or source-file header wherever derived logic lands: *portions derived from
`HHSIDEAlab/medicaid_eligibility`, © 2013–2020 BlueLabs, BSD-3-Clause.*

## Consequences

**Good**

- Preserves offline-first and the privacy promise.
- No runtime dependency on an unmaintained service.
- Still captures the genuine value: a proven config schema and two rule modules for gaps we have.

**Costs**

- We implement the household screener ourselves. Small, since ADR-0003 means it is three questions and
  a pointer to the agency rather than a calculation.
- BSD-3 attribution obligation to track.

## Alternatives rejected

- **Call the hosted API.** Breaks offline-first, privacy, and adds an unmaintained dependency.
- **Self-host it.** Requires a server. HourKeep has none by design.
- **Port the whole engine to TypeScript.** Ports the wrong question — eligibility ceiling, not
  community-engagement floor — plus stale data and partial State coverage.
