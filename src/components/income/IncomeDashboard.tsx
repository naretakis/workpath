"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { IncomeEntry, MonthlyIncomeSummary } from "@/types/income";
import { IncomeStatusIndicator } from "./IncomeStatusIndicator";
import { IncomeEntryList } from "./IncomeEntryList";
import { IncomeEntryForm } from "./IncomeEntryForm";
import { SeasonalWorkerView } from "./SeasonalWorkerView";
import { SeasonalWorkerToggle } from "./SeasonalWorkerToggle";
import { DuplicateIncomeDialog } from "./DuplicateIncomeDialog";
import {
  saveIncomeEntry,
  updateIncomeEntry,
  deleteIncomeEntryWithDocuments,
  getIncomeEntriesForLast6Months,
  getMonthlyIncomeSummary,
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
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [entryToDuplicate, setEntryToDuplicate] = useState<IncomeEntry | null>(
    null,
  );
  // Deletion confirmation state. W0 § 0.3.2.
  const [pendingDelete, setPendingDelete] = useState<{
    entryId: number;
    documentCount: number;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // `noSsr` because the app statically exports: a media query that returns false
  // on first paint would flash a non-fullscreen dialog on a phone.
  // See .kiro/steering/component-standards.md.
  const theme = useTheme();
  const isSmallViewport = useMediaQuery(theme.breakpoints.down("sm"), {
    noSsr: true,
  });

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

  /**
   * Ask before deleting. W0 § 0.3.2.
   *
   * Income deletion previously had NO confirmation on either of its two paths —
   * the list's trash icon and the form's Delete button — while activity deletion
   * confirms from the list. The gate lives here rather than in each path so both
   * are covered once.
   *
   * The document count is read before asking, matching
   * `handleDeleteActivityFromList` in `src/app/tracking/page.tsx`: the number of
   * pay stubs about to be destroyed is the fact that changes someone's mind, and
   * documents are the evidence a state may ask for under 42 CFR 435.557.
   */
  const handleRequestDeleteEntry = async (entryId: number) => {
    const documents = await getDocumentsByIncomeEntry(entryId);
    setPendingDelete({ entryId, documentCount: documents.length });
  };

  const handleCancelDelete = () => {
    setPendingDelete(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      // Cascading delete: removes the entry, its documents, and their blobs.
      // Before § 0.3.2 this was a bare row delete that orphaned both.
      await deleteIncomeEntryWithDocuments(pendingDelete.entryId);
      setPendingDelete(null);
      setFormOpen(false);
      await loadIncomeData();
    } catch (error) {
      console.error("Error deleting income entry:", error);
      setDeleteError(
        "We couldn't delete this entry. Nothing was removed — your records are still here. Try again, and if it keeps failing you may need to delete its photos one at a time first.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteFromForm = async () => {
    if (editingEntry?.id) {
      await handleRequestDeleteEntry(editingEntry.id);
    }
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingEntry(undefined);
  };

  const handleDuplicateEntry = (entry: IncomeEntry) => {
    setEntryToDuplicate(entry);
    setDuplicateDialogOpen(true);
  };

  const handleDuplicateToMultipleDates = async (dates: string[]) => {
    if (!entryToDuplicate) return;

    try {
      // Create a new income entry for each selected date
      for (const date of dates) {
        await saveIncomeEntry({
          userId,
          date,
          amount: entryToDuplicate.amount,
          payPeriod: entryToDuplicate.payPeriod,
          monthlyEquivalent: entryToDuplicate.monthlyEquivalent,
          source: entryToDuplicate.source,
          incomeType: entryToDuplicate.incomeType,
        });
      }

      // Reload data
      await loadIncomeData();
    } catch (error) {
      console.error("Error duplicating income entry:", error);
    }
  };

  const handleCloseDuplicateDialog = () => {
    setDuplicateDialogOpen(false);
    setEntryToDuplicate(null);
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
        onDelete={handleRequestDeleteEntry}
        onDuplicate={handleDuplicateEntry}
        documentCounts={documentCounts}
      />

      {/*
        Delete confirmation. W0 § 0.3.2.

        An MUI Dialog rather than the `window.confirm` the activity list uses.
        Deviation recorded deliberately: the wave file says "matching the activity
        flow", and this matches its MESSAGE (the document-count warning), which is
        the substantive part, but not its primitive. `window.confirm` is
        unstylable, cannot be made full-screen on a phone, and gives no place to
        show a failure — and this dialog needs one, because the cascade can fail
        partway and must then say that nothing was lost. MUI dialogs are already
        the income idiom (DuplicateIncomeDialog, RescreenDialog).
      */}
      <Dialog
        open={pendingDelete !== null}
        onClose={deleting ? undefined : handleCancelDelete}
        aria-labelledby="delete-income-entry-title"
        aria-describedby="delete-income-entry-description"
        fullWidth
        maxWidth="xs"
        fullScreen={isSmallViewport}
      >
        <DialogTitle id="delete-income-entry-title">
          Delete this income entry?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-income-entry-description">
            {pendingDelete?.documentCount
              ? `This also deletes ${pendingDelete.documentCount} photo${
                  pendingDelete.documentCount > 1 ? "s" : ""
                } attached to it. Your state may ask for those, and this can't be undone.`
              : "This can't be undone."}
          </DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {deleteError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            Keep it
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : undefined}
          >
            {deleting ? "Deleting..." : "Delete entry"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Duplicate Income Dialog */}
      <DuplicateIncomeDialog
        open={duplicateDialogOpen}
        onClose={handleCloseDuplicateDialog}
        onDuplicate={handleDuplicateToMultipleDates}
        entry={entryToDuplicate}
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
