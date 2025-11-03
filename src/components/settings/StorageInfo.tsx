"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import { useStorageQuota } from "@/hooks/useStorageQuota";
import { db } from "@/lib/db";
import { cleanupOrphanedDocuments } from "@/lib/storage/activities";
import { Document } from "@/types/documents";

interface StorageBreakdown {
  documents: {
    count: number;
    size: number;
  };
  activities: {
    count: number;
    size: number;
  };
  total: number;
}

interface DocumentWithSize extends Document {
  blobSize: number;
}

export function StorageInfo() {
  const quota = useStorageQuota();
  const [breakdown, setBreakdown] = useState<StorageBreakdown | null>(null);
  const [documents, setDocuments] = useState<DocumentWithSize[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  useEffect(() => {
    loadStorageBreakdown();
  }, []);

  async function loadStorageBreakdown() {
    try {
      setLoading(true);

      // Count documents
      const documentCount = await db.documents.count();

      // Get all document blobs and calculate total size
      const blobs = await db.documentBlobs.toArray();
      const documentSize = blobs.reduce((sum, b) => sum + b.blob.size, 0);

      // Get all documents with their blob sizes
      const allDocuments = await db.documents.toArray();
      const documentsWithSizes: DocumentWithSize[] = await Promise.all(
        allDocuments.map(async (doc) => {
          const blob = await db.documentBlobs.get(doc.blobId);
          return {
            ...doc,
            blobSize: blob?.blob.size || 0,
          };
        }),
      );

      // Sort by size (largest first)
      documentsWithSizes.sort((a, b) => b.blobSize - a.blobSize);
      setDocuments(documentsWithSizes);

      // Estimate other data (activities, profile)
      const activityCount = await db.activities.count();
      const otherSize = activityCount * 200; // Rough estimate

      setBreakdown({
        documents: {
          count: documentCount,
          size: documentSize,
        },
        activities: {
          count: activityCount,
          size: otherSize,
        },
        total: documentSize + otherSize,
      });
    } catch (error) {
      console.error("Error loading storage breakdown:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCleanupOrphaned() {
    try {
      setCleaning(true);
      const count = await cleanupOrphanedDocuments();

      if (count > 0) {
        setCleanupMessage(
          `Cleaned up ${count} orphaned document${count !== 1 ? "s" : ""}`,
        );
      } else {
        setCleanupMessage("No orphaned documents found");
      }

      // Reload storage breakdown
      await loadStorageBreakdown();

      // Clear message after 5 seconds
      setTimeout(() => setCleanupMessage(null), 5000);
    } catch (error) {
      console.error("Error cleaning up orphaned documents:", error);
      setCleanupMessage("Error cleaning up orphaned documents");
    } finally {
      setCleaning(false);
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  function getDocumentTypeLabel(type: string, customType?: string): string {
    const labels: Record<string, string> = {
      "pay-stub": "Pay Stub",
      "volunteer-verification": "Volunteer Verification",
      "school-enrollment": "School Enrollment",
      "medical-documentation": "Medical Documentation",
      other: customType || "Other",
    };
    return labels[type] || type;
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!quota || !breakdown) {
    return (
      <Alert severity="info">
        Storage information is not available in this browser.
      </Alert>
    );
  }

  const usageMB = (quota.usage / (1024 * 1024)).toFixed(2);
  const quotaMB = (quota.quota / (1024 * 1024)).toFixed(2);

  return (
    <Box>
      {/* Cleanup Message */}
      {cleanupMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setCleanupMessage(null)}
        >
          {cleanupMessage}
        </Alert>
      )}

      {/* Overall Storage Usage */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Storage Usage
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {usageMB} MB of {quotaMB} MB used
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {quota.percentage.toFixed(1)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(quota.percentage, 100)}
            color={quota.percentage > 80 ? "warning" : "primary"}
          />
        </Box>
      </Paper>

      {/* Storage Breakdown */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Storage Breakdown
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Documents"
              secondary={`${breakdown.documents.count} documents`}
            />
            <Typography variant="body2">
              {formatBytes(breakdown.documents.size)}
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Activities"
              secondary={`${breakdown.activities.count} activities`}
            />
            <Typography variant="body2">
              {formatBytes(breakdown.activities.size)}
            </Typography>
          </ListItem>
        </List>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CleaningServicesIcon />}
            onClick={handleCleanupOrphaned}
            disabled={cleaning}
            fullWidth
          >
            {cleaning ? "Cleaning..." : "Clean Up Orphaned Documents"}
          </Button>
        </Box>
      </Paper>

      {/* Document List - Read Only */}
      {documents.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Documents by Size
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            To delete documents, edit or delete their associated activities from
            the tracking page.
          </Typography>
          <List>
            {documents.map((doc) => (
              <ListItem
                key={doc.id}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemText
                  primary={getDocumentTypeLabel(doc.type, doc.customType)}
                  secondary={
                    <>
                      {doc.description && `${doc.description} • `}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </>
                  }
                />
                <Typography variant="body2" color="text.secondary">
                  {formatBytes(doc.blobSize)}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
