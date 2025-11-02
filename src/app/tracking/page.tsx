"use client";

import { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";

export default function TrackingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Activity Tracking
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Calendar and activity tracking will be implemented in Phase 3.
        </Typography>
      </Box>
    </Container>
  );
}
