import type { FastifyPluginAsync } from "fastify";
import fs from "fs";
import path from "path";

const REGISTRY_PATH = path.join(__dirname, "../config/serviceRegistry.json");

export const githubRoutes: FastifyPluginAsync = async (fastify) => {
  // GitHub webhook — auto-discovers new repos pushed to the org
  fastify.post("/webhook/github", async (req, reply) => {
    const body = req.body as Record<string, any>;
    const event = req.headers["x-github-event"];

    if (event === "create" && body?.ref_type === "repository") {
      const repoName = body?.repository?.name;
      const repoUrl = body?.repository?.html_url;
      const cloneSSH = body?.repository?.ssh_url;
      const cloneHTTPS = body?.repository?.clone_url;

      if (repoName) {
        const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
        const exists = registry.find((r: any) => r.name === repoName);

        if (!exists) {
          registry.push({
            id: repoName,
            name: repoName,
            description: "New repo — add description",
            category: "Experimental",
            stack: [],
            port: null,
            hasUI: false,
            gitUrl: repoUrl || "",
            cloneSSH: cloneSSH || "",
            cloneHTTPS: cloneHTTPS || "",
            status: "unknown",
            lastUpdated: Date.now(),
          });
          fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2));
          fastify.log.info(`New repo auto-discovered: ${repoName}`);
        }
      }
    }

    return { received: true };
  });
};
