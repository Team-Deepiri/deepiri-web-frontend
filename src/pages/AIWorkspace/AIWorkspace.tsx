import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import CyrexChatPanel from '../../components/ai/CyrexChat';
import { agentApi } from '../../api/agentApi';
import { probeCyrex } from '../../services/cyrexService';
import { hubClient } from '../../services/hubClient';
import { useHealthStore } from '../../store/healthStore';
import { useEventStore } from '../../store/eventStore';
import { useUiStore } from '../../store/uiStore';
import './AIWorkspace.css';

const PERSOLA_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PERSOLA_URL) ||
  'http://localhost:3000';

const TABS = [
  { id: 'chat', label: 'Chat', blurb: 'Full Cyrex stream with Hub health context' },
  { id: 'agent', label: 'Agent Builder', blurb: 'Sessions via api-gateway agent routes' },
  { id: 'personas', label: 'Personas', blurb: 'Persola UI for persona authoring' },
  { id: 'prism', label: 'PrismPipe', blurb: 'Intent / capability plane status' },
] as const;

type TabId = (typeof TABS)[number]['id'];

type LayoutMode = 'split' | 'chat' | 'tools';

const STARTERS = [
  'Summarize Hub health and call out anything red.',
  'Which services should I restart first?',
  'Explain the path from Portal → Hub → immersive.',
  'Draft a smoke-test checklist for Cyrex.',
];

const PRISM_CAPABILITIES = [
  {
    id: 'intent',
    title: 'Intent routing',
    detail: 'Maps operator asks to platform capabilities before Cyrex answers.',
  },
  {
    id: 'organic',
    title: 'Organic graph',
    detail: 'Capability registry used by PrismPipe organic intent paths.',
  },
  {
    id: 'tools',
    title: 'Tool surface',
    detail: 'Pairs with deepiri-registry tools catalog for deploy/orchestration.',
  },
];

type AgentSessionRow = { id?: string; title?: string; settings?: unknown };

