"use client";

import { Box, Typography, Switch, Chip } from "@mui/material";
import { HelpTooltip } from "@/components/help/HelpTooltip";

interface SeasonalWorkerToggleProps {
  isSeasonalWorker: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}

export function SeasonalWorkerToggle({
  isSeasonalWorker,
  onToggle,
  disabled = false,
}: SeasonalWorkerToggleProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1.5,
        px: { xs: 2, sm: 3 },
        bgcolor: isSeasonalWorker ? "info.lighter" : "transparent",
        borderRadius: 1,
        transition: "background-color 0.2s ease-in-out",
      }}
    >
      {/* Left side: Label and description */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                color: "text.primary",
              }}
            >
              I&apos;m a seasonal worker
            </Typography>
            <HelpTooltip
              title="Seasonal Worker Status"
              // W2a § 2.3. The old text imposed a test the rule does not contain:
              // "work is typically available for 6 months or less per year".
              // "Seasonal worker" is defined by 26 U.S.C. 45R(d)(5)(B) — labour
              // performed on a seasonal basis as the Secretary of Labor defines it
              // (29 CFR 500.20(s)(1)), INCLUDING retail workers employed
              // exclusively during holiday seasons. rule-extract.md § 2.7 records
              // that those two are inclusive EXAMPLES, not a closed test, and that
              // the IFC sets no verification rule for seasonal-worker status. The
              // invented months-per-year threshold was restrictive in the
              // user-hostile direction.
              //
              // The averaging window itself (6 months PRECEDING the assessed
              // month, excluding it) is arithmetic and belongs to W7a.
              content="If your work comes and goes with the season, your state can look at your average monthly income over 6 months instead of a single month. There's no fixed number of months you have to be out of work to qualify, and the list of seasonal jobs isn't closed — if your work is seasonal, say so and ask your state."
              examples={[
                "Farm work (harvest seasons)",
                "Holiday retail (November-December)",
                "Summer tourism (May-September)",
                "Ski resort work (winter months)",
                "Fishing industry (seasonal catches)",
              ]}
              ariaLabel="Help for seasonal worker status"
              size="small"
              color="default"
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              display: "block",
            }}
          >
            {isSeasonalWorker
              ? "Using 6-month income average"
              : "Use 6-month income average instead of monthly"}
          </Typography>
        </Box>
      </Box>

      {/* Right side: Switch and chip */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isSeasonalWorker && (
          <Chip
            label="Active"
            size="small"
            color="info"
            sx={{
              height: 24,
              fontSize: "0.75rem",
            }}
          />
        )}
        <Switch
          checked={isSeasonalWorker}
          onChange={(e) => onToggle(e.target.checked)}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
}
