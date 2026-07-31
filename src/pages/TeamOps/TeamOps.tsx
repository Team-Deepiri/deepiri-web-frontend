import React, { Suspense, lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import './TeamOps.css';

const TaskManagement = lazy(() => import('../TaskManagement'));
const Notifications = lazy(() => import('../Notifications'));
const GroupChats = lazy(() => import('../GroupChats'));
const AnalyticsDashboard = lazy(() => import('../AnalyticsDashboard'));

const TABS = [
  { id: 'tasks', label: 'Tasks', hint: 'Open work by role' },
  { id: 'notifications', label: 'Notifications', hint: 'Alerts & mentions' },
  { id: 'messages', label: 'Messages', hint: 'Group chats' },
  { id: 'analytics', label: 'Analytics', hint: 'Team metrics' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const TeamOps: React.FC = () => {
  const [tab, setTab] = useState<TabId>('tasks');

  return (
    <div className="team-ops" data-tour-id="tour-team-ops">
      <header className="team-ops-head">
        <div>
          <h1>Team Ops</h1>
          <p>Tasks, notifications, messages, and analytics — migrated into the portal shell.</p>
        </div>
        <div className="team-ops-links">
          <Link to="/tasks">Open classic Tasks</Link>
          <Link to="/notifications">Notifications</Link>
          <Link to="/group-chats">Messages</Link>
          <Link to="/analytics">Analytics</Link>
        </div>
      </header>

      <div className="team-ops-tabs" role="tablist" aria-label="Team Ops sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'is-active' : ''}
            onClick={() => setTab(t.id)}
          >
            <strong>{t.label}</strong>
            <span>{t.hint}</span>
          </button>
        ))}
      </div>

      <div
        className={`team-ops-body ${tab === 'tasks' ? 'is-highlight' : ''}`}
        data-tour-id="tour-team-tasks"
      >
        <ErrorBoundary>
          <Suspense fallback={<div className="team-ops-loading">Loading {tab}…</div>}>
            {tab === 'tasks' && <TaskManagement />}
            {tab === 'notifications' && <Notifications />}
            {tab === 'messages' && <GroupChats />}
            {tab === 'analytics' && <AnalyticsDashboard />}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default TeamOps;
