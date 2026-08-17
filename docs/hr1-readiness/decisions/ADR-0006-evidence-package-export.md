# ADR-0006 — Evidence Package Export

**Status:** Accepted
**Date:** 2026-08-16

## Context

The export is the product. Under ADR-0003, HourKeep's whole job is to produce something a person can
hand to their State. Today it produces two artifacts, and both are unfit.

Verified by grep, **absent from both export paths**: `assessmentResults`, `documents`, `documentBlobs`,
`incomeDocuments`, `incomeDocumentBlobs`, `exemptionHistory`, `seasonalWorkerStatus`. Every uploaded pay
stub and verification letter is left behind by a feature labeled "Backing up your data."

Additional defects: the JSON reads `db.profiles` directly, shipping `dateOfBirth` and `medicaidId` as
AES-GCM ciphertext with no key — permanently unreadable. The readable report re-hardcodes `>= 80` and
`>= 580`, **skips seasonal averaging entirely**, and renders only one mode per month, so it can
contradict the UI and lose half a month's record.

What the rule expects a person to be able to submit (§ 435.557, § II.I.3): paystubs; a document from a
community service organization including a point of contact who can confirm hours; transcripts or class
schedules; a VA disability document; SNAP or TANF approval notices. Submission must be possible
**online, by phone, by mail, in person, or electronically** (§ 435.907(a)).

## Decision

Replace both exports with a **review-period-scoped evidence package** in three formats.

**Scope selection.** The user picks a review period (ADR-0005) or an arbitrary month range. Everything in
the package is scoped to it.

**Contents.**

1. **Cover summary** — who this is about (name, State, Medicaid ID, date of birth, contact), which months
   are covered, and what basis is being presented. Decrypted, never ciphertext.
2. **Per month**: activities by type with dates, hours, organization, and the community-service record
   fields; income evidence entries; apparent status with its CFR citation; and a document count.
3. **Document manifest** — every document with its type, capture date, linked activity or month, and a
   stable reference into the attachments.
4. **Attachments** — the actual image blobs.
5. **A plain signature-and-date line.** No attestation language.

   > **Corrected on validation.** An earlier version framed this as an "attestation block" citing
   > § 435.557(f)(1)'s penalty-of-perjury statements. That invites a real problem: **from January 1, 2028 a
   > self-attestation of medical frailty is accepted only once per period of enrollment** (and already from
   > January 2027 in eight States). A generic block framed as an attestation could burn a user's one
   > permitted attestation on the wrong document, or be read as one when it isn't. Keep the signature line
   > plain; if a penalty-of-perjury statement is ever needed, make it a separate, deliberate, explained
   > artifact the user opts into.
6. **Legend and framing** — what the threshold is, that the State makes the determination, and that
   HourKeep is a personal record.

**Formats.**

| Format | Purpose |
|---|---|
| **Print-ready HTML** (browser print → PDF) | Mail, in-person, and fax. The primary artifact |
| **ZIP** | Online portal upload: the summary plus attachments as real files |
| **JSON** | Structured backup and any future import |

Print-ready HTML rather than a PDF library: it keeps the static-export bundle small, uses the platform's
own print pipeline, and remains accessible and selectable. `react-zoom-pan-pinch` is already the only
heavy dependency and we don't want another.

**It must survive fax.** Missouri accepts portal upload, mail, **fax**, or in person, and no State publishes
MIME types or size limits. So: a single flat artifact per month, **legible in black and white**, no colour
dependency, no multi-file bundle required, and **every page self-identifying** with name, case number,
month, and activity type — faxed pages arrive separated.

### On aligning with CMS's Emmy App

**Do not couple to it. Do read its schema as prior art.**

Emmy App (`DSACMS/iv-cbv-payroll`) produces a comparable evidence package, and matching an emerging federal
convention on field names costs nothing.

But two facts, verified 2026-08-16, argue against depending on it. CMS's own repo description calls it
**"a prototype… currently being piloted for testing and validation purposes"** — notably weaker than the
"numerous States have successfully piloted" framing in our earlier research note. And there are credible
reports it may be discontinued. Commit activity is genuinely high — 27 commits in the most recent week,
v0.2.0 released 2026-08-12, active work on sending CE documents to agencies over HTTP and S3 — so it is
**not** dormant. But active development right up to cancellation is the normal shape of a cancelled pilot.

**The principle that survives either outcome:** target the **§ 435.907(a) channels States must accept**,
which are statutory, rather than any particular tool's format. If Emmy thrives, our artifact still works. If
it is cancelled, nothing changes.

**Non-negotiables.**

- **One evaluation path.** The export calls the same `evaluateMonth` the UI calls. It may not recompute
  anything. This structurally prevents gap 8.9 from recurring.
- **No verdicts.** Consistent with ADR-0003, it reports logged totals and the threshold. It does not
  print "COMPLIANT."
- **No ciphertext.** Profile fields go through `getProfile`, not `db.profiles`.
- **A PII warning before download.** The package contains name, date of birth, and Medicaid ID by design,
  because the agency needs them. The user should be told before it lands in their downloads folder.

## Consequences

**Good**

- The app finally does the thing it exists to do.
- Documents ship with the evidence they support.
- Structurally impossible for export and UI to disagree.
- Covers all five submission modalities the rule requires States to accept.

**Costs**

- Largest single feature in the plan. Depends on ADR-0005 month scoping and ADR-0002 status model.
- ZIP generation needs a small dependency or a hand-rolled store-only writer.
- Print stylesheets are fiddly across browsers.

## Alternatives rejected

- **Fix the existing text report in place.** It has no document handling and no period scoping. The
  rewrite is smaller than the retrofit.
- **Generate PDFs client-side with a library.** Adds meaningful bundle weight to a PWA aimed at
  low-bandwidth users, and produces less accessible output than printed HTML.
- **Keep JSON as the primary artifact.** No caseworker will accept it.