const AIWorkspace: React.FC = () => {
  const [tab, setTab] = useState<TabId>('chat');
  const [layout, setLayout] = useState<LayoutMode>('split');
  const [iframeError, setIframeError] = useState(false);
  const [starter, setStarter] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState('Workspace agent');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<AgentSessionRow[]>([]);
  const [agentInput, setAgentInput] = useState('');
  const [agentLog, setAgentLog] = useState<Array<{ role: 'user' | 'assistant' | 'system'; text: string }>>([
    { role: 'system', text: 'Create or pick a session, then message the agent API.' },
  ]);
  const [agentBusy, setAgentBusy] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);

  const services = useHealthStore((s) => s.services);
  const byProducer = useEventStore((s) => s.byProducer);
  const selectedNode = useUiStore((s) => s.selectedNode);

  const health = useMemo(() => {
    const up = services.filter((s) => s.status === 'up').length;
    const down = services.filter((s) => s.status === 'down').length;
    const degraded = services.filter((s) => s.status === 'degraded').length;
    return { up, down, degraded, total: services.length };
  }, [services]);

  const recentEvents = useMemo(
    () =>
      Object.values(byProducer)
        .flat()
        .slice(-5)
        .reverse(),
    [byProducer]
  );

  const { data: cyrexLive } = useQuery(['ai', 'cyrex-probe'], () => probeCyrex(), {
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  const { data: registry } = useQuery(['hub', 'registry'], () => hubClient.getRegistry(), {
    staleTime: 30_000,
    retry: 1,
  });

  const { data: tools } = useQuery(['hub', 'registry-tools'], () => hubClient.getRegistryTools(), {
    staleTime: 60_000,
    retry: 1,
    enabled: tab === 'prism' || tab === 'agent',
  });

  useEffect(() => {
    setIframeError(false);
  }, [tab]);

  const refreshSessions = useCallback(async () => {
    try {
      const res = await agentApi.listSessions(12, 0);
      const list = (res?.data ?? res?.sessions ?? res) as AgentSessionRow[] | { sessions?: AgentSessionRow[] };
      const rows = Array.isArray(list) ? list : list?.sessions ?? [];
      setSessions(rows.filter(Boolean));
      setAgentError(null);
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : 'Could not list agent sessions');
    }
  }, []);

  useEffect(() => {
    if (tab === 'agent') void refreshSessions();
  }, [tab, refreshSessions]);

  const createSession = async () => {
    setAgentBusy(true);
    try {
      const res = await agentApi.createSession(sessionTitle.trim() || 'Workspace agent', {
        source: 'ai-workspace',
        selectedService: selectedNode,
      });
      const id = (res?.data?.id ?? res?.id ?? res?.data?.sessionId) as string | undefined;
      if (id) {
        setSessionId(id);
        setAgentLog((log) => [...log, { role: 'system', text: `Session ${id} created.` }]);
      } else {
        setAgentLog((log) => [...log, { role: 'system', text: 'Session created (no id in response).' }]);
      }
      await refreshSessions();
    } catch (err) {
      setAgentError(err instanceof Error ? err.message : 'Create session failed');
    } finally {
      setAgentBusy(false);
    }
  };

  const sendAgent = async () => {
    const text = agentInput.trim();
    if (!text || !sessionId || agentBusy) return;
    setAgentInput('');
    setAgentLog((log) => [...log, { role: 'user', text }]);
    setAgentBusy(true);
    try {
      const res = await agentApi.sendMessage(sessionId, text);
      const reply =
        (res?.data?.message as string) ||
        (res?.message as string) ||
        (res?.data?.content as string) ||
        JSON.stringify(res?.data ?? res).slice(0, 800);
      setAgentLog((log) => [...log, { role: 'assistant', text: reply || '(empty reply)' }]);
      setAgentError(null);
    } catch (err) {
      setAgentLog((log) => [
        ...log,
        {
          role: 'assistant',
          text: err instanceof Error ? err.message : 'Agent request failed',
        },
      ]);
      setAgentError(err instanceof Error ? err.message : 'Agent request failed');
    } finally {
      setAgentBusy(false);
    }
  };

  const showChat = layout !== 'tools';
  const showTools = layout !== 'chat';

  return (
    <div className="ai-workspace" data-tour-id="tour-ai-workspace">
      <header className="ai-workspace-head">
        <div>
          <h1>AI Workspace</h1>
          <p>
            Cyrex, agent sessions, Persola, and PrismPipe — wired to Hub health and deepiri-registry.
          </p>
        </div>
        <div className="ai-workspace-head-actions">
          <div className="ai-workspace-layout" role="group" aria-label="Layout">
            {(
              [
                ['split', 'Split'],
                ['chat', 'Chat focus'],
                ['tools', 'Tools focus'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={layout === id ? 'is-active' : ''}
                onClick={() => setLayout(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="ai-workspace-tabs" role="tablist" aria-label="AI workspace tabs">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={tab === t.id ? 'is-active' : ''}
                onClick={() => {
                  setTab(t.id);
                  if (t.id !== 'chat' && layout === 'chat') setLayout('split');
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="ai-workspace-context" aria-label="Live context">
        <div className="ai-ctx-pill">
          <span className={`ai-dot ${cyrexLive ? 'is-live' : cyrexLive === false ? 'is-down' : ''}`} />
          Cyrex {cyrexLive ? 'live' : cyrexLive === false ? 'offline' : '…'}
        </div>
        <div className="ai-ctx-pill">
          Health {health.up}/{health.total} up
          {health.down > 0 ? ` · ${health.down} down` : ''}
          {health.degraded > 0 ? ` · ${health.degraded} degraded` : ''}
        </div>
        <div className="ai-ctx-pill">
          Selected {selectedNode ?? 'none'}
        </div>
        <div className="ai-ctx-pill">
          Registry{' '}
          {registry?.registryReachable === false
            ? 'seed fallback'
            : registry?.source ?? (registry ? 'linked' : '…')}
          {registry?.repos ? ` · ${registry.repos.length} repos` : ''}
        </div>
        <Link to="/ops/registry" className="ai-ctx-link">
          Open Registry →
        </Link>
      </div>

      <div
        className={`ai-workspace-grid is-${layout}`}
      >
        {showChat && (
          <section className="ai-workspace-panel" aria-label="Cyrex chat">
            <div className="ai-panel-bar">
              <strong>Cyrex</strong>
              <span>{TABS.find((t) => t.id === 'chat')?.blurb}</span>
            </div>
            <div className="ai-starters" aria-label="Prompt starters">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStarter(s)}
                  title={s}
                >
                  {s}
                </button>
              ))}
            </div>
            <CyrexChatPanel dense draftPrompt={starter} onDraftConsumed={() => setStarter(null)} />
          </section>
        )}

        {showTools && (
          <section className="ai-workspace-panel ai-workspace-tools" aria-label={tab}>
            <div className="ai-panel-bar">
              <strong>{TABS.find((t) => t.id === tab)?.label}</strong>
              <span>{TABS.find((t) => t.id === tab)?.blurb}</span>
            </div>

            {tab === 'chat' && (
              <div className="ai-side-stack">
                <div className="ai-card">
                  <h2>Context feed</h2>
                  <p className="ai-muted">
                    Cyrex receives page path, selected service, recent events, and Hub health with every
                    message.
                  </p>
                  <ul className="ai-event-list">
                    {recentEvents.length === 0 && <li className="ai-muted">No recent Hub events yet.</li>}
                    {recentEvents.map((e) => (
                      <li key={e.id}>
                        <code>{e.producer}</code> {e.type}
                        {e.error ? ' · error' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="ai-card">
                  <h2>Jump</h2>
                  <div className="ai-jump-row">
                    <Link to="/ops">Ops Hub</Link>
                    <Link to="/immersive">Enter 3D</Link>
                    <Link to="/agent">Legacy Agent Chat</Link>
                    <a href={PERSOLA_URL} target="_blank" rel="noreferrer">
                      Persola ↗
                    </a>
                  </div>
                </div>
                <div className="ai-card ai-iframe-wrap">
                  <div className="ai-iframe-toolbar">
                    <span>Persola preview</span>
                    <a href={PERSOLA_URL} target="_blank" rel="noreferrer">
                      Open ↗
                    </a>
                  </div>
                  {iframeError ? (
                    <div className="ai-workspace-empty">
                      Persola not reachable at {PERSOLA_URL}. In deploy, use Nginx <code>/personas</code>.
                    </div>
                  ) : (
                    <iframe
                      title="Persola preview"
                      src={PERSOLA_URL}
                      className="ai-workspace-iframe"
                      onError={() => setIframeError(true)}
                    />
                  )}
                </div>
              </div>
            )}

            {tab === 'agent' && (
              <div className="ai-side-stack">
                <div className="ai-card">
                  <h2>New session</h2>
                  <div className="ai-agent-form">
                    <input
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      placeholder="Session title"
                      aria-label="Agent session title"
                    />
                    <button type="button" onClick={() => void createSession()} disabled={agentBusy}>
                      Create
                    </button>
                    <button type="button" onClick={() => void refreshSessions()} disabled={agentBusy}>
                      Refresh
                    </button>
                  </div>
                  {agentError && <p className="ai-error">{agentError}</p>}
                  <ul className="ai-session-list">
                    {sessions.length === 0 && (
                      <li className="ai-muted">No sessions yet — create one or check api-gateway agent routes.</li>
                    )}
                    {sessions.map((s, i) => {
                      const id = s.id || `row-${i}`;
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            className={sessionId === s.id ? 'is-active' : ''}
                            onClick={() => s.id && setSessionId(s.id)}
                          >
                            {s.title || s.id || 'untitled'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="ai-card ai-agent-thread">
                  <h2>Session {sessionId ? <code>{sessionId.slice(0, 8)}…</code> : '(none)'}</h2>
                  <div className="ai-agent-log">
                    {agentLog.map((m, i) => (
                      <div key={`${m.role}-${i}`} className={`ai-agent-msg is-${m.role}`}>
                        {m.text}
                      </div>
                    ))}
                  </div>
                  <form
                    className="ai-agent-composer"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void sendAgent();
                    }}
                  >
                    <input
                      value={agentInput}
                      onChange={(e) => setAgentInput(e.target.value)}
                      placeholder={sessionId ? 'Message agent…' : 'Create or select a session first'}
                      disabled={!sessionId || agentBusy}
                      aria-label="Agent message"
                    />
                    <button type="submit" disabled={!sessionId || agentBusy}>
                      Send
                    </button>
                  </form>
                </div>
              </div>
            )}

            {tab === 'personas' && (
              <div className="ai-card ai-iframe-wrap is-fill">
                <div className="ai-iframe-toolbar">
                  <span>Persola /personas</span>
                  <a href={`${PERSOLA_URL}/personas`} target="_blank" rel="noreferrer">
                    Open ↗
                  </a>
                </div>
                {iframeError ? (
                  <div className="ai-workspace-empty">
                    Persola UI not reachable at {PERSOLA_URL}. Proxied via Nginx <code>/personas</code> in
                    deploy.
                  </div>
                ) : (
                  <iframe
                    title="Persola personas"
                    src={`${PERSOLA_URL}/personas`}
                    className="ai-workspace-iframe"
                    onError={() => setIframeError(true)}
                  />
                )}
              </div>
            )}

            {tab === 'prism' && (
              <div className="ai-side-stack">
                <div className="ai-card">
                  <h2>PrismPipe plane</h2>
                  <p className="ai-muted">
                    Capability registry lives under platform PrismPipe organic intent. Hub surfaces registry
                    tools so operators can see what the plane can call.
                  </p>
                  <div className="ai-cap-grid">
                    {PRISM_CAPABILITIES.map((c) => (
                      <article key={c.id}>
                        <h3>{c.title}</h3>
                        <p>{c.detail}</p>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="ai-card">
                  <h2>Registry tools</h2>
                  <ul className="ai-event-list">
                    {(tools?.tools ?? []).length === 0 && (
                      <li className="ai-muted">
                        No tools from deepiri-registry yet — start registry on :5003 or check Hub{' '}
                        <code>REGISTRY_URL</code>.
                      </li>
                    )}
                    {(tools?.tools as Array<{ name?: string; kind?: string; description?: string }> | undefined)?.map(
                      (t, i) => (
                        <li key={`${t.name ?? i}`}>
                          <strong>{t.name ?? 'tool'}</strong>
                          {t.kind ? ` · ${t.kind}` : ''}
                          {t.description ? ` — ${t.description}` : ''}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AIWorkspace;
