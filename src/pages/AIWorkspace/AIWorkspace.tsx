import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CyrexChatPanel from '../../components/ai/CyrexChat';
import './AIWorkspace.css';

const PERSOLA_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_PERSOLA_URL) ||
  'http://localhost:3000';

const TABS = [
  { id: 'chat', label: 'Chat' },
  { id: 'agent', label: 'Agent Builder' },
  { id: 'personas', label: 'Personas' },
  { id: 'prism', label: 'PrismPipe' },
] as const;

type TabId = (typeof TABS)[number]['id'];

const AIWorkspace: React.FC = () => {
  const [tab, setTab] = useState<TabId>('chat');
  const [iframeOk, setIframeOk] = useState(true);

  useEffect(() => {
    // Soft probe — iframe may still load even if fetch is CORS-blocked
    const t = window.setTimeout(() => setIframeOk(true), 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="ai-workspace" data-tour-id="tour-ai-workspace">
      <header className="ai-workspace-head">
        <div>
          <h1>AI Workspace</h1>
          <p>Cyrex chat + Persola personas side by side.</p>
        </div>
        <div className="ai-workspace-tabs" role="tablist" aria-label="AI workspace tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? 'is-active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="ai-workspace-grid">
        <section className="ai-workspace-panel" aria-label="Cyrex chat">
          <CyrexChatPanel dense />
        </section>
        <section className="ai-workspace-panel ai-workspace-persola" aria-label="Persola">
          {tab === 'chat' || tab === 'personas' ? (
            iframeOk ? (
              <iframe
                title="Persola"
                src={`${PERSOLA_URL}${tab === 'personas' ? '/personas' : '/'}`}
                className="ai-workspace-iframe"
              />
            ) : (
              <div className="ai-workspace-empty">
                Persola UI not reachable at {PERSOLA_URL}. Proxied via Nginx <code>/personas</code> in deploy.
              </div>
            )
          ) : (
            <div className="ai-workspace-empty">
              <h2>{TABS.find((t) => t.id === tab)?.label}</h2>
              <p>
                Scaffold reserved for Phase 6+ agent tooling. Use{' '}
                <Link to="/agent">Agent Chat</Link> for the existing Cyrex agent surface.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AIWorkspace;
