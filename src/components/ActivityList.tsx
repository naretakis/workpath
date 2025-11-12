"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { Activity } from "@/types";
import { format, parseISO } from "date-fns";
import { useActivityDocumentCounts } from "@/hooks/useActivityDocumentCounts";

interface ActivityListProps {
  activities: Activity[];
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onDuplicate: (activity: Activity) => void;
}

const activityTypeColors = {
  work: "primary",
  volunteer: "success",
  education: "info",
  workProgram: "secondary",
} as const;

const activityTypeLabels = {
  work: "Work",
  volunteer: "Volunteer",
  education: "Education",
  workProgram: "Work Program",
} as const;

export function ActivityList({
  activities,
  onEdit,
  onDelete,
  onDuplicate,
}: ActivityListProps) {
  // Get document counts for all activities
  const activityIds = activities
    .map((a) => a.id)
    .filter((id): id is number => id !== undefined);
  const documentCounts = useActivityDocumentCounts(activityIds);

  if (activities.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          px: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hours logged yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click the + button below to log your first activity
        </Typography>
      </Box>
    );
  }

  // Sort activities by date (most recent first)
  const sortedActivities = [...activities].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  // Group activities by month
  const activitiesByMonth = sortedActivities.reduce(
    (acc, activity) => {
      const monthKey = activity.date.substring(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(activity);
      return acc;
    },
    {} as Record<string, Activity[]>,
  );

  // Get sorted month keys (most recent first)
  const monthKeys = Object.keys(activitiesByMonth).sort((a, b) =>
    b.localeCompare(a),
  );

  // Format month for display
  const formatMonthHeader = (monthKey: string): string => {
    const [year, month] = monthKey.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {monthKeys.map((monthKey) => (
        <Box key={monthKey}>
          {/* Month Header */}
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              pb: 1,
              borderBottom: "2px solid",
              borderColor: "divider",
            }}
          >
            {formatMonthHeader(monthKey)}
          </Typography>

          {/* Activities for this month */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {activitiesByMonth[monthKey].map((activity) => {
              const docCount = activity.id
                ? documentCounts.get(activity.id) || 0
                : 0;
              const dateObj = parseISO(activity.date);
              const formattedDate = format(dateObj, "MMMM d, yyyy");

              return (
                <Card
                  key={activity.id}
                  sx={{
                    position: "relative",
                    "&:hover": {
                      boxShadow: 3,
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {formattedDate}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {activity.hours}{" "}
                          {activity.hours === 1 ? "hour" : "hours"}
                        </Typography>
                        {activity.organization && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {activity.organization}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => onDuplicate(activity)}
                          aria-label="duplicate activity"
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(activity)}
                          aria-label="edit activity"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(activity)}
                          aria-label="delete activity"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        mt: 1,
                      }}
                    >
                      <Chip
                        label={activityTypeLabels[activity.type]}
                        color={activityTypeColors[activity.type]}
                        size="small"
                        variant="outlined"
                      />
                      {docCount > 0 && (
                        <Chip
                          icon={<AttachFileIcon />}
                          label={`${docCount} ${docCount === 1 ? "document" : "documents"}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
