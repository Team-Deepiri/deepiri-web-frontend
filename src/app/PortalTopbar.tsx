import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, PanelRight, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useHealthStore } from '../store/healthStore';
import { useUiStore } from '../store/uiStore';
import ImmersiveButton from './ImmersiveButton';
import ProgressTracker from '../components/onboarding/ProgressTracker';

function healthDotClass(status: string): string {
  if (status === 'live' || status === 'up') return 'is-green';
  if (status === 'degraded' || status === 'amber') return 'is-amber';
  if (status === 'down' || status === 'red') return 'is-red';
  return 'is-muted';
}

const PortalTopbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const services = useHealthStore((s) => s.services);
  const immersiveStatus = useHealthStore((s) => s.immersiveStatus);
  const toggleCyrex = useUiStore((s) => s.toggleCyrex);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const cyrexOpen = useUiStore((s) => s.cyrexOpen);

  const up = services.filter((s) => s.status === 'up').length;
  const down = services.filter((s) => s.status === 'down' || s.status === 'degraded').length;
  const crumb = location.pathname.replace(/^\//, '') || 'home';

  return (
    <header className="portal-topbar">
      <div className="portal-topbar-left">
        <button
          type="button"
          className="portal-icon-btn portal-mobile-only"
          aria-label="Open navigation"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu size={18} />
        </button>
        <div className="portal-breadcrumb" title={crumb}>
          {crumb}
        </div>
      </div>

      <div className="portal-topbar-center">
        <div className="portal-health-dots" title={`${up} up · ${down} issues · immersive ${immersiveStatus}`}>
          <span className={`portal-health-dot ${healthDotClass(down === 0 ? 'up' : 'degraded')}`} />
          <span className={`portal-health-dot ${healthDotClass(up > 0 ? 'up' : 'down')}`} />
          <span className={`portal-health-dot ${healthDotClass(immersiveStatus)}`} />
        </div>
        <label className="portal-search">
          <Search size={14} />
          <input type="search" placeholder="Search portal…" aria-label="Search portal" disabled />
        </label>
      </div>

      <div className="portal-topbar-right">
        <ProgressTracker />
        <ImmersiveButton />
        <Link to="/notifications" className="portal-icon-btn" aria-label="Notifications">
          <Bell size={16} />
        </Link>
        <button
          type="button"
          className={`portal-icon-btn ${cyrexOpen ? 'is-active' : ''}`}
          aria-label="Toggle Cyrex AI sidebar"
          aria-pressed={cyrexOpen}
          onClick={toggleCyrex}
        >
          <PanelRight size={16} />
        </button>
        <div className="portal-avatar" title={user?.email ?? 'Account'}>
          <span>{(user?.name || user?.email || 'U').slice(0, 1).toUpperCase()}</span>
          <button type="button" className="portal-signout" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
};

export default PortalTopbar;
