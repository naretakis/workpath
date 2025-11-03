/**
 * FileUpload Component
 *
 * Allows users to upload image files from their device with drag-and-drop support.
 * Validates file type and size, and displays preview after selection.
 */

"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  LinearProgress,
} from "@mui/material";
import { Upload as UploadIcon, Image as ImageIcon } from "@mui/icons-material";
import {
  validateFile,
  formatFileSize,
  ValidationError,
  compressImage,
} from "@/lib/utils/imageCompression";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  onCancel?: () => void;
  maxSizeMB?: number;
  autoCompress?: boolean;
  compressionThresholdMB?: number;
}

export function FileUpload({
  onFileSelected,
  onCancel,
  maxSizeMB = 10,
  autoCompress = true,
  compressionThresholdMB = 5,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [finalSize, setFinalSize] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = (file: File): boolean => {
    setError(null);

    try {
      validateFile(file, maxSizeMB);
      return true;
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
      } else {
        setError("Failed to validate file. Please try again.");
      }
      return false;
    }
  };

  const handleFileSelection = async (file: File) => {
    if (!handleFileValidation(file)) {
      return;
    }

    setIsLoading(true);
    setOriginalSize(file.size);
    let processedFile = file;

    try {
      // Check if compression is needed
      const fileSizeMB = file.size / (1024 * 1024);
      if (autoCompress && fileSizeMB > compressionThresholdMB) {
        setIsCompressing(true);
        setCompressionProgress(0);

        const result = await compressImage(file, {
          maxSizeMB: compressionThresholdMB,
          quality: 0.8,
          maxDimension: 1920,
          onProgress: (progress) => {
            setCompressionProgress(progress);
          },
        });

        // Create a new File object from the compressed blob
        processedFile = new File([result.blob], file.name, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        setFinalSize(result.compressedSize);
        setIsCompressing(false);
      } else {
        setFinalSize(file.size);
      }

      setSelectedFile(processedFile);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
        setIsLoading(false);
      };
      reader.onerror = () => {
        setError("Failed to read file. Please try again.");
        setIsLoading(false);
        setIsCompressing(false);
      };
      reader.readAsDataURL(processedFile);
    } catch {
      setError("Failed to process file. Please try again.");
      setIsLoading(false);
      setIsCompressing(false);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onFileSelected(selectedFile);
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    setOriginalSize(null);
    setFinalSize(null);
    setCompressionProgress(0);
    setIsCompressing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Show preview if file is selected
  if (preview && selectedFile) {
    return (
      <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Preview
        </Typography>

        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{
              maxWidth: "100%",
              maxHeight: 400,
              objectFit: "contain",
              mb: 2,
            }}
          />

          <Typography variant="body2" color="text.secondary">
            {selectedFile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Size: {formatFileSize(selectedFile.size)}
          </Typography>
          {originalSize && finalSize && originalSize !== finalSize && (
            <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
              Compressed from {formatFileSize(originalSize)} (
              {Math.round((1 - finalSize / originalSize) * 100)}% reduction)
            </Typography>
          )}
        </Paper>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button variant="outlined" onClick={handleRetake}>
            Choose Different File
          </Button>
          <Button variant="contained" onClick={handleConfirm}>
            Use This Photo
          </Button>
        </Box>

        {onCancel && (
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button onClick={onCancel}>Cancel</Button>
          </Box>
        )}
      </Box>
    );
  }

  // Show upload interface
  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Upload Photo
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={isDragging ? 8 : 2}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          p: 4,
          mb: 2,
          textAlign: "center",
          border: isDragging ? "2px dashed" : "2px dashed transparent",
          borderColor: isDragging ? "primary.main" : "divider",
          backgroundColor: isDragging ? "action.hover" : "background.paper",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "action.hover",
            borderColor: "primary.main",
          },
        }}
        onClick={handleUploadClick}
      >
        {isLoading || isCompressing ? (
          <Box sx={{ py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              {isCompressing ? "Compressing image..." : "Loading file..."}
            </Typography>
            {isCompressing && (
              <Box sx={{ width: "100%", maxWidth: 300, mx: "auto", mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={compressionProgress}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {Math.round(compressionProgress)}%
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <>
            <ImageIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Drag and drop an image here
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              or
            </Typography>
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              sx={{ mt: 2 }}
            >
              Choose File
            </Button>
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Supported formats: JPEG, PNG (max {maxSizeMB}MB)
            </Typography>
          </>
        )}
      </Paper>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />

      {onCancel && (
        <Box sx={{ textAlign: "center" }}>
          <Button onClick={onCancel}>Cancel</Button>
        </Box>
      )}
    </Box>
  );
}
