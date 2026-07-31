import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../store/uiStore';
import { useHealthStore } from '../store/healthStore';
import { useEventStore } from '../store/eventStore';

const QUICK_ACTIONS = [
  'What is down?',
  'Recent errors',
  'Summarize today',
  'Launch Cyrex',
] as const;

const CyrexSidebar: React.FC = () => {
  const open = useUiStore((s) => s.cyrexOpen);
  const setCyrexOpen = useUiStore((s) => s.setCyrexOpen);
  const services = useHealthStore((s) => s.services);
  const connected = useEventStore((s) => s.connected);
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Cyrex sidebar is ready. Full streaming lands in Phase 6 — ask a quick question for a local health summary.',
    },
  ]);

  if (!open) return null;

  const down = services.filter((s) => s.status === 'down' || s.status === 'degraded');

  const respondLocally = (q: string) => {
    const lower = q.toLowerCase();
    if (lower.includes('down') || lower.includes('what is down')) {
      return down.length
        ? `Degraded/down right now: ${down.map((s) => s.name ?? s.serviceId).join(', ')}.`
        : 'All polled services look up (or Hub has not seen failures yet).';
    }
    if (lower.includes('error')) {
      return connected
        ? 'Event stream is connected — open Event River for live error cards.'
        : 'Event stream is offline. Start Hub Server on :5200 to relay realtime events.';
    }
    if (lower.includes('summarize')) {
      const up = services.filter((s) => s.status === 'up').length;
      return `Today’s snapshot: ${up}/${services.length} services up. Immersive status is tracked in the top bar.`;
    }
    if (lower.includes('launch') || lower.includes('cyrex')) {
      navigate('/ai');
      return 'Opening AI Workspace…';
    }
    return 'Phase 6 wires this panel to diri-cyrex :8000 with streaming tokens. Until then, try the quick actions.';
  };

  const submit = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'assistant', text: respondLocally(q) }]);
    setInput('');
  };

  return (
    <aside className="portal-cyrex" aria-label="Cyrex AI sidebar">
      <div className="portal-cyrex-head">
        <div>
          <strong>Cyrex</strong>
          <span className="portal-cyrex-sub">AI sidebar</span>
        </div>
        <button type="button" className="portal-icon-btn" onClick={() => setCyrexOpen(false)} aria-label="Close Cyrex">
          ×
        </button>
      </div>

      <div className="portal-cyrex-chips">
        {QUICK_ACTIONS.map((a) => (
          <button key={a} type="button" className="portal-chip" onClick={() => submit(a)}>
            {a}
          </button>
        ))}
      </div>

      <div className="portal-cyrex-messages">
        {messages.map((m, i) => (
          <div key={`${m.role}-${i}`} className={`portal-cyrex-msg is-${m.role}`}>
            {m.text}
          </div>
        ))}
      </div>

      <form
        className="portal-cyrex-composer"
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the platform…"
          aria-label="Cyrex message"
        />
        <button type="submit">Send</button>
      </form>
    </aside>
  );
};

export default CyrexSidebar;
