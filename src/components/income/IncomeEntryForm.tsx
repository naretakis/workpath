"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  MenuItem,
  FormHelperText,
  Badge,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { IncomeEntry, IncomeDocument } from "@/types/income";
import {
  calculateMonthlyEquivalent,
  formatCurrency,
  getPayPeriodLabel,
} from "@/lib/utils/payPeriodConversion";
import { DocumentCapture } from "@/components/documents/DocumentCapture";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { DocumentMetadataFormSimple } from "@/components/documents/DocumentMetadataFormSimple";
import { DocumentVerificationHelpIcon } from "@/components/help/DocumentVerificationHelp";
import {
  getDocumentsByIncomeEntry,
  getIncomeDocumentBlob,
  deleteIncomeDocument,
} from "@/lib/storage/incomeDocuments";

interface IncomeEntryFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    entry: Omit<IncomeEntry, "id" | "createdAt" | "updatedAt">,
  ) => Promise<number | void>;
  onDelete?: () => void;
  selectedDate: Date | null;
  existingEntry?: IncomeEntry;
  userId: string;
}

export function IncomeEntryForm({
  open,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  existingEntry,
  userId,
}: IncomeEntryFormProps) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [payPeriod, setPayPeriod] =
    useState<IncomeEntry["payPeriod"]>("monthly");
  const [source, setSource] = useState("");
  const [incomeType, setIncomeType] = useState<IncomeEntry["incomeType"]>();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Document state for new entries
  const [pendingDocument, setPendingDocument] = useState<{
    blob: Blob;
    type: string;
    customType?: string;
    description?: string;
  } | null>(null);
  const [showDocumentCapture, setShowDocumentCapture] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [showMetadataForm, setShowMetadataForm] = useState(false);

  // Document display state for existing entries
  const [documents, setDocuments] = useState<IncomeDocument[]>([]);
  const [documentUrls, setDocumentUrls] = useState<Map<number, string>>(
    new Map(),
  );
  const [viewingDocumentId, setViewingDocumentId] = useState<number | null>(
    null,
  );

  // Initialize form with existing entry or selected date
  useEffect(() => {
    if (existingEntry) {
      setAmount(existingEntry.amount.toString());
      setDate(existingEntry.date);
      setPayPeriod(existingEntry.payPeriod);
      setSource(existingEntry.source || "");
      setIncomeType(existingEntry.incomeType);

      // Load documents for existing entry
      if (existingEntry.id) {
        loadDocuments(existingEntry.id);
      }
    } else if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      setDate(`${year}-${month}-${day}`);
    }
  }, [existingEntry, selectedDate]);

  // Load documents for existing income entry
  const loadDocuments = async (incomeEntryId: number) => {
    try {
      const docs = await getDocumentsByIncomeEntry(incomeEntryId);
      setDocuments(docs);

      // Load document blobs and create URLs
      const urls = new Map<number, string>();
      for (const doc of docs) {
        const blobData = await getIncomeDocumentBlob(doc.blobId);
        if (blobData) {
          const url = URL.createObjectURL(blobData.blob);
          urls.set(doc.id!, url);
        }
      }
      setDocumentUrls(urls);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  // Cleanup document URLs on unmount
  useEffect(() => {
    return () => {
      documentUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [documentUrls]);

  // Calculate monthly equivalent in real-time
  const monthlyEquivalent = amount
    ? calculateMonthlyEquivalent(parseFloat(amount), payPeriod)
    : 0;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasWarnings = false;

    // Amount validation
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Amount must be greater than $0";
    } else {
      const amountValue = parseFloat(amount);

      // Check for unusually high amounts
      if (amountValue > 100000) {
        newErrors.amount = "Amount seems unusually high. Please verify.";
      } else if (amountValue > 50000) {
        setWarningMessage(
          "This is a very high amount. Please double-check that it's correct.",
        );
        hasWarnings = true;
      }

      // Check for unusually low amounts for certain pay periods
      if (payPeriod === "monthly" && amountValue < 100) {
        setWarningMessage(
          "This monthly amount seems low. Make sure you selected the correct pay period.",
        );
        hasWarnings = true;
      } else if (payPeriod === "bi-weekly" && amountValue < 50) {
        setWarningMessage(
          "This bi-weekly amount seems low. Make sure you selected the correct pay period.",
        );
        hasWarnings = true;
      }
    }

    // Date validation
    if (!date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const oneMonthFuture = new Date();
      oneMonthFuture.setMonth(today.getMonth() + 1);

      // Check if date is too far in the past
      if (selectedDate < oneYearAgo) {
        setWarningMessage(
          "This date is more than a year ago. Make sure it's correct.",
        );
        hasWarnings = true;
      }

      // Check if date is in the future
      if (selectedDate > oneMonthFuture) {
        newErrors.date = "Date cannot be more than one month in the future";
      }
    }

    // Pay period validation
    if (!payPeriod) {
      newErrors.payPeriod = "Pay period is required";
    }

    setErrors(newErrors);

    // Show warning if there are warnings but no errors
    if (hasWarnings && Object.keys(newErrors).length === 0) {
      setShowWarning(true);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const result = await onSave({
        userId,
        date,
        amount: parseFloat(amount),
        payPeriod,
        monthlyEquivalent,
        source: source.trim() || undefined,
        incomeType,
      });

      // If there's a pending document and we got an income entry ID, save it
      if (pendingDocument && typeof result === "number") {
        const { saveIncomeDocument } = await import(
          "@/lib/storage/incomeDocuments"
        );
        const { compressImage } = await import("@/lib/utils/imageCompression");

        let finalBlob = pendingDocument.blob;
        let compressedSize: number | undefined;

        // Compress if needed
        const fiveMB = 5 * 1024 * 1024;
        if (pendingDocument.blob.size > fiveMB) {
          const compressed = await compressImage(pendingDocument.blob as File, {
            maxSizeMB: 5,
            quality: 0.8,
            maxDimension: 1920,
          });
          finalBlob = compressed.blob;
          compressedSize = compressed.compressedSize;
        }

        // Save document
        await saveIncomeDocument(result, finalBlob, {
          type: pendingDocument.type as IncomeDocument["type"],
          customType: pendingDocument.customType,
          description: pendingDocument.description,
          fileSize: pendingDocument.blob.size,
          compressedSize,
          mimeType: pendingDocument.blob.type as "image/jpeg" | "image/png",
          captureMethod: "camera",
        });
      }

      // Show success message
      setShowSuccess(true);

      // Close after a brief delay to show success message
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error("Error saving income entry:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to save income entry. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("duplicate")) {
          errorMessage =
            "This income entry may already exist. Please check your entries.";
        } else if (error.message.includes("network")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.message.includes("storage")) {
          errorMessage = "Storage error. Your device may be out of space.";
        }
      }

      setErrors({ submit: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  // Document handlers for new entries
  const handleAddDocumentClick = () => {
    setShowDocumentCapture(true);
  };

  const handleDocumentCaptured = (blob: Blob) => {
    console.log("IncomeEntryForm - Document captured:", {
      size: blob.size,
      type: blob.type,
      constructor: blob.constructor.name,
    });
    setCapturedBlob(blob);
    setShowDocumentCapture(false);
    setShowMetadataForm(true);
  };

  const handleMetadataSavedForNew = (metadata: {
    type: string;
    customType?: string;
    description?: string;
  }) => {
    if (capturedBlob) {
      setPendingDocument({
        blob: capturedBlob,
        type: metadata.type,
        customType: metadata.customType,
        description: metadata.description,
      });
    }
    setShowMetadataForm(false);
    setCapturedBlob(null);
  };

  const handleRemovePendingDocument = () => {
    setPendingDocument(null);
  };

  // Document handlers for existing entries
  const handleAddDocumentToExisting = () => {
    setShowDocumentCapture(true);
  };

  const handleDocumentCapturedForExisting = async (blob: Blob) => {
    if (!existingEntry?.id) return;
    setCapturedBlob(blob);
    setShowDocumentCapture(false);
    setShowMetadataForm(true);
  };

  const handleMetadataSaved = async () => {
    setShowMetadataForm(false);
    setCapturedBlob(null);
    if (existingEntry?.id) {
      await loadDocuments(existingEntry.id);
    }
  };

  const handleMetadataCancel = () => {
    setShowMetadataForm(false);
    setCapturedBlob(null);
  };

  const handleCancelDocumentCapture = () => {
    setShowDocumentCapture(false);
  };

  const handleViewDocument = (documentId: number) => {
    setViewingDocumentId(documentId);
  };

  const handleCloseDocumentViewer = () => {
    setViewingDocumentId(null);
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      await deleteIncomeDocument(documentId);
      if (existingEntry?.id) {
        await loadDocuments(existingEntry.id);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleClose = () => {
    setAmount("");
    setDate("");
    setPayPeriod("monthly");
    setSource("");
    setIncomeType(undefined);
    setErrors({});
    setPendingDocument(null);
    setDocuments([]);
    documentUrls.forEach((url) => URL.revokeObjectURL(url));
    setDocumentUrls(new Map());
    setShowSuccess(false);
    setShowWarning(false);
    setWarningMessage("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="income-entry-form-title"
    >
      <DialogTitle id="income-entry-form-title">
        {existingEntry ? "Edit Income Entry" : "Add Income Entry"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* Pay Period */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Pay Period *
            </Typography>
            <ToggleButtonGroup
              value={payPeriod}
              exclusive
              onChange={(_, value) => value && setPayPeriod(value)}
              aria-label="pay period"
              fullWidth
              sx={{
                "& .MuiToggleButton-root": {
                  py: 1,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                },
              }}
            >
              <ToggleButton value="daily">Daily</ToggleButton>
              <ToggleButton value="weekly">Weekly</ToggleButton>
              <ToggleButton value="bi-weekly">Bi-weekly</ToggleButton>
              <ToggleButton value="monthly">Monthly</ToggleButton>
            </ToggleButtonGroup>
            {errors.payPeriod && (
              <FormHelperText error>{errors.payPeriod}</FormHelperText>
            )}
          </Box>

          {/* Amount */}
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={!!errors.amount}
            helperText={errors.amount}
            required
            fullWidth
            slotProps={{
              input: {
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              },
              htmlInput: {
                min: 0,
                step: 0.01,
              },
            }}
          />

          {/* Monthly Equivalent Display */}
          {amount && parseFloat(amount) > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.50",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "primary.200",
              }}
            >
              <Typography variant="subtitle2" color="primary.main" gutterBottom>
                Monthly Equivalent
              </Typography>
              <Typography variant="h5" color="primary.main">
                {formatCurrency(monthlyEquivalent)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Calculated: {formatCurrency(parseFloat(amount))} ×{" "}
                {payPeriod === "monthly"
                  ? "1"
                  : payPeriod === "bi-weekly"
                    ? "2.17"
                    : payPeriod === "weekly"
                      ? "4.33"
                      : "30"}{" "}
                {getPayPeriodLabel(payPeriod).toLowerCase()} periods/month
              </Typography>
            </Box>
          )}

          {/* Payday */}
          <TextField
            label="Payday"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={!!errors.date}
            helperText={errors.date || "When did you get paid?"}
            required
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
          />

          {/* Combined Source/Employer and Type */}
          <Box>
            <TextField
              label="Source/Employer (Optional)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              fullWidth
              placeholder="e.g., Acme Corp, Uber, Freelance"
              helperText="Who pays you for this income?"
            />
            <TextField
              label="Income Type (Optional)"
              select
              value={incomeType || ""}
              onChange={(e) =>
                setIncomeType(
                  e.target.value as IncomeEntry["incomeType"] | undefined,
                )
              }
              fullWidth
              sx={{ mt: 2 }}
              helperText="What kind of work is this?"
            >
              <MenuItem value="">
                <em>Not specified</em>
              </MenuItem>
              <MenuItem value="wages">Wages (W-2)</MenuItem>
              <MenuItem value="self-employment">Self-Employment</MenuItem>
              <MenuItem value="gig-work">Gig Work</MenuItem>
              <MenuItem value="tips">Tips</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Box>

          {errors.submit && (
            <Typography color="error" variant="body2">
              {errors.submit}
            </Typography>
          )}

          {/* Document Section */}
          <Divider sx={{ my: 2 }} />
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="subtitle2">
                Documentation (Optional)
              </Typography>
              <DocumentVerificationHelpIcon
                context={incomeType === "gig-work" ? "gig-work" : "income"}
              />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 2 }}
            >
              Add pay stubs, bank statements, or app screenshots to verify your
              income
            </Typography>

            {/* Pending document for new entries */}
            {!existingEntry && pendingDocument && (
              <Card sx={{ mb: 2 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={URL.createObjectURL(pendingDocument.blob)}
                  alt="Pending document"
                />
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    onClick={handleRemovePendingDocument}
                    color="error"
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            )}

            {/* Existing documents */}
            {existingEntry && documents.length > 0 && (
              <Box
                sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}
              >
                {documents.map((doc) => {
                  const url = documentUrls.get(doc.id!);
                  return (
                    <Card key={doc.id} sx={{ display: "flex" }}>
                      {url && (
                        <CardMedia
                          component="img"
                          sx={{ width: 100, height: 100, objectFit: "cover" }}
                          image={url}
                          alt="Income document"
                        />
                      )}
                      <CardActions sx={{ ml: "auto" }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewDocument(doc.id!)}
                          aria-label="view document"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteDocument(doc.id!)}
                          aria-label="delete document"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  );
                })}
              </Box>
            )}

            {/* Add document button */}
            <Button
              startIcon={
                <Badge
                  badgeContent={
                    existingEntry ? documents.length : pendingDocument ? 1 : 0
                  }
                  color="primary"
                >
                  <AttachFileIcon />
                </Badge>
              }
              onClick={
                existingEntry
                  ? handleAddDocumentToExisting
                  : handleAddDocumentClick
              }
              variant="outlined"
              fullWidth
            >
              {existingEntry
                ? "Add Another Document"
                : pendingDocument
                  ? "Replace Document"
                  : "Add Document"}
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        {existingEntry && onDelete && (
          <Button onClick={onDelete} color="error" sx={{ mr: "auto" }}>
            Delete
          </Button>
        )}
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>

      {/* Document Capture Dialog */}
      <Dialog
        open={showDocumentCapture}
        onClose={handleCancelDocumentCapture}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          <DocumentCapture
            onCapture={
              existingEntry
                ? handleDocumentCapturedForExisting
                : handleDocumentCaptured
            }
            onCancel={handleCancelDocumentCapture}
          />
        </DialogContent>
      </Dialog>

      {/* Document Metadata Form Dialog */}
      {showMetadataForm && capturedBlob && (
        <Dialog
          open={true}
          onClose={handleMetadataCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Document Details</DialogTitle>
          <DialogContent>
            <DocumentMetadataFormSimple
              blob={capturedBlob}
              onCancel={handleMetadataCancel}
              context="income"
              onSave={
                existingEntry
                  ? async (metadata) => {
                      if (!existingEntry.id) return;
                      const { saveIncomeDocument } = await import(
                        "@/lib/storage/incomeDocuments"
                      );
                      const { compressImage } = await import(
                        "@/lib/utils/imageCompression"
                      );

                      let finalBlob = capturedBlob;
                      let compressedSize: number | undefined;

                      const fiveMB = 5 * 1024 * 1024;
                      if (capturedBlob.size > fiveMB) {
                        const compressed = await compressImage(
                          capturedBlob as File,
                          {
                            maxSizeMB: 5,
                            quality: 0.8,
                            maxDimension: 1920,
                          },
                        );
                        finalBlob = compressed.blob;
                        compressedSize = compressed.compressedSize;
                      }

                      await saveIncomeDocument(existingEntry.id, finalBlob, {
                        type: metadata.type as IncomeDocument["type"],
                        customType: metadata.customType,
                        description: metadata.description,
                        fileSize: capturedBlob.size,
                        compressedSize,
                        mimeType: capturedBlob.type as
                          | "image/jpeg"
                          | "image/png",
                        captureMethod: "camera",
                      });

                      await handleMetadataSaved();
                    }
                  : handleMetadataSavedForNew
              }
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Document Viewer Dialog */}
      {viewingDocumentId !== null && (
        <DocumentViewer
          documentId={viewingDocumentId}
          onClose={handleCloseDocumentViewer}
          onDelete={async (deletedId) => {
            // Remove from documents list and refresh
            setDocuments((prev) => prev.filter((doc) => doc.id !== deletedId));
            handleCloseDocumentViewer();
          }}
        />
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowSuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          Income entry saved successfully!
        </Alert>
      </Snackbar>

      {/* Warning Snackbar */}
      <Snackbar
        open={showWarning}
        autoHideDuration={6000}
        onClose={() => setShowWarning(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowWarning(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {warningMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
