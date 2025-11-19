"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ChecklistIcon from "@mui/icons-material/Checklist";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BarChartIcon from "@mui/icons-material/BarChart";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ExploreIcon from "@mui/icons-material/Explore";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import { dashboardGuidance } from "@/content/helpText";

const STORAGE_KEY = "hourkeep_dashboard_guidance_dismissed";
const COLLAPSED_KEY = "hourkeep_dashboard_guidance_collapsed";

export interface DashboardGuidanceProps {
  /**
   * Callback when guidance is dismissed
   */
  onDismiss?: () => void;
  /**
   * Whether the guidance can be dismissed
   */
  dismissible?: boolean;
}

/**
 * DashboardGuidance Component
 *
 * Displays step-by-step guidance on the main dashboard to help users
 * understand how to use HourKeep.
 *
 * Features:
 * - Shows on first app load
 * - Can be dismissed (stored in localStorage)
 * - Can be collapsed to save space
 * - Numbered steps with icons
 * - Action links for relevant steps
 * - Mobile-friendly layout
 */
export function DashboardGuidance({
  onDismiss,
  dismissible = true,
}: DashboardGuidanceProps) {
  const router = useRouter();

  // Initialize state from storage
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem(COLLAPSED_KEY) === "true";
    }
    return false;
  });

  const [highlight, setHighlight] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  // Expose method to show and highlight the guidance
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (
        window as Window & { showDashboardGuidance?: () => void }
      ).showDashboardGuidance = () => {
        // If dismissed, un-dismiss it
        if (dismissed) {
          localStorage.removeItem(STORAGE_KEY);
          setDismissed(false);
        }

        // If collapsed, expand it
        if (collapsed) {
          setCollapsed(false);
          sessionStorage.setItem(COLLAPSED_KEY, "false");
        }

        // Scroll to it and highlight
        setTimeout(() => {
          cardRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          setHighlight(true);
          setTimeout(() => setHighlight(false), 2000);
        }, 100);
      };
    }

    return () => {
      if (typeof window !== "undefined") {
        delete (window as Window & { showDashboardGuidance?: () => void })
          .showDashboardGuidance;
      }
    };
  }, [dismissed, collapsed]);

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setDismissed(true);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleToggleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(COLLAPSED_KEY, newCollapsed.toString());
    }
  };

  const handleActionClick = (action: string | null) => {
    if (action) {
      router.push(action);
    }
  };

  // Get icon for each step
  const getStepIcon = (iconName: string) => {
    switch (iconName) {
      case "compass":
        return <ExploreIcon />;
      case "checklist":
        return <ChecklistIcon />;
      case "calendar":
        return <CalendarTodayIcon />;
      case "chart":
        return <BarChartIcon />;
      case "download":
        return <FileDownloadIcon />;
      case "add":
        return (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AddIcon sx={{ fontSize: 18, color: "white" }} />
          </Box>
        );
      default:
        return <ChecklistIcon />;
    }
  };

  if (dismissed) {
    return null;
  }

  return (
    <Card
      ref={cardRef}
      sx={{
        backgroundColor: "primary.50",
        border: "2px solid",
        borderColor: "primary.main",
        boxShadow: 2,
        transition: "all 0.3s ease-in-out",
        ...(highlight && {
          boxShadow: 6,
          transform: "scale(1.02)",
          borderColor: "primary.dark",
        }),
      }}
    >
      <CardContent sx={{ pb: collapsed ? 2 : 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: collapsed ? 0 : 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {dashboardGuidance.title}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <IconButton
              onClick={handleToggleCollapse}
              size="small"
              aria-label={collapsed ? "Expand guidance" : "Collapse guidance"}
              sx={{
                minWidth: 44,
                minHeight: 44,
              }}
            >
              {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
            {dismissible && (
              <IconButton
                onClick={handleDismiss}
                size="small"
                aria-label="Dismiss guidance"
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                }}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Steps */}
        <Collapse in={!collapsed}>
          <List sx={{ py: 0 }}>
            {dashboardGuidance.steps.map((step, index) => (
              <ListItem
                key={index}
                sx={{
                  px: 0,
                  py: 1,
                  alignItems: "flex-start",
                  cursor: step.action ? "pointer" : "default",
                  borderRadius: 1,
                  transition: "background-color 0.2s",
                  "&:hover": step.action
                    ? {
                        backgroundColor: "action.hover",
                      }
                    : {},
                }}
                onClick={
                  step.action ? () => handleActionClick(step.action) : undefined
                }
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: "primary.main",
                    mt: 0.25,
                  }}
                >
                  {getStepIcon(step.icon)}
                </ListItemIcon>
                <ListItemText
                  primary={step.text}
                  primaryTypographyProps={{
                    variant: "body2",
                    sx: { fontWeight: 500 },
                  }}
                  sx={{ my: 0 }}
                />
                {step.action && (
                  <Box
                    sx={{
                      ml: 1,
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </Collapse>
      </CardContent>

      {!collapsed && (
        <CardActions
          sx={{
            px: 2,
            pb: 2,
            pt: 0,
            justifyContent: "flex-end",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mr: "auto" }}
          >
            You can dismiss this anytime
          </Typography>
          {dismissible && (
            <Button size="small" onClick={handleDismiss} sx={{ minHeight: 44 }}>
              Got it
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
}

/**
 * Utility function to reset the dismissed state
 * (useful for testing or settings page)
 */
export function resetDashboardGuidance() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(COLLAPSED_KEY);
  }
}

/**
 * Utility function to check if guidance has been dismissed
 */
export function isDashboardGuidanceDismissed(): boolean {
  if (typeof window !== "undefined") {
    return localStorage.getItem(STORAGE_KEY) === "true";
  }
  return false;
}
