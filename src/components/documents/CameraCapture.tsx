import { useRef, useState, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useCamera } from "@/hooks/useCamera";

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const {
    stream,
    error,
    isLoading,
    openCamera,
    closeCamera,
    isCameraAvailable,
  } = useCamera();

  // Open camera on mount
  useEffect(() => {
    if (isCameraAvailable) {
      openCamera();
    }
  }, [isCameraAvailable, openCamera]);

  // Attach stream to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closeCamera();
      if (capturedImage) {
        URL.revokeObjectURL(capturedImage);
      }
    };
  }, [closeCamera, capturedImage]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);
            closeCamera(); // Stop camera after capture
          }
          setIsCapturing(false);
        },
        "image/jpeg",
        0.95,
      );
    }
  };

  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
    openCamera(); // Restart camera
  };

  const handleConfirm = () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          onCapture(blob);
        }
      },
      "image/jpeg",
      0.95,
    );
  };

  const handleClose = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
    }
    closeCamera();
    onCancel();
  };

  if (!isCameraAvailable) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Camera is not available on this device. Please use the upload option
          instead.
        </Alert>
        <Button variant="outlined" onClick={onCancel} fullWidth>
          Go Back
        </Button>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          To enable camera access:
        </Typography>
        <Typography variant="body2" component="ul" sx={{ mb: 2, pl: 2 }}>
          <li>Go to your device settings</li>
          <li>Find this app or browser</li>
          <li>Enable camera permissions</li>
          <li>Refresh this page</li>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Or use the file upload option as an alternative.
        </Typography>
        <Button variant="outlined" onClick={onCancel} fullWidth>
          Go Back
        </Button>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6">
          {capturedImage ? "Review Photo" : "Take Photo"}
        </Typography>
        <IconButton onClick={handleClose} edge="end">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Camera/Preview Area */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "4/3",
          bgcolor: "black",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CircularProgress />
            <Typography color="white">Opening camera...</Typography>
          </Box>
        )}

        {!capturedImage && stream && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {capturedImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capturedImage}
            alt="Captured"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </Box>

      {/* Controls */}
      <Box sx={{ p: 2 }}>
        {!capturedImage ? (
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleCapture}
            disabled={!stream || isCapturing}
            startIcon={<CameraIcon />}
            sx={{
              py: 1.5,
              fontSize: "1.1rem",
            }}
          >
            {isCapturing ? "Capturing..." : "Take Photo"}
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={handleRetake}
              startIcon={<RefreshIcon />}
              sx={{ py: 1.5 }}
            >
              Retake
            </Button>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleConfirm}
              startIcon={<CheckIcon />}
              sx={{ py: 1.5 }}
            >
              Confirm
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
