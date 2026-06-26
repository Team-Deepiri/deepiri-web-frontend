import { exec } from "child_process";
import { POLL_INTERVALS_MS } from "@deepiri/shared";

export interface DockerServiceStatus {
  name: string;
  status: "running" | "stopped" | "unknown";
  port: string | null;
}

export class DockerWatcher {
  private cache: DockerServiceStatus[] = [];
  private interval: NodeJS.Timeout | null = null;

  start() {
    this.poll();
    this.interval = setInterval(() => this.poll(), POLL_INTERVALS_MS.DOCKER_STATUS);
    console.log("DockerWatcher started");
  }

  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  getAll(): DockerServiceStatus[] {
    return this.cache;
  }

  private poll() {
    exec("docker compose ps --format json", (err, stdout) => {
      if (err) {
        // Docker not running or no compose file — that's fine
        return;
      }
      try {
        const lines = stdout.trim().split("\n").filter(Boolean);
        this.cache = lines.map((line) => {
          const parsed = JSON.parse(line);
          return {
            name: parsed.Name || parsed.Service || "unknown",
            status: parsed.State === "running" ? "running" : "stopped",
            port: parsed.Publishers?.[0]?.PublishedPort?.toString() ?? null,
          };
        });
      } catch {
        // Ignore parse errors
      }
    });
  }
}
