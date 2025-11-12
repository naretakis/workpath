"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  TextField,
} from "@mui/material";
import { IncomeEntry } from "@/types/income";
import { formatCurrency } from "@/lib/utils/payPeriodConversion";
import { format } from "date-fns";

interface DuplicateIncomeDialogProps {
  open: boolean;
  onClose: () => void;
  onDuplicate: (dates: string[]) => void;
  entry: IncomeEntry | null;
}

export function DuplicateIncomeDialog({
  open,
  onClose,
  onDuplicate,
  entry,
}: DuplicateIncomeDialogProps) {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");

  const handleAddDate = () => {
    if (newDate && !selectedDates.includes(newDate)) {
      setSelectedDates([...selectedDates, newDate]);
      setNewDate("");
    }
  };

  const handleRemoveDate = (date: string) => {
    setSelectedDates(selectedDates.filter((d) => d !== date));
  };

  const handleDuplicate = () => {
    if (selectedDates.length > 0) {
      onDuplicate(selectedDates);
      setSelectedDates([]);
      setNewDate("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedDates([]);
    setNewDate("");
    onClose();
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Duplicate Income Entry</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            You&apos;re duplicating:
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "grey.200",
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              {formatCurrency(entry.amount)} ({entry.payPeriod})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monthly equivalent: {formatCurrency(entry.monthlyEquivalent)}
            </Typography>
            {entry.source && (
              <Typography variant="body2" color="text.secondary">
                {entry.source}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Select dates to duplicate to:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              size="small"
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <Button
              onClick={handleAddDate}
              variant="outlined"
              disabled={!newDate}
            >
              Add
            </Button>
          </Box>

          {selectedDates.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {selectedDates.map((date) => (
                <Chip
                  key={date}
                  label={format(new Date(date + "T00:00:00"), "MMM d, yyyy")}
                  onDelete={() => handleRemoveDate(date)}
                  size="small"
                />
              ))}
            </Box>
          )}
        </Box>

        {selectedDates.length > 0 && (
          <Box
            sx={{
              p: 2,
              bgcolor: "info.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "info.200",
            }}
          >
            <Typography variant="body2" color="info.main">
              This will create <strong>{selectedDates.length}</strong> new{" "}
              {selectedDates.length === 1 ? "entry" : "entries"} with the same
              amount and details.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDuplicate}
          variant="contained"
          disabled={selectedDates.length === 0}
        >
          Duplicate to {selectedDates.length}{" "}
          {selectedDates.length === 1 ? "Date" : "Dates"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
