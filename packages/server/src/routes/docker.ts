import type { FastifyInstance } from 'fastify';
import type { DockerWatcher } from '../services/DockerWatcher.js';

export async function registerDockerRoutes(
  app: FastifyInstance,
  docker: DockerWatcher
): Promise<void> {
  app.get('/docker/status', async () => ({
    repos: docker.getAll(),
  }));

  app.get<{ Params: { repoId: string } }>('/docker/status/:repoId', async (req, reply) => {
    const one = docker.getOne(req.params.repoId);
    if (!one) {
      return reply.code(404).send({ error: 'repo not found or not polled yet' });
    }
    return one;
  });
}
