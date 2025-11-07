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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
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
              primary="Anonymous usage analytics"
              secondary="We collect anonymous usage statistics (page views, device types, states) to understand where this tool is needed most and improve the app. This does NOT include any personal information, activity logs, or documents. Respects 'Do Not Track' browser settings."
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

        <Accordion sx={{ mb: 2, boxShadow: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="analytics-details-content"
            id="analytics-details-header"
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              What We Track (Details)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph sx={{ fontWeight: 500 }}>
              What is collected (anonymous):
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CheckIcon
                  sx={{ fontSize: 18, color: "success.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  Page views (which pages you visit)
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CheckIcon
                  sx={{ fontSize: 18, color: "success.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  Device type (mobile, desktop, tablet)
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CheckIcon
                  sx={{ fontSize: 18, color: "success.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  Browser and operating system
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CheckIcon
                  sx={{ fontSize: 18, color: "success.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  State/region (e.g., &quot;California&quot;, &quot;Texas&quot;)
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CheckIcon
                  sx={{ fontSize: 18, color: "success.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  Screen size
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" paragraph sx={{ fontWeight: 500 }}>
              What is NOT collected:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CloseIcon
                  sx={{ fontSize: 18, color: "error.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  Your profile information (name, state, DOB, Medicaid ID)
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CloseIcon
                  sx={{ fontSize: 18, color: "error.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  Your activity logs (hours worked, organizations)
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CloseIcon
                  sx={{ fontSize: 18, color: "error.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  Your documents (pay stubs, verification letters)
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CloseIcon
                  sx={{ fontSize: 18, color: "error.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  Your exemption screening results
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CloseIcon
                  sx={{ fontSize: 18, color: "error.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  IP addresses or persistent identifiers
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CloseIcon
                  sx={{ fontSize: 18, color: "error.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  Cookies or tracking across websites
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 0.5 }}>
                <CloseIcon
                  sx={{ fontSize: 18, color: "error.main", mr: 1, mt: 0.2 }}
                />
                <Typography component="span" variant="body2">
                  City-level or more granular location data
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Learn more:{" "}
              <Link
                href="https://plausible.io/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Plausible Privacy Policy
              </Link>
            </Typography>
          </AccordionDetails>
        </Accordion>

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
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={{ minHeight: 48 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
