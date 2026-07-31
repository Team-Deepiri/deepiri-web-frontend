import type { FastifyInstance } from 'fastify';
import { getRegistry, persistRegistry } from '../services/RegistryStore.js';

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

    const registry = getRegistry();
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

    registry.repos.push(entry);
    const persisted = persistRegistry();

    return { ok: true, action: 'created', repo: entry, persisted };
  });

  /** Proxy GitHub README (avoids browser rate-limit / CORS). */
  app.get<{ Params: { owner: string; repo: string }; Querystring: { ref?: string } }>(
    '/github/readme/:owner/:repo',
    async (req, reply) => {
      const ref = req.query.ref || 'main';
      const url = `https://raw.githubusercontent.com/${encodeURIComponent(req.params.owner)}/${encodeURIComponent(req.params.repo)}/${encodeURIComponent(ref)}/README.md`;
      try {
        const res = await fetch(url, {
          headers: { Accept: 'text/plain', 'User-Agent': 'deepiri-hub-server' },
        });
        if (!res.ok) {
          return reply.code(res.status).send({ error: `upstream ${res.status}` });
        }
        const text = await res.text();
        reply.header('Content-Type', 'text/plain; charset=utf-8');
        return text;
      } catch (err) {
        return reply.code(502).send({
          error: err instanceof Error ? err.message : 'github readme proxy failed',
        });
      }
    }
  );

  /** Proxy recent commits. */
  app.get<{ Params: { owner: string; repo: string }; Querystring: { per_page?: string } }>(
    '/github/commits/:owner/:repo',
    async (req, reply) => {
      const perPage = Math.min(20, Math.max(1, Number(req.query.per_page) || 5));
      const url = `https://api.github.com/repos/${encodeURIComponent(req.params.owner)}/${encodeURIComponent(req.params.repo)}/commits?per_page=${perPage}`;
      try {
        const headers: Record<string, string> = {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'deepiri-hub-server',
        };
        if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
        const res = await fetch(url, { headers });
        if (!res.ok) {
          const body = await res.text();
          return reply.code(res.status).send({ error: body || `upstream ${res.status}` });
        }
        return res.json();
      } catch (err) {
        return reply.code(502).send({
          error: err instanceof Error ? err.message : 'github commits proxy failed',
        });
      }
    }
  );
}
