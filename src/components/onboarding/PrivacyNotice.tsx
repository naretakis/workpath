"use client";

import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

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

      <Typography variant="h6" color="primary" sx={{ mb: 3, fontWeight: 500 }}>
        Keep Your Hours, Keep Your Coverage
      </Typography>

      <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
        Your privacy comes first:
      </Typography>

      <List sx={{ mb: 3 }}>
        <ListItem sx={{ px: 0, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Everything stays on your device"
            secondary="Your data never leaves unless you export it"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="You control your data"
            secondary="Export or delete anytime"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Works offline"
            secondary="No internet required"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>

        <ListItem sx={{ px: 0, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Sensitive data encrypted"
            secondary="Date of birth and Medicaid ID protected"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItem>
      </List>

      <Accordion sx={{ mb: 3, boxShadow: 1 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="analytics-details-content"
          id="analytics-details-header"
        >
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            About anonymous analytics
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            We collect basic anonymous stats (page views, device types, states)
            to improve the app. This helps us understand where HourKeep is
            needed most.
          </Typography>

          <Typography variant="body2" paragraph sx={{ fontWeight: 500 }}>
            We collect (anonymous):
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2, fontSize: "0.875rem" }}>
            <li>Page views</li>
            <li>Device type and screen size</li>
            <li>Browser and OS</li>
            <li>State/region only</li>
          </Box>

          <Typography variant="body2" paragraph sx={{ fontWeight: 500 }}>
            We never collect:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2, fontSize: "0.875rem" }}>
            <li>Your name, DOB, or Medicaid ID</li>
            <li>Your hours or activity logs</li>
            <li>Your documents</li>
            <li>IP addresses or cookies</li>
            <li>City-level location</li>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Analytics respect &quot;Do Not Track&quot; settings.{" "}
            <Link
              href="https://plausible.io/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </Link>
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={onAcknowledge}
        sx={{
          minHeight: 48,
          fontSize: "1.1rem",
        }}
      >
        I Understand and Accept
      </Button>
    </Box>
  );
}
