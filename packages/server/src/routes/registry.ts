import type { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import registry from '../config/serviceRegistry.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.resolve(__dirname, '../config/serviceRegistry.json');

export async function registerRegistryRoutes(app: FastifyInstance): Promise<void> {
  app.get('/registry', async () => ({
    repos: registry.repos,
    services: registry.services,
  }));

  app.get<{ Params: { id: string } }>('/registry/:id', async (req, reply) => {
    const repo = registry.repos.find((r) => r.id === req.params.id);
    const service = registry.services.find((s) => s.id === req.params.id);
    if (!repo && !service) {
      return reply.code(404).send({ error: 'not found' });
    }
    return { repo: repo ?? null, service: service ?? null };
  });

  app.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    '/registry/:id',
    async (req, reply) => {
      const idx = registry.repos.findIndex((r) => r.id === req.params.id);
      if (idx < 0) {
        return reply.code(404).send({ error: 'repo not found' });
      }
      const current = registry.repos[idx];
      const next = {
        ...current,
        ...pick(req.body, ['name', 'description', 'category', 'tags', 'localPath', 'httpsUrl', 'sshUrl']),
      };
      registry.repos[idx] = next as (typeof registry.repos)[number];
      persistRegistry();
      return { repo: registry.repos[idx] };
    }
  );
}

function pick<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    if (k in obj) out[k] = obj[k];
  }
  return out as Partial<T>;
}

function persistRegistry(): void {
  try {
    fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
  } catch (err) {
    console.warn('[hub] failed to persist registry:', err);
  }
}
