import Fastify from "fastify";
import fastifyWebsocket from "@fastify/websocket";
import fastifyCors from "@fastify/cors";

import { healthRoutes } from "./routes/health";
import { registryRoutes } from "./routes/registry";
import { dockerRoutes } from "./routes/docker";
import { githubRoutes } from "./routes/github";
import { WebSocketRelay } from "./ws/WebSocketRelay";
import { HealthPoller } from "./services/HealthPoller";
import { ImmersiveChecker } from "./services/ImmersiveChecker";
import { DockerWatcher } from "./services/DockerWatcher";

const PORT = Number(process.env.PORT) || 5200;

const server = Fastify({ logger: true });

async function start() {
  // ── Plugins ────────────────────────────────────────────────────────────────
  await server.register(fastifyCors, {
    origin: [
      "http://localhost:5173", // Portal
      "http://localhost:5174", // Immersive
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
  });

  await server.register(fastifyWebsocket);

  // ── Services (start polling) ───────────────────────────────────────────────
  const healthPoller = new HealthPoller();
  const immersiveChecker = new ImmersiveChecker();
  const dockerWatcher = new DockerWatcher();
  const wsRelay = new WebSocketRelay();

  healthPoller.start();
  immersiveChecker.start();
  dockerWatcher.start();
  wsRelay.connect();

  // ── Routes ─────────────────────────────────────────────────────────────────
  await server.register(healthRoutes, {
    healthPoller,
    immersiveChecker,
  });
  await server.register(registryRoutes);
  await server.register(dockerRoutes, { dockerWatcher });
  await server.register(githubRoutes);

  // ── WebSocket endpoint — Portal + Immersive connect here ───────────────────
  server.get("/ws", { websocket: true }, (socket) => {
    server.log.info("Client connected to Hub Server WebSocket");

    wsRelay.addClient(socket);

    socket.on("close", () => {
      wsRelay.removeClient(socket);
      server.log.info("Client disconnected from Hub Server WebSocket");
    });
  });

  // ── Health check ───────────────────────────────────────────────────────────
  server.get("/ping", async () => ({ status: "ok", ts: Date.now() }));

  // ── Start ──────────────────────────────────────────────────────────────────
  await server.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`\n🚀 Hub Server running on http://localhost:${PORT}\n`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
