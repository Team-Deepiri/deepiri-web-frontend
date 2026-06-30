import { useEffect } from "react";
import { hubClient } from "@/services/hubClient";
import { useHealthStore } from "@/store/healthStore";
import { POLL_INTERVALS_MS } from "@deepiri/shared";

export function useHealthPoll() {
  const { setServices, setLoading } = useHealthStore();

  useEffect(() => {
    async function poll() {
      try {
        const res = await hubClient.get("/health/all");
        setServices(res.data || []);
      } catch {
        // Silently fail — UI shows last known state
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    poll();
    const interval = setInterval(poll, POLL_INTERVALS_MS.HEALTH);
    return () => clearInterval(interval);
  }, [setServices, setLoading]);
}
