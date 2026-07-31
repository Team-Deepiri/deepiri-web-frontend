import type { FastifyInstance } from 'fastify';
import type { GraphBuilder } from '../services/GraphBuilder.js';

export async function registerGraphRoutes(
  app: FastifyInstance,
  graphs: GraphBuilder
): Promise<void> {
  app.get('/graph/repos', async () => ({
    repos: graphs.listRepos(),
  }));

  app.get<{ Params: { repoId: string }; Querystring: { force?: string } }>(
    '/graph/:repoId',
    async (req, reply) => {
      try {
        const force = req.query.force === '1' || req.query.force === 'true';
        const graph = graphs.build(req.params.repoId, force);
        return graph;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode ?? 500;
        return reply.code(status).send({
          error: err instanceof Error ? err.message : 'graph build failed',
        });
      }
    }
  );
}
