"use client";

import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
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
        maxHeight: "80vh",
        overflowY: "auto",
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

      <List sx={{ mb: 2 }}>
        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="All data stays on your device"
            secondary="Nothing is sent to any server. Your information never leaves your device unless you explicitly export it."
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="You control all exports"
            secondary="Only you decide when to share your data. You can export your hours and documents whenever you need to submit them."
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="You can delete everything"
            secondary="Remove all your data anytime from the settings page. Once deleted, it's gone forever."
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="No tracking or analytics"
            secondary="We don't collect any information about how you use the app. No cookies, no tracking, no analytics."
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Works completely offline"
            secondary="No internet connection needed. Everything works locally on your device."
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0 }}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Sensitive data is encrypted"
            secondary="Your date of birth and Medicaid ID are encrypted when stored on your device for extra protection."
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
      </List>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        What We Store
      </Typography>

      <Typography variant="body2" paragraph>
        HourKeep stores the following information locally on your device:
      </Typography>

      <Box component="ul" sx={{ pl: 2, mb: 3 }}>
        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
          Your profile information (name, state, date of birth, contact info)
        </Typography>
        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
          Your activity logs (work, volunteer, education hours)
        </Typography>
        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
          Documents you upload (pay stubs, verification letters)
        </Typography>
        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
          Your exemption screening results (if you complete the screening)
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Your Rights
      </Typography>

      <Typography variant="body2" paragraph>
        You have complete control over your data:
      </Typography>

      <Box component="ul" sx={{ pl: 2, mb: 3 }}>
        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
          View all your data anytime
        </Typography>
        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
          Edit your profile information
        </Typography>
        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
          Export your data in multiple formats
        </Typography>
        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
          Delete all your data permanently
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Your privacy is our priority. If you have questions about how your data
        is handled, please contact your local Medicaid office or the app
        developer.
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
        I Understand and Accept
      </Button>
    </Box>
  );
}
