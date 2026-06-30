import { useEffect } from "react";
import { hubClient } from "@/services/hubClient";
import { useUIStore } from "@/store/uiStore";
import { POLL_INTERVALS_MS } from "@deepiri/shared";

export function useImmersiveStatus() {
  const setImmersiveLive = useUIStore((s) => s.setImmersiveLive);

  useEffect(() => {
    async function check() {
      try {
        const res = await hubClient.get("/health/immersive");
        setImmersiveLive(res.data?.status === "live");
      } catch {
        setImmersiveLive(false);
      }
    }

    check();
    const interval = setInterval(check, POLL_INTERVALS_MS.IMMERSIVE_CHECK);
    return () => clearInterval(interval);
  }, [setImmersiveLive]);
}
