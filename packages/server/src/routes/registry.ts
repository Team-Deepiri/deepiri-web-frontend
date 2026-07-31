import type { FastifyInstance } from 'fastify';
import {
  fetchEcosystemHealth,
  fetchPlatformTools,
  findPlatformRepo,
  getMergedCatalog,
  getSeedRegistry,
} from '../services/RegistryStore.js';

export async function registerRegistryRoutes(app: FastifyInstance): Promise<void> {
  /** Merged catalog from deepiri-registry (+ seed overlays). */
  app.get('/registry', async () => {
    const catalog = await getMergedCatalog();
    return {
      repos: catalog.repos,
      services: catalog.services,
      source: catalog.source,
      registryReachable: catalog.registryReachable,
    };
  });

  app.get('/registry/tools', async () => ({ tools: await fetchPlatformTools().catch(() => []) }));

  app.get('/registry/ecosystem', async (_req, reply) => {
    try {
      return await fetchEcosystemHealth();
    } catch (err) {
      return reply.code(502).send({
        error: err instanceof Error ? err.message : 'registry ecosystem unreachable',
      });
    }
  });

  app.get<{ Params: { id: string } }>('/registry/:id', async (req, reply) => {
    const repo = await findPlatformRepo(req.params.id);
    const seed = getSeedRegistry();
    const service =
      seed.services.find((s) => s.id === req.params.id || s.name === req.params.id) ?? null;
    if (!repo && !service) {
      return reply.code(404).send({ error: 'not found' });
    }
    return { repo: repo ?? null, service };
  });

  /**
   * Local-path / launch overlays are seed-only and not mutable via Hub.
   * Dynamic catalog lives in deepiri-registry.
   */
  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/registry/:id',
    async (_req, reply) =>
      reply.code(501).send({
        error: 'Registry mutations belong to deepiri-registry (POST /api/registry/services).',
        hint: 'Hub serves a read-only merge of registry + local seed overlays.',
      })
  );
}
