"use client";

import { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(() => {
    // Initialize with navigator.onLine if available (client-side)
    if (typeof navigator !== "undefined") {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: "warning.main",
        color: "warning.contrastText",
        padding: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        zIndex: 9999,
      }}
    >
      <WifiOffIcon fontSize="small" />
      <Typography variant="body2">
        You&apos;re offline. Changes will be saved locally.
      </Typography>
    </Box>
  );
}
