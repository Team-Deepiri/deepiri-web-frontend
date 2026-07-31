import type { FastifyInstance } from 'fastify';
import type { HealthPoller } from '../services/HealthPoller.js';
import type { ImmersiveChecker } from '../services/ImmersiveChecker.js';

export async function registerHealthRoutes(
  app: FastifyInstance,
  deps: { health: HealthPoller; immersive: ImmersiveChecker }
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
}
