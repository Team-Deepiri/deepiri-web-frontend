import React from 'react';
import PlaceholderPage from './PlaceholderPage';

export const EventRiverPage = () => (
  <PlaceholderPage title="Event Stream River" phase="Phase 4">
    <p style={{ marginTop: '0.75rem' }}>
      Five producer lanes (Synapse, Sugar Glider, Language Intelligence, Redis Streams, Realtime Gateway)
      will stream from Hub Server WebSocket events already buffered in <code>eventStore</code>.
    </p>
  </PlaceholderPage>
);

export const DependenciesPage = () => (
  <PlaceholderPage title="Dependency Map" phase="Phase 4" />
);

export const PulsePage = () => (
  <PlaceholderPage title="Platform Pulse" phase="Phase 4" />
);

export const SankeyPage = () => (
  <PlaceholderPage title="Sankey + Journey Tracer" phase="Phase 4" />
);

export const LaunchpadPage = () => (
  <PlaceholderPage title="Repo Launchpad" phase="Phase 4">
    <p style={{ marginTop: '0.75rem' }}>
      Registry data is available via Hub <code>GET /registry</code> and platform registry service.
    </p>
  </PlaceholderPage>
);

export const AIWorkspacePage = () => (
  <PlaceholderPage title="AI Workspace" phase="Phase 6">
    <p style={{ marginTop: '0.75rem' }}>
      Two-panel Cyrex + Persola workspace. The Cyrex sidebar in the shell is the Phase 3 foothold.
    </p>
  </PlaceholderPage>
);

export const TeamOpsPage = () => (
  <PlaceholderPage title="Team Ops" phase="Phase 8" />
);

export const OnboardingPage = () => (
  <PlaceholderPage title="Start Here" phase="Phase 7">
    <p style={{ marginTop: '0.75rem' }}>
      Guided tour overlay will spotlight live hub UI. Entry point is always available from the sidebar.
    </p>
  </PlaceholderPage>
);
