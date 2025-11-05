"use client";

import { Box, Typography, Button, Divider } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { UserProfile } from "@/types";
import { calculateAge, formatPhoneNumber } from "@/lib/validation/profile";
import { format } from "date-fns";

interface ProfileDisplayProps {
  profile: UserProfile;
  onEdit: () => void;
}

export function ProfileDisplay({ profile, onEdit }: ProfileDisplayProps) {
  // Format date of birth with age
  const formatDateOfBirth = (dob: string): string => {
    try {
      const date = new Date(dob);
      const age = calculateAge(date);
      return `${format(date, "MMMM d, yyyy")} (${age} years old)`;
    } catch {
      return dob;
    }
  };

  // Get state name from code
  const getStateName = (code: string): string => {
    const states: Record<string, string> = {
      AL: "Alabama",
      AK: "Alaska",
      AZ: "Arizona",
      AR: "Arkansas",
      CA: "California",
      CO: "Colorado",
      CT: "Connecticut",
      DE: "Delaware",
      FL: "Florida",
      GA: "Georgia",
      HI: "Hawaii",
      ID: "Idaho",
      IL: "Illinois",
      IN: "Indiana",
      IA: "Iowa",
      KS: "Kansas",
      KY: "Kentucky",
      LA: "Louisiana",
      ME: "Maine",
      MD: "Maryland",
      MA: "Massachusetts",
      MI: "Michigan",
      MN: "Minnesota",
      MS: "Mississippi",
      MO: "Missouri",
      MT: "Montana",
      NE: "Nebraska",
      NV: "Nevada",
      NH: "New Hampshire",
      NJ: "New Jersey",
      NM: "New Mexico",
      NY: "New York",
      NC: "North Carolina",
      ND: "North Dakota",
      OH: "Ohio",
      OK: "Oklahoma",
      OR: "Oregon",
      PA: "Pennsylvania",
      RI: "Rhode Island",
      SC: "South Carolina",
      SD: "South Dakota",
      TN: "Tennessee",
      TX: "Texas",
      UT: "Utah",
      VT: "Vermont",
      VA: "Virginia",
      WA: "Washington",
      WV: "West Virginia",
      WI: "Wisconsin",
      WY: "Wyoming",
      DC: "District of Columbia",
    };
    return states[code] || code;
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Your Profile</Typography>
        <Button
          startIcon={<EditIcon />}
          onClick={onEdit}
          sx={{ minHeight: 44, minWidth: 44 }}
        >
          Edit
        </Button>
      </Box>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Name */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            Name
          </Typography>
          <Typography variant="body1">{profile.name}</Typography>
        </Box>

        {/* State */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            State
          </Typography>
          <Typography variant="body1">{getStateName(profile.state)}</Typography>
        </Box>

        {/* Date of Birth */}
        {profile.dateOfBirth && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              Date of Birth
            </Typography>
            <Typography variant="body1">
              {formatDateOfBirth(profile.dateOfBirth)}
            </Typography>
          </Box>
        )}

        {/* Medicaid ID */}
        {profile.medicaidId && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              Medicaid ID
            </Typography>
            <Typography variant="body1">{profile.medicaidId}</Typography>
          </Box>
        )}

        {/* Phone Number */}
        {profile.phoneNumber && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              Phone Number
            </Typography>
            <Typography variant="body1">
              {formatPhoneNumber(profile.phoneNumber)}
            </Typography>
          </Box>
        )}

        {/* Email */}
        {profile.email && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              Email
            </Typography>
            <Typography variant="body1">{profile.email}</Typography>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Metadata */}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.5 }}
          >
            Profile created:{" "}
            {format(new Date(profile.createdAt), "MMMM d, yyyy")}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block" }}
          >
            Last updated: {format(new Date(profile.updatedAt), "MMMM d, yyyy")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
