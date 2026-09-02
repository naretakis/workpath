"use client";

import { useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { formatMonthLong } from "@/lib/month";
import type { ReviewPeriod } from "@/lib/reviewPeriod";

interface ReviewPeriodPanelProps {
  /** The derived period, or `undefined` when the user has not told us the anchor. */
  reviewPeriod?: ReviewPeriod;
  /** Hours logged in each month of the period. Facts, not findings. */
  monthHours: Array<{ month: string; totalHours: number }>;
  /** The monthly hours total, derived from the calculation module, never a literal. */
  monthlyThreshold: number;
  /** The month currently on screen, so the panel can offer to jump to a month. */
  selectedMonth: string;
  /**
   * The real current month, used as the form's starting value.
   *
   * Deliberately not `selectedMonth`: an application month or a renewal due date sits
   * near today, not near whichever month the user happens to be browsing. A first
   * version seeded the form from `selectedMonth`, which also went stale — `useState`
   * captured it once at mount, so after paging two months back the form still offered
   * the month it had been opened on.
   */
  todayMonth: string;
  onSelectMonth: (month: string) => void;
  onAnchorChange: (kind: "application" | "renewal", month: string) => void;
  onClearAnchor: () => void;
}

/**
 * What months the state may look at, and what is on record for each.
 *
 * W5. 42 CFR 435.556(a) measures everything against a review period, and until now
 * HourKeep had no concept of one — `monthsRequired` was a bare count with no months
 * attached, so it could not answer "which months".
 *
 * WHAT THIS PANEL IS ALLOWED TO SAY. It reports hours logged against a published
 * threshold, and it names the months. It does not say whether anyone complied:
 * ADR-0003, and `compliance-copy-standards.md`'s banned list. The most important
 * thing it says is the most under-communicated fact in the rule — that at renewal any
 * qualifying month in the period counts, because CMS reads "whether or not
 * consecutive" as denying states the power to pick the months (91 FR 33389).
 *
 * WHY IT ASKS RATHER THAN INFERS. § 435.556(a)(1) measures from the month of
 * application and § 435.556(a)(2)(i) from the last redetermination. Neither was
 * stored. The notice deadline could not stand in for either without inventing the
 * assessed months, which § 435.556(d) and § 435.558 both require the state to name
 * and § 435.556(a)(2) forbids the state to choose. So the honest default is to say we
 * do not know, and give the user a way to say.
 */
export function ReviewPeriodPanel({
  reviewPeriod,
  monthHours,
  monthlyThreshold,
  selectedMonth,
  todayMonth,
  onSelectMonth,
  onAnchorChange,
  onClearAnchor,
}: ReviewPeriodPanelProps) {
  const [editing, setEditing] = useState(false);
  const [draftKind, setDraftKind] = useState<"application" | "renewal">(
    "application",
  );
  const [draftMonth, setDraftMonth] = useState<string>(todayMonth);

  const save = () => {
    if (!draftMonth) return;
    onAnchorChange(draftKind, draftMonth);
    setEditing(false);
  };

  // ── Unknown ────────────────────────────────────────────────────────────────
  // "Uncertainty is content." But a hedge with nothing after it just transfers
  // anxiety, so this state is mostly a next action.
  if (!reviewPeriod) {
    return (
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Which months will your state look at?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          We don&apos;t know yet, and we won&apos;t guess. Your state decides
          which months it checks, and it has to tell you which ones in writing.
          If you got a letter, the months are named in it.
        </Typography>

        {!editing ? (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button
              variant="contained"
              onClick={() => setEditing(true)}
              sx={{ minHeight: 44 }}
            >
              Tell us your dates
            </Button>
          </Stack>
        ) : (
          <AnchorForm
            draftKind={draftKind}
            draftMonth={draftMonth}
            setDraftKind={setDraftKind}
            setDraftMonth={setDraftMonth}
            onSave={save}
            onCancel={() => setEditing(false)}
          />
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 2 }}
        >
          Keep logging hours either way. Nothing here changes what you&apos;ve
          already recorded.
        </Typography>
      </Paper>
    );
  }

  // ── Known ──────────────────────────────────────────────────────────────────
  const months = monthHours;
  const monthsRequired = reviewPeriod.monthsRequired;
  const isApplication = reviewPeriod.kind === "application";
  const monthsAtOrOverThreshold = months.filter(
    (m) => m.totalHours >= monthlyThreshold,
  ).length;

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Months your state may look at
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {describePeriod(reviewPeriod)}
      </Typography>

      {/* Neutral arithmetic, per month. Hours logged and the difference; no verdict.
          `hoursNeeded`-style differences survive ADR-0003 because a difference is
          not a determination. */}
      <Stack spacing={1} sx={{ mb: 2 }}>
        {months.map(({ month, totalHours }) => {
          const difference = Math.max(monthlyThreshold - totalHours, 0);
          const isSelected = month === selectedMonth;
          return (
            <Box
              key={month}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: isSelected ? "action.selected" : "action.hover",
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600}>
                  {formatMonthLong(month)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Logged: {totalHours} hours. Threshold: {monthlyThreshold}{" "}
                  hours.
                  {difference > 0 ? ` Difference: ${difference}.` : ""}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => onSelectMonth(month)}
                aria-label={`Show ${formatMonthLong(month)}`}
                sx={{ minHeight: 44, flexShrink: 0 }}
              >
                {isSelected ? "Showing" : "Show"}
              </Button>
            </Box>
          );
        })}
      </Stack>

      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 2 }}>
        <Chip
          size="small"
          label={`${months.length} month${months.length === 1 ? "" : "s"} in the period`}
        />
        <Chip
          size="small"
          label={`${monthsRequired} month${monthsRequired === 1 ? "" : "s"} required`}
        />
        <Chip
          size="small"
          variant="outlined"
          label={`${monthsAtOrOverThreshold} at or over ${monthlyThreshold} hours`}
        />
      </Box>

      {!isApplication && (
        // The user-favourable rule, and the one nobody tells people. CMS: the clause
        // "whether or not consecutive" is "not modified by a grant of discretion to
        // the State", so states may neither require consecutive months nor dictate
        // which ones. 91 FR 33389, preamble to 42 CFR 435.556(a)(2).
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>Any qualifying month counts</AlertTitle>
          {monthsRequired === 1
            ? "Your state can't tell you which month it has to be. If any one month in this list works, that counts."
            : `Your state can't tell you which months they have to be, and they don't have to be back to back. Any ${monthsRequired} months in this list count.`}
        </Alert>
      )}

      {isApplication && monthsRequired > 1 && (
        // § 435.556(a)(1) says "consecutive" in the rule text itself, so the
        // favourable reading above does NOT extend to applications. Saying so is
        // less pleasant and more useful than leaving it ambiguous.
        <Alert severity="info" sx={{ mb: 2 }}>
          <AlertTitle>These months are back to back</AlertTitle>
          For a new application, states look at the months right before you
          apply — all {monthsRequired} of them, in a row. That&apos;s different
          from renewals.
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        <AlertTitle>Check this with your state</AlertTitle>
        How many months your state asks for is up to them, within limits, and we
        don&apos;t know what yours chose. Ask them which months they&apos;re
        checking and how many they need. If you got a letter, it should say.
      </Alert>

      {!editing ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setEditing(true)}
            sx={{ minHeight: 44 }}
          >
            Change these dates
          </Button>
          <Button size="small" onClick={onClearAnchor} sx={{ minHeight: 44 }}>
            Remove them
          </Button>
        </Stack>
      ) : (
        <AnchorForm
          draftKind={draftKind}
          draftMonth={draftMonth}
          setDraftKind={setDraftKind}
          setDraftMonth={setDraftMonth}
          onSave={save}
          onCancel={() => setEditing(false)}
        />
      )}
    </Paper>
  );
}

