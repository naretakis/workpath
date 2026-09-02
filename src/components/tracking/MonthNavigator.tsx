"use client";

import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Button,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import {
  compareMonths,
  formatMonthLong,
  nextMonth,
  previousMonth,
} from "@/lib/month";

interface MonthNavigatorProps {
  /** The month on screen, `YYYY-MM`. */
  month: string;
  /** The real current month, `YYYY-MM`. Passed in rather than read from the clock. */
  today: string;
  onMonthChange: (month: string) => void;
  /** Months the state may review, if the user has told us. Empty when unknown. */
  reviewPeriodMonths?: string[];
}

/**
 * The month being viewed, and how to change it.
 *
 * W5 (ADR-0005). This is the control that used to be buried inside `Calendar`, where
 * it changed the grid and nothing else.
 *
 * TWO THINGS IT DELIBERATELY DOES NOT DO.
 *
 * It does not hide or disable past months. ADR-0005 § 5 was reversed on validation
 * to say the retrospective case is the primary one: a past month can be improved,
 * not by working more hours but by finding evidence for hours already worked, which
 * is exactly what a 42 CFR 435.558 notice asks someone to do with about 35 days'
 * notice about months already gone.
 *
 * It does not disable future months either. Someone preparing for a January
 * application needs December, and someone logging hours as they go needs the month
 * they are in. Restricting navigation would assert something about which months
 * matter, and only the state knows that.
 */
export function MonthNavigator({
  month,
  today,
  onMonthChange,
  reviewPeriodMonths = [],
}: MonthNavigatorProps) {
  const comparison = compareMonths(month, today);
  const isCurrentMonth = comparison === 0;
  const isPast = comparison < 0;
  const inReviewPeriod = reviewPeriodMonths.includes(month);

  const previous = previousMonth(month);
  const upcoming = nextMonth(month);

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2 },
        // Past months are visually distinct, which is the acceptance criterion, but
        // distinct as a RECORD rather than as something disabled or degraded.
        borderLeft: "4px solid",
        borderLeftColor: isPast ? "secondary.main" : "primary.main",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <IconButton
          onClick={() => onMonthChange(previous)}
          aria-label={`Show ${formatMonthLong(previous)}`}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ textAlign: "center", minWidth: 0, flex: 1 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ fontSize: { xs: "1.05rem", sm: "1.25rem" }, lineHeight: 1.2 }}
          >
            {formatMonthLong(month)}
          </Typography>

          {/* Never colour alone: every state carries a word.
              component-standards.md, and WCAG 1.4.1. */}
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              justifyContent: "center",
              flexWrap: "wrap",
              mt: 0.5,
            }}
          >
            {isCurrentMonth ? (
              <Chip label="This month" size="small" color="primary" />
            ) : (
              <Chip
                label={isPast ? "Past month" : "Upcoming month"}
                size="small"
                variant="outlined"
              />
            )}
            {inReviewPeriod && (
              <Chip
                label="Your state may review this month"
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <IconButton
          onClick={() => onMonthChange(upcoming)}
          aria-label={`Show ${formatMonthLong(upcoming)}`}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {!isCurrentMonth && (
        <Box sx={{ mt: 1.5, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {isPast
              ? // Prompts for EVIDENCE, not for progress toward a threshold. "34
                // hours to go" is a target and is meaningless for a month that has
                // ended; "who can confirm it" is the thing that still helps.
                //
                // Names the month rather than saying "this month". Review caught
                // that: "this month" colloquially means the wall-clock month, which
                // is exactly the ambiguity this wave exists to remove, and it read
                // especially oddly directly under a chip saying "Past month".
                `You can still add hours you worked in ${formatMonthLong(month)}, or find proof for hours you already logged.`
              : `You can log hours for ${formatMonthLong(month)} as you go.`}
          </Typography>
          <Button
            size="small"
            onClick={() => onMonthChange(today)}
            sx={{ minHeight: 44 }}
          >
            Back to {formatMonthLong(today)}
          </Button>
        </Box>
      )}
    </Paper>
  );
}
