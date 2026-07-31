import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import PortalTopbar from './PortalTopbar';
import CyrexSidebar from './CyrexSidebar';
import { useHealthStore } from '../store/healthStore';
import { useEventStore } from '../store/eventStore';
import { useUiStore } from '../store/uiStore';
import { useMetricsStore } from '../store/metricsStore';
import './Shell.css';

/**
 * Phase 3 Portal Shell — 3-column layout:
 * left nav (220px / 60px collapsed) · main · Cyrex sidebar (320px)
 */
const Shell: React.FC = () => {
  const startHealth = useHealthStore((s) => s.startPolling);
  const immersiveStatus = useHealthStore((s) => s.immersiveStatus);
  const setImmersiveLive = useUiStore((s) => s.setImmersiveLive);
  const cyrexOpen = useUiStore((s) => s.cyrexOpen);
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const connectEvents = useEventStore((s) => s.connect);

  useEffect(() => startHealth(10_000), [startHealth]);
  useEffect(() => connectEvents(), [connectEvents]);
  useEffect(() => {
    setImmersiveLive(immersiveStatus === 'live');
  }, [immersiveStatus, setImmersiveLive]);

  // Also poll immersive on the 30s cadence from the doc (health poll is 10s; this keeps uiStore in sync)
  useEffect(() => {
    const id = setInterval(() => {
      setImmersiveLive(useHealthStore.getState().immersiveStatus === 'live');
    }, 30_000);
    return () => clearInterval(id);
  }, [setImmersiveLive]);

  useEffect(() => {
    return useMetricsStore.getState().startTelemetryPolling(30_000);
  }, []);

  return (
    <div
      className={`portal-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${cyrexOpen ? 'cyrex-open' : ''}`}
    >
      {mobileNavOpen && (
        <button
          type="button"
          className="portal-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNavOpen(false)}
        />
      )}
      <PortalSidebar />
      <div className="portal-main">
        <PortalTopbar />
        <div className="portal-content">
          <Outlet />
        </div>
      </div>
      <CyrexSidebar />
    </div>
  );
};

export default Shell;
