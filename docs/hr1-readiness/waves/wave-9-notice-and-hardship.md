# Wave 9 — Notice Response and Hardship

**Depends on:** W8 (a notice response *is* an evidence package with a deadline)
**Detail level:** goals and scope. Task breakdown when the wave starts.

## Goal

Support the two moments the app currently ignores entirely: a notice of noncompliance arriving, and a
hardship interrupting someone's month. Both are absent today.

## Scope

### Notice of noncompliance (§ 435.558)

The highest-stress moment in the whole regime, and HourKeep has nothing for it.

- **Record the notice.** Date on the notice, date received if known, and which months the notice says are
  being assessed (§ 435.558(c)(1)(i)(A)).
- **Countdown.** 30 calendar days from **receipt**, with receipt defaulting to notice date + 5 days per the
  § 435.558(c)(4) presumption — roughly 35 days from the notice date. Let the user override the received
  date, since the presumption is rebuttable.
- **Lead with the reassurance.** "Your coverage continues while you respond" (§ 435.558(a)(3)). This is the
  single most calming true fact available, and no user currently learns it from HourKeep.
- **Both response paths** (§ 435.558(a)(2)). Either show compliance or deemed compliance for the assessed
  months, or show the requirement doesn't apply because the person isn't an applicable individual. The second
  path is easy to miss and often the stronger argument.
- **Response package.** A W8 evidence package scoped to the notice's assessed months, framed as a response
  rather than a general record.
- **What comes after.** Explain the 90-day reconsideration without a new application (§ 435.916(a)(3)(iii)),
  and that there is **no restriction on reapplying** (§ 435.558(e)). Both are reassuring and both are
  currently unsaid.
- **Submission guidance.** The five § 435.907(a) modalities, and that a household adult, family member, or
  authorized representative may submit on the person's behalf.

### Short-term hardship (§ 435.555)

**State option**, so everything here is gated on `profile.shortTermHardshipOffered` and must be honest when
we don't know a State's election.

- **Four event types**, all-or-none if the State elects:

  | Event | Request required |
  |---|---|
  | Inpatient or similar-acuity services, including noninstitutional services that prevented institutionalization | Yes |
  | County with a Presidentially declared emergency or disaster | **No — automatic** |
  | County unemployment at or above the lesser of 8% or 1.5× national | **No — automatic** |
  | Travel outside the community for a serious or complex condition | Yes |

- **Automatic versus request-based** is the distinction that matters most to a user. For the two automatic
  events, tell them no request is needed (§ 435.555(e)).
- **Dependent travel.** § 435.555(d)(4)(i): if the dependent travels without the individual, the individual
  must show they took leave or absented themselves for related reasons — local appointments in preparation,
  travel logistics, communicating with providers. Capture that narrative.
- **Hardship months resolve to `kind: "hardship"`** in the W3 status model, with the event and whether a
  request was made.
- **Duration.** Disaster hardship runs from the first month of the incident period through at least the month
  it ends, extendable by CMS.

## Acceptance criteria

- [ ] A notice can be recorded with its date, received date, and assessed months
- [ ] Countdown defaults to notice date + 5 days, then 30 days, and the received date is user-overridable
- [ ] "Your coverage continues" appears prominently, not buried
- [ ] Both response paths are offered, with the non-applicability path given equal weight
- [ ] A response package can be generated scoped to the assessed months
- [ ] Reconsideration and reapplication rights are explained
- [ ] All four hardship events can be recorded, with automatic ones marked as needing no request
- [ ] Dependent-travel narrative is capturable
- [ ] Hardship months resolve to `hardship` status with citation
- [ ] Everything hardship-related is gated on the profile, and says so when the State's election is unknown

## Risks

| Risk | Mitigation |
|---|---|
| Countdown creates anxiety | Pair every deadline with "coverage continues" and a concrete next action |
| Hardship is irrelevant in States that decline it | Gate on profile; when unknown, present as "your state may offer this — ask" |
| Users mis-record the received date and misjudge their deadline | Default to the legal presumption, explain it, and show both dates |
| Automatic hardships depend on county data we don't have | Don't assert. Explain the rule and that the state applies it without a request |
