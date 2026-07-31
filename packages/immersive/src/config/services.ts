export type ServiceCategory = 'platform' | 'ai' | 'comms' | 'infra' | 'tooling';

export type ImmersiveService = {
  id: string;
  name: string;
  category: ServiceCategory;
  port?: number;
};

/** Static topology seed — live health overlays from Hub. */
export const IMMERSIVE_SERVICES: ImmersiveService[] = [
  { id: 'api-gateway', name: 'API Gateway', category: 'platform', port: 5100 },
  { id: 'auth-service', name: 'Auth', category: 'platform', port: 5001 },
  { id: 'registry', name: 'Registry', category: 'platform', port: 5010 },
  { id: 'jobs', name: 'Jobs', category: 'platform', port: 5007 },
  { id: 'truss', name: 'Truss', category: 'platform', port: 5002 },
  { id: 'telemetry', name: 'Telemetry', category: 'infra', port: 5011 },
  { id: 'realtime-gateway', name: 'Realtime GW', category: 'comms', port: 5008 },
  { id: 'cyrex', name: 'Cyrex', category: 'ai', port: 8000 },
  { id: 'language-intelligence', name: 'Lang Intel', category: 'ai' },
  { id: 'synapse', name: 'Synapse', category: 'comms' },
  { id: 'sugar-glider', name: 'Sugar Glider', category: 'comms' },
  { id: 'hub-server', name: 'Hub Server', category: 'tooling', port: 5200 },
  { id: 'portal', name: 'Portal', category: 'tooling', port: 5173 },
  { id: 'redis', name: 'Redis', category: 'infra' },
];

export const IMMERSIVE_EDGES: Array<[string, string]> = [
  ['portal', 'hub-server'],
  ['portal', 'api-gateway'],
  ['hub-server', 'api-gateway'],
  ['hub-server', 'realtime-gateway'],
  ['api-gateway', 'auth-service'],
  ['api-gateway', 'registry'],
  ['api-gateway', 'jobs'],
  ['api-gateway', 'truss'],
  ['api-gateway', 'telemetry'],
  ['api-gateway', 'cyrex'],
  ['api-gateway', 'language-intelligence'],
  ['jobs', 'truss'],
  ['truss', 'telemetry'],
  ['realtime-gateway', 'synapse'],
  ['realtime-gateway', 'sugar-glider'],
  ['cyrex', 'realtime-gateway'],
  ['redis', 'realtime-gateway'],
  ['redis', 'jobs'],
];

export const CATEGORY_ORIGIN: Record<ServiceCategory, [number, number, number]> = {
  platform: [-8, 0, 0],
  ai: [8, 1, -2],
  comms: [0, 6, -4],
  infra: [0, -5, 2],
  tooling: [0, 0, 8],
};

export const HUB_URL =
  (typeof import.meta !== 'undefined' && (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_HUB_URL) ||
  'http://localhost:5200';

export const PORTAL_URL =
  (typeof import.meta !== 'undefined' && (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_PORTAL_URL) ||
  'http://localhost:5173/dashboard';
