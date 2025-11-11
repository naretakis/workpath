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
              content="If you work in an industry where work is typically available for 6 months or less per year, you can use a 6-month income average instead of just one month to meet work requirements."
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
