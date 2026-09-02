"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Alert,
  IconButton,
  CircularProgress,
  Backdrop,
  Fab,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Download as DownloadIcon,
  HelpOutline as HelpOutlineIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { Calendar } from "@/components/Calendar";
import { ActivityForm } from "@/components/ActivityForm";
import { ActivityList } from "@/components/ActivityList";
import { DateActivityMenu } from "@/components/DateActivityMenu";
import { Dashboard } from "@/components/Dashboard";
import { DuplicateActivityDialog } from "@/components/DuplicateActivityDialog";

import { AssessmentBadge } from "@/components/assessment/AssessmentBadge";
import { DashboardGuidance } from "@/components/help/DashboardGuidance";
import { RequirementFacts } from "@/components/help/RequirementFacts";
import { ComplianceModeSelector } from "@/components/compliance/ComplianceModeSelector";
import { IncomeDashboard } from "@/components/income/IncomeDashboard";
import { CompletionMessage } from "@/components/tracking/CompletionMessage";
import { db } from "@/lib/db";
import { Activity, MonthlySummary, UserProfile } from "@/types";
import { AssessmentResult } from "@/types/assessment";
import { calculateMonthlySummary } from "@/lib/calculations";
import { deleteActivityWithDocuments } from "@/lib/storage/activities";
import { getLatestAssessmentResult } from "@/lib/storage/assessment";
import {
  getStoredComplianceMode,
  setComplianceMode,
  getSeasonalWorkerStatus,
  setSeasonalWorkerStatus,
} from "@/lib/storage/income";
import { updateProfile } from "@/lib/storage/profile";
import { currentMonth } from "@/lib/month";
import {
  applicationReviewPeriod,
  renewalReviewPeriodEndingAt,
  FEDERAL_DEFAULT_REVIEW_PERIOD,
  includesMonth,
  monthsInReviewPeriod,
  monthsRequiredFor,
  type ReviewPeriod,
} from "@/lib/reviewPeriod";
import { MonthNavigator } from "@/components/tracking/MonthNavigator";
import { ReviewPeriodPanel } from "@/components/tracking/ReviewPeriodPanel";
import { format, parseISO } from "date-fns";

