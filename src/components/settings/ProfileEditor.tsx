"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  Divider,
  Alert,
} from "@mui/material";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { UserProfile } from "@/types";
import {
  calculateAge,
  formatPhoneNumber,
  validatePhoneNumber,
} from "@/lib/validation/profile";
import { updateProfile } from "@/lib/storage/profile";

// US States
const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];

interface ProfileEditorProps {
  profile: UserProfile;
  onSave: () => void;
  onCancel: () => void;
}

export function ProfileEditor({
  profile,
  onSave,
  onCancel,
}: ProfileEditorProps) {
  // Initialize date of birth from profile
  const initialDateOfBirth = profile.dateOfBirth
    ? (() => {
        try {
          const date = new Date(profile.dateOfBirth);
          return date.toISOString().split("T")[0];
        } catch (error) {
          console.error("Error parsing date of birth:", error);
          return "";
        }
      })()
    : "";

  // Form fields
  const [name, setName] = useState(profile.name);
  const [state, setState] = useState(profile.state);
  const [dateOfBirth, setDateOfBirth] = useState(initialDateOfBirth);
  const [medicaidId, setMedicaidId] = useState(profile.medicaidId || "");
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber || "");
  const [email, setEmail] = useState(profile.email || "");

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, name: "Please enter your full name" }));
      return false;
    }
    if (value.length > 100) {
      setErrors((prev) => ({
        ...prev,
        name: "Name is too long. Please use 100 characters or less",
      }));
      return false;
    }
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, ...rest } = prev;
      return rest;
    });
    return true;
  };

  const validateState = (value: string): boolean => {
    if (!value) {
      setErrors((prev) => ({ ...prev, state: "Please select a state" }));
      return false;
    }
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { state, ...rest } = prev;
      return rest;
    });
    return true;
  };

  const validateDateOfBirth = (value: string): boolean => {
    if (!value) {
      setErrors((prev) => ({
        ...prev,
        dateOfBirth: "Please select your date of birth",
      }));
      return false;
    }

    const date = new Date(value);
    const age = calculateAge(date);

    if (age < 16) {
      setErrors((prev) => ({
        ...prev,
        dateOfBirth: "You must be at least 16 years old to use this app",
      }));
      return false;
    }

    if (age > 120) {
      setErrors((prev) => ({
        ...prev,
        dateOfBirth: "Please check your date of birth - it seems incorrect",
      }));
      return false;
    }

    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dateOfBirth, ...rest } = prev;
      return rest;
    });
    return true;
  };

  const validateMedicaidId = (value: string): boolean => {
    if (value && value.length > 50) {
      setErrors((prev) => ({
        ...prev,
        medicaidId: "Medicaid ID is too long. Please check and try again",
      }));
      return false;
    }
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { medicaidId, ...rest } = prev;
      return rest;
    });
    return true;
  };

  const validatePhone = (value: string): boolean => {
    if (value && !validatePhoneNumber(value)) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "Please enter a valid phone number (e.g., 555-123-4567)",
      }));
      return false;
    }
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { phoneNumber, ...rest } = prev;
      return rest;
    });
    return true;
  };

  const validateEmail = (value: string): boolean => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address (e.g., name@example.com)",
      }));
      return false;
    }
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...rest } = prev;
      return rest;
    });
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value) validateName(value);
  };

  const handleStateChange = (value: string) => {
    setState(value);
    if (value) validateState(value);
  };

  const handleDateOfBirthChange = (value: string) => {
    setDateOfBirth(value);
    if (value) validateDateOfBirth(value);
  };

  const handleMedicaidIdChange = (value: string) => {
    setMedicaidId(value);
    validateMedicaidId(value);
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    validatePhone(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameValid = validateName(name);
    const stateValid = validateState(state);
    const dobValid = validateDateOfBirth(dateOfBirth);
    const medicaidValid = validateMedicaidId(medicaidId);
    const phoneValid = validatePhone(phoneNumber);
    const emailValid = validateEmail(email);

    if (
      !nameValid ||
      !stateValid ||
      !dobValid ||
      !medicaidValid ||
      !phoneValid ||
      !emailValid
    ) {
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      // Update profile
      await updateProfile(profile.id, {
        name: name.trim(),
        state,
        dateOfBirth, // Will be encrypted by storage layer
        medicaidId: medicaidId.trim() || undefined,
        phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : undefined,
        email: email.trim() || undefined,
      });

      setSuccess(true);
      setSaving(false);

      // Call onSave after a brief delay to show success message
      setTimeout(() => {
        onSave();
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({
        submit:
          "We couldn't save your changes. Please check your information and try again.",
      });
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Edit Profile</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Profile updated successfully!
        </Alert>
      )}

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.submit}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
        {/* Required Fields */}
        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          required
          autoFocus
        />

        <TextField
          select
          label="State"
          value={state}
          onChange={(e) => handleStateChange(e.target.value)}
          error={!!errors.state}
          helperText={errors.state}
          fullWidth
          required
        >
          {US_STATES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          type="date"
          label="Date of Birth"
          value={dateOfBirth}
          onChange={(e) => handleDateOfBirthChange(e.target.value)}
          error={!!errors.dateOfBirth}
          helperText={errors.dateOfBirth}
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            max: new Date().toISOString().split("T")[0],
          }}
        />

        <Divider />

        {/* Optional Fields */}
        <Typography variant="caption" color="text.secondary">
          Optional Information
        </Typography>

        <TextField
          label="Medicaid ID"
          value={medicaidId}
          onChange={(e) => handleMedicaidIdChange(e.target.value)}
          error={!!errors.medicaidId}
          helperText={errors.medicaidId || "Optional"}
          fullWidth
        />

        <TextField
          label="Phone Number"
          value={phoneNumber}
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber || "Optional"}
          fullWidth
          placeholder="(555) 123-4567"
        />

        <TextField
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          error={!!errors.email}
          helperText={errors.email || "Optional"}
          fullWidth
          placeholder="your.email@example.com"
        />
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
          disabled={saving || !name.trim() || !state || !dateOfBirth}
          fullWidth
          sx={{ minHeight: 48 }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={onCancel}
          disabled={saving}
          fullWidth
          sx={{ minHeight: 48 }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
