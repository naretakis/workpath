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
import { buildTextReport } from "@/lib/export/buildTextReport";

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

      // The report itself is built by a pure function in lib/export so it can be
      // asserted directly — see that module's header for why W2a extracted it.
      // The 80 and 580 literals below are the last two in this file and are
      // recorded in the W2a -> W2b policy-literal handoff table.
      const textContent = buildTextReport({
        profile: profiles[0],
        activities,
        incomeEntries,
        complianceModes,
        thresholds: { hours: 80, income: 580 },
      });

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
