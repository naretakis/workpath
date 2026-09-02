"use client";

import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  FactCheck as FactCheckIcon,
  FileDownload as FileDownloadIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";

/**
 * What is on record for the review period, once every month required has reached the
 * hours threshold.
 *
 * ─────────────────────────────────────────────────────────────────────────────────
 * REWRITTEN IN W5, and this component is the reason the wave needed an extra
 * approval. It is worth understanding why, because the shape of the problem recurs.
 *
 * W5's job here was to make the component REACHABLE. It was fed a
 * `Map<string, boolean>` holding exactly one entry — the wall-clock month — under the
 * comment "For now, just check current month", and it returns `null` when
 * `monthsCompleted < monthsRequired`. Since `monthsRequired` is documented 1-6, it
 * could only ever render at 1. For the other five values it was unreachable by
 * construction.
 *
 * And what it rendered was "🎉 Goal Complete!" and "You've completed all N required
 * months" — row 2 of the banned table in `compliance-copy-standards.md`, and a
 * verdict on a legal outcome that only a state can reach. So fixing the reachability
 * bug on its own would have shipped banned copy to five of six users who have a
 * notice. The bug and the no-verdict guard had been protecting each other by
 * accident.
 *
 * What replaced it: hours logged, the threshold, and the count of months that reached
 * it. Those are facts about the user's own records. "You have a complete record" is a
 * statement about a record; "you are compliant" is a statement about eligibility, and
 * HourKeep is not allowed to make it (ADR-0003).
 *
 * Also removed: "Remember: Renewals happen every 6 months." That was a policy literal
 * outside `src/lib/policy/`, and worse, it was the *contested* figure — the IFC
 * amends 42 CFR 435.916 to say 12 months while its own preamble says 6 for the adult
 * group under SSA 1902(e)(14)(L), a different section of PL 119-21 that this rule does
 * not implement. Stating either as fact would be wrong for someone.
 * ─────────────────────────────────────────────────────────────────────────────────
 */
interface CompletionMessageProps {
  /**
   * How many months in the review period have reached the hours threshold.
   *
   * Named for what it measures. It was `monthsCompleted`, which sounds like a
   * finding; a month is not "complete", it either has enough hours logged or it does
   * not, and whether that satisfies anyone is the state's call.
   */
  monthsAtOrOverThreshold: number;
  /** How many months the review period requires — 42 CFR 435.556(a). */
  monthsRequired: number;
  /** The monthly hours total, so the copy can state it without a literal. */
  monthlyThreshold: number;
  /**
   * Which review period this is. Applications need consecutive months
   * (§ 435.556(a)(1)); renewals do not, and saying so is user-favourable
   * (91 FR 33389).
   */
  reviewPeriodKind:
    | "application"
    | "renewal"
    | "verification"
    | "newlyApplicable";
  onExport: () => void;
  onContinueTracking: () => void;
  onSetReminder?: () => void;
}

export function CompletionMessage({
  monthsAtOrOverThreshold,
  monthsRequired,
  monthlyThreshold,
  reviewPeriodKind,
  onExport,
  onContinueTracking,
  onSetReminder,
}: CompletionMessageProps) {
  // Nothing to report until the record covers what the period asks for. A period
  // requiring zero months (someone who became applicable in the month their coverage
  // began, § 435.556(a)(2)(iii)) has nothing to say here either.
  if (monthsRequired < 1 || monthsAtOrOverThreshold < monthsRequired) {
    return null;
  }

  const isApplication = reviewPeriodKind === "application";

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 3,
        bgcolor: "success.50",
        border: "2px solid",
        borderColor: "success.main",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
        }}
      >
        <FactCheckIcon sx={{ fontSize: 48, color: "success.main" }} />
        <Box>
          <Typography variant="h5" component="h2" fontWeight={600}>
            Your record covers every month
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {monthsAtOrOverThreshold} month
            {monthsAtOrOverThreshold === 1 ? "" : "s"} at or over{" "}
            {monthlyThreshold} hours. Your state asks for {monthsRequired}.
          </Typography>
        </Box>
      </Box>

      {/* The thing that is genuinely still uncertain, said plainly, with the actor
          named. compliance-copy-standards.md: "Name the actor. 'Your state decides,'
          not 'it is determined.'" */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Your state still makes the decision</AlertTitle>
        This means your records are in order, not that your state has agreed.
        They check your hours against their own information first, and they have
        to tell you what they decided in writing. If they ask for proof,
        everything you&apos;ve logged is here.
        {!isApplication &&
          " They also can't insist on particular months — any months in your review period count."}
      </Alert>

      {/* Next Steps */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
          What&apos;s Next?
        </Typography>
        <List>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <FileDownloadIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Save or print your record"
              secondary="Hours, dates, and any photos you added — ready to hand over or attach"
            />
          </ListItem>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <CalendarIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Keep logging"
              secondary="Your state will check again. Staying up to date makes next time quick."
            />
          </ListItem>
        </List>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={onExport}
          fullWidth
          sx={{ py: 1.5 }}
        >
          Save or print my record
        </Button>
        <Button
          variant="outlined"
          startIcon={<TrendingUpIcon />}
          onClick={onContinueTracking}
          fullWidth
          sx={{ py: 1.5 }}
        >
          Keep Tracking
        </Button>
      </Box>

      {/* Set Reminder (Placeholder) */}
      {onSetReminder && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="text"
            startIcon={<NotificationsIcon />}
            onClick={onSetReminder}
            fullWidth
            sx={{ py: 1 }}
          >
            Set Renewal Reminder (Coming Soon)
          </Button>
        </Box>
      )}
    </Paper>
  );
}
