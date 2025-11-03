"use client";

import { useState } from "react";
import { Alert, AlertTitle, IconButton, Link as MuiLink } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { useStorageQuota } from "@/hooks/useStorageQuota";

export function StorageWarning() {
  const quota = useStorageQuota();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if no quota data, usage is below 80%, or user dismissed
  if (!quota || quota.percentage < 80 || dismissed) {
    return null;
  }

  const usageMB = (quota.usage / (1024 * 1024)).toFixed(2);
  const availableMB = ((quota.quota - quota.usage) / (1024 * 1024)).toFixed(2);

  return (
    <Alert
      severity="warning"
      action={
        <IconButton
          aria-label="close"
          color="inherit"
          size="small"
          onClick={() => setDismissed(true)}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
      sx={{ mb: 2 }}
    >
      <AlertTitle>Storage Space Running Low</AlertTitle>
      You&apos;re using {usageMB} MB with only {availableMB} MB available.{" "}
      <MuiLink
        component={Link}
        href="/settings"
        color="inherit"
        underline="always"
      >
        Manage storage
      </MuiLink>{" "}
      to free up space.
    </Alert>
  );
}
