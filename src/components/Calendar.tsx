"use client";

import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  styled,
} from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import {
  calendarGridDays,
  formatMonthLong,
  nextMonth,
  previousMonth,
} from "@/lib/month";

/**
 * A month grid, CONTROLLED by whoever renders it.
 *
 * W5 (ADR-0005). This component used to own `useState(new Date())` and page itself,
 * telling nobody. The visible symptom: you could move the calendar back to March,
 * log hours into March, and the summary, activity list and income view would all
 * stay on today — so the hours appeared to vanish. That is the bug the wave exists
 * to fix, and it could not be fixed inside this file, because the month has to live
 * where the sibling components can see it.
 *
 * All date arithmetic now comes from `@/lib/month`. This file imports nothing from
 * `date-fns`, which is enforced rather than merely intended:
 * `src/__tests__/no-wall-clock-month.test.ts` bans `startOfMonth`, `endOfMonth`,
 * `eachDayOfInterval` and `useState(new Date())` everywhere but `src/lib/month.ts`.
 */
interface CalendarProps {
  /** The month to display, `YYYY-MM`. Controlled — this component holds no month state. */
  month: string;
  /** Called with the new `YYYY-MM` when the user pages. */
  onMonthChange: (month: string) => void;
  /**
   * Called with a `YYYY-MM-DD` date string, not a `Date`.
   *
   * A string because that is what the grid and the stored records both use;
   * handing out a `Date` invited each caller to reparse it, and
   * `new Date("2026-07-01")` parses as UTC.
   */
  onDateClick: (date: string, event: React.MouseEvent<HTMLElement>) => void;
  activeDates?: Set<string>;
  /** `YYYY-MM-DD` to total hours logged that day. */
  dateHours?: Map<string, number>;
  /** `YYYY-MM-DD` to number of separate activities that day. */
  dateActivityCount?: Map<string, number>;
  /**
   * Whether the displayed month falls in the state's review period, when that is
   * known. Presentational only — the component decides nothing.
   */
  inReviewPeriod?: boolean;
}

const DayCell = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "isCurrentMonth" && prop !== "isToday" && prop !== "hasActivity",
})<{
  isCurrentMonth: boolean;
  isToday: boolean;
  hasActivity: boolean;
}>(({ theme, isCurrentMonth, isToday, hasActivity }) => ({
  aspectRatio: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: isCurrentMonth ? "pointer" : "default",
  borderRadius: theme.shape.borderRadius,
  position: "relative",
  opacity: isCurrentMonth ? 1 : 0.3,
  backgroundColor: isToday ? theme.palette.primary.main : "transparent",
  color: isToday ? theme.palette.primary.contrastText : "inherit",
  border: hasActivity ? `2px solid ${theme.palette.success.main}` : "none",
  "&:hover": isCurrentMonth
    ? {
        backgroundColor: isToday
          ? theme.palette.primary.dark
          : theme.palette.action.hover,
      }
    : {},
}));

export function Calendar({
  month,
  onMonthChange,
  onDateClick,
  activeDates = new Set(),
  dateHours = new Map(),
  dateActivityCount = new Map(),
  inReviewPeriod,
}: CalendarProps) {
  const days = calendarGridDays(month);
  const previous = previousMonth(month);
  const next = nextMonth(month);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Header with month navigation */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <IconButton
          onClick={() => onMonthChange(previous)}
          // Names the destination rather than the direction. "Previous month" tells
          // a screen-reader user nothing about where they will land, and this
          // control is the primary way to reach the months a state actually
          // assesses. component-standards.md requires a label on every icon-only
          // control; 44px is this project's touch-target standard (WCAG 2.2 AAA
          // SC 2.5.5) and the theme sets no minimum yet — that fix is W10's.
          aria-label={`Go to ${formatMonthLong(previous)}`}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {formatMonthLong(month)}
          </Typography>
          {inReviewPeriod && (
            <Chip
              label="In your review period"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>

        <IconButton
          onClick={() => onMonthChange(next)}
          aria-label={`Go to ${formatMonthLong(next)}`}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Weekday headers */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: { xs: 0.5, sm: 1 },
          mb: 1,
        }}
      >
        {weekDays.map((day) => (
          <Typography
            key={day}
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              fontWeight: "bold",
              color: "text.secondary",
              fontSize: { xs: "0.65rem", sm: "0.75rem" },
            }}
          >
            {day}
          </Typography>
        ))}
      </Box>

      {/* Calendar days */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: { xs: 0.5, sm: 1 },
        }}
      >
        {days.map((day) => {
          const hasActivity = activeDates.has(day.date);
          const hours = dateHours.get(day.date);
          const activityCount = dateActivityCount.get(day.date) || 0;

          return (
            <DayCell
              key={day.date}
              isCurrentMonth={day.inMonth}
              isToday={day.isToday}
              hasActivity={hasActivity}
              onClick={(e) => day.inMonth && onDateClick(day.date, e)}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: hasActivity ? 600 : 400 }}
              >
                {day.dayOfMonth}
              </Typography>
              {hasActivity && hours !== undefined && (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    color: day.isToday ? "inherit" : "success.main",
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  {hours}h
                  {activityCount > 1 && (
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.6rem",
                        ml: 0.25,
                        opacity: 0.7,
                      }}
                    >
                      ({activityCount})
                    </Typography>
                  )}
                </Typography>
              )}
            </DayCell>
          );
        })}
      </Box>
    </Paper>
  );
}
