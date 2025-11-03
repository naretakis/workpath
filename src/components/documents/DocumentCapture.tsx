/**
 * DocumentCapture Component
 *
 * Unified interface for capturing documents via camera or file upload.
 * Provides a consistent interface regardless of capture method.
 */

"use client";

import { useState } from "react";
import { Box, Button, Typography, Paper } from "@mui/material";
import {
  CameraAlt as CameraIcon,
  Upload as UploadIcon,
  ArrowBack as BackIcon,
} from "@mui/icons-material";
import { CameraCapture } from "./CameraCapture";
import { FileUpload } from "./FileUpload";
import { isCameraAvailable } from "@/lib/utils/cameraUtils";

interface DocumentCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel?: () => void;
  maxSizeMB?: number;
}

type CaptureMode = "select" | "camera" | "upload";

export function DocumentCapture({
  onCapture,
  onCancel,
  maxSizeMB = 10,
}: DocumentCaptureProps) {
  const [mode, setMode] = useState<CaptureMode>("select");
  const cameraAvailable = isCameraAvailable();

  const handleCameraCapture = (blob: Blob) => {
    onCapture(blob);
  };

  const handleFileUpload = (file: File) => {
    onCapture(file);
  };

  const handleBack = () => {
    setMode("select");
  };

  // Camera mode
  if (mode === "camera") {
    return (
      <Box>
        <Box sx={{ mb: 2 }}>
          <Button startIcon={<BackIcon />} onClick={handleBack}>
            Back
          </Button>
        </Box>
        <CameraCapture
          onCapture={handleCameraCapture}
          onCancel={onCancel || handleBack}
        />
      </Box>
    );
  }

  // Upload mode
  if (mode === "upload") {
    return (
      <Box>
        <Box sx={{ mb: 2 }}>
          <Button startIcon={<BackIcon />} onClick={handleBack}>
            Back
          </Button>
        </Box>
        <FileUpload
          onFileSelected={handleFileUpload}
          onCancel={onCancel}
          maxSizeMB={maxSizeMB}
        />
      </Box>
    );
  }

  // Selection mode (default)
  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", p: 2 }}>
      <Typography variant="h5" gutterBottom align="center">
        Add Document
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mb: 4 }}
      >
        Choose how you&apos;d like to add your document
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {cameraAvailable && (
          <Paper
            elevation={2}
            sx={{
              p: 3,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                elevation: 4,
                backgroundColor: "action.hover",
              },
            }}
            onClick={() => setMode("camera")}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <CameraIcon sx={{ fontSize: 48, color: "primary.main" }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">Take Photo</Typography>
                <Typography variant="body2" color="text.secondary">
                  Use your device&apos;s camera to capture a document
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        <Paper
          elevation={2}
          sx={{
            p: 3,
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              elevation: 4,
              backgroundColor: "action.hover",
            },
          }}
          onClick={() => setMode("upload")}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <UploadIcon sx={{ fontSize: 48, color: "primary.main" }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6">Upload Photo</Typography>
              <Typography variant="body2" color="text.secondary">
                Choose an existing photo from your device
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {onCancel && (
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button onClick={onCancel}>Cancel</Button>
        </Box>
      )}

      {!cameraAvailable && (
        <Typography
          variant="caption"
          color="text.secondary"
          align="center"
          display="block"
          sx={{ mt: 2 }}
        >
          Camera not available on this device
        </Typography>
      )}
    </Box>
  );
}
