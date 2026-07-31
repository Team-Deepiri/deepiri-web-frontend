import type { FastifyInstance } from 'fastify';
import type { DeepiriEvent } from '@deepiri/shared/types';
import type { HealthPoller } from '../services/HealthPoller.js';
import type { ImmersiveChecker } from '../services/ImmersiveChecker.js';
import type { WebSocketRelay } from '../ws/WebSocketRelay.js';

export async function registerHealthRoutes(
  app: FastifyInstance,
  deps: { health: HealthPoller; immersive: ImmersiveChecker; relay?: WebSocketRelay }
): Promise<void> {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'hub-server',
    ts: new Date().toISOString(),
  }));

  app.get('/health/all', async () => ({
    services: deps.health.getAll(),
    immersive: deps.immersive.getStatus(),
  }));

  app.get<{ Params: { serviceId: string } }>('/health/:serviceId', async (req, reply) => {
    if (req.params.serviceId === 'immersive') {
      return deps.immersive.getStatus();
    }
    const one = deps.health.getOne(req.params.serviceId);
    if (!one) {
      return reply.code(404).send({ error: 'service not found' });
    }
    return one;
  });

  app.get('/health/immersive', async () => deps.immersive.getStatus());

  /** Force an immersive re-check (dev / portal refresh). */
  app.post('/health/immersive/check', async () => deps.immersive.recheck());

  /** Inject a demo event onto the Hub WS bus for Immersive particle smoke tests. */
  app.post<{
    Body?: { producer?: string; type?: string; error?: boolean };
  }>('/events/demo', async (req) => {
    if (!deps.relay) {
      return { ok: false, error: 'relay not ready' };
    }
    const body = req.body ?? {};
    const event: DeepiriEvent = {
      id: `demo-${Date.now()}`,
      producer: (body.producer as DeepiriEvent['producer']) ?? 'realtimeGateway',
      type: body.type ?? 'pulse',
      timestamp: new Date().toISOString(),
      error: Boolean(body.error),
      payload: { source: 'hub-demo' },
    };
    deps.relay.publish(event);
    return { ok: true, event };
  });
}
