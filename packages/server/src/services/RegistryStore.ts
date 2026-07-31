/**
 * Hub registry facade over deepiri-registry (platform service on :5003).
 *
 * - Live catalog: REGISTRY_URL (repos / services / tools / ecosystem)
 * - Local seed (serviceRegistry.json): read-only Hub overlays — localPath,
 *   health ports for GraphBuilder / HealthPoller / DockerWatcher
 * - Never writes packaged config or a runtime JSON file
 */
import seed from '../config/serviceRegistry.json' with { type: 'json' };

const REGISTRY_BASE = (process.env.REGISTRY_URL || 'http://localhost:5003').replace(/\/$/, '');

export type HubRepo = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  localPath?: string;
  httpsUrl?: string;
  sshUrl?: string;
  launchUrl?: string;
  nginxPath?: string;
  tier?: number;
  org?: string;
  source?: 'platform' | 'seed' | 'mixed';
};

export type HubService = {
  id: string;
  name: string;
  healthPath?: string;
  port?: number;
  category?: string;
  launchUrl?: string;
  healthUrl?: string;
  tier?: number;
  status?: string;
  lastSeen?: string | null;
  source?: 'platform' | 'seed' | 'mixed';
};

type SeedData = {
  repos: HubRepo[];
  services: HubService[];
};

const SEED = seed as SeedData;

type PlatformRepo = {
  id: string;
  org?: string;
  name: string;
  displayName?: string | null;
  githubUrl?: string | null;
  tier?: number;
  description?: string | null;
};

type PlatformService = {
  name: string;
  repo?: string;
  healthUrl?: string;
  tier?: number;
  status?: string;
  lastSeen?: string;
  metadata?: Record<string, unknown>;
};

function seedRepoById(id: string): HubRepo | undefined {
  return SEED.repos.find((r) => r.id === id || r.name === id);
}

function seedServiceById(id: string): HubService | undefined {
  return SEED.services.find((s) => s.id === id || s.name === id);
}

async function registryFetch<T>(path: string): Promise<T> {
  const url = `${REGISTRY_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'deepiri-hub-server' },
    });
    if (!res.ok) {
      throw new Error(`registry ${res.status} ${path}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(t);
  }
}

function mapPlatformRepo(repo: PlatformRepo): HubRepo {
  const overlay = seedRepoById(repo.name) || seedRepoById(repo.id);
  return {
    id: repo.id || repo.name,
    name: repo.displayName || repo.name,
    description: repo.description ?? overlay?.description,
    category: overlay?.category || (repo.tier === 0 ? 'platform' : 'catalog'),
    tags: overlay?.tags ?? [],
    localPath: overlay?.localPath,
    httpsUrl: repo.githubUrl ?? overlay?.httpsUrl,
    sshUrl: overlay?.sshUrl,
    launchUrl: overlay?.launchUrl,
    nginxPath: overlay?.nginxPath,
    tier: repo.tier,
    org: repo.org,
    source: overlay ? 'mixed' : 'platform',
  };
}

function mapPlatformService(svc: PlatformService): HubService {
  const overlay = seedServiceById(svc.name);
  return {
    id: overlay?.id || svc.name,
    name: svc.name,
    healthPath: overlay?.healthPath,
    port: overlay?.port,
    category: overlay?.category || 'platform',
    launchUrl: overlay?.launchUrl,
    healthUrl: svc.healthUrl,
    tier: svc.tier,
    status: svc.status,
    lastSeen: svc.lastSeen ?? null,
    source: overlay ? 'mixed' : 'platform',
  };
}

/** Read-only local seed — used by GraphBuilder / HealthPoller / DockerWatcher. */
export function getSeedRegistry(): SeedData {
  return {
    repos: SEED.repos.map((r) => ({ ...r, source: 'seed' as const })),
    services: SEED.services.map((s) => ({ ...s, source: 'seed' as const })),
  };
}

/** @deprecated Prefer getSeedRegistry() or getMergedCatalog(). */
export function getRegistry(): SeedData {
  return getSeedRegistry();
}

export async function fetchPlatformRepos(): Promise<HubRepo[]> {
  const data = await registryFetch<{ repos: PlatformRepo[] }>('/api/registry/repos');
  return (data.repos ?? []).map(mapPlatformRepo);
}

export async function fetchPlatformServices(): Promise<HubService[]> {
  const list = await registryFetch<PlatformService[]>('/api/registry/services');
  return (Array.isArray(list) ? list : []).map(mapPlatformService);
}

export async function fetchPlatformTools(): Promise<unknown[]> {
  const data = await registryFetch<{ tools: unknown[] }>('/api/registry/tools');
  return data.tools ?? [];
}

export async function fetchEcosystemHealth(): Promise<unknown> {
  return registryFetch('/api/registry/health/ecosystem');
}

/**
 * Prefer live deepiri-registry; fall back to seed when registry is down
 * so Launchpad / Hub still boot offline.
 */
export async function getMergedCatalog(): Promise<{
  repos: HubRepo[];
  services: HubService[];
  source: 'platform' | 'seed' | 'mixed';
  registryReachable: boolean;
}> {
  try {
    const [repos, services] = await Promise.all([fetchPlatformRepos(), fetchPlatformServices()]);
    const seedOnlyRepos = SEED.repos.filter(
      (s) => !repos.some((r) => r.id === s.id || r.name === s.name)
    );
    const seedOnlyServices = SEED.services.filter(
      (s) => !services.some((svc) => svc.id === s.id || svc.name === s.name)
    );
    return {
      repos: [...repos, ...seedOnlyRepos.map((r) => ({ ...r, source: 'seed' as const }))],
      services: [
        ...services,
        ...seedOnlyServices.map((s) => ({ ...s, source: 'seed' as const })),
      ],
      source: seedOnlyRepos.length || seedOnlyServices.length ? 'mixed' : 'platform',
      registryReachable: true,
    };
  } catch (err) {
    console.warn('[hub] deepiri-registry unreachable, using seed:', err);
    const seed = getSeedRegistry();
    return {
      repos: seed.repos,
      services: seed.services,
      source: 'seed',
      registryReachable: false,
    };
  }
}

export async function findPlatformRepo(id: string): Promise<HubRepo | null> {
  try {
    const repo = await registryFetch<PlatformRepo>(`/api/registry/repos/${encodeURIComponent(id)}`);
    return mapPlatformRepo(repo);
  } catch {
    return seedRepoById(id) ?? null;
  }
}

/** GitHub webhook: registry seeds from org API — no local persist. */
export async function noteDiscoveredRepo(entry: {
  name: string;
  description?: string | null;
  httpsUrl?: string;
  sshUrl?: string;
}): Promise<{ action: 'exists' | 'known-to-registry' | 'seed-only'; repo: HubRepo }> {
  const existing = await findPlatformRepo(entry.name);
  if (existing) {
    return { action: 'exists', repo: existing };
  }
  const seedHit = seedRepoById(entry.name);
  if (seedHit) {
    return { action: 'seed-only', repo: seedHit };
  }
  return {
    action: 'known-to-registry',
    repo: {
      id: entry.name,
      name: entry.name,
      description: entry.description ?? undefined,
      category: 'discovered',
      tags: ['github-webhook'],
      httpsUrl: entry.httpsUrl,
      sshUrl: entry.sshUrl,
      source: 'platform',
    },
  };
}

export { REGISTRY_BASE };
