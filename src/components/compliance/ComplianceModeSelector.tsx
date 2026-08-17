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
          Change what this month shows?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="mode-switch-warning-description">
            {/*
              W2a § 2.6. Both branches used to say that "only your income" or
              "only your hours" would count. Neither is true of the rule:
              42 CFR 435.552(e)(1) requires states to determine hours per
              activity and ADD THEM TOGETHER, and 435.552(e)(2) lets a state
              credit income below the threshold AS work hours and combine that
              with other activities. CMS's worked example is $380 / $7.25 = up to
              52 hours, needing 28 more.

              So this control changes what HourKeep shows, not what counts. The
              selector is removed entirely in W7b; until then it must not state
              something false.
            */}
            {pendingMode === "income" ? (
              <>
                This switches what this month&apos;s summary shows from hours to
                income.
                <br />
                <br />
                Your hours stay saved and they still count. Your state adds
                different activities together, and it may be able to count
                income alongside them, so nothing is lost by switching the view.
              </>
            ) : (
              <>
                This switches what this month&apos;s summary shows from income
                to hours.
                <br />
                <br />
                Your income stays saved and it still counts. Your state adds
                different activities together, and it may be able to count
                income alongside hours, so nothing is lost by switching the
                view.
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
