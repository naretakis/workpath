/**
 * DocumentMetadataForm Component
 *
 * Form for adding metadata to a captured or uploaded document.
 * Displays image preview, allows selection of document type and description.
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  FormHelperText,
} from "@mui/material";
import { DocumentType } from "@/types/documents";
import { saveDocument } from "@/lib/storage/documents";
import { compressImage, formatFileSize } from "@/lib/utils/imageCompression";
import { db } from "@/lib/db";

interface DocumentMetadataFormProps {
  blob: Blob;
  activityId: number;
  captureMethod: "camera" | "upload";
  onSave: (documentId: number) => void;
  onCancel: () => void;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  "pay-stub": "Pay Stub",
  "volunteer-verification": "Volunteer Verification Letter",
  "school-enrollment": "School Enrollment",
  "medical-documentation": "Medical Documentation",
  other: "Other",
};

export function DocumentMetadataForm({
  blob,
  activityId,
  captureMethod,
  onSave,
  onCancel,
}: DocumentMetadataFormProps) {
  const [type, setType] = useState<DocumentType | "">("");
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [activity, setActivity] = useState<{
    date: string;
    type: string;
    hours: number;
    organization?: string;
  } | null>(null);

  // Load activity details
  useEffect(() => {
    async function loadActivity() {
      try {
        const act = await db.activities.get(activityId);
        if (act) {
          setActivity({
            date: act.date,
            type: act.type,
            hours: act.hours,
            organization: act.organization,
          });
        }
      } catch (err) {
        console.error("Error loading activity:", err);
      }
    }
    loadActivity();
  }, [activityId]);

  // Create image preview URL
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setImageUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  const descriptionCharsRemaining = 200 - description.length;

  const typeError = useMemo(() => {
    if (!type) return "";
    return "";
  }, [type]);

  const customTypeError = useMemo(() => {
    if (type === "other" && customType.length > 100) {
      return "Custom type must be 100 characters or less";
    }
    return "";
  }, [type, customType]);

  const descriptionError = useMemo(() => {
    if (description.length > 200) {
      return "Description must be 200 characters or less";
    }
    return "";
  }, [description]);

  const isValid = useMemo(() => {
    return (
      type !== "" &&
      (type !== "other" || (customType.trim() !== "" && !customTypeError)) &&
      !descriptionError
    );
  }, [type, customType, customTypeError, descriptionError]);

  const handleSave = async () => {
    if (!isValid) return;

    setError(null);
    setSaving(true);

    try {
      let finalBlob = blob;
      let compressedSize: number | undefined;

      // Check if compression is needed (>5MB)
      const fiveMB = 5 * 1024 * 1024;
      if (blob.size > fiveMB) {
        setCompressing(true);
        try {
          const result = await compressImage(blob as File, {
            maxSizeMB: 5,
            quality: 0.8,
            maxDimension: 1920,
            onProgress: setCompressionProgress,
          });

          finalBlob = result.blob;
          compressedSize = result.compressedSize;

          // Check if still too large after compression
          const tenMB = 10 * 1024 * 1024;
          if (finalBlob.size > tenMB) {
            throw new Error(
              "Image is too large (over 10MB even after compression). Please try a different photo.",
            );
          }
        } catch (compressionError) {
          throw compressionError;
        } finally {
          setCompressing(false);
        }
      }

      // Prepare metadata
      const metadata = {
        type: type as DocumentType,
        customType: type === "other" ? customType.trim() : undefined,
        description: description.trim() || undefined,
        fileSize: blob.size,
        compressedSize,
        mimeType: blob.type as "image/jpeg" | "image/png",
        captureMethod,
      };

      // Save document
      const documentId = await saveDocument(activityId, finalBlob, metadata);

      // Call success callback
      onSave(documentId);
    } catch (err) {
      console.error("Error saving document:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save document. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const formatActivityType = (activityType: string) => {
    return activityType.charAt(0).toUpperCase() + activityType.slice(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Add Document Details
      </Typography>

      {/* Image Preview */}
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          overflow: "hidden",
          backgroundColor: "grey.100",
        }}
      >
        <Box
          component="img"
          src={imageUrl}
          alt="Document preview"
          sx={{
            width: "100%",
            height: "auto",
            maxHeight: 400,
            objectFit: "contain",
            display: "block",
          }}
        />
        <Box sx={{ p: 1, textAlign: "center", backgroundColor: "grey.200" }}>
          <Typography variant="caption" color="text.secondary">
            File size: {formatFileSize(blob.size)}
          </Typography>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Compression Progress */}
      {compressing && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2">
              Compressing image... {compressionProgress}%
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Form Fields */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Document Type */}
        <FormControl fullWidth required error={!!typeError}>
          <InputLabel>Document Type</InputLabel>
          <Select
            value={type}
            label="Document Type"
            onChange={(e) => setType(e.target.value as DocumentType)}
          >
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
          {typeError && <FormHelperText>{typeError}</FormHelperText>}
        </FormControl>

        {/* Custom Type (if "other" selected) */}
        {type === "other" && (
          <TextField
            label="Specify Document Type"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            error={!!customTypeError}
            helperText={customTypeError || "What type of document is this?"}
            fullWidth
            required
          />
        )}

        {/* Description */}
        <TextField
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={!!descriptionError}
          helperText={
            descriptionError ||
            `${descriptionCharsRemaining} characters remaining`
          }
          multiline
          rows={3}
          fullWidth
          placeholder="Add any notes about this document..."
        />

        {/* Activity Info */}
        {activity && (
          <Paper
            variant="outlined"
            sx={{ p: 2, backgroundColor: "grey.50", mt: 1 }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              For Activity:
            </Typography>
            <Typography variant="body1">{formatDate(activity.date)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {formatActivityType(activity.type)} - {activity.hours} hours
              {activity.organization && ` at ${activity.organization}`}
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 3,
          justifyContent: "flex-end",
        }}
      >
        <Button onClick={onCancel} disabled={saving || compressing}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isValid || saving || compressing}
          startIcon={
            saving || compressing ? <CircularProgress size={16} /> : null
          }
        >
          {compressing
            ? "Compressing..."
            : saving
              ? "Saving..."
              : "Save Document"}
        </Button>
      </Box>
    </Box>
  );
}
