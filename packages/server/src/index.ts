import Fastify from 'fastify';
import cors from '@fastify/cors';
import { HealthPoller } from './services/HealthPoller.js';
import { ImmersiveChecker } from './services/ImmersiveChecker.js';
import { DockerWatcher } from './services/DockerWatcher.js';
import { GraphBuilder } from './services/GraphBuilder.js';
import { WebSocketRelay } from './ws/WebSocketRelay.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerRegistryRoutes } from './routes/registry.js';
import { registerDockerRoutes } from './routes/docker.js';
import { registerGithubRoutes } from './routes/github.js';
import { registerGraphRoutes } from './routes/graph.js';

const PORT = Number(process.env.PORT ?? 5200);
const HOST = process.env.HOST ?? '0.0.0.0';

async function main(): Promise<void> {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
      true,
    ],
    credentials: true,
  });

  const health = new HealthPoller();
  const immersive = new ImmersiveChecker();
  const docker = new DockerWatcher();
  const graphs = new GraphBuilder();
  const relay = new WebSocketRelay();

  health.start();
  immersive.start();
  docker.start();

  await registerHealthRoutes(app, { health, immersive });
  await registerRegistryRoutes(app);
  await registerDockerRoutes(app, docker);
  await registerGithubRoutes(app);
  await registerGraphRoutes(app, graphs);

  await app.listen({ port: PORT, host: HOST });
  relay.attach(app);

  const shutdown = async () => {
    health.stop();
    immersive.stop();
    docker.stop();
    relay.stop();
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  app.log.info(`Hub Server listening on http://${HOST}:${PORT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
