import type { FastifyPluginAsync } from "fastify";
import type { DockerWatcher } from "../services/DockerWatcher";

interface DockerRouteOptions {
  dockerWatcher: DockerWatcher;
}

export const dockerRoutes: FastifyPluginAsync<DockerRouteOptions> = async (
  fastify,
  { dockerWatcher }
) => {
  fastify.get("/docker/status", async () => {
    return dockerWatcher.getAll();
  });
};
