import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '../store/uiStore';
import { useHealthStore } from '../store/healthStore';
import { useEventStore } from '../store/eventStore';
import {
  buildCyrexContext,
  probeCyrex,
  streamCyrexChat,
} from '../services/cyrexService';

const QUICK_ACTIONS = [
  'What is down?',
  'Recent errors',
  'Summarize today',
  'Launch Cyrex',
] as const;

type Msg = { role: 'user' | 'assistant'; text: string; streaming?: boolean };

const CyrexSidebar: React.FC = () => {
  const open = useUiStore((s) => s.cyrexOpen);
  const setCyrexOpen = useUiStore((s) => s.setCyrexOpen);
  const selectedNode = useUiStore((s) => s.selectedNode);
  const services = useHealthStore((s) => s.services);
  const byProducer = useEventStore((s) => s.byProducer);
  const events = Object.values(byProducer).flat();
  const connected = useEventStore((s) => s.connected);
  const location = useLocation();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'assistant',
      text: 'Cyrex is standing by. Ask about health, errors, or say “Launch Cyrex” for the full AI workspace.',
    },
  ]);

  useEffect(() => {
    let cancelled = false;
    void probeCyrex().then((ok) => {
      if (!cancelled) setAvailable(ok);
    });
    const id = setInterval(() => {
      void probeCyrex().then((ok) => {
        if (!cancelled) setAvailable(ok);
      });
    }, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const localFallback = useCallback(
    (q: string) => {
      const lower = q.toLowerCase();
      const down = services.filter((s) => s.status === 'down' || s.status === 'degraded');
      if (lower.includes('down')) {
        return down.length
          ? `Degraded/down: ${down.map((s) => s.name ?? s.serviceId).join(', ')}.`
          : 'All polled services look up (or Hub has not reported failures yet).';
      }
      if (lower.includes('error')) {
        const errs = events.filter((e: { error?: boolean }) => e.error).slice(-5);
        if (errs.length) return `Recent error events: ${errs.map((e: { type: string }) => e.type).join(', ')}.`;
        return connected
          ? 'Event stream is connected — no recent error-tagged events in the buffer.'
          : 'Event stream offline. Start Hub Server on :5200 to relay realtime events.';
      }
      if (lower.includes('summarize')) {
        const up = services.filter((s) => s.status === 'up').length;
        return `Snapshot on ${location.pathname}: ${up}/${services.length} services up.`;
      }
      if (lower.includes('launch') || lower.includes('cyrex')) {
        navigate('/ai');
        return 'Opening AI Workspace…';
      }
      return available === false
        ? 'diri-cyrex is unreachable — answering from Hub health cache. Start Cyrex on :8000 for full streaming.'
        : 'I could not reach Cyrex streaming; used local Hub context instead.';
    },
    [available, connected, events, location.pathname, navigate, services]
  );

  const submit = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    if (q.toLowerCase().includes('launch')) {
      setMessages((m) => [...m, { role: 'user', text: q }, { role: 'assistant', text: 'Opening AI Workspace…' }]);
      setInput('');
      navigate('/ai');
      return;
    }

    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'assistant', text: '', streaming: true }]);
    setBusy(true);
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    const ctx = buildCyrexContext({
      page: location.pathname,
      selectedService: selectedNode,
      services,
      events,
    });

    let gotToken = false;
    try {
      await streamCyrexChat(q, ctx, {
        signal: ac.signal,
        onToken: (chunk) => {
          gotToken = true;
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last?.role === 'assistant') {
              copy[copy.length - 1] = { ...last, text: last.text + chunk, streaming: true };
            }
            return copy;
          });
        },
        onDone: () => {
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last?.role === 'assistant') copy[copy.length - 1] = { ...last, streaming: false };
            return copy;
          });
        },
      });
      if (!gotToken) {
        const fb = localFallback(q);
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', text: fb };
          return copy;
        });
      }
    } catch {
      const fb = localFallback(q);
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: 'assistant', text: fb };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="portal-cyrex"
          aria-label="Cyrex AI sidebar"
          data-tour-id="tour-cyrex"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.2 }}
        >
          <div className="portal-cyrex-head">
            <div>
              <strong>Cyrex</strong>
              <span className="portal-cyrex-sub">
                {available === null ? 'checking…' : available ? 'streaming · :8000' : 'offline · local fallback'}
              </span>
            </div>
            <button
              type="button"
              className="portal-icon-btn"
              onClick={() => setCyrexOpen(false)}
              aria-label="Close Cyrex"
            >
              ×
            </button>
          </div>

          {available === false && (
            <div className="portal-cyrex-banner" role="status">
              diri-cyrex unreachable — sidebar stays usable with Hub health answers.
            </div>
          )}

          <div className="portal-cyrex-chips">
            {QUICK_ACTIONS.map((a) => (
              <button key={a} type="button" className="portal-chip" onClick={() => void submit(a)} disabled={busy}>
                {a}
              </button>
            ))}
          </div>

          <div className="portal-cyrex-messages" ref={listRef}>
            {messages.map((m, i) => (
              <div key={`${m.role}-${i}`} className={`portal-cyrex-msg is-${m.role}`}>
                {m.text || (m.streaming ? '…' : '')}
              </div>
            ))}
          </div>

          <form
            className="portal-cyrex-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void submit(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the platform…"
              aria-label="Cyrex message"
              disabled={busy}
            />
            <button type="submit" disabled={busy} aria-label="Send message">
              Send
            </button>
          </form>

          <button type="button" className="portal-cyrex-expand" onClick={() => navigate('/ai')}>
            Expand → AI Workspace
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default CyrexSidebar;
