import type { FastifyInstance } from 'fastify';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import registry from '../config/serviceRegistry.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = path.resolve(__dirname, '../config/serviceRegistry.json');

type GhWebhookBody = {
  repository?: {
    name?: string;
    full_name?: string;
    description?: string | null;
    html_url?: string;
    clone_url?: string;
    ssh_url?: string;
  };
  action?: string;
};

export async function registerGithubRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: GhWebhookBody }>('/webhook/github', async (req) => {
    const repo = req.body?.repository;
    if (!repo?.name) {
      return { ok: false, reason: 'no repository in payload' };
    }

    const id = repo.name;
    const existing = registry.repos.find((r) => r.id === id);
    if (existing) {
      return { ok: true, action: 'exists', repo: existing };
    }

    const entry = {
      id,
      name: repo.name,
      description: repo.description ?? undefined,
      category: 'discovered',
      tags: ['github-webhook'],
      localPath: `../${repo.name}`,
      httpsUrl: repo.html_url ?? repo.clone_url,
      sshUrl: repo.ssh_url,
    };

    (registry.repos as Array<typeof entry>).push(entry);
    try {
      fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
    } catch (err) {
      console.warn('[hub] webhook persist failed:', err);
    }

    return { ok: true, action: 'created', repo: entry };
  });
}