/**
 * A plain-language description of which months the state may look at, and why.
 *
 * Switched on `kind` rather than on a derived boolean so TypeScript narrows the union
 * — each arm of `ReviewPeriod` carries different fields, and the exhaustiveness check
 * means adding a fifth review period cannot silently fall through to prose written
 * for a different one.
 */
function describePeriod(period: ReviewPeriod): string {
  switch (period.kind) {
    case "application":
      // § 435.556(a)(1): the months immediately preceding the application month. The
      // application month itself is not one of them.
      return (
        `You told us you're applying in ${formatMonthLong(period.applicationMonth)}. ` +
        `States look at the months just before you apply.`
      );
    case "renewal":
      // § 435.556(a)(2)(i). The SPAN is an assumption, not a finding — say so out
      // loud. See `renewalPeriodMonthsSource` for why six is uncertain.
      return (
        `You told us your renewal is due in ${formatMonthLong(period.periodEnd)}. ` +
        `States look at the months since your last renewal. We've assumed six, but ` +
        `yours may count a different stretch.`
      );
    case "verification":
      // § 435.556(a)(2)(ii). Only reachable in a state that checks between renewals.
      return (
        `Your state checks between renewals. These are the months since your last ` +
        `check, up to ${formatMonthLong(period.until)}.`
      );
    case "newlyApplicable":
      // § 435.556(a)(2)(iii). Ends at the end of the month BEFORE the change, so the
      // month things changed is not one your state may assess.
      return (
        `Things changed for you in ` +
        `${formatMonthLong(period.becameApplicableMonth)}, so your state looks at the ` +
        `months before that — not that month itself.`
      );
  }
}

