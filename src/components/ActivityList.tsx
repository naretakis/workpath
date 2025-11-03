"use client";

import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
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
} as const;

const activityTypeLabels = {
  work: "Work",
  volunteer: "Volunteer",
  education: "Education",
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
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No activities logged yet. Click a date on the calendar to get started!
        </Typography>
      </Paper>
    );
  }

  // Sort activities by date (most recent first)
  const sortedActivities = [...activities].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <Paper sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontSize: { xs: "1.1rem", sm: "1.25rem" },
          px: { xs: 1, sm: 0 },
        }}
      >
        Activity Log
      </Typography>
      <List sx={{ px: { xs: 0, sm: 0 } }}>
        {sortedActivities.map((activity, index) => (
          <Box key={activity.id}>
            {index > 0 && <Divider />}
            <ListItem
              sx={{
                px: { xs: 1, sm: 2 },
                py: { xs: 1.5, sm: 2 },
              }}
              secondaryAction={
                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 0, sm: 0.5 },
                    alignItems: "center",
                  }}
                >
                  {activity.id && documentCounts.get(activity.id) ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mr: 1,
                        color: "text.secondary",
                      }}
                    >
                      <AttachFileIcon
                        fontSize="small"
                        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                      >
                        {documentCounts.get(activity.id)}
                      </Typography>
                    </Box>
                  ) : null}
                  <IconButton
                    aria-label="duplicate"
                    onClick={() => onDuplicate(activity)}
                    size="small"
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    aria-label="edit"
                    onClick={() => onEdit(activity)}
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => onDelete(activity)}
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                sx={{ pr: { xs: 1, sm: 2 } }}
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 0.5, sm: 1 },
                      mb: 0.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontSize: { xs: "0.95rem", sm: "1rem" } }}
                    >
                      {format(parseISO(activity.date), "MMM d, yyyy")}
                    </Typography>
                    <Chip
                      label={activityTypeLabels[activity.type]}
                      color={activityTypeColors[activity.type]}
                      size="small"
                      sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                    />
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" } }}
                    >
                      {activity.hours} {activity.hours === 1 ? "hour" : "hours"}
                    </Typography>
                    {activity.organization && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="span"
                        sx={{ fontSize: { xs: "0.85rem", sm: "0.875rem" } }}
                      >
                        {" • "}
                        {activity.organization}
                      </Typography>
                    )}
                  </>
                }
              />
            </ListItem>
          </Box>
        ))}
      </List>
    </Paper>
  );
}
