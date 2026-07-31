import type { FastifyInstance } from 'fastify';
import type { DeepiriEvent, EventProducer } from '@deepiri/shared/types';
import { WebSocketServer, type WebSocket } from 'ws';
import { io as ioClient, type Socket } from 'socket.io-client';

const PRODUCERS: EventProducer[] = [
  'synapse',
  'sugarGlider',
  'languageIntelligence',
  'redisStreams',
  'realtimeGateway',
];

function tagProducer(raw: unknown): EventProducer {
  const s = String(raw ?? '').toLowerCase();
  if (s.includes('sugar')) return 'sugarGlider';
  if (s.includes('language') || s.includes('lease')) return 'languageIntelligence';
  if (s.includes('redis')) return 'redisStreams';
  if (s.includes('realtime') || s.includes('gateway')) return 'realtimeGateway';
  if (s.includes('synapse')) return 'synapse';
  return 'realtimeGateway';
}

function normalizeEvent(payload: unknown): DeepiriEvent {
  const obj = (payload && typeof payload === 'object' ? payload : {}) as Record<string, unknown>;
  return {
    id: String(obj.id ?? obj.eventId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    producer: tagProducer(obj.producer ?? obj.source ?? obj.channel),
    type: String(obj.type ?? obj.eventType ?? obj.name ?? 'event'),
    timestamp: String(obj.timestamp ?? obj.ts ?? new Date().toISOString()),
    payload: (obj.payload ?? obj.data ?? obj) as Record<string, unknown>,
    error: Boolean(obj.error ?? obj.isError ?? false),
  };
}

/**
 * Relays realtime-gateway events to Hub Server WebSocket clients.
 * If the upstream gateway is down, local clients still connect; events simply pause.
 */
export class WebSocketRelay {
  private upstream: Socket | null = null;
  private wss: WebSocketServer | null = null;
  private clients = new Set<WebSocket>();
  private readonly gatewayUrl: string;
  private recent: DeepiriEvent[] = [];
  private readonly recentCap = 200;
  private latestHealth: unknown[] = [];

  constructor(gatewayUrl = process.env.REALTIME_GATEWAY_URL ?? 'http://localhost:5008') {
    this.gatewayUrl = gatewayUrl;
  }

  attach(server: FastifyInstance): void {
    this.wss = new WebSocketServer({ server: server.server, path: '/ws/events' });
    this.wss.on('connection', (socket) => {
      this.clients.add(socket);
      socket.send(
        JSON.stringify({
          type: 'hello',
          producers: PRODUCERS,
          recent: this.recent.slice(-50),
          health: this.latestHealth,
        })
      );
      socket.on('close', () => this.clients.delete(socket));
      socket.on('error', () => this.clients.delete(socket));
    });

    this.connectUpstream();
  }

  stop(): void {
    this.upstream?.disconnect();
    this.upstream = null;
    for (const c of this.clients) c.close();
    this.clients.clear();
    this.wss?.close();
    this.wss = null;
  }

  getRecent(): DeepiriEvent[] {
    return [...this.recent];
  }

  /** Inject a synthetic event (useful for demos / tests). */
  publish(event: DeepiriEvent): void {
    this.recent.push(event);
    if (this.recent.length > this.recentCap) this.recent.shift();
    this.broadcast({ type: 'event', event });
  }

  /** Push health snapshot to Immersive + Portal WS clients. */
  publishHealth(services: unknown[]): void {
    this.latestHealth = services;
    this.broadcast({ type: 'health', services, ts: new Date().toISOString() });
  }

  private broadcast(payload: unknown): void {
    const msg = JSON.stringify(payload);
    for (const c of this.clients) {
      if (c.readyState === 1) c.send(msg);
    }
  }

  private connectUpstream(): void {
    try {
      this.upstream = ioClient(this.gatewayUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 3_000,
        timeout: 5_000,
      });

      this.upstream.on('connect', () => {
        serverLog(`WS relay connected to ${this.gatewayUrl}`);
      });
      this.upstream.on('disconnect', () => {
        serverLog(`WS relay disconnected from ${this.gatewayUrl}`);
      });
      this.upstream.on('connect_error', () => {
        /* gateway optional — hub stays up */
      });

      const forward = (payload: unknown) => this.publish(normalizeEvent(payload));
      for (const evt of ['event', 'message', 'notification', 'platform:event']) {
        this.upstream.on(evt, forward);
      }
      this.upstream.onAny((_event, ...args) => {
        if (args[0] && typeof args[0] === 'object') forward(args[0]);
      });
    } catch (err) {
      serverLog(`WS relay failed to start: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

function serverLog(msg: string): void {
  console.log(`[hub-ws] ${msg}`);
}
