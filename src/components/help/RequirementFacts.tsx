"use client";

import { useState } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  Stack,
  Typography,
} from "@mui/material";
import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

import { programScope, requirementFacts } from "@/content/helpText";

/**
 * Renders the facts the app should volunteer unprompted — W2a § 2.3b,
 * gaps 15.7 (42 CFR 435.559(c) timing), 15.8 (435.557(a)–(b) ex parte first),
 * and 15.20 (a negative self-report can support a denial).
 *
 * All three were rated harmful in the gap analysis, and all three were harmful by
 * ABSENCE: the app opened on a tracking calendar and said nothing about the fact
 * that CMS expects most of the adult group to be cleared without doing anything.
 *
 * Deliberately not inside `DashboardGuidance`: that component renders three short
 * `{ icon, text, action }` steps and has no room for prose or for a citation.
 */
interface RequirementFactsProps {
  /** Render collapsed behind a summary button. Defaults to open. */
  initiallyCollapsed?: boolean;
}

export function RequirementFacts({
  initiallyCollapsed = false,
}: RequirementFactsProps) {
  const [open, setOpen] = useState(!initiallyCollapsed);

  return (
    <Box sx={{ mb: { xs: 2, md: 3 } }}>
      <Button
        onClick={() => setOpen((prev) => !prev)}
        endIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        aria-expanded={open}
        aria-controls="requirement-facts-panel"
        sx={{
          textTransform: "none",
          fontWeight: 600,
          minHeight: 44,
          px: 1,
        }}
      >
        Before you start: a few things worth knowing
      </Button>

      <Collapse in={open}>
        <Stack spacing={2} id="requirement-facts-panel" sx={{ mt: 1 }}>
          {requirementFacts.map((fact) => (
            <Alert
              key={fact.id}
              // Colour is never the only signal: each Alert carries an icon from
              // its severity plus a text title, per the accessibility floor.
              severity={fact.tone === "caution" ? "warning" : "info"}
              variant="outlined"
              sx={{ alignItems: "flex-start" }}
            >
              <AlertTitle sx={{ fontWeight: 600 }}>{fact.title}</AlertTitle>

              <Typography variant="body2" sx={{ mb: 1.5 }}>
                {fact.body}
              </Typography>

              <Typography
                variant="body2"
                sx={{ fontWeight: 600, display: "block" }}
              >
                What to do: {fact.nextAction}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                {fact.citation}
              </Typography>
            </Alert>
          ))}

          {/*
            W2a § 2.4, gaps 11.1-11.5. Scope and timing facts the app never
            stated: which jurisdictions are in, that the territories are out
            entirely (42 CFR 435.550), and the January 2028 and December 2028
            dates that were absent altogether.
          */}
          <Alert
            severity="info"
            variant="outlined"
            sx={{ alignItems: "flex-start" }}
          >
            <AlertTitle sx={{ fontWeight: 600 }}>
              Where and when this applies
            </AlertTitle>

            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {programScope.jurisdictions}
            </Typography>

            {/* Gap 11.4: the adult group includes parents, not only childless adults. */}
            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {programScope.whoItReaches}
            </Typography>

            <Typography variant="body2" sx={{ mb: 1.5 }}>
              {programScope.territories}
            </Typography>

            <Box component="dl" sx={{ m: 0 }}>
              {programScope.keyDates.map((entry) => (
                <Box key={entry.date} sx={{ mb: 1.5 }}>
                  <Typography
                    component="dt"
                    variant="body2"
                    sx={{ fontWeight: 600 }}
                  >
                    {entry.date}
                  </Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                    {entry.what}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {entry.citation}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Typography variant="caption" color="text.secondary">
              {programScope.citation}
            </Typography>
          </Alert>
        </Stack>
      </Collapse>
    </Box>
  );
}
