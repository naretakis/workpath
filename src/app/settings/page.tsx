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
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { db } from "@/lib/db";
import { UserProfile } from "@/types";

const US_STATES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedState, setEditedState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profiles = await db.profiles.toArray();
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleBackToTracking = () => {
    router.push("/tracking");
  };

  const handleEdit = () => {
    if (profile) {
      setEditedName(profile.name);
      setEditedState(profile.state);
      setEditing(true);
      setError(null);
      setSuccess(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setEditedName("");
    setEditedState("");
    setError(null);
  };

  const handleSave = async () => {
    if (!profile) return;

    // Validate
    if (!editedName.trim()) {
      setError("Name is required");
      return;
    }

    if (!editedState) {
      setError("State is required");
      return;
    }

    try {
      // Update profile in database
      await db.profiles.update(profile.id, {
        name: editedName.trim(),
        state: editedState,
      });

      // Update local state
      setProfile({
        ...profile,
        name: editedName.trim(),
        state: editedState,
      });

      setEditing(false);
      setSuccess(true);
      setError(null);

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
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
          Settings
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Profile updated successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Profile Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Profile</Typography>
          {!editing && profile && (
            <Button startIcon={<EditIcon />} onClick={handleEdit} size="small">
              Edit
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />
        {profile ? (
          editing ? (
            <Box>
              <TextField
                label="Name"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
                autoFocus
              />
              <TextField
                label="State"
                value={editedState}
                onChange={(e) => setEditedState(e.target.value)}
                select
                fullWidth
                sx={{ mb: 3 }}
              >
                {US_STATES.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  fullWidth
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                  fullWidth
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {profile.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>State:</strong> {profile.state}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(profile.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )
        ) : (
          <Typography variant="body2" color="text.secondary">
            No profile found
          </Typography>
        )}
      </Paper>

      {/* About Section */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          About WorkPath
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="text.secondary" paragraph>
          WorkPath helps you track work, volunteer, and education hours to meet
          Medicaid work requirements (80 hours/month).
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Version 1.0 - All data is stored locally on your device.
        </Typography>
      </Paper>
    </Container>
  );
}
