import { useState, useEffect } from "react";

export interface StorageQuota {
  usage: number;
  quota: number;
  percentage: number;
}

export function useStorageQuota() {
  const [quota, setQuota] = useState<StorageQuota | null>(null);

  useEffect(() => {
    async function checkQuota() {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const usage = estimate.usage || 0;
          const quotaValue = estimate.quota || 0;
          const percentage = quotaValue > 0 ? (usage / quotaValue) * 100 : 0;

          setQuota({
            usage,
            quota: quotaValue,
            percentage,
          });
        } catch (error) {
          console.error("Failed to estimate storage quota:", error);
        }
      }
    }

    // Check immediately
    checkQuota();

    // Poll every 60 seconds
    const interval = setInterval(checkQuota, 60000);

    return () => clearInterval(interval);
  }, []);

  return quota;
}
