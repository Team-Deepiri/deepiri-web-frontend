import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useHealthStore } from '../../store/healthStore';
import { useEventStore } from '../../store/eventStore';
import { useUiStore } from '../../store/uiStore';
import { buildCyrexContext, probeCyrex, streamCyrexChat } from '../../services/cyrexService';

type Msg = { role: 'user' | 'assistant'; text: string };

/** Full-height Cyrex chat used by AI Workspace (and reusable elsewhere). */
const CyrexChat: React.FC<{ dense?: boolean }> = ({ dense }) => {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', text: 'Full-screen Cyrex chat. Context includes current route + Hub health.' },
  ]);
  const services = useHealthStore((s) => s.services);
  const byProducer = useEventStore((s) => s.byProducer);
  const events = Object.values(byProducer).flat();
  const selectedNode = useUiStore((s) => s.selectedNode);
  const location = useLocation();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void probeCyrex().then(setAvailable);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: q }, { role: 'assistant', text: '' }]);
    setBusy(true);
    const ctx = buildCyrexContext({
      page: location.pathname,
      selectedService: selectedNode,
      services,
      events,
    });
    try {
      await streamCyrexChat(q, ctx, {
        onToken: (chunk) => {
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = {
              role: 'assistant',
              text: copy[copy.length - 1].text + chunk,
            };
            return copy;
          });
        },
      });
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: 'assistant',
          text: available === false
            ? 'diri-cyrex is offline. Start it on :8000 or use the sidebar local fallback.'
            : 'Cyrex request failed.',
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`cyrex-chat ${dense ? 'is-dense' : ''}`}>
      <div className="cyrex-chat-status">
        {available === false ? 'Cyrex offline' : available ? 'Cyrex live' : 'Checking Cyrex…'}
      </div>
      <div className="cyrex-chat-messages" ref={listRef}>
        {messages.map((m, i) => (
          <div key={`${m.role}-${i}`} className={`portal-cyrex-msg is-${m.role}`}>
            {m.text || '…'}
          </div>
        ))}
      </div>
      <form
        className="portal-cyrex-composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Cyrex…"
          aria-label="Cyrex workspace message"
          disabled={busy}
        />
        <button type="submit" disabled={busy}>
          Send
        </button>
      </form>
    </div>
  );
};

export default CyrexChat;
