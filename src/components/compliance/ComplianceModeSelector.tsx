"use client";

import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { HelpOutline as HelpIcon } from "@mui/icons-material";
import { useState } from "react";

interface ComplianceModeSelectorProps {
  currentMode: "hours" | "income";
  currentMonth: string; // YYYY-MM format
  onModeChange: (mode: "hours" | "income") => void;
  disabled?: boolean;
}

export function ComplianceModeSelector({
  currentMode,
  currentMonth: _currentMonth,
  onModeChange,
  disabled = false,
}: ComplianceModeSelectorProps) {
  const [showWarning, setShowWarning] = useState(false);
  const [pendingMode, setPendingMode] = useState<"hours" | "income" | null>(
    null,
  );

  const handleModeClick = (
    _event: React.MouseEvent<HTMLElement>,
    newMode: "hours" | "income" | null,
  ) => {
    if (newMode === null || newMode === currentMode) {
      return;
    }

    // Show warning dialog before switching
    setPendingMode(newMode);
    setShowWarning(true);
  };

  const handleConfirmSwitch = () => {
    if (pendingMode) {
      onModeChange(pendingMode);
    }
    setShowWarning(false);
    setPendingMode(null);
  };

  const handleCancelSwitch = () => {
    setShowWarning(false);
    setPendingMode(null);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          justifyContent: "center",
          mb: 2,
        }}
      >
        <ToggleButtonGroup
          value={currentMode}
          exclusive
          onChange={handleModeClick}
          aria-label="compliance tracking mode"
          disabled={disabled}
          sx={{
            "& .MuiToggleButton-root": {
              px: { xs: 2, sm: 3 },
              py: 1,
              fontSize: { xs: "0.875rem", sm: "1rem" },
            },
          }}
        >
          <ToggleButton value="hours" aria-label="track hours">
            Track Hours
          </ToggleButton>
          <ToggleButton value="income" aria-label="track income">
            Track Income
          </ToggleButton>
        </ToggleButtonGroup>

        <Tooltip
          title="You can choose to track either hours OR income each month. Either method counts toward meeting work requirements."
          arrow
        >
          <IconButton size="small" aria-label="help with compliance modes">
            <HelpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Warning Dialog */}
      <Dialog
        open={showWarning}
        onClose={handleCancelSwitch}
        aria-labelledby="mode-switch-warning-title"
        aria-describedby="mode-switch-warning-description"
      >
        <DialogTitle id="mode-switch-warning-title">
          Switch Tracking Mode?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="mode-switch-warning-description">
            {pendingMode === "income" ? (
              <>
                You&apos;re about to switch from tracking hours to tracking
                income for this month.
                <br />
                <br />
                Your hours data will be preserved, but only your income will
                count toward compliance while in income mode.
              </>
            ) : (
              <>
                You&apos;re about to switch from tracking income to tracking
                hours for this month.
                <br />
                <br />
                Your income data will be preserved, but only your hours will
                count toward compliance while in hours mode.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSwitch} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmSwitch} variant="contained" autoFocus>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
