import axiosInstance from '../api/axiosInstance';

export type JobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

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
  const res = await axiosInstance.get<{ jobs: JobRecord[] }>('/jobs', { params: filters });
  return res.data.jobs;
}

export async function getJob(id: string): Promise<JobRecord> {
  const res = await axiosInstance.get<JobRecord>(`/jobs/${id}`);
  return res.data;
}

export async function getJobLogs(id: string): Promise<JobLogLine[]> {
  const res = await axiosInstance.get<{ logs: JobLogLine[] }>(`/jobs/${id}/logs`);
  return res.data.logs;
}

export async function cancelJob(id: string): Promise<JobRecord> {
  const res = await axiosInstance.post<JobRecord>(`/jobs/${id}/cancel`);
  return res.data;
}

export async function retryJob(id: string): Promise<JobRecord> {
  const res = await axiosInstance.post<JobRecord>(`/jobs/${id}/retry`);
  return res.data;
}

export async function getQueueStats(): Promise<Record<string, number>> {
  const res = await axiosInstance.get<{ stats: Record<string, number> }>('/queues/stats');
  return res.data.stats;
}
