import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSeedRegistry } from './RegistryStore.js';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../../');

export type DockerServiceStatus = {
  repoId: string;
  name: string;
  state: string;
  status: string;
  running: boolean;
};

export type RepoDockerStatus = {
  repoId: string;
  available: boolean;
  error?: string;
  services: DockerServiceStatus[];
  checkedAt: string;
};

export class DockerWatcher {
  private cache = new Map<string, RepoDockerStatus>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private readonly intervalMs: number;

  constructor(intervalMs = 20_000) {
    this.intervalMs = intervalMs;
  }

  start(): void {
    void this.pollAll();
    this.timer = setInterval(() => {
      void this.pollAll();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  getAll(): RepoDockerStatus[] {
    return Array.from(this.cache.values());
  }

  getOne(repoId: string): RepoDockerStatus | undefined {
    return this.cache.get(repoId);
  }

  private async pollAll(): Promise<void> {
    const repos = getSeedRegistry().repos as Array<{ id: string; localPath?: string }>;
    await Promise.all(repos.map((repo) => this.pollRepo(repo.id, String(repo.localPath ?? '.'))));
  }

  private resolveRepoPath(localPath: string): string {
    return path.isAbsolute(localPath) ? localPath : path.resolve(REPO_ROOT, localPath);
  }

  private async pollRepo(repoId: string, localPath: string): Promise<void> {
    const checkedAt = new Date().toISOString();
    const cwd = this.resolveRepoPath(localPath);

    try {
      const { stdout } = await execFileAsync(
        'docker',
        ['compose', 'ps', '--format', 'json'],
        { cwd, timeout: 8_000, maxBuffer: 2 * 1024 * 1024 }
      );

      const services = this.parseComposePs(stdout, repoId);
      this.cache.set(repoId, { repoId, available: true, services, checkedAt });
    } catch (err) {
      this.cache.set(repoId, {
        repoId,
        available: false,
        error: err instanceof Error ? err.message : 'docker compose unavailable',
        services: [],
        checkedAt,
      });
    }
  }

  private parseComposePs(stdout: string, repoId: string): DockerServiceStatus[] {
    const trimmed = stdout.trim();
    if (!trimmed) return [];

    // docker compose may emit NDJSON (one object per line) or a JSON array
    try {
      if (trimmed.startsWith('[')) {
        const arr = JSON.parse(trimmed) as Array<Record<string, unknown>>;
        return arr.map((row) => this.rowToStatus(row, repoId));
      }
      return trimmed
        .split('\n')
        .filter(Boolean)
        .map((line) => this.rowToStatus(JSON.parse(line) as Record<string, unknown>, repoId));
    } catch {
      return [];
    }
  }

  private rowToStatus(row: Record<string, unknown>, repoId: string): DockerServiceStatus {
    const name = String(row.Name ?? row.Service ?? row.name ?? 'unknown');
    const state = String(row.State ?? row.state ?? 'unknown').toLowerCase();
    const status = String(row.Status ?? row.status ?? state);
    return {
      repoId,
      name,
      state,
      status,
      running: state === 'running' || status.toLowerCase().includes('up'),
    };
  }
}
