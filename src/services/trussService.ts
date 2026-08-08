import { apiClient } from "./platformClient";

export type TrussRunStatus = "queued" | "running" | "waiting" | "completed" | "failed" | "cancelled";

export interface TrussDefinition {
  id: string;
  name: string;
  description?: string | null;
  version: number;
  steps: TrussDefinitionStep[];
  metadata: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrussDefinitionStep {
  id: string;
  kind: "jobStep" | "conditionStep" | "waitEventStep" | string;
  name?: string;
  job?: {
    type: string;
    payloadFrom?: string;
    labels?: Record<string, string>;
  };
  condition?: {
    path: string;
    equals: unknown;
  };
  event?: {
    type: string;
    correlationPath?: string;
  };
}

export interface TrussStepRun {
  id: string;
  runId: string;
  stepId: string;
  kind: string;
  status: TrussRunStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  error?: string | null;
  externalRef?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrussRun {
  id: string;
  definitionId: string;
  status: TrussRunStatus;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  error?: string | null;
  currentStep?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  definition?: TrussDefinition;
  stepRuns?: TrussStepRun[];
}

export interface TrussTemplateLaunchResponse {
  definition: {
    id: string;
    name: string;
    version: number;
  };
  run: TrussRun;
}

export async function listTrussDefinitions(): Promise<TrussDefinition[]> {
  const res = await apiClient.get<{ definitions: TrussDefinition[] }>("/api/truss/definitions");
  return res.data.definitions;
}

export async function listTrussRuns(): Promise<TrussRun[]> {
  const res = await apiClient.get<{ runs: TrussRun[] }>("/api/truss/runs");
  return res.data.runs;
}

export async function getTrussRun(id: string): Promise<TrussRun> {
  const res = await apiClient.get<TrussRun>(`/api/truss/runs/${id}`);
  return res.data;
}

export async function launchTrainPublishTemplate(
  input: Record<string, unknown>
): Promise<TrussTemplateLaunchResponse> {
  const res = await apiClient.post<TrussTemplateLaunchResponse>("/api/truss/templates/ml.train-publish", {
    input,
  });
  return res.data;
}

export async function cancelTrussRun(id: string): Promise<TrussRun> {
  const res = await apiClient.post<TrussRun>(`/api/truss/runs/${id}/cancel`);
  return res.data;
}
