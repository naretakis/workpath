"use client";

import { Dialog, DialogContent, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { ExemptionScreening } from "@/types/exemptions";
import { ExemptionResults } from "./ExemptionResults";

interface ExemptionDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  screening: ExemptionScreening;
  onRescreen: () => void;
}

export function ExemptionDetailsDialog({
  open,
  onClose,
  screening,
  onRescreen,
}: ExemptionDetailsDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "90vh",
        },
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: "grey.500",
          zIndex: 1,
        }}
        aria-label="close"
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: 3 }}>
        <ExemptionResults
          result={screening.result}
          screeningDate={screening.screeningDate}
          onDone={onClose}
          onRescreen={onRescreen}
        />
      </DialogContent>
    </Dialog>
  );
}
