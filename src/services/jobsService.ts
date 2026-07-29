import { apiClient } from "./platformClient";

export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface JobRecord {
  id: string;
  type: string;
  status: JobStatus;
  payload: Record<string, unknown>;
  labels: Record<string, string>;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface JobLogLine {
  line: string;
  createdAt: string;
}

export interface JobFilters {
  type?: string;
  status?: string;
  label?: string;
}

export async function listJobs(filters: JobFilters = {}): Promise<JobRecord[]> {
  const res = await apiClient.get<{ jobs: JobRecord[] }>("/api/jobs", { params: filters });
  return res.data.jobs;
}

export async function getJob(id: string): Promise<JobRecord> {
  const res = await apiClient.get<JobRecord>(`/api/jobs/${id}`);
  return res.data;
}

export async function getJobLogs(id: string): Promise<JobLogLine[]> {
  const res = await apiClient.get<{ logs: JobLogLine[] }>(`/api/jobs/${id}/logs`);
  return res.data.logs;
}

export async function cancelJob(id: string): Promise<JobRecord> {
  const res = await apiClient.post<JobRecord>(`/api/jobs/${id}/cancel`);
  return res.data;
}

export async function retryJob(id: string): Promise<JobRecord> {
  const res = await apiClient.post<JobRecord>(`/api/jobs/${id}/retry`);
  return res.data;
}

export async function getQueueStats(): Promise<Record<string, number>> {
  const res = await apiClient.get<{ stats: Record<string, number> }>("/api/queues/stats");
  return res.data.stats;
}
