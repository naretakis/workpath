"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
} from "@mui/icons-material";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { format } from "date-fns";
import { Document } from "@/types/documents";
import {
  getDocument,
  getDocumentBlob,
  deleteDocument,
} from "@/lib/storage/documents";
import { formatFileSize } from "@/lib/utils/imageCompression";

interface DocumentViewerProps {
  documentId: number | null;
  onClose: () => void;
  onDelete?: (documentId: number) => void;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  "pay-stub": "Pay Stub",
  "volunteer-verification": "Volunteer Verification",
  "school-enrollment": "School Enrollment",
  "medical-documentation": "Medical Documentation",
  other: "Other",
};

export function DocumentViewer({
  documentId,
  onClose,
  onDelete,
}: DocumentViewerProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (documentId === null) {
      // Reset state when closed
      setDocument(null);
      setImageUrl(null);
      setError(null);
      setDeleteConfirm(false);
      return;
    }

    loadDocument();

    // Cleanup blob URL on unmount
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const loadDocument = async () => {
    if (documentId === null) return;

    setLoading(true);
    setError(null);

    try {
      // Load document metadata
      const doc = await getDocument(documentId);
      if (!doc) {
        setError("Document not found");
        return;
      }
      setDocument(doc);

      // Load document blob
      const blobData = await getDocumentBlob(doc.blobId);
      if (!blobData) {
        setError("Document image not found");
        return;
      }

      // Create object URL for display
      const url = URL.createObjectURL(blobData.blob);
      setImageUrl(url);
    } catch (err) {
      console.error("Error loading document:", err);
      setError("Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!document?.id) return;

    setDeleting(true);
    try {
      await deleteDocument(document.id);
      if (onDelete) {
        onDelete(document.id);
      }
      onClose();
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Failed to delete document");
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  return (
    <Dialog
      open={documentId !== null}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: { xs: "100%", sm: "90vh" },
          m: { xs: 0, sm: 2 },
          maxHeight: { xs: "100%", sm: "90vh" },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        Document
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ ml: 2 }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
        {loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: 400,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {!loading && !error && document && imageUrl && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {/* Image Display with Zoom/Pan */}
            <Box
              sx={{
                flex: 1,
                overflow: "hidden",
                backgroundColor: "grey.100",
                position: "relative",
                minHeight: 400,
              }}
            >
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
                wheel={{ step: 0.1 }}
                doubleClick={{ mode: "toggle", step: 0.7 }}
                pinch={{ step: 5 }}
              >
                {({ zoomIn, zoomOut, resetTransform, instance }) => (
                  <>
                    <TransformComponent
                      wrapperStyle={{
                        width: "100%",
                        height: "100%",
                      }}
                      contentStyle={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={document.type}
                        sx={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "contain",
                          userSelect: "none",
                        }}
                      />
                    </TransformComponent>

                    {/* Zoom Controls */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 16,
                        right: 16,
                        display: "flex",
                        gap: 0.5,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        borderRadius: 1,
                        p: 0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => zoomOut()}
                        sx={{ color: "white" }}
                        aria-label="zoom out"
                      >
                        <ZoomOutIcon fontSize="small" />
                      </IconButton>
                      <Button
                        size="small"
                        onClick={() => resetTransform()}
                        sx={{
                          color: "white",
                          minWidth: 60,
                          fontSize: "0.75rem",
                        }}
                        startIcon={<ResetIcon sx={{ fontSize: 14 }} />}
                      >
                        {Math.round((instance.transformState.scale || 1) * 100)}
                        %
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => zoomIn()}
                        sx={{ color: "white" }}
                        aria-label="zoom in"
                      >
                        <ZoomInIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </>
                )}
              </TransformWrapper>
            </Box>

            {/* Document Metadata */}
            <Box
              sx={{
                p: 3,
                borderTop: 1,
                borderColor: "divider",
                backgroundColor: "background.paper",
              }}
            >
              <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                <Chip
                  label={
                    document.type === "other" && document.customType
                      ? document.customType
                      : DOCUMENT_TYPE_LABELS[document.type] || document.type
                  }
                  color="primary"
                  size="small"
                />
                <Chip
                  label={
                    document.captureMethod === "camera" ? "Camera" : "Upload"
                  }
                  size="small"
                  variant="outlined"
                />
              </Box>

              {document.description && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {document.description}
                </Typography>
              )}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2">
                    {format(
                      new Date(document.createdAt),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    File Size
                  </Typography>
                  <Typography variant="body2">
                    {formatFileSize(
                      document.compressedSize || document.fileSize,
                    )}
                    {document.compressedSize &&
                      document.compressedSize < document.fileSize && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          (compressed from {formatFileSize(document.fileSize)})
                        </Typography>
                      )}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!deleteConfirm ? (
          <>
            {onDelete && (
              <Button
                onClick={() => setDeleteConfirm(true)}
                color="error"
                startIcon={<DeleteIcon />}
                disabled={deleting || loading}
                sx={{ mr: "auto" }}
              >
                Delete
              </Button>
            )}
            <Button onClick={onClose} disabled={deleting}>
              Close
            </Button>
          </>
        ) : (
          <>
            <Alert severity="warning" sx={{ flex: 1, mr: 2 }}>
              Delete this document permanently?
            </Alert>
            <Button onClick={() => setDeleteConfirm(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              color="error"
              variant="contained"
              disabled={deleting}
              startIcon={
                deleting ? <CircularProgress size={16} /> : <DeleteIcon />
              }
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
