import type { FastifyPluginAsync } from "fastify";
import type { HealthPoller } from "../services/HealthPoller";
import type { ImmersiveChecker } from "../services/ImmersiveChecker";

interface HealthRouteOptions {
  healthPoller: HealthPoller;
  immersiveChecker: ImmersiveChecker;
}

export const healthRoutes: FastifyPluginAsync<HealthRouteOptions> = async (
  fastify,
  { healthPoller, immersiveChecker }
) => {
  // All services health
  fastify.get("/health/all", async () => {
    return healthPoller.getAll();
  });

  // Single service health
  fastify.get<{ Params: { serviceId: string } }>(
    "/health/:serviceId",
    async (req, reply) => {
      const service = healthPoller.getById(req.params.serviceId);
      if (!service) {
        return reply.status(404).send({ error: "Service not found" });
      }
      return service;
    }
  );

  // Immersive live/down status — Portal polls this to show/hide Enter 3D button
  fastify.get("/health/immersive", async () => {
    return immersiveChecker.getStatus();
  });
};
