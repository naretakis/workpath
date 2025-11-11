"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import {
  Download as DownloadIcon,
  ArrowBack as ArrowBackIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { db } from "@/lib/db";
import { format } from "date-fns";

export default function ExportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activityCount, setActivityCount] = useState(0);
  const [profileExists, setProfileExists] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [incomeCount, setIncomeCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profiles = await db.profiles.toArray();
        const activities = await db.activities.toArray();
        const incomeEntries = await db.incomeEntries.toArray();
        setProfileExists(profiles.length > 0);
        setActivityCount(activities.length);
        setIncomeCount(incomeEntries.length);
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleExportJSON = async () => {
    try {
      // Get all data from database
      const profiles = await db.profiles.toArray();
      const activities = await db.activities.toArray();
      const incomeEntries = await db.incomeEntries.toArray();
      const exemptions = await db.exemptions.toArray();
      const complianceModes = await db.complianceModes.toArray();

      // Create export object
      const exportData = {
        exportDate: new Date().toISOString(),
        profile: profiles[0] || null,
        activities: activities,
        incomeEntries: incomeEntries,
        exemptions: exemptions,
        complianceModes: complianceModes,
        version: "2.0", // Updated version to include income data
      };

      // Convert to JSON
      const jsonString = JSON.stringify(exportData, null, 2);

      // Create blob and download
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hourkeep-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error exporting data:", error);
      setError("Failed to export data. Please try again.");
    }
  };

  const handleExportReadable = async () => {
    try {
      // Get all data from database
      const profiles = await db.profiles.toArray();
      const activities = await db.activities.toArray();
      const incomeEntries = await db.incomeEntries.toArray();
      const complianceModes = await db.complianceModes.toArray();

      const profile = profiles[0];

      // Create readable text format
      let textContent = "HOURKEEP COMPLIANCE REPORT\n";
      textContent += "=".repeat(50) + "\n\n";

      if (profile) {
        textContent += `Name: ${profile.name}\n`;
        textContent += `State: ${profile.state}\n`;
        textContent += `Report Date: ${format(new Date(), "MMMM d, yyyy")}\n\n`;
      }

      textContent += "=".repeat(50) + "\n\n";

      // Get all unique months from both activities and income entries
      const allMonths = new Set<string>();
      activities.forEach((a) => allMonths.add(a.date.substring(0, 7)));
      incomeEntries.forEach((i) => allMonths.add(i.date.substring(0, 7)));

      // Sort months
      const sortedMonths = Array.from(allMonths).sort().reverse();

      sortedMonths.forEach((month) => {
        // Get compliance mode for this month
        const modeRecord = complianceModes.find(
          (m) => m.month === month && m.userId === profile?.id,
        );
        const mode = modeRecord?.mode || "hours";

        textContent += `${format(new Date(month + "-01"), "MMMM yyyy")}\n`;
        textContent += `-`.repeat(50) + "\n";
        textContent += `Compliance Mode: ${mode === "hours" ? "Hours Tracking" : "Income Tracking"}\n\n`;

        if (mode === "hours") {
          // Hours tracking
          const monthActivities = activities.filter(
            (a) => a.date.substring(0, 7) === month,
          );
          const totalHours = monthActivities.reduce(
            (sum, a) => sum + a.hours,
            0,
          );
          const isCompliant = totalHours >= 80;

          textContent += `Total Hours: ${totalHours} / 80 ${isCompliant ? "✓ COMPLIANT" : "✗ NOT COMPLIANT"}\n\n`;

          if (monthActivities.length > 0) {
            const sortedActivities = [...monthActivities].sort((a, b) =>
              a.date.localeCompare(b.date),
            );

            sortedActivities.forEach((activity) => {
              textContent += `  ${format(new Date(activity.date + "T00:00:00"), "MMM d, yyyy")} - `;
              textContent += `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} - `;
              textContent += `${activity.hours} hours`;
              if (activity.organization) {
                textContent += ` - ${activity.organization}`;
              }
              textContent += "\n";
            });
          } else {
            textContent += "  No activities recorded\n";
          }
        } else {
          // Income tracking
          const monthIncomeEntries = incomeEntries.filter(
            (i) => i.date.substring(0, 7) === month,
          );
          const totalIncome = monthIncomeEntries.reduce(
            (sum, i) => sum + i.monthlyEquivalent,
            0,
          );
          const isCompliant = totalIncome >= 580;

          textContent += `Total Income: $${totalIncome.toFixed(2)} / $580.00 ${isCompliant ? "✓ COMPLIANT" : "✗ NOT COMPLIANT"}\n\n`;

          if (monthIncomeEntries.length > 0) {
            const sortedEntries = [...monthIncomeEntries].sort((a, b) =>
              a.date.localeCompare(b.date),
            );

            sortedEntries.forEach((entry) => {
              textContent += `  ${format(new Date(entry.date + "T00:00:00"), "MMM d, yyyy")} - `;
              textContent += `$${entry.amount.toFixed(2)} (${entry.payPeriod}) → $${entry.monthlyEquivalent.toFixed(2)}/month`;
              if (entry.source) {
                textContent += ` - ${entry.source}`;
              }
              textContent += "\n";
            });
          } else {
            textContent += "  No income entries recorded\n";
          }
        }

        textContent += "\n";
      });

      if (activities.length === 0 && incomeEntries.length === 0) {
        textContent += "No activities or income entries recorded yet.\n";
      }

      // Create blob and download
      const blob = new Blob([textContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hourkeep-report-${
        new Date().toISOString().split("T")[0]
      }.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error exporting readable format:", error);
      setError("Failed to export data. Please try again.");
    }
  };

  const handleBackToTracking = () => {
    router.push("/tracking");
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
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToTracking}
          sx={{ mb: 2 }}
        >
          Back to Tracking
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Export Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Download your activity data in different formats
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Export successful! Check your downloads folder.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Data Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Data
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body1" gutterBottom>
          <strong>Profile:</strong> {profileExists ? "Yes" : "No"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Activities:</strong> {activityCount} recorded
        </Typography>
        <Typography variant="body1">
          <strong>Income Entries:</strong> {incomeCount} recorded
        </Typography>
      </Paper>

      {/* JSON Export */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <DownloadIcon sx={{ mr: 1 }} />
          <Typography variant="h6">JSON Format</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          Export all your data as a JSON file. This format is best for:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="ul">
          <li>Backing up your data</li>
          <li>Importing into other systems</li>
          <li>Technical users who need raw data</li>
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExportJSON}
          fullWidth
          sx={{ mt: 2 }}
        >
          Download JSON
        </Button>
      </Paper>

      {/* Readable Text Export */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <DescriptionIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Download Report</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          Download a human-readable text report. This format is best for:
        </Typography>
        <Typography variant="body2" color="text.secondary" component="ul">
          <li>Submitting to your caseworker</li>
          <li>Printing for your records</li>
          <li>Easy-to-read monthly summaries</li>
        </Typography>
        <Button
          variant="contained"
          startIcon={<DescriptionIcon />}
          onClick={handleExportReadable}
          fullWidth
          sx={{ mt: 2 }}
        >
          Download Report
        </Button>
      </Paper>
    </Container>
  );
}
