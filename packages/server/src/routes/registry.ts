import type { FastifyPluginAsync } from "fastify";
import fs from "fs";
import path from "path";

const REGISTRY_PATH = path.join(__dirname, "../config/serviceRegistry.json");

function readRegistry() {
  const raw = fs.readFileSync(REGISTRY_PATH, "utf-8");
  return JSON.parse(raw);
}

function writeRegistry(data: unknown) {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export const registryRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all repos
  fastify.get("/registry", async () => {
    return readRegistry();
  });

  // Get single repo
  fastify.get<{ Params: { id: string } }>("/registry/:id", async (req, reply) => {
    const registry = readRegistry();
    const entry = registry.find((r: any) => r.id === req.params.id);
    if (!entry) return reply.status(404).send({ error: "Repo not found" });
    return entry;
  });

  // Update repo entry
  fastify.patch<{ Params: { id: string }; Body: Record<string, unknown> }>(
    "/registry/:id",
    async (req, reply) => {
      const registry = readRegistry();
      const index = registry.findIndex((r: any) => r.id === req.params.id);
      if (index === -1) return reply.status(404).send({ error: "Repo not found" });
      registry[index] = {
        ...registry[index],
        ...req.body,
        lastUpdated: Date.now(),
      };
      writeRegistry(registry);
      return registry[index];
    }
  );
};
