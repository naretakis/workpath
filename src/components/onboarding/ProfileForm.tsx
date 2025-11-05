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
import { UserProfile } from "@/types";
import {
  calculateAge,
  formatPhoneNumber,
  validatePhoneNumber,
} from "@/lib/validation/profile";

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

interface ProfileFormProps {
  onSave: (
    profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  privacyAcknowledgedAt: Date;
}

export function ProfileForm({
  onSave,
  privacyAcknowledgedAt,
}: ProfileFormProps) {
  // Required fields
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Optional fields
  const [medicaidId, setMedicaidId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [ageHint, setAgeHint] = useState<string | null>(null);

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
      setAgeHint(null);
      return false;
    }

    const date = new Date(value);
    const age = calculateAge(date);

    if (age < 16) {
      setErrors((prev) => ({
        ...prev,
        dateOfBirth: "You must be at least 16 years old to use this app",
      }));
      setAgeHint(null);
      return false;
    }

    if (age > 120) {
      setErrors((prev) => ({
        ...prev,
        dateOfBirth: "Please check your date of birth - it seems incorrect",
      }));
      setAgeHint(null);
      return false;
    }

    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { dateOfBirth, ...rest } = prev;
      return rest;
    });

    // Show age exemption hint for users 65+
    if (age >= 65) {
      setAgeHint(
        "Good news! You may be exempt from work requirements due to your age. Check the exemption screening after setup.",
      );
    } else {
      setAgeHint(null);
    }

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

    // Validate all required fields
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

    try {
      const profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt"> = {
        name: name.trim(),
        state,
        dateOfBirth, // Will be encrypted by storage layer
        medicaidId: medicaidId.trim() || undefined,
        phoneNumber: phoneNumber ? formatPhoneNumber(phoneNumber) : undefined,
        email: email.trim() || undefined,
        privacyNoticeAcknowledged: true,
        privacyNoticeAcknowledgedAt: privacyAcknowledgedAt,
        version: 2,
      };

      await onSave(profile);
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors({
        submit:
          "We couldn't save your profile. Please check your information and try again.",
      });
      setSaving(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        padding: 3,
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <Typography
        variant="h5"
        component="h2"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Set Up Your Profile
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This information helps personalize your experience and can be included
        in exports.
      </Typography>

      {errors.submit && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.submit}
        </Alert>
      )}

      {/* Required Information Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            display: "block",
            mb: 2,
          }}
        >
          Required Information
        </Typography>

        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          fullWidth
          required
          sx={{ mb: 2 }}
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
          sx={{ mb: 2 }}
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
          helperText={errors.dateOfBirth || "Used to check age exemptions"}
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{
            max: new Date().toISOString().split("T")[0],
          }}
          sx={{ mb: 2 }}
        />

        {ageHint && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {ageHint}
          </Alert>
        )}
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Optional Information Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          sx={{
            fontWeight: 600,
            color: "text.secondary",
            display: "block",
            mb: 1,
          }}
        >
          Optional Information
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These fields are optional but can be helpful for agency submissions.
        </Typography>

        <TextField
          label="Medicaid ID"
          value={medicaidId}
          onChange={(e) => handleMedicaidIdChange(e.target.value)}
          error={!!errors.medicaidId}
          helperText={errors.medicaidId || "Optional - varies by state"}
          fullWidth
          sx={{ mb: 2 }}
        />

        <TextField
          label="Phone Number"
          value={phoneNumber}
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber || "Optional - e.g., (555) 123-4567"}
          fullWidth
          sx={{ mb: 2 }}
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
          sx={{ mb: 2 }}
          placeholder="your.email@example.com"
        />
      </Box>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={saving || !name.trim() || !state || !dateOfBirth}
        startIcon={saving ? <CircularProgress size={20} /> : null}
        sx={{
          minHeight: 48,
          fontSize: "1.1rem",
        }}
      >
        {saving ? "Saving..." : "Complete Setup"}
      </Button>
    </Box>
  );
}
