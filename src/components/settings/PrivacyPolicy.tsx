"use client";

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { format } from "date-fns";

interface PrivacyPolicyProps {
  open: boolean;
  onClose: () => void;
  acknowledgedAt?: Date;
}

export function PrivacyPolicy({
  open,
  onClose,
  acknowledgedAt,
}: PrivacyPolicyProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          m: { xs: 2, sm: 3 },
          maxHeight: { xs: "calc(100% - 32px)", sm: "calc(100% - 64px)" },
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Privacy Policy
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" paragraph>
          HourKeep is designed with your privacy as the top priority.
          Here&apos;s how we handle your data:
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

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          What We Store
        </Typography>

        <Typography variant="body2" paragraph>
          HourKeep stores the following information locally on your device:
        </Typography>

        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
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

        <Box component="ul" sx={{ pl: 2, mb: 2 }}>
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

        <Divider sx={{ my: 2 }} />

        {acknowledgedAt && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            You acknowledged this privacy policy on{" "}
            {format(new Date(acknowledgedAt), "MMMM d, yyyy 'at' h:mm a")}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Your privacy is our priority. If you have questions about how your
          data is handled, please contact your local Medicaid office or the app
          developer.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="contained" fullWidth>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
