import axiosInstance from '../api/axiosInstance';

export interface Repo {
  id: string;
  org: string;
  name: string;
  displayName: string | null;
  githubUrl: string | null;
  tier: number;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Tool {
  id: string;
  name: string;
  kind: string;
  description: string | null;
  endpoint: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface EcosystemHealth {
  repos: Array<{ id: string; name: string; status: string; lastChecked: string | null }>;
  services: Array<{ name: string; status: string; lastSeen: string | null }>;
}

export async function listRepos(): Promise<Repo[]> {
  const res = await axiosInstance.get<{ repos: Repo[] }>('/registry/repos');
  return res.data.repos;
}

export async function listTools(): Promise<Tool[]> {
  const res = await axiosInstance.get<{ tools: Tool[] }>('/registry/tools');
  return res.data.tools;
}

export async function getEcosystemHealth(): Promise<EcosystemHealth> {
  const res = await axiosInstance.get<EcosystemHealth>('/registry/health/ecosystem');
  return res.data;
}
