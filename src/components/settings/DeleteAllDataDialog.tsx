"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { deleteAllData } from "@/lib/storage/deleteAllData";

/**
 * The word a user must type to confirm.
 *
 * Compared case-sensitively after trimming. Case-sensitive because typing a word
 * in capitals is a deliberate act and lowercase is what an absent-minded tap
 * produces; trimmed because phone keyboards append a space after autocorrect or a
 * long-press paste, and refusing that reads as the app being broken rather than
 * careful.
 */
const CONFIRM_WORD = "DELETE";

interface DeleteAllDataDialogProps {
  open: boolean;
  /** Called when the user backs out, or closes without deleting. */
  onClose: () => void;
  /** Called once, only after the deletion has actually succeeded. */
  onDeleted: () => void;
}

/**
 * Confirmation gate for deleting everything HourKeep has stored.
 *
 * Added by W0 § 0.5. `PrivacyNotice.tsx:71` promises "Export or delete anytime"
 * before the user is allowed to start, and `settings/PrivacyPolicy.tsx:77` repeats
 * it. Neither was true.
 *
 * This is the only irreversible action in the app. There is no server, no backup,
 * and no import path (`gap-analysis.md:298`, gap 15.27) — so an export is a
 * printout, not a way back. The type-to-confirm gate is the entire protection, and
 * the copy deliberately does not offer the export as a consolation.
 */
export function DeleteAllDataDialog({
  open,
  onClose,
  onDeleted,
}: DeleteAllDataDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // noSsr because the app statically exports: without it the query returns false
  // on first paint and a phone gets a brief non-fullscreen dialog.
  const theme = useTheme();
  const isSmallViewport = useMediaQuery(theme.breakpoints.down("sm"), {
    noSsr: true,
  });

  const confirmed = confirmText.trim() === CONFIRM_WORD;

  const handleClose = () => {
    if (deleting) return;
    setConfirmText("");
    setError(null);
    onClose();
  };

  const handleDelete = async () => {
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteAllData();
      setConfirmText("");
      onDeleted();
    } catch (err) {
      console.error("Error deleting all data:", err);
      // Deliberately does NOT call onClose. A dialog that closes after a failed
      // delete reads as success, and the user would believe their records were
      // gone when they are not.
      setError(
        "We couldn't delete your data. It's still here — nothing was removed. Try again, and if it keeps failing you can clear this site's data from your browser settings.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-all-data-title"
      aria-describedby="delete-all-data-description"
      fullWidth
      maxWidth="sm"
      fullScreen={isSmallViewport}
    >
      <DialogTitle id="delete-all-data-title">
        Delete all your data?
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-all-data-description">
          This removes everything HourKeep has saved on this device. It
          can&apos;t be undone, and we have no copy of it.
        </DialogContentText>

        <List dense sx={{ mt: 1 }}>
          <ListItem disableGutters>
            <ListItemText primary="Every activity and all the hours you've logged" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Every income entry" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Every photo of a pay stub or letter you've added" />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Your profile and your answers to the questions" />
          </ListItem>
        </List>

        <DialogContentText sx={{ mt: 1 }}>
          If you might still need any of this for your state, save or print an
          export before you continue.
        </DialogContentText>

        <Box sx={{ mt: 3 }}>
          <TextField
            label={`Type ${CONFIRM_WORD} to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={deleting}
            fullWidth
            autoComplete="off"
            slotProps={{
              htmlInput: {
                autoCapitalize: "characters",
                autoCorrect: "off",
                spellCheck: false,
              },
            }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={deleting}>
          Keep my data
        </Button>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={!confirmed || deleting}
          startIcon={deleting ? <CircularProgress size={16} /> : undefined}
        >
          {deleting ? "Deleting..." : "Delete everything"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
