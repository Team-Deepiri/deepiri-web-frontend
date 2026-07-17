import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";

/**
 * Immersive is a route in this same app (/immersive), so it is always "live".
 * Replaces hub-server ImmersiveChecker pinging a separate :5174 container.
 */
export function useImmersiveStatus() {
  const setImmersiveLive = useUIStore((s) => s.setImmersiveLive);

  useEffect(() => {
    setImmersiveLive(true);
  }, [setImmersiveLive]);
}
