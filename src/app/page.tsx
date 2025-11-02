"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { db } from "@/lib/db";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const checkProfile = async () => {
      try {
        // Check if profile exists
        const profiles = await db.profiles.toArray();

        if (profiles.length > 0) {
          // Profile exists, redirect to tracking
          router.push("/tracking");
        } else {
          // No profile, redirect to onboarding
          router.push("/onboarding");
        }
      } catch (error) {
        console.error("Error checking profile:", error);
        // On error, go to onboarding
        router.push("/onboarding");
      }
    };

    checkProfile();
  }, [router, mounted]);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  // Show loading spinner while checking
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <CircularProgress />
    </Box>
  );
}
