"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Badge,
  Card,
  CardMedia,
  CardActions,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  Chip,
  FormHelperText,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { ActivityFormHelp } from "@/components/activities/ActivityFormHelp";
import { Activity } from "@/types";
import { Document } from "@/types/documents";
import { DocumentCapture } from "@/components/documents/DocumentCapture";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { DocumentMetadataFormSimple } from "@/components/documents/DocumentMetadataFormSimple";
import { DocumentVerificationHelpIcon } from "@/components/help/DocumentVerificationHelp";
import {
  getDocumentsByActivity,
  getDocumentBlob,
  deleteDocument,
} from "@/lib/storage/documents";

interface ActivityFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    activity: Omit<Activity, "id" | "createdAt" | "updatedAt">,
  ) => Promise<number | void>;
  onDelete?: () => void;
  selectedDate: Date | null;
  existingActivity?: Activity;
}

export function ActivityForm({
  open,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  existingActivity,
}: ActivityFormProps) {
  const [type, setType] = useState<Activity["type"]>("work");
  const [hours, setHours] = useState("");
  const [date, setDate] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [organization, setOrganization] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // Ref for the hidden date input
  const additionalDateInputRef = useRef<HTMLInputElement>(null);

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentUrls, setDocumentUrls] = useState<Map<number, string>>(
    new Map(),
  );
  const [viewingDocumentId, setViewingDocumentId] = useState<number | null>(
    null,
  );

  // Initialize form with existing activity or selected date
  useEffect(() => {
    if (existingActivity) {
      setType(existingActivity.type);
      setHours(existingActivity.hours.toString());
      setDate(existingActivity.date);
      setDates([existingActivity.date]);
      setOrganization(existingActivity.organization || "");

      // Load documents for existing activity
      if (existingActivity.id) {
        loadDocuments(existingActivity.id);
      }
    } else if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;
      setDate(dateStr);
      setDates([dateStr]);
    }
  }, [existingActivity, selectedDate]);

  // Load documents for existing activity
  const loadDocuments = async (activityId: number) => {
    try {
      const docs = await getDocumentsByActivity(activityId);
      setDocuments(docs);

      // Load document blobs and create URLs
      const urls = new Map<number, string>();
      for (const doc of docs) {
        const blobData = await getDocumentBlob(doc.blobId);
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

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    let hasWarnings = false;

    // Hours validation
    if (!hours || parseFloat(hours) <= 0) {
      newErrors.hours = "Hours must be greater than 0";
    } else {
      const hoursValue = parseFloat(hours);

      if (hoursValue > 24) {
        newErrors.hours = "Hours cannot exceed 24 per day";
      } else if (hoursValue > 16) {
        setWarningMessage(
          "This is a lot of hours for one day. Please double-check.",
        );
        hasWarnings = true;
      }
    }

    // Date validation
    if (!date && dates.length === 0) {
      newErrors.date = "At least one date is required";
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
      // If editing existing activity
      if (existingActivity) {
        await onSave({
          date,
          type,
          hours: parseFloat(hours),
          organization: organization.trim() || undefined,
        });

        // If there's a pending document, save it
        if (pendingDocument && existingActivity.id) {
          const { saveDocument } = await import("@/lib/storage/documents");
          const { compressImage } = await import(
            "@/lib/utils/imageCompression"
          );

          let finalBlob = pendingDocument.blob;
          let compressedSize: number | undefined;

          const fiveMB = 5 * 1024 * 1024;
          if (pendingDocument.blob.size > fiveMB) {
            const compressed = await compressImage(
              pendingDocument.blob as File,
              {
                maxSizeMB: 5,
                quality: 0.8,
                maxDimension: 1920,
              },
            );
            finalBlob = compressed.blob;
            compressedSize = compressed.compressedSize;
          }

          await saveDocument(existingActivity.id, finalBlob, {
            type: pendingDocument.type as Document["type"],
            customType: pendingDocument.customType,
            description: pendingDocument.description,
            fileSize: pendingDocument.blob.size,
            compressedSize,
            mimeType: pendingDocument.blob.type as "image/jpeg" | "image/png",
            captureMethod: "camera",
          });
        }
      } else {
        // Creating new activity/activities
        const datesToCreate = dates.length > 0 ? dates : [date];

        // Import db directly to batch save without triggering reload each time
        const { db } = await import("@/lib/db");
        let firstActivityId: number | undefined;

        // Save all activities in batch
        for (const dateStr of datesToCreate) {
          const activityId = await db.activities.add({
            date: dateStr,
            type,
            hours: parseFloat(hours),
            organization: organization.trim() || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Store the first activity ID for document attachment
          if (!firstActivityId) {
            firstActivityId = activityId;
          }
        }

        // If there's a pending document, attach it to the first entry
        if (pendingDocument && firstActivityId) {
          const { saveDocument } = await import("@/lib/storage/documents");
          const { compressImage } = await import(
            "@/lib/utils/imageCompression"
          );

          let finalBlob = pendingDocument.blob;
          let compressedSize: number | undefined;

          const fiveMB = 5 * 1024 * 1024;
          if (pendingDocument.blob.size > fiveMB) {
            const compressed = await compressImage(
              pendingDocument.blob as File,
              {
                maxSizeMB: 5,
                quality: 0.8,
                maxDimension: 1920,
              },
            );
            finalBlob = compressed.blob;
            compressedSize = compressed.compressedSize;
          }

          await saveDocument(firstActivityId, finalBlob, {
            type: pendingDocument.type as Document["type"],
            customType: pendingDocument.customType,
            description: pendingDocument.description,
            fileSize: pendingDocument.blob.size,
            compressedSize,
            mimeType: pendingDocument.blob.type as "image/jpeg" | "image/png",
            captureMethod: "camera",
          });
        }
      }

      // Close the form immediately
      handleClose();

      // Manually reload activities after batch save
      if (!existingActivity) {
        // Trigger a page reload by dispatching a custom event
        window.dispatchEvent(new CustomEvent("activities-updated"));
      }
    } catch (error) {
      console.error("Error saving activity:", error);

      let errorMessage = "Failed to save activity. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("storage")) {
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
    if (!existingActivity?.id) return;
    setCapturedBlob(blob);
    setShowDocumentCapture(false);
    setShowMetadataForm(true);
  };

  const handleMetadataSaved = async () => {
    setShowMetadataForm(false);
    setCapturedBlob(null);
    if (existingActivity?.id) {
      await loadDocuments(existingActivity.id);
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
      await deleteDocument(documentId);
      if (existingActivity?.id) {
        await loadDocuments(existingActivity.id);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleClose = () => {
    setType("work");
    setHours("");
    setDate("");
    setDates([]);
    setOrganization("");
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

  // Calculate total hours for multi-day entries
  const totalHours =
    dates.length > 1 && hours ? parseFloat(hours) * dates.length : null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="activity-form-title"
    >
      <DialogTitle id="activity-form-title">
        {existingActivity ? "Edit Activity" : "Log Hours"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {/* Activity Type */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Activity Type *
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {[
                { value: "work", label: "Work" },
                { value: "volunteer", label: "Volunteer" },
                { value: "education", label: "Education" },
              ].map((activityType) => (
                <Box
                  key={activityType.value}
                  sx={{
                    flex: 1,
                    position: "relative",
                    border: "2px solid",
                    borderColor:
                      type === activityType.value ? "primary.main" : "divider",
                    borderRadius: 1,
                    bgcolor:
                      type === activityType.value
                        ? "primary.50"
                        : "transparent",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "primary.50",
                    },
                  }}
                  onClick={() =>
                    setType(activityType.value as Activity["type"])
                  }
                >
                  <Box
                    sx={{
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: type === activityType.value ? 600 : 400,
                        color:
                          type === activityType.value
                            ? "primary.main"
                            : "text.primary",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      {activityType.label}
                    </Typography>
                    <Box
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent selecting the type when clicking help
                      }}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <ActivityFormHelp
                        activityType={
                          activityType.value as
                            | "work"
                            | "volunteer"
                            | "education"
                        }
                        inline={true}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            {errors.type && (
              <FormHelperText error>{errors.type}</FormHelperText>
            )}
          </Box>

          {/* Hours */}
          <TextField
            label="Hours"
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            error={!!errors.hours}
            helperText={errors.hours}
            required
            fullWidth
            slotProps={{
              htmlInput: {
                min: 0,
                max: 24,
                step: 0.5,
              },
            }}
          />

          {/* Date(s) */}
          {!existingActivity && (
            <Box>
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (!dates.includes(e.target.value)) {
                    setDates([e.target.value]);
                  }
                }}
                error={!!errors.date}
                helperText={errors.date || "When did you complete these hours?"}
                required
                fullWidth
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />

              {/* Add more dates section */}
              {dates.length > 1 && (
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 1, display: "block" }}
                  >
                    Selected dates:
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}
                  >
                    {dates.map((d) => (
                      <Chip
                        key={d}
                        label={new Date(d + "T00:00:00").toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                        size="small"
                        onDelete={() => {
                          const newDates = dates.filter((date) => date !== d);
                          setDates(newDates);
                          if (newDates.length > 0) {
                            setDate(newDates[0]);
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box
                sx={{
                  mt: 2,
                  p: 1.5,
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: "primary.main",
                  },
                }}
                onClick={() => additionalDateInputRef.current?.showPicker?.()}
              >
                <CalendarTodayIcon
                  sx={{ color: "primary.main", fontSize: 20 }}
                />
                <Typography
                  variant="body2"
                  color="primary.main"
                  sx={{ fontWeight: 500 }}
                >
                  Add Another Date
                </Typography>
                <input
                  ref={additionalDateInputRef}
                  type="date"
                  style={{
                    position: "absolute",
                    opacity: 0,
                    width: 0,
                    height: 0,
                    pointerEvents: "none",
                  }}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    if (newDate && !dates.includes(newDate)) {
                      setDates([...dates, newDate]);
                    }
                    // Clear the input
                    e.target.value = "";
                  }}
                />
              </Box>

              {/* Multi-day indicator */}
              {totalHours && (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    bgcolor: "info.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "info.200",
                  }}
                >
                  <Typography variant="body2" color="info.main">
                    {dates.length} {dates.length === 1 ? "day" : "days"} ×{" "}
                    {hours} hours = <strong>{totalHours} total hours</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    This will create {dates.length} separate{" "}
                    {dates.length === 1 ? "entry" : "entries"}
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {existingActivity && (
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={!!errors.date}
              helperText={errors.date}
              required
              fullWidth
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
          )}

          {/* Source/Employer/Organization */}
          <TextField
            label="Source/Employer/Organization (Optional)"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            fullWidth
            placeholder="e.g., Acme Corp, Food Bank, Community College"
            helperText="Where did you complete these hours?"
          />

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
              <DocumentVerificationHelpIcon activityType={type} />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 2 }}
            >
              Add timesheets, pay stubs, or verification letters
            </Typography>

            {/* Pending document for new entries */}
            {!existingActivity && pendingDocument && (
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
            {existingActivity && documents.length > 0 && (
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
                          alt="Activity document"
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
                    existingActivity
                      ? documents.length
                      : pendingDocument
                        ? 1
                        : 0
                  }
                  color="primary"
                >
                  <AttachFileIcon />
                </Badge>
              }
              onClick={
                existingActivity
                  ? handleAddDocumentToExisting
                  : handleAddDocumentClick
              }
              variant="outlined"
              fullWidth
            >
              {existingActivity
                ? "Add Another Document"
                : pendingDocument
                  ? "Replace Document"
                  : "Add Document"}
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        {existingActivity && onDelete && (
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
              existingActivity
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
              context="activity"
              onSave={
                existingActivity
                  ? async (metadata) => {
                      if (!existingActivity.id) return;
                      const { saveDocument } = await import(
                        "@/lib/storage/documents"
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

                      await saveDocument(existingActivity.id, finalBlob, {
                        type: metadata.type as Document["type"],
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
          Activity saved successfully!
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
