"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Badge,
  Card,
  CardMedia,
  CardActions,
  IconButton,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { Activity } from "@/types";
import { Document } from "@/types/documents";
import { DocumentCapture } from "@/components/documents/DocumentCapture";
import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { DocumentMetadataForm } from "@/components/documents/DocumentMetadataForm";
import { DocumentMetadataFormSimple } from "@/components/documents/DocumentMetadataFormSimple";
import {
  getDocumentsByActivity,
  getDocumentBlob,
} from "@/lib/storage/documents";

interface ActivityFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    activity: Omit<Activity, "id" | "createdAt" | "updatedAt">,
  ) => Promise<number | void>; // Return activity ID if created
  onDelete?: () => void;
  selectedDate: Date | null;
  existingActivity?: Activity;
}

interface ActivityFormContentProps extends Omit<ActivityFormProps, "open"> {
  onViewDocument: (documentId: number) => void;
  reloadTrigger: number;
}

function ActivityFormContent({
  onClose,
  onSave,
  onDelete,
  selectedDate,
  existingActivity,
  onViewDocument,
  reloadTrigger,
}: ActivityFormContentProps) {
  const [type, setType] = useState<"work" | "volunteer" | "education">(
    existingActivity?.type || "work",
  );
  const [hours, setHours] = useState<string>(
    existingActivity?.hours.toString() || "",
  );
  const [organization, setOrganization] = useState<string>(
    existingActivity?.organization || "",
  );
  const [errors, setErrors] = useState<{ hours?: string }>({});
  const [saving, setSaving] = useState(false);

  // Document state for new activities
  const [pendingDocument, setPendingDocument] = useState<{
    blob: Blob;
    type: string;
    customType?: string;
    description?: string;
  } | null>(null);
  const [showDocumentCapture, setShowDocumentCapture] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [showMetadataForm, setShowMetadataForm] = useState(false);

  // Document display state for existing activities
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentUrls, setDocumentUrls] = useState<Map<number, string>>(
    new Map(),
  );
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const validateHours = (value: string): boolean => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      setErrors({ hours: "Please enter a valid number" });
      return false;
    }
    if (num < 0 || num > 24) {
      setErrors({ hours: "Hours must be between 0 and 24" });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSave = async () => {
    if (!selectedDate) return;

    if (!validateHours(hours)) return;

    const activity: Omit<Activity, "id" | "createdAt" | "updatedAt"> = {
      date: format(selectedDate, "yyyy-MM-dd"),
      type,
      hours: parseFloat(hours),
      organization: organization.trim() || undefined,
    };

    setSaving(true);
    try {
      const result = await onSave(activity);

      // If there's a pending document and we got an activity ID, save it
      if (pendingDocument && typeof result === "number") {
        const { saveDocument } = await import("@/lib/storage/documents");
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
        await saveDocument(result, finalBlob, {
          type: pendingDocument.type as Document["type"],
          customType: pendingDocument.customType,
          description: pendingDocument.description,
          fileSize: pendingDocument.blob.size,
          compressedSize,
          mimeType: pendingDocument.blob.type as "image/jpeg" | "image/png",
          captureMethod: "camera",
        });
      }

      onClose();
    } catch (error) {
      console.error("Error saving activity:", error);
      setErrors({ hours: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const handleHoursChange = (value: string) => {
    setHours(value);
    if (value) {
      validateHours(value);
    } else {
      setErrors({});
    }
  };

  // Document handlers for new activities
  const handleAddDocumentClick = () => {
    setShowDocumentCapture(true);
  };

  const handleDocumentCaptured = (blob: Blob) => {
    // For new activities, show metadata form (we'll save after activity is created)
    setCapturedBlob(blob);
    setShowDocumentCapture(false);
    setShowMetadataForm(true);
  };

  const handleMetadataSavedForNew = (metadata: {
    type: string;
    customType?: string;
    description?: string;
  }) => {
    // Store metadata temporarily - we'll save the document after activity is created
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

  // Document handlers for existing activities
  const handleAddDocumentToExisting = () => {
    setShowDocumentCapture(true);
  };

  const handleDocumentCapturedForExisting = async (blob: Blob) => {
    if (!existingActivity?.id) return;

    // Show metadata form instead of saving directly
    setCapturedBlob(blob);
    setShowDocumentCapture(false);
    setShowMetadataForm(true);
  };

  const handleMetadataSaved = async () => {
    // Document was saved, close metadata form and reload
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

  // Load documents for the activity
  const loadDocuments = async (activityId: number) => {
    setLoadingDocuments(true);
    try {
      const docs = await getDocumentsByActivity(activityId);
      setDocuments(docs);

      // Load blob URLs for thumbnails
      const urls = new Map<number, string>();
      for (const doc of docs) {
        try {
          const blobData = await getDocumentBlob(doc.blobId);
          if (blobData) {
            const url = URL.createObjectURL(blobData.blob);
            urls.set(doc.id!, url);
          }
        } catch (error) {
          console.error("Error loading document blob:", error);
        }
      }
      setDocumentUrls(urls);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Load documents when activity changes
  useEffect(() => {
    if (existingActivity?.id) {
      loadDocuments(existingActivity.id);
    }

    // Cleanup blob URLs on unmount
    return () => {
      documentUrls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingActivity?.id, reloadTrigger]);

  if (!selectedDate) return null;

  // Show metadata form for existing activities
  if (showMetadataForm && capturedBlob && existingActivity?.id) {
    return (
      <>
        <DialogTitle>Add Document Details</DialogTitle>
        <DialogContent>
          <DocumentMetadataForm
            blob={capturedBlob}
            activityId={existingActivity.id}
            captureMethod="camera"
            onSave={handleMetadataSaved}
            onCancel={handleMetadataCancel}
          />
        </DialogContent>
      </>
    );
  }

  // Show metadata form for new activities (no activityId yet)
  if (showMetadataForm && capturedBlob && !existingActivity) {
    return (
      <>
        <DialogTitle>Add Document Details</DialogTitle>
        <DialogContent>
          <DocumentMetadataFormSimple
            blob={capturedBlob}
            onSave={handleMetadataSavedForNew}
            onCancel={handleMetadataCancel}
          />
        </DialogContent>
      </>
    );
  }

  // Show document capture overlay
  if (showDocumentCapture) {
    return (
      <>
        <DialogTitle>
          {existingActivity ? "Add Document" : "Add Document (Optional)"}
        </DialogTitle>
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
      </>
    );
  }

  return (
    <>
      <DialogTitle>
        {existingActivity ? "Edit Activity" : "Log Activity"}
        <Typography variant="body2" color="text.secondary">
          {format(selectedDate, "MMMM d, yyyy")}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
          {/* Activity Details Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              p: 2,
              borderRadius: 1,
              backgroundColor: "grey.50",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="overline"
              sx={{ fontWeight: 600, color: "text.secondary" }}
            >
              Activity Details
            </Typography>

            <FormControl fullWidth>
              <InputLabel>Activity Type</InputLabel>
              <Select
                value={type}
                label="Activity Type"
                onChange={(e) =>
                  setType(e.target.value as "work" | "volunteer" | "education")
                }
              >
                <MenuItem value="work">Work</MenuItem>
                <MenuItem value="volunteer">Volunteer</MenuItem>
                <MenuItem value="education">Education</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Hours"
              type="number"
              value={hours}
              onChange={(e) => handleHoursChange(e.target.value)}
              error={!!errors.hours}
              helperText={errors.hours || "Enter hours between 0 and 24"}
              inputProps={{
                min: 0,
                max: 24,
                step: 0.5,
              }}
              fullWidth
              required
            />

            <TextField
              label="Organization (Optional)"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Where did you work/volunteer/study?"
              fullWidth
            />
          </Box>

          {/* Document Section for NEW activities */}
          {!existingActivity && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                backgroundColor: "primary.50",
                border: "1px solid",
                borderColor: "primary.100",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  mb: 1,
                  display: "block",
                  textTransform: "uppercase",
                }}
              >
                Verification Document (Optional)
              </Typography>
              {pendingDocument ? (
                <Card sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="120"
                    image={URL.createObjectURL(pendingDocument.blob)}
                    alt="Document preview"
                    sx={{ objectFit: "contain", backgroundColor: "grey.100" }}
                  />
                  <CardActions sx={{ p: 0.5 }}>
                    <Button
                      size="small"
                      color="error"
                      onClick={handleRemovePendingDocument}
                      startIcon={<DeleteIcon />}
                      sx={{ fontSize: "0.75rem" }}
                    >
                      Remove
                    </Button>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: "auto", fontSize: "0.7rem" }}
                    >
                      Attached
                    </Typography>
                  </CardActions>
                </Card>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  onClick={handleAddDocumentClick}
                  fullWidth
                  size="small"
                  sx={{ py: 1 }}
                >
                  Add Document
                </Button>
              )}
            </Box>
          )}

          {/* Documents Section for EXISTING activities */}
          {existingActivity?.id && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                backgroundColor: "primary.50",
                border: "1px solid",
                borderColor: "primary.100",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    flex: 1,
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "primary.main",
                      textTransform: "uppercase",
                    }}
                  >
                    Documents
                  </Typography>
                  {documents.length > 0 && (
                    <Badge
                      badgeContent={documents.length}
                      color="primary"
                      sx={{
                        "& .MuiBadge-badge": {
                          fontSize: "0.65rem",
                          height: 16,
                          minWidth: 16,
                        },
                      }}
                    />
                  )}
                </Box>
                <IconButton
                  size="small"
                  onClick={handleAddDocumentToExisting}
                  disabled={saving}
                  sx={{
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "primary.dark",
                    },
                    width: 28,
                    height: 28,
                  }}
                >
                  <AttachFileIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              {loadingDocuments ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : documents.length === 0 ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", textAlign: "center", py: 0.5 }}
                >
                  No documents yet
                </Typography>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    overflowX: "auto",
                    py: 0.5,
                    "&::-webkit-scrollbar": {
                      height: 6,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "rgba(0,0,0,0.2)",
                      borderRadius: 3,
                    },
                  }}
                >
                  {documents.map((doc) => (
                    <Card
                      key={doc.id}
                      sx={{
                        minWidth: 80,
                        maxWidth: 80,
                        flexShrink: 0,
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="80"
                        image={documentUrls.get(doc.id!) || ""}
                        alt={doc.type}
                        sx={{
                          objectFit: "cover",
                          backgroundColor: "grey.200",
                        }}
                      />
                      <CardActions
                        sx={{
                          p: 0.25,
                          justifyContent: "space-between",
                          minHeight: "auto",
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => onViewDocument(doc.id!)}
                          title="View"
                          sx={{ padding: 0.25 }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            // View document to access delete functionality
                            onViewDocument(doc.id!);
                          }}
                          title="View/Delete"
                          sx={{ padding: 0.25 }}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </CardActions>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          pt: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          backgroundColor: "grey.50",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "stretch",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          {existingActivity && onDelete && (
            <Button
              onClick={handleDelete}
              variant="outlined"
              color="error"
              disabled={saving}
              sx={{
                flex: { xs: 1, sm: "0 0 auto" },
              }}
            >
              Delete
            </Button>
          )}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              ml: existingActivity && onDelete ? 0 : "auto",
            }}
          >
            <Button
              onClick={onClose}
              disabled={saving}
              variant="outlined"
              sx={{
                minWidth: 100,
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={!hours || saving}
              startIcon={saving ? <CircularProgress size={16} /> : null}
              sx={{
                minWidth: 100,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </>
  );
}

export function ActivityForm({
  open,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  existingActivity,
}: ActivityFormProps) {
  const [viewingDocumentId, setViewingDocumentId] = useState<number | null>(
    null,
  );
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Use key to reset form state when dialog opens with different data
  const dialogKey = open
    ? `${selectedDate?.toISOString()}-${existingActivity?.id || "new"}-${reloadTrigger}`
    : "closed";

  const handleViewDocument = (documentId: number) => {
    setViewingDocumentId(documentId);
  };

  const handleCloseViewer = () => {
    setViewingDocumentId(null);
  };

  const handleDocumentDeleted = () => {
    // Document was deleted, close viewer and trigger reload
    setViewingDocumentId(null);
    setReloadTrigger((prev) => prev + 1);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        key={dialogKey}
        PaperProps={{
          sx: {
            m: { xs: 2, sm: 3 },
            maxHeight: { xs: "calc(100% - 32px)", sm: "calc(100% - 64px)" },
          },
        }}
      >
        {open && (
          <ActivityFormContent
            onClose={onClose}
            onSave={onSave}
            onDelete={onDelete}
            selectedDate={selectedDate}
            existingActivity={existingActivity}
            onViewDocument={handleViewDocument}
            reloadTrigger={reloadTrigger}
          />
        )}
      </Dialog>

      {/* Document Viewer - Separate from main dialog */}
      <DocumentViewer
        documentId={viewingDocumentId}
        onClose={handleCloseViewer}
        onDelete={handleDocumentDeleted}
      />
    </>
  );
}
