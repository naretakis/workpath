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
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  FileDownload as FileDownloadIcon,
  Add as AddIcon,
} from "@mui/icons-material";
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
  showDeadlineField?: boolean; // Show deadline field for users with notices
  initialDeadline?: string; // Pre-fill deadline if already set
  showIntroduction?: boolean; // Show welcome message at the top
  onSkip?: (
    profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>; // Skip to dashboard without assessment
}

export function ProfileForm({
  onSave,
  privacyAcknowledgedAt,
  showDeadlineField = false,
  initialDeadline = "",
  showIntroduction = false,
  onSkip,
}: ProfileFormProps) {
  // Required fields
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Optional fields
  const [medicaidId, setMedicaidId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [deadline, setDeadline] = useState(initialDeadline);

  // Form state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [ageHint, setAgeHint] = useState<string | null>(null);
  const [isSkipping, setIsSkipping] = useState(false);

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

  const validateDeadline = (value: string): boolean => {
    if (value) {
      const deadlineDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (deadlineDate < today) {
        setErrors((prev) => ({
          ...prev,
          deadline: "Deadline must be in the future",
        }));
        return false;
      }
    }
    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { deadline, ...rest } = prev;
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

  const handleDeadlineChange = (value: string) => {
    setDeadline(value);
    validateDeadline(value);
  };

  const handleSkipClick = async () => {
    // Validate all required fields first
    const nameValid = validateName(name);
    const stateValid = validateState(state);
    const dobValid = validateDateOfBirth(dateOfBirth);
    const medicaidValid = validateMedicaidId(medicaidId);
    const phoneValid = validatePhone(phoneNumber);
    const emailValid = validateEmail(email);
    const deadlineValid = validateDeadline(deadline);

    if (
      !nameValid ||
      !stateValid ||
      !dobValid ||
      !medicaidValid ||
      !phoneValid ||
      !emailValid ||
      !deadlineValid
    ) {
      return;
    }

    setIsSkipping(true);
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

      // Call onSkip with profile data
      if (onSkip) {
        await onSkip(profile);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setErrors({
        submit:
          "We couldn't save your profile. Please check your information and try again.",
      });
      setSaving(false);
      setIsSkipping(false);
    }
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
    const deadlineValid = validateDeadline(deadline);

    if (
      !nameValid ||
      !stateValid ||
      !dobValid ||
      !medicaidValid ||
      !phoneValid ||
      !emailValid ||
      !deadlineValid
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
      {showIntroduction && (
        <Box sx={{ mb: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Welcome to HourKeep
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Keep your hours, and keep your coverage.
            </Typography>
          </Box>

          {/* How HourKeep Works */}
          <Paper
            sx={{
              p: 3,
              mb: 3,
              bgcolor: "primary.50",
              border: "1px solid",
              borderColor: "primary.200",
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Here&apos;s how HourKeep works:
            </Typography>

            <List sx={{ py: 0 }}>
              <ListItem sx={{ py: 2, alignItems: "flex-start" }}>
                <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <AddIcon sx={{ fontSize: 20, color: "white" }} />
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary="Log your hours or income"
                  secondary="Track work, volunteer, school, and training hours"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>

              <ListItem sx={{ py: 2, alignItems: "flex-start" }}>
                <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}>
                  <AssessmentIcon color="primary" sx={{ fontSize: 32 }} />
                </ListItemIcon>
                <ListItemText
                  primary="See your progress"
                  secondary="Know if you're meeting your requirements"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>

              <ListItem sx={{ py: 2, alignItems: "flex-start" }}>
                <ListItemIcon sx={{ minWidth: 48, mt: 0.5 }}>
                  <FileDownloadIcon color="primary" sx={{ fontSize: 32 }} />
                </ListItemIcon>
                <ListItemText
                  primary="Export when needed"
                  secondary="Generate reports to submit to your state"
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

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

        {showDeadlineField && (
          <TextField
            type="date"
            label="Response Deadline"
            value={deadline}
            onChange={(e) => handleDeadlineChange(e.target.value)}
            error={!!errors.deadline}
            helperText={
              errors.deadline ||
              (deadline
                ? `You have ${Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days to respond`
                : "When do you need to respond to your notice?")
            }
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: new Date().toISOString().split("T")[0],
            }}
            sx={{ mb: 2 }}
          />
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

      {showIntroduction && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="body1" color="text.secondary" paragraph>
            After setting up your profile, we&apos;ll ask a few questions to
            help you understand the easiest way to maintain your coverage.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The assessment takes about 5 minutes and will give you personalized
            recommendations.
          </Typography>
        </Paper>
      )}

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
          mb: onSkip ? 2 : 0,
        }}
      >
        {saving
          ? "Saving..."
          : showIntroduction
            ? "Start HourKeep Assessment"
            : "Complete Setup"}
      </Button>

      {onSkip && (
        <Button
          variant="outlined"
          fullWidth
          size="large"
          onClick={handleSkipClick}
          disabled={saving || !name.trim() || !state || !dateOfBirth}
          startIcon={isSkipping ? <CircularProgress size={20} /> : null}
          sx={{
            minHeight: 48,
            fontSize: "1.1rem",
          }}
        >
          {isSkipping ? "Saving..." : "Skip for Now"}
        </Button>
      )}
    </Box>
  );
}
