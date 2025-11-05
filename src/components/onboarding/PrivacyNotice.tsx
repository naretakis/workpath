"use client";

import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface PrivacyNoticeProps {
  onAcknowledge: () => void;
}

export function PrivacyNotice({ onAcknowledge }: PrivacyNoticeProps) {
  return (
    <Box
      sx={{
        padding: 3,
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600 }}
      >
        Welcome to HourKeep
      </Typography>

      <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 500 }}>
        Keep Your Hours, Keep Your Coverage
      </Typography>

      <Typography variant="body1" paragraph sx={{ mb: 3 }}>
        Before you start, here&apos;s how we handle your data:
      </Typography>

      <List sx={{ mb: 3 }}>
        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="All data stays on your device"
            secondary="Nothing is sent to any server"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="You control all exports"
            secondary="Only you decide when to share"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="You can delete everything"
            secondary="Remove all data anytime"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="No tracking or analytics"
            secondary="We don't collect any info"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Works completely offline"
            secondary="No internet connection needed"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
      </List>

      <Typography
        variant="body1"
        sx={{ mb: 3, fontWeight: 500, color: "text.primary" }}
      >
        Your privacy is our priority.
      </Typography>

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={onAcknowledge}
        sx={{
          minHeight: 48, // 48px touch target
          fontSize: "1.1rem",
        }}
      >
        I Understand
      </Button>
    </Box>
  );
}
