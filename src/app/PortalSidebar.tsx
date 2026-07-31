import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';

type NavItem = {
  label: string;
  to: string;
  icon: string;
  section?: string;
};

const NAV: NavItem[] = [
  { label: 'Home', to: '/dashboard', icon: '⌂', section: 'Portal' },
  { label: 'Event River', to: '/events-river', icon: '≋', section: 'Portal' },
  { label: 'Dependencies', to: '/dependencies', icon: '⧉', section: 'Portal' },
  { label: 'Ops', to: '/ops', icon: '⚙', section: 'Ops' },
  { label: 'Pulse', to: '/pulse', icon: '⌁', section: 'Ops' },
  { label: 'Sankey', to: '/sankey', icon: '⤵', section: 'Ops' },
  { label: 'Launchpad', to: '/launchpad', icon: '🚀', section: 'Repos' },
  { label: 'Repo Graph', to: '/graph', icon: '◈', section: 'Repos' },
  { label: 'AI Workspace', to: '/ai', icon: '✦', section: 'AI' },
  { label: 'Team Ops', to: '/team', icon: '☰', section: 'Team' },
];

const PortalSidebar: React.FC = () => {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const setTourActive = useUiStore((s) => s.setTourActive);
  const mobileNavOpen = useUiStore((s) => s.mobileNavOpen);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);

  let lastSection = '';

  return (
    <aside
      className={`portal-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileNavOpen ? 'is-mobile-open' : ''}`}
      aria-label="Portal navigation"
    >
      <div className="portal-sidebar-brand">
        {!collapsed && <span className="portal-sidebar-brand-text">Deepiri</span>}
        <button
          type="button"
          className="portal-icon-btn"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="portal-sidebar-nav">
        {NAV.map((item) => {
          const showSection = Boolean(item.section && item.section !== lastSection && !collapsed);
          if (item.section) lastSection = item.section;
          return (
            <React.Fragment key={item.to}>
              {showSection && <div className="portal-nav-section">{item.section}</div>}
              <NavLink
                to={item.to}
                className={({ isActive }) => `portal-nav-link ${isActive ? 'is-active' : ''}`}
                title={item.label}
                onClick={() => setMobileNavOpen(false)}
              >
                <span className="portal-nav-icon" aria-hidden>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

      <div className="portal-sidebar-footer">
        <NavLink
          to="/onboarding"
          className="portal-start-here"
          title="Start Here"
          onClick={() => {
            setTourActive(true);
            setMobileNavOpen(false);
          }}
        >
          <span aria-hidden>◎</span>
          {!collapsed && <span>Start Here</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default PortalSidebar;
