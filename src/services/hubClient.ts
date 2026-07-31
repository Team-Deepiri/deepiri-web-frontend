const HUB_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_HUB_URL) ||
  'http://localhost:5200';

export type HubServiceHealth = {
  serviceId: string;
  name?: string;
  status: string;
  latencyMs: number | null;
  healthBand: string;
  lastChecked: string;
  message?: string;
};

export type HubRepo = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  localPath?: string;
  httpsUrl?: string;
};

export type HubGraphNode = {
  id: string;
  label: string;
  path: string;
  community: string;
  communityId: number;
  lines: number;
  degree: number;
  kind: string;
};

export type HubGraphEdge = {
  id: string;
  source: string;
  target: string;
  kind: 'import' | 'inferred';
};

export type HubCommunity = {
  id: number;
  name: string;
  count: number;
  color: string;
};

export type HubRepoGraph = {
  repoId: string;
  repoName: string;
  generatedAt: string;
  nodeCount: number;
  edgeCount: number;
  communities: HubCommunity[];
  nodes: HubGraphNode[];
  edges: HubGraphEdge[];
};

async function hubFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${HUB_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `Hub ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const hubClient = {
  baseUrl: HUB_BASE,

  getHealthAll: () =>
    hubFetch<{ services: HubServiceHealth[]; immersive: { status: string } }>('/health/all'),

  getImmersiveStatus: () =>
    hubFetch<{ status: 'live' | 'down'; lastChecked: string | null }>('/health/immersive'),

  getRegistry: () => hubFetch<{ repos: HubRepo[]; services: unknown[] }>('/registry'),

  getDockerStatus: () => hubFetch<{ repos: unknown[] }>('/docker/status'),

  listGraphRepos: () => hubFetch<{ repos: HubRepo[] }>('/graph/repos'),

  getRepoGraph: (repoId: string, force = false) =>
    hubFetch<HubRepoGraph>(`/graph/${encodeURIComponent(repoId)}${force ? '?force=1' : ''}`),
};

export function hubWsUrl(): string {
  const u = new URL(HUB_BASE);
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.pathname = '/ws/events';
  u.search = '';
  return u.toString();
}
