"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  Alert,
  IconButton,
  CircularProgress,
  Backdrop,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { Calendar } from "@/components/Calendar";
import { ActivityForm } from "@/components/ActivityForm";
import { ActivityList } from "@/components/ActivityList";
import { DateActivityMenu } from "@/components/DateActivityMenu";
import { Dashboard } from "@/components/Dashboard";
import { DuplicateActivityDialog } from "@/components/DuplicateActivityDialog";
import { db } from "@/lib/db";
import { Activity, MonthlySummary } from "@/types";
import { calculateMonthlySummary } from "@/lib/calculations";
import { format, startOfMonth, endOfMonth } from "date-fns";

export default function TrackingPage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentMonthActivities, setCurrentMonthActivities] = useState<
    Activity[]
  >([]);
  const [activeDates, setActiveDates] = useState<Set<string>>(new Set());
  const [dateHours, setDateHours] = useState<Map<string, number>>(new Map());
  const [dateActivityCount, setDateActivityCount] = useState<
    Map<string, number>
  >(new Map());
  const [selectedDateActivities, setSelectedDateActivities] = useState<
    Activity[]
  >([]);
  const [existingActivity, setExistingActivity] = useState<
    Activity | undefined
  >();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary>({
    month: format(new Date(), "yyyy-MM"),
    totalHours: 0,
    workHours: 0,
    volunteerHours: 0,
    educationHours: 0,
    isCompliant: false,
    hoursNeeded: 80,
  });
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [activityToDuplicate, setActivityToDuplicate] =
    useState<Activity | null>(null);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const allActivities = await db.activities.toArray();
      setActivities(allActivities);

      // Create set of dates that have activities
      const dates = new Set(allActivities.map((a) => a.date));
      setActiveDates(dates);

      // Calculate hours per date
      const hoursMap = new Map<string, number>();
      const countMap = new Map<string, number>();
      allActivities.forEach((activity) => {
        const current = hoursMap.get(activity.date) || 0;
        hoursMap.set(activity.date, current + activity.hours);

        const currentCount = countMap.get(activity.date) || 0;
        countMap.set(activity.date, currentCount + 1);
      });
      setDateHours(hoursMap);
      setDateActivityCount(countMap);

      // Filter activities for current month
      const now = new Date();
      const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(now), "yyyy-MM-dd");
      const currentMonth = allActivities.filter(
        (a) => a.date >= monthStart && a.date <= monthEnd,
      );
      setCurrentMonthActivities(currentMonth);

      // Calculate monthly summary
      const summary = calculateMonthlySummary(allActivities);
      setMonthlySummary(summary);
    } catch (err) {
      console.error("Error loading activities:", err);
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  // Load activities on mount - this is intentional initialization
  useEffect(() => {
    loadActivities();
  }, []);

  const handleDateClick = async (
    date: Date,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    setSelectedDate(date);

    // Get activities for this date
    const dateStr = format(date, "yyyy-MM-dd");
    const dateActivities = activities.filter((a) => a.date === dateStr);
    setSelectedDateActivities(dateActivities);

    // Open menu to choose action
    setMenuAnchor(event.currentTarget);
  };

  const handleAddNewActivity = () => {
    setExistingActivity(undefined);
    setFormOpen(true);
  };

  const handleEditActivity = (activity: Activity) => {
    const date = new Date(activity.date + "T00:00:00");
    setSelectedDate(date);
    setExistingActivity(activity);
    setFormOpen(true);
  };

  const handleDeleteActivityFromList = async (activity: Activity) => {
    if (!activity.id) return;

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    setSaving(true);
    try {
      await db.activities.delete(activity.id);
      await loadActivities();
      setError(null);
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError("Failed to delete activity. Please try again.");
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
      } else {
        // Create new activity and return its ID
        activityId = await db.activities.add({
          ...activityData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Reload activities
      await loadActivities();
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
      await db.activities.delete(existingActivity.id);
      await loadActivities();
      setError(null);
    } catch (err) {
      console.error("Error deleting activity:", err);
      setError("Failed to delete activity. Please try again.");
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
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" } }}
          >
            Activity Tracking
          </Typography>
          <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
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

        <Box sx={{ mt: 3 }}>
          <Dashboard summary={monthlySummary} />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Calendar
            onDateClick={handleDateClick}
            activeDates={activeDates}
            dateHours={dateHours}
            dateActivityCount={dateActivityCount}
          />
        </Box>

        <Box sx={{ mt: 3 }}>
          <ActivityList
            activities={currentMonthActivities}
            onEdit={handleEditActivity}
            onDelete={handleDeleteActivityFromList}
            onDuplicate={handleDuplicateActivity}
          />
        </Box>

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
