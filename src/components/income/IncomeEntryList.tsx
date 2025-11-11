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
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { IncomeEntry } from "@/types/income";
import {
  formatCurrency,
  getPayPeriodLabel,
} from "@/lib/utils/payPeriodConversion";
import { format, parseISO } from "date-fns";

interface IncomeEntryListProps {
  entries: IncomeEntry[];
  onEdit: (entry: IncomeEntry) => void;
  onDelete: (entryId: number) => void;
  documentCounts?: Record<number, number>; // Map of entryId to document count
}

export function IncomeEntryList({
  entries,
  onEdit,
  onDelete,
  documentCounts = {},
}: IncomeEntryListProps) {
  if (entries.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 6,
          px: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No income entries yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Click the + button below to add your first income entry
        </Typography>
      </Box>
    );
  }

  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // Group entries by month
  const entriesByMonth = sortedEntries.reduce(
    (acc, entry) => {
      const monthKey = entry.date.substring(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(entry);
      return acc;
    },
    {} as Record<string, IncomeEntry[]>,
  );

  // Get sorted month keys (most recent first)
  const monthKeys = Object.keys(entriesByMonth).sort((a, b) =>
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

          {/* Entries for this month */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {entriesByMonth[monthKey].map((entry) => {
              const docCount = entry.id ? documentCounts[entry.id] || 0 : 0;
              const dateObj = parseISO(entry.date);
              const formattedDate = format(dateObj, "MMMM d, yyyy");

              return (
                <Card
                  key={entry.id}
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
                          {formatCurrency(entry.amount)} (
                          {getPayPeriodLabel(entry.payPeriod)}){" → "}
                          <strong>
                            {formatCurrency(entry.monthlyEquivalent)}/month
                          </strong>
                        </Typography>
                        {entry.source && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            {entry.source}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(entry)}
                          aria-label="edit income entry"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => entry.id && onDelete(entry.id)}
                          aria-label="delete income entry"
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
                      {entry.incomeType && (
                        <Chip
                          label={entry.incomeType.replace("-", " ")}
                          size="small"
                          variant="outlined"
                        />
                      )}
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
