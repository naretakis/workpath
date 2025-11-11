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
import { formatFileSize } from "@/lib/utils/imageCompression";

interface DocumentMetadataFormSimpleProps {
  blob: Blob;
  onSave: (metadata: {
    type: string;
    customType?: string;
    description?: string;
  }) => void;
  onCancel: () => void;
  context?: "income" | "activity"; // Determines which document types to show
}

type IncomeDocumentType =
  | "pay_stub"
  | "bank_statement"
  | "app_screenshot"
  | "other";
type ActivityDocumentType =
  | "pay-stub"
  | "volunteer-verification"
  | "school-enrollment"
  | "medical-documentation"
  | "other";

const INCOME_DOCUMENT_TYPE_LABELS: Record<IncomeDocumentType, string> = {
  pay_stub: "Pay Stub",
  bank_statement: "Bank Statement",
  app_screenshot: "App Screenshot (Uber, DoorDash, etc.)",
  other: "Other Income Proof",
};

const ACTIVITY_DOCUMENT_TYPE_LABELS: Record<ActivityDocumentType, string> = {
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
  context = "activity", // Default to activity for backward compatibility
}: DocumentMetadataFormSimpleProps) {
  const [type, setType] = useState<string>("");

  // Select the appropriate labels based on context
  const documentTypeLabels =
    context === "income"
      ? INCOME_DOCUMENT_TYPE_LABELS
      : ACTIVITY_DOCUMENT_TYPE_LABELS;
  const [customType, setCustomType] = useState("");
  const [description, setDescription] = useState("");
  const [imageError, setImageError] = useState(false);

  // Create image preview URL using useMemo
  const imageUrl = useMemo(() => {
    if (!blob || blob.size === 0) {
      console.error("Invalid blob:", blob);
      return null;
    }

    try {
      console.log("DocumentMetadataFormSimple - Creating URL for blob:", {
        size: blob.size,
        type: blob.type,
        constructor: blob.constructor.name,
      });

      const url = URL.createObjectURL(blob);
      console.log("Created object URL successfully:", url);
      return url;
    } catch (error) {
      console.error("Error creating object URL:", error);
      return null;
    }
  }, [blob]);

  // Cleanup URL on unmount or blob change
  useEffect(() => {
    return () => {
      if (imageUrl) {
        console.log("Cleaning up object URL:", imageUrl);
        URL.revokeObjectURL(imageUrl);
      }
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
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto" }}>
      {/* Image Preview */}
      {imageUrl ? (
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            overflow: "hidden",
            backgroundColor: "grey.100",
          }}
        >
          {!imageError && (
            <img
              src={imageUrl}
              alt="Document preview"
              onError={(e) => {
                console.error("Image failed to load:", e, "URL:", imageUrl);
                setImageError(true);
              }}
              onLoad={() => {
                console.log("Image loaded successfully from URL:", imageUrl);
                setImageError(false);
              }}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: 400,
                objectFit: "contain",
                display: "block",
              }}
            />
          )}
          {imageError && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="error">
                Failed to load image preview
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Blob size: {blob.size} bytes, Type: {blob.type || "unknown"}
              </Typography>
            </Box>
          )}
          <Box sx={{ p: 1, textAlign: "center", backgroundColor: "grey.200" }}>
            <Typography variant="caption" color="text.secondary">
              File size: {formatFileSize(blob.size)} • Type:{" "}
              {blob.type || "unknown"}
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            p: 3,
            textAlign: "center",
            backgroundColor: "grey.100",
          }}
        >
          <Typography color="error">No image preview available</Typography>
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
            onChange={(e) => setType(e.target.value)}
          >
            {Object.entries(documentTypeLabels).map(([value, label]) => (
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