interface AnchorFormProps {
  draftKind: "application" | "renewal";
  draftMonth: string;
  setDraftKind: (kind: "application" | "renewal") => void;
  setDraftMonth: (month: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function AnchorForm({
  draftKind,
  draftMonth,
  setDraftKind,
  setDraftMonth,
  onSave,
  onCancel,
}: AnchorFormProps) {
  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        variant="body2"
        component="label"
        id="anchor-kind-label"
        sx={{ display: "block", mb: 1, fontWeight: 600 }}
      >
        Which is happening?
      </Typography>
      <ToggleButtonGroup
        exclusive
        value={draftKind}
        onChange={(_, value) => value && setDraftKind(value)}
        aria-labelledby="anchor-kind-label"
        orientation="horizontal"
        sx={{ mb: 2, flexWrap: "wrap" }}
      >
        <ToggleButton value="application" sx={{ minHeight: 44 }}>
          I&apos;m applying
        </ToggleButton>
        <ToggleButton value="renewal" sx={{ minHeight: 44 }}>
          I&apos;m renewing
        </ToggleButton>
      </ToggleButtonGroup>

      <TextField
        // `type="month"` gives YYYY-MM directly and opens a month picker on a phone,
        // so there is no parsing and no way to enter a day by mistake.
        type="month"
        fullWidth
        value={draftMonth}
        onChange={(e) => setDraftMonth(e.target.value)}
        label={
          draftKind === "application"
            ? "Month you're applying"
            : "Month your renewal is due"
        }
        helperText={
          draftKind === "application"
            ? "Your state will look at the months just before this one."
            : "Your state will look at the months leading up to this one."
        }
        slotProps={{ inputLabel: { shrink: true } }}
        sx={{ mb: 2 }}
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!draftMonth}
          sx={{ minHeight: 44 }}
        >
          Save
        </Button>
        <Button onClick={onCancel} sx={{ minHeight: 44 }}>
          Cancel
        </Button>
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 1.5 }}
      >
        Not sure? Your state has to tell you the months in writing, and you can{" "}
        <Link href="/how-to-hourkeep">check what applies to you</Link> first.
        This only changes what HourKeep shows you.
      </Typography>
    </Box>
  );
}
