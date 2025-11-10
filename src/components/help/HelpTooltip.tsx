"use client";

import React, { useState } from "react";
import {
  Tooltip,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
  Divider,
  ClickAwayListener,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

export interface HelpTooltipProps {
  /**
   * Main content to display (can be string or React node)
   */
  content: string | React.ReactNode;
  /**
   * Optional title for the help text
   */
  title?: string;
  /**
   * Examples of what counts
   */
  examples?: string[];
  /**
   * Counter-examples of what doesn't count
   */
  counterExamples?: string[];
  /**
   * Tooltip placement (desktop only)
   */
  placement?: "top" | "bottom" | "left" | "right";
  /**
   * ARIA label for accessibility
   */
  ariaLabel: string;
  /**
   * Size of the info icon
   */
  size?: "small" | "medium" | "large";
  /**
   * Color of the info icon
   */
  color?: "primary" | "secondary" | "default" | "inherit";
}

/**
 * HelpTooltip Component
 *
 * Displays contextual help text in a tooltip (desktop) or bottom sheet modal (mobile).
 * Designed for mobile-first with large touch targets and accessibility.
 *
 * Features:
 * - Desktop: Shows on click with tooltip
 * - Mobile: Shows in bottom sheet modal
 * - 44px+ touch target for accessibility
 * - Keyboard navigable (Enter/Space to open, Escape to close)
 * - Shows title, content, examples, and counter-examples
 */
export function HelpTooltip({
  content,
  title,
  examples,
  counterExamples,
  placement = "top",
  ariaLabel,
  size = "small",
  color = "primary",
}: HelpTooltipProps) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  // Render content for both tooltip and modal
  const renderContent = (inModal: boolean = false) => (
    <Box sx={{ maxWidth: inModal ? "100%" : 300 }}>
      {title && !inModal && (
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
          {title}
        </Typography>
      )}
      {typeof content === "string" ? (
        <Typography
          variant="body2"
          sx={{ mb: examples || counterExamples ? 1.5 : 0 }}
        >
          {content}
        </Typography>
      ) : (
        <Box sx={{ mb: examples || counterExamples ? 1.5 : 0 }}>{content}</Box>
      )}

      {examples && examples.length > 0 && (
        <Box sx={{ mb: counterExamples ? 1.5 : 0 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
          >
            <CheckCircleOutlineIcon
              sx={{ fontSize: 16, color: "success.main" }}
            />
            <Typography
              variant="caption"
              sx={{ fontWeight: "bold", color: "success.main" }}
            >
              What Counts:
            </Typography>
          </Box>
          <List dense sx={{ py: 0, pl: inModal ? 2 : 1 }}>
            {examples.map((example, index) => (
              <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                <ListItemText
                  primary={`• ${example}`}
                  primaryTypographyProps={{
                    variant: "caption",
                    sx: { fontSize: inModal ? "0.875rem" : "0.8125rem" },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {counterExamples && counterExamples.length > 0 && (
        <Box>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
          >
            <CancelOutlinedIcon sx={{ fontSize: 16, color: "error.main" }} />
            <Typography
              variant="caption"
              sx={{ fontWeight: "bold", color: "error.main" }}
            >
              What Doesn&apos;t Count:
            </Typography>
          </Box>
          <List dense sx={{ py: 0, pl: inModal ? 2 : 1 }}>
            {counterExamples.map((example, index) => (
              <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                <ListItemText
                  primary={`• ${example}`}
                  primaryTypographyProps={{
                    variant: "caption",
                    sx: { fontSize: inModal ? "0.875rem" : "0.8125rem" },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );

  // Mobile: Show in bottom sheet modal
  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          size={size}
          color={color}
          aria-label={ariaLabel}
          sx={{
            minWidth: 44,
            minHeight: 44,
            padding: size === "small" ? 1.5 : 2,
          }}
        >
          <InfoOutlinedIcon fontSize={size} />
        </IconButton>

        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              position: "fixed",
              bottom: 0,
              m: 0,
              maxHeight: "80vh",
              borderRadius: "16px 16px 0 0",
            },
          }}
          TransitionProps={{
            timeout: 250,
          }}
          sx={{
            "& .MuiBackdrop-root": {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pb: 1,
            }}
          >
            <Typography variant="h6" component="span">
              {title || "Help"}
            </Typography>
            <IconButton
              onClick={handleClose}
              size="small"
              aria-label="Close"
              sx={{ ml: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>{renderContent(true)}</DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} variant="contained" fullWidth>
              Got it
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }

  // Desktop: Show in tooltip
  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Tooltip
        title={renderContent(false)}
        open={open}
        onClose={handleClose}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        arrow
        placement={placement}
        componentsProps={{
          tooltip: {
            sx: {
              maxWidth: 350,
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
              p: 2,
              backgroundColor: "background.paper",
              color: "text.primary",
              boxShadow: 3,
              "& .MuiTooltip-arrow": {
                color: "background.paper",
              },
            },
          },
        }}
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 8],
                },
              },
              {
                name: "preventOverflow",
                enabled: true,
                options: {
                  boundary: "viewport",
                  padding: 8,
                },
              },
              {
                name: "flip",
                enabled: true,
                options: {
                  fallbackPlacements: ["bottom", "top", "right", "left"],
                },
              },
            ],
          },
        }}
      >
        <IconButton
          onClick={open ? handleClose : handleOpen}
          onKeyDown={handleKeyDown}
          size={size}
          color={color}
          aria-label={ariaLabel}
          sx={{
            minWidth: 44,
            minHeight: 44,
            padding: size === "small" ? 1.5 : 2,
          }}
        >
          <InfoOutlinedIcon fontSize={size} />
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
}