export default function TrackingPage() {
  const router = useRouter();
  /**
   * THE MONTH BEING LOOKED AT. One value, at page level, passed down — ADR-0005's
   * first decision, and the reason this wave exists.
   *
   * Before W5 there was no such state. `Calendar` owned `useState(new Date())` and
   * never told anyone, while the summary, activity list, income view and both
   * per-month toggles each re-derived "now" independently, six of them via
   * `format(new Date(), "yyyy-MM")` and one via UTC. So paging the calendar to
   * March let you log March hours into a page that went on reporting today, and the
   * hours looked as though they had vanished.
   *
   * `currentMonth()` is the initial value and the only wall-clock read left in this
   * file; `src/__tests__/no-wall-clock-month.test.ts` enforces that.
   */
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    currentMonth(),
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDateActivities, setSelectedDateActivities] = useState<
    Activity[]
  >([]);
  const [existingActivity, setExistingActivity] = useState<
    Activity | undefined
  >();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [activityToDuplicate, setActivityToDuplicate] =
    useState<Activity | null>(null);

  const [assessmentResult, setAssessmentResult] =
    useState<AssessmentResult | null>(null);
  const [complianceMode, setComplianceModeState] = useState<"hours" | "income">(
    "hours",
  );
  const [userId, setUserId] = useState<string>("");
  const [isSeasonalWorker, setIsSeasonalWorker] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  /**
   * DERIVED, NOT STATE. Five `useState` hooks used to hold these — the monthly
   * summary, the month's activities, and the three per-date maps — written by the
   * loader and therefore correct only when the loader was.
   *
   * Making them derivations is what actually satisfies "selecting any month updates
   * the summary, activity list, income view and status together": they cannot
   * disagree with `selectedMonth`, because they are functions of it. The React
   * Compiler is on, so no memoisation is needed
   * (`.kiro/steering/component-standards.md`).
   */
  const monthlySummary: MonthlySummary = calculateMonthlySummary(
    activities,
    selectedMonth,
  );

  const monthActivities = activities.filter((activity) =>
    activity.date.startsWith(selectedMonth),
  );

  // Deliberately across ALL months, not just the selected one: the grid shows
  // padding days from the neighbouring months and should mark activity on them.
  const activeDates = new Set(activities.map((a) => a.date));
  const dateHours = new Map<string, number>();
  const dateActivityCount = new Map<string, number>();
  for (const activity of activities) {
    dateHours.set(
      activity.date,
      (dateHours.get(activity.date) || 0) + activity.hours,
    );
    dateActivityCount.set(
      activity.date,
      (dateActivityCount.get(activity.date) || 0) + 1,
    );
  }

  /**
   * The review period, when the user has told us what to measure from.
   *
   * `undefined` is a real and common answer, and the UI says so rather than
   * guessing. See `ReviewPeriodAnchor` for why nothing is inferred from the notice
   * deadline.
   */
  const anchor = userProfile?.onboardingContext?.reviewPeriodAnchor;
  const monthsRequiredFromNotice =
    userProfile?.onboardingContext?.monthsRequired;

  const bounds = FEDERAL_DEFAULT_REVIEW_PERIOD.applicationLookbackBounds;

  /**
   * Whether the notice figure exceeds what § 435.556(a)(1) allows at application.
   *
   * Surfaced to the user rather than clamped in silence. Review caught this: a
   * notice saying 4, 5 or 6 months with "I'm applying" selected was quietly shown a
   * 3-month period, and under-scoping is the direction that costs someone coverage —
   * they gather no evidence for a month the state is assessing. It also contradicted
   * the panel's own promise two components away, "We don't know yet, and we won't
   * guess."
   */
  const noticeExceedsApplicationBounds =
    anchor?.kind === "application" &&
    monthsRequiredFromNotice !== undefined &&
    monthsRequiredFromNotice > bounds.max;

  let reviewPeriod: ReviewPeriod | undefined;
  /**
   * A stored anchor can be malformed — `<input type="month">` is a real widget in
   * Chromium but falls back to a free-text field in Firefox, and the value is
   * persisted before it is ever parsed. The constructors below throw on anything
   * that is not strict `YYYY-MM`, and this runs in the RENDER BODY of a page with no
   * error boundary anywhere in `src/`, so an unparseable value would blank the
   * tracking page on every load — including the page holding the only control that
   * could clear it.
   *
   * The write side now validates too (`ReviewPeriodPanel`), but both ends need it:
   * validation stops bad values arriving, and this stops a value that arrived some
   * other way from being unrecoverable. Degrading to "we don't know" is the same
   * state as never having set an anchor, which the UI already handles well.
   */
  try {
    if (anchor?.kind === "application") {
      reviewPeriod = applicationReviewPeriod(anchor.month, {
        ...FEDERAL_DEFAULT_REVIEW_PERIOD,
        applicationLookbackMonths: Math.min(
          Math.max(monthsRequiredFromNotice ?? bounds.min, bounds.min),
          bounds.max,
        ),
      });
    } else if (anchor?.kind === "renewal") {
      reviewPeriod = renewalReviewPeriodEndingAt(anchor.month, {
        ...FEDERAL_DEFAULT_REVIEW_PERIOD,
        renewalMonthsRequired:
          monthsRequiredFromNotice ??
          FEDERAL_DEFAULT_REVIEW_PERIOD.renewalMonthsRequired,
      });
    }
  } catch (err) {
    console.error("Stored review period is unusable, ignoring it:", err);
    reviewPeriod = undefined;
  }

  const reviewPeriodMonths = reviewPeriod
    ? monthsInReviewPeriod(reviewPeriod)
    : [];

  /**
   * Hours logged per month of the review period.
   *
   * Replaces `monthlyCompliance`, a `Map<string, boolean>` that held exactly one
   * entry — the wall-clock month — under the comment "For now, just check current
   * month". That made `CompletionMessage` unreachable for five of the six valid
   * `monthsRequired` values, by construction rather than by data.
   *
   * Carries HOURS rather than a boolean deliberately. The old map stored
   * `summary.isCompliant`, and `engineering-standards.md` is explicit that
   * "`isCompliant: boolean` is a verdict regardless of what renders it". W7b renames
   * that field; building new code on it would have widened what W7b has to unpick.
   */
  const reviewPeriodHours = reviewPeriodMonths.map((month) => ({
    month,
    totalHours: calculateMonthlySummary(activities, month).totalHours,
  }));

  /**
   * The monthly hours threshold, WITHOUT writing the number down.
   *
   * `hoursNeeded` for a month with no activities *is* the threshold, so this reads it
   * out of the compliance module rather than restating it. ADR-0001 forbids policy
   * literals outside `src/lib/policy/`, which does not exist until W2b — and a
   * literal `80` here would be one more site for W2b to find. When W2b injects the
   * threshold, this picks the new value up with no edit.
   */
  const monthlyThreshold = calculateMonthlySummary(
    [],
    selectedMonth,
  ).hoursNeeded;

  /**
   * The real current month, read once and passed down.
   *
   * Components get it as a prop rather than calling `currentMonth()` themselves, so
   * every part of the page agrees about what "this month" means even across a
   * midnight boundary, and so they stay testable without a fake clock.
   */
  const todayMonth = currentMonth();

  /**
   * Everything that does not depend on which month is selected.
   *
   * Split from the per-month reads below, and the split is why paging a month is
   * instant and does not flash the full-page spinner: the profile, the assessment
   * and the whole activity list are month-independent, and the month-scoped values
   * are now derivations rather than fetches.
   */
  const loadActivities = React.useCallback(async () => {
    try {
      setLoading(true);

      // Check if profile exists - route guard
      const profiles = await db.profiles.toArray();
      if (profiles.length === 0) {
        // No profile exists, redirect to onboarding
        router.push("/onboarding");
        return;
      }

      setActivities(await db.activities.toArray());

      const profile = profiles[0];
      setUserId(profile.id);
      setUserProfile(profile);

      const assessment = await getLatestAssessmentResult(profile.id);
      setAssessmentResult(assessment || null);
    } catch (err) {
      console.error("Error loading activities:", err);
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Load activities on mount and listen for updates
  useEffect(() => {
    loadActivities();

    // Listen for custom event to reload activities (for batch saves)
    const handleActivitiesUpdated = () => {
      loadActivities();
    };

    // Listen for assessment completion event
    const handleAssessmentCompleted = () => {
      loadActivities(); // Reload to get updated assessment
    };

    window.addEventListener("activities-updated", handleActivitiesUpdated);
    window.addEventListener("assessment-completed", handleAssessmentCompleted);

    return () => {
      window.removeEventListener("activities-updated", handleActivitiesUpdated);
      window.removeEventListener(
        "assessment-completed",
        handleAssessmentCompleted,
      );
    };
  }, [loadActivities]);

  /**
   * The two genuinely per-month reads: `complianceModes` and `seasonalWorkerStatus`
   * are both stored per user per month, so changing month changes which row applies.
   *
   * The compliance mode uses `getStoredComplianceMode`, which returns `undefined`
   * when the month has no row, rather than `getComplianceMode`, which returns
   * "hours". That distinction is the difference between leaving the view as the user
   * left it and silently flipping someone tracking income into hours tracking the
   * moment they page to a month they have not opened before — with their income
   * entries apparently gone and nothing on screen explaining why.
   */
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    (async () => {
      try {
        const [storedMode, seasonal] = await Promise.all([
          getStoredComplianceMode(userId, selectedMonth),
          getSeasonalWorkerStatus(userId, selectedMonth),
        ]);
        if (cancelled) return;
        // Only follow a stored preference. No row means "no preference expressed
        // for this month", so keep showing whatever the user is already looking at.
        if (storedMode) setComplianceModeState(storedMode);
        setIsSeasonalWorker(seasonal);
      } catch (err) {
        console.error("Error loading month settings:", err);
        if (!cancelled) {
          setError(
            `Could not load your settings for ${selectedMonth}. Your logged hours are unaffected.`,
          );
        }
      }
    })();

    return () => {
      // Paging quickly must not let an earlier month's response land last.
      cancelled = true;
    };
  }, [userId, selectedMonth]);

  const handleDateClick = async (
    dateStr: string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    // `Calendar` now hands over a YYYY-MM-DD string rather than a Date, so the
    // records and the grid speak the same language and nobody reparses. The one
    // place a Date is still needed is `ActivityForm`, whose props W6a rewrites;
    // `parseISO` is the local-time parse (unlike `new Date("2026-07-01")`, which is
    // UTC) and is already the idiom in DuplicateActivityDialog.
    setSelectedDate(parseISO(dateStr));

    const dateActivities = activities.filter((a) => a.date === dateStr);
    setSelectedDateActivities(dateActivities);

    // Open menu to choose action
    setMenuAnchor(event.currentTarget);
  };

  /**
   * Paging the month.
   *
   * Also closes the date menu: it is anchored to a cell that is about to be
   * replaced by a different date, and leaving it open would attach yesterday's
   * activity list to a new month's grid.
   */
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    setMenuAnchor(null);
    setSelectedDateActivities([]);
  };

  /** Record what the review period is measured from. Persisted on the profile. */
  const handleAnchorChange = async (
    kind: "application" | "renewal",
    month: string,
  ) => {
    if (!userProfile) return;
    try {
      const nextContext = {
        ...userProfile.onboardingContext,
        reviewPeriodAnchor: { kind, month },
      };
      await updateProfile(userProfile.id, { onboardingContext: nextContext });
      setUserProfile({ ...userProfile, onboardingContext: nextContext });
      setError(null);
    } catch (err) {
      console.error("Error saving review period:", err);
      setError("Could not save your review period. Please try again.");
    }
  };

  const handleClearAnchor = async () => {
    if (!userProfile) return;
    try {
      const nextContext = { ...userProfile.onboardingContext };
      delete nextContext.reviewPeriodAnchor;
      await updateProfile(userProfile.id, { onboardingContext: nextContext });
      setUserProfile({ ...userProfile, onboardingContext: nextContext });
      setError(null);
    } catch (err) {
      console.error("Error clearing review period:", err);
      setError("Could not update your review period. Please try again.");
    }
  };

  const handleAddNewActivity = () => {
    setExistingActivity(undefined);
    setFormOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    // Was `new Date(activity.date + "T00:00:00")` — a hand-rolled local parse that
    // worked, but was a third idiom for the same operation in one codebase.
    // `parseISO` is what DuplicateActivityDialog already uses.
    setSelectedDate(parseISO(activity.date));
    setExistingActivity(activity);
    setFormOpen(true);
  };

  const handleDeleteActivityFromList = async (activity: Activity) => {
    if (!activity.id) return;

    // Get document count for confirmation message
    const { getDocumentsByActivity } = await import("@/lib/storage/documents");
    const documents = await getDocumentsByActivity(activity.id);
    const docCount = documents.length;

    // Confirm deletion with document warning
    const confirmMessage =
      docCount > 0
        ? `Are you sure you want to delete this activity?\n\nThis will also delete ${docCount} associated document${docCount > 1 ? "s" : ""}.`
        : "Are you sure you want to delete this activity?";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSaving(true);
    try {
      await deleteActivityWithDocuments(activity.id);
      await loadActivities();
      setError(null);
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError(
        "Failed to delete activity. Please try again. If the problem persists, some documents may need to be deleted manually.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveActivity = async (
    activityData: Omit<Activity, "id" | "createdAt" | "updatedAt">,
  ): Promise<number | void> => {
    try {
      setSaving(true);
      let activityId: number | undefined;

      if (existingActivity) {
        // Update existing activity
        await db.activities.update(existingActivity.id!, {
          ...activityData,
          updatedAt: new Date(),
        });
        activityId = existingActivity.id;

        // Reload activities for updates
        await loadActivities();
      } else {
        // Create new activity and return its ID
        activityId = await db.activities.add({
          ...activityData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Don't reload immediately for new activities - let the form handle batch reload
      }

      setError(null);

      // Return the activity ID for new activities
      return activityId;
    } catch (err) {
      console.error("Error saving activity:", err);
      setError("Failed to save activity");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteActivity = async () => {
    if (!existingActivity?.id) return;

    setSaving(true);
    try {
      await deleteActivityWithDocuments(existingActivity.id);
      await loadActivities();
      setError(null);
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError(
        "Failed to delete activity. Please try again. If the problem persists, some documents may need to be deleted manually.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedDate(null);
    setExistingActivity(undefined);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleDuplicateActivity = (activity: Activity) => {
    setActivityToDuplicate(activity);
    setDuplicateDialogOpen(true);
  };

  const handleDuplicateToMultipleDates = async (dates: string[]) => {
    if (!activityToDuplicate) return;

    setSaving(true);
    try {
      // Create a new activity for each selected date
      const newActivities = dates.map((date) => ({
        date,
        type: activityToDuplicate.type,
        hours: activityToDuplicate.hours,
        organization: activityToDuplicate.organization,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Add all activities to the database
      await db.activities.bulkAdd(newActivities);

      // Reload activities
      await loadActivities();
      setError(null);
    } catch (err) {
      console.error("Error duplicating activity:", err);
      setError("Failed to duplicate activity. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseDuplicateDialog = () => {
    setDuplicateDialogOpen(false);
    setActivityToDuplicate(null);
  };

  const handleExport = () => {
    router.push("/export");
  };

  const handleModeChange = async (mode: "hours" | "income") => {
    if (!userId) return;

    try {
      // Writes the month the user is LOOKING AT, not today. `complianceModes` is a
      // per-user-per-month table, so that is what the row means — but it also means
      // the control has to say which month it affects, which is why the selector
      // below is given `selectedMonth` rather than the wall clock.
      await setComplianceMode(userId, selectedMonth, mode);
      setComplianceModeState(mode);
    } catch (error) {
      console.error("Error changing compliance mode:", error);
      setError("Failed to change tracking mode. Please try again.");
    }
  };

  const handleSeasonalWorkerToggle = async (checked: boolean) => {
    if (!userId) return;

    try {
      await setSeasonalWorkerStatus(userId, selectedMonth, checked);
      setIsSeasonalWorker(checked);
    } catch (error) {
      console.error("Error updating seasonal worker status:", error);
      setError("Failed to update seasonal worker status. Please try again.");
    }
  };

  // `handleAddMonth` was deleted here. W0 § 0.4 listed it for deletion — "plus
  // tracking/page.tsx's handleAddMonth and the empty handleContinueTracking" — and it
  // survived that wave, still zero-caller and still raising an unused-variable
  // warning. Swept up because W5 rewrites this file and because the month navigator
  // above is now the actual answer to "show me another month", which is what the
  // dead function pretended to do by routing to Settings.

  const handleContinueTracking = () => {
    // Just close the completion message and continue tracking
    // In a full implementation, this might update a preference
  };

  const handleSetReminder = () => {
    // Placeholder for future reminder functionality
    alert("Renewal reminders will be available in a future update!");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={saving}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Box sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                component="svg"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                sx={{
                  width: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
                  height: { xs: "1.75rem", sm: "2.25rem", md: "2.5rem" },
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <path d="M12 6v6l3.644 1.822" />
                <path d="M16 19h6" />
                <path d="M19 16v6" />
                <path d="M21.92 13.267a10 10 0 1 0-8.653 8.653" />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
              >
                HourKeep
              </Typography>
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, ml: { xs: 5, sm: 5.5, md: 6 } }}
            >
              Keep your hours, keep your coverage
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
            <IconButton
              onClick={() => {
                // Call the global method to show and highlight the guidance
                if (
                  typeof window !== "undefined" &&
                  (window as Window & { showDashboardGuidance?: () => void })
                    .showDashboardGuidance
                ) {
                  (
                    window as Window & { showDashboardGuidance?: () => void }
                  ).showDashboardGuidance?.();
                } else {
                  // Fallback: reset and reload if method not available
                  localStorage.removeItem(
                    "hourkeep_dashboard_guidance_dismissed",
                  );
                  sessionStorage.removeItem(
                    "hourkeep_dashboard_guidance_collapsed",
                  );
                  window.location.reload();
                }
              }}
              aria-label="show help"
              size="large"
              title="Show help guide"
            >
              <HelpOutlineIcon />
            </IconButton>
            <IconButton
              onClick={handleExport}
              aria-label="export data"
              size="large"
            >
              <DownloadIcon />
            </IconButton>
            <IconButton
              onClick={() => router.push("/settings")}
              aria-label="settings"
              size="large"
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/*
          W2a § 2.3b: 42 CFR 435.559(c) renewal timing, 435.557(a)-(b) ex parte
          first, and the caution against a casual negative self-report. Placed
          above the tracking UI on purpose — a user who may not need to track
          anything should learn that before being shown a calendar.
        */}
        <Box sx={{ mt: 3 }}>
          <RequirementFacts initiallyCollapsed={false} />
        </Box>

        <Box sx={{ mt: 3 }}>
          <DashboardGuidance dismissible={true} />
        </Box>

        {/* Assessment Badge - replaces old exemption badge */}
        <Box sx={{ mt: 3 }}>
          <AssessmentBadge
            result={assessmentResult}
            onTakeAssessment={() => router.push("/how-to-hourkeep")}
            onViewDetails={() => router.push("/how-to-hourkeep/results")}
            onRetakeAssessment={() => router.push("/how-to-hourkeep")}
          />
        </Box>

        {/* Compliance Mode Selector - show for all users, but note exempt users don't need to track */}
        {/*
          W5: the month selector sits ABOVE everything month-scoped, because it
          governs all of it. Before this, the only month control was buried in the
          calendar further down the page and changed nothing but the grid.
        */}
        <Box sx={{ mt: 3 }}>
          <MonthNavigator
            month={selectedMonth}
            today={todayMonth}
            onMonthChange={handleMonthChange}
            reviewPeriodMonths={reviewPeriodMonths}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <ReviewPeriodPanel
            reviewPeriod={reviewPeriod}
            monthHours={reviewPeriodHours}
            monthlyThreshold={monthlyThreshold}
            pathway={complianceMode}
            noticeExceedsApplicationBounds={noticeExceedsApplicationBounds}
            selectedMonth={selectedMonth}
            todayMonth={todayMonth}
            onSelectMonth={handleMonthChange}
            onAnchorChange={handleAnchorChange}
            onClearAnchor={handleClearAnchor}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <ComplianceModeSelector
            currentMode={complianceMode}
            currentMonth={selectedMonth}
            onModeChange={handleModeChange}
          />
        </Box>

        {/* Hours Tracking UI */}
        {complianceMode === "hours" && (
          <>
            {/*
              W5: driven by the real review period rather than by a one-entry map of
              the wall-clock month. `monthsRequired` still gates it, because without
              a review period there is no "how many months" to report against.
            */}
            {reviewPeriod && (
              <Box sx={{ mt: 3 }}>
                <CompletionMessage
                  monthsAtOrOverThreshold={
                    reviewPeriodHours.filter(
                      (m) => m.totalHours >= monthlyThreshold,
                    ).length
                  }
                  monthsRequired={monthsRequiredFor(reviewPeriod)}
                  monthsInPeriod={reviewPeriodMonths.length}
                  monthlyThreshold={monthlyThreshold}
                  reviewPeriodKind={reviewPeriod.kind}
                  onExport={handleExport}
                  onContinueTracking={handleContinueTracking}
                  onSetReminder={handleSetReminder}
                />
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <Dashboard
                summary={monthlySummary}
                threshold={monthlyThreshold}
              />
            </Box>

            {/* Hour Log - moved up */}
            <Box sx={{ mt: 3 }}>
              <ActivityList
                activities={monthActivities}
                onEdit={handleEditActivity}
                onDelete={handleDeleteActivityFromList}
                onDuplicate={handleDuplicateActivity}
              />
            </Box>

            {/* Calendar - moved down */}
            <Box sx={{ mt: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  pb: 1,
                  borderBottom: "2px solid",
                  borderColor: "divider",
                }}
              >
                Calendar View
              </Typography>
              <Calendar
                month={selectedMonth}
                onMonthChange={handleMonthChange}
                onDateClick={handleDateClick}
                activeDates={activeDates}
                dateHours={dateHours}
                dateActivityCount={dateActivityCount}
                inReviewPeriod={
                  reviewPeriod
                    ? includesMonth(reviewPeriod, selectedMonth)
                    : undefined
                }
              />
            </Box>

            {/* Add Hours FAB */}
            <Fab
              color="primary"
              aria-label="add hours"
              onClick={handleAddNewActivity}
              sx={{
                position: "fixed",
                bottom: { xs: 16, sm: 24 },
                right: { xs: 16, sm: 24 },
              }}
            >
              <AddIcon />
            </Fab>
          </>
        )}

        {/* Income Tracking UI */}
        {complianceMode === "income" && userId && (
          <Box sx={{ mt: 3 }}>
            <IncomeDashboard
              userId={userId}
              currentMonth={selectedMonth}
              isSeasonalWorker={isSeasonalWorker}
              onSeasonalWorkerToggle={handleSeasonalWorkerToggle}
            />
          </Box>
        )}

        <DateActivityMenu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleCloseMenu}
          activities={selectedDateActivities}
          onAddNew={handleAddNewActivity}
          onEditActivity={handleEditActivity}
          onDuplicateActivity={handleDuplicateActivity}
          selectedDateStr={
            selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""
          }
        />

        <ActivityForm
          open={formOpen}
          onClose={handleCloseForm}
          onSave={handleSaveActivity}
          onDelete={existingActivity ? handleDeleteActivity : undefined}
          selectedDate={selectedDate}
          existingActivity={existingActivity}
        />

        <DuplicateActivityDialog
          open={duplicateDialogOpen}
          onClose={handleCloseDuplicateDialog}
          onDuplicate={handleDuplicateToMultipleDates}
          activity={activityToDuplicate}
        />
      </Box>
    </Container>
  );
}
