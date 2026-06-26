import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CyrexSidebar } from "@/components/layout/CyrexSidebar";
import { useUIStore } from "@/store/uiStore";
import { useHealthPoll } from "@/hooks/useHealthPoll";
import { useImmersiveStatus } from "@/hooks/useImmersiveStatus";
import { useEventStream } from "@/hooks/useEventStream";

export function Shell() {
  // Start all background polling + WebSocket on mount
  useHealthPoll();
  useImmersiveStatus();
  useEventStream();

  const { sidebarCollapsed, cyrexOpen } = useUIStore();

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Top Bar */}
        <Topbar />

        {/* Page content */}
        <main style={{
          flex: 1,
          overflow: "auto",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
        }}>
          <Outlet />
        </main>
      </div>

      {/* Right — Cyrex AI Sidebar */}
      {cyrexOpen && <CyrexSidebar />}
    </div>
  );
}
