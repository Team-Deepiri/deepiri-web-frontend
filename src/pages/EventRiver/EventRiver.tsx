import React, { useEffect, useMemo, useState } from 'react';
import { useEventStore } from '../../store/eventStore';
import type { DeepiriEvent, EventProducer } from '../../types/hub';
import { PRODUCERS, colorMap, errorColor, producerLabels } from '../../utils/colorMap';
import './EventRiver.css';

const LANE_CAP = 50;

const EventRiver: React.FC = () => {
  const byProducer = useEventStore((s) => s.byProducer);
  const paused = useEventStore((s) => s.paused);
  const connected = useEventStore((s) => s.connected);
  const demoRunning = useEventStore((s) => s.demoRunning);
  const setPaused = useEventStore((s) => s.setPaused);
  const clear = useEventStore((s) => s.clear);
  const startDemoStream = useEventStore((s) => s.startDemoStream);

  const [enabled, setEnabled] = useState<Set<EventProducer>>(new Set(PRODUCERS));
  const [keyword, setKeyword] = useState('');
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [selected, setSelected] = useState<DeepiriEvent | null>(null);

  useEffect(() => {
    // Auto-start a light demo stream so the river is alive without realtime-gateway
    const stop = startDemoStream(1_400);
    return stop;
  }, [startDemoStream]);

  const toggleProducer = (p: EventProducer) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const filterLane = (events: DeepiriEvent[]) => {
    const q = keyword.trim().toLowerCase();
    return events
      .filter((e) => (errorsOnly ? e.error : true))
      .filter((e) => {
        if (!q) return true;
        return (
          e.type.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          JSON.stringify(e.payload ?? {}).toLowerCase().includes(q)
        );
      })
      .slice(-LANE_CAP)
      .reverse();
  };

  const total = useMemo(
    () => PRODUCERS.reduce((n, p) => n + byProducer[p].length, 0),
    [byProducer]
  );

  return (
    <div className="event-river">
      <header className="event-river-toolbar">
        <div>
          <h1>Event Stream River</h1>
          <p>
            {connected ? 'Hub WS connected' : 'Hub WS offline'} · {total} buffered
            {demoRunning ? ' · demo stream on' : ''}
          </p>
        </div>
        <div className="event-river-actions">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Filter keyword…"
            aria-label="Filter events"
          />
          <label className="event-river-check">
            <input type="checkbox" checked={errorsOnly} onChange={(e) => setErrorsOnly(e.target.checked)} />
            Errors only
          </label>
          <button type="button" onClick={() => setPaused(!paused)}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" onClick={() => clear()}>
            Clear
          </button>
        </div>
      </header>

      <div className="event-river-filters">
        {PRODUCERS.map((p) => (
          <button
            key={p}
            type="button"
            className={`event-river-chip ${enabled.has(p) ? 'is-on' : ''}`}
            style={{ ['--lane' as string]: colorMap[p] }}
            onClick={() => toggleProducer(p)}
          >
            {producerLabels[p]}
          </button>
        ))}
      </div>

      <div className="event-river-lanes">
        {PRODUCERS.filter((p) => enabled.has(p)).map((p) => {
          const cards = filterLane(byProducer[p]);
          // Errors float to top
          const ordered = [...cards].sort((a, b) => Number(b.error) - Number(a.error));
          return (
            <section key={p} className="event-river-lane" style={{ ['--lane' as string]: colorMap[p] }}>
              <header>
                <span className="event-river-dot" />
                <strong>{producerLabels[p]}</strong>
                <em>{ordered.length}</em>
              </header>
              <div className="event-river-cards">
                {ordered.length === 0 && <p className="event-river-empty">Waiting for events…</p>}
                {ordered.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    className={`event-river-card ${ev.error ? 'is-error' : ''}`}
                    onClick={() => setSelected(ev)}
                  >
                    <span className="event-river-card-type">{ev.type}</span>
                    <span className="event-river-card-time">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selected && (
        <aside className="event-river-detail">
          <button type="button" onClick={() => setSelected(null)}>
            Close
          </button>
          <h2>{selected.type}</h2>
          <dl>
            <div>
              <dt>ID</dt>
              <dd>{selected.id}</dd>
            </div>
            <div>
              <dt>Producer</dt>
              <dd>{producerLabels[selected.producer]}</dd>
            </div>
            <div>
              <dt>Time</dt>
              <dd>{selected.timestamp}</dd>
            </div>
            <div>
              <dt>Error</dt>
              <dd style={{ color: selected.error ? errorColor : undefined }}>
                {selected.error ? 'yes' : 'no'}
              </dd>
            </div>
          </dl>
          <pre>{JSON.stringify(selected.payload ?? {}, null, 2)}</pre>
        </aside>
      )}
    </div>
  );
};

export default EventRiver;
