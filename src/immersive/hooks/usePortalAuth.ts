import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useSceneStore } from "@/immersive/store/sceneStore";

/**
 * Same-app auth: read JWT from portal auth store (no postMessage / second origin).
 */
export function usePortalAuth() {
  const setToken = useSceneStore((s) => s.setToken);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (token) setToken(token);
  }, [token, setToken]);
}
