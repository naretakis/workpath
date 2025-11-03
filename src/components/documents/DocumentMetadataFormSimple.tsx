/**
 * DocumentMetadataFormSimple Component
 *
 * Simplified form for adding metadata to a document before activity is saved.
 * Doesn't require activityId - just collects metadata.
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
} from "@mui/material";
import { DocumentType } from "@/types/documents";
import { formatFileSize } from "@/lib/utils/imageCompression";

interface DocumentMetadataFormSimpleProps {
  blob: Blob;
  onSave: (metadata: {
    type: string;
    customType?: string;
    description?: string;
  }) => void;
  onCancel: () => void;
}

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  "pay-stub": "Pay Stub",
  "volunteer-verification": "Volunteer Verification Letter",
  "school-enrollment": "School Enrollment",
  "medical-documentation": "Medical Documentation",
  other: "Other",
};

export function DocumentMetadataFormSimple({
  blob,
  onSave,
  onCancel,
}: DocumentMetadataFormSimpleProps) {
  const [type, setType] = useState<DocumentType | "">("");
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");
  // Create image preview URL using useMemo to avoid effect
  const imageUrl = useMemo(() => {
    return URL.createObjectURL(blob);
  }, [blob]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const descriptionCharsRemaining = 200 - description.length;

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

  const handleSave = () => {
    if (!isValid) return;

    onSave({
      type: type as string,
      customType: type === "other" ? customType.trim() : undefined,
      description: description.trim() || undefined,
    });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Add Document Details
      </Typography>

      {/* Image Preview */}
      {imageUrl && (
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
      )}

      {/* Form Fields */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Document Type */}
        <FormControl fullWidth required>
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
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={!isValid}>
          Continue
        </Button>
      </Box>
    </Box>
  );
}
