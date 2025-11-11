"use client";

import { useState, useEffect } from "react";
import { Box, Fab } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { IncomeEntry, MonthlyIncomeSummary } from "@/types/income";
import { IncomeStatusIndicator } from "./IncomeStatusIndicator";
import { IncomeEntryList } from "./IncomeEntryList";
import { IncomeEntryForm } from "./IncomeEntryForm";
import { SeasonalWorkerView } from "./SeasonalWorkerView";
import { SeasonalWorkerToggle } from "./SeasonalWorkerToggle";
import {
  saveIncomeEntry,
  updateIncomeEntry,
  deleteIncomeEntry,
  getIncomeEntriesForLast6Months,
  getMonthlyIncomeSummary,
  getSeasonalWorkerStatus,
} from "@/lib/storage/income";
import { getDocumentsByIncomeEntry } from "@/lib/storage/incomeDocuments";

interface IncomeDashboardProps {
  userId: string;
  currentMonth: string; // YYYY-MM format
  isSeasonalWorker: boolean;
  onSeasonalWorkerToggle: (checked: boolean) => void;
}

export function IncomeDashboard({
  userId,
  currentMonth,
  isSeasonalWorker,
  onSeasonalWorkerToggle,
}: IncomeDashboardProps) {
  const [entries, setEntries] = useState<IncomeEntry[]>([]);
  const [summary, setSummary] = useState<MonthlyIncomeSummary | null>(null);
  const [documentCounts, setDocumentCounts] = useState<Record<number, number>>(
    {},
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | undefined>();
  const [loading, setLoading] = useState(true);

  // Load income data
  useEffect(() => {
    loadIncomeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentMonth, isSeasonalWorker]);

  const loadIncomeData = async () => {
    setLoading(true);
    try {
      const [incomeEntries, incomeSummary] = await Promise.all([
        getIncomeEntriesForLast6Months(userId, currentMonth),
        getMonthlyIncomeSummary(userId, currentMonth),
      ]);

      setEntries(incomeEntries);
      setSummary(incomeSummary);

      // Load document counts for each entry
      const counts: Record<number, number> = {};
      for (const entry of incomeEntries) {
        if (entry.id) {
          const docs = await getDocumentsByIncomeEntry(entry.id);
          counts[entry.id] = docs.length;
        }
      }
      setDocumentCounts(counts);
    } catch (error) {
      console.error("Error loading income data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncome = () => {
    setEditingEntry(undefined);
    setFormOpen(true);
  };

  const handleEditEntry = (entry: IncomeEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleSaveEntry = async (
    entry: Omit<IncomeEntry, "id" | "createdAt" | "updatedAt">,
  ): Promise<number | void> => {
    try {
      if (editingEntry?.id) {
        // Update existing entry
        await updateIncomeEntry(editingEntry.id, entry);
        await loadIncomeData();
      } else {
        // Create new entry
        const id = await saveIncomeEntry(entry);
        await loadIncomeData();
        return id; // Return ID for document attachment
      }
    } catch (error) {
      console.error("Error saving income entry:", error);
      throw error;
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    try {
      await deleteIncomeEntry(entryId);
      await loadIncomeData();
    } catch (error) {
      console.error("Error deleting income entry:", error);
    }
  };

  const handleDeleteFromForm = async () => {
    if (editingEntry?.id) {
      await handleDeleteEntry(editingEntry.id);
      setFormOpen(false);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingEntry(undefined);
  };

  if (loading) {
    return <Box sx={{ p: 3, textAlign: "center" }}>Loading income data...</Box>;
  }

  return (
    <Box sx={{ position: "relative", pb: 10 }}>
      {/* Status Indicator */}
      {summary && (
        <Box sx={{ mb: 3 }}>
          <IncomeStatusIndicator summary={summary} />
        </Box>
      )}

      {/* Seasonal Worker Toggle - below the dashboard */}
      <Box sx={{ mb: 3 }}>
        <SeasonalWorkerToggle
          isSeasonalWorker={isSeasonalWorker}
          onToggle={onSeasonalWorkerToggle}
        />
      </Box>

      {/* Seasonal Worker View - Show when seasonal worker is enabled */}
      {isSeasonalWorker &&
        summary?.seasonalHistory &&
        summary.seasonalAverage !== undefined && (
          <SeasonalWorkerView
            history={summary.seasonalHistory}
            average={summary.seasonalAverage}
            isCompliant={summary.isCompliant}
          />
        )}

      {/* Income Entry List */}
      <IncomeEntryList
        entries={entries}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
        documentCounts={documentCounts}
      />

      {/* Add Income FAB */}
      <Fab
        color="primary"
        aria-label="add income"
        onClick={handleAddIncome}
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Income Entry Form */}
      <IncomeEntryForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveEntry}
        onDelete={editingEntry ? handleDeleteFromForm : undefined}
        selectedDate={new Date()} // Default to today
        existingEntry={editingEntry}
        userId={userId}
      />
    </Box>
  );
}
