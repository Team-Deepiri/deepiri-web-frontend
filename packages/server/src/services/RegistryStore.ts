import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import seed from '../config/serviceRegistry.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Runtime registry store.
 * Seeded from packaged serviceRegistry.json; mutations persist to REGISTRY_DATA_PATH
 * (default: packages/server/data/serviceRegistry.runtime.json) so deploys don't
 * rewrite the image-baked config file.
 */
export type RegistryData = {
  repos: Array<Record<string, unknown> & { id: string; name: string }>;
  services: Array<Record<string, unknown> & { id: string; name: string }>;
};

const SEED = seed as RegistryData;

const RUNTIME_PATH =
  process.env.REGISTRY_DATA_PATH ||
  path.resolve(__dirname, '../../data/serviceRegistry.runtime.json');

function load(): RegistryData {
  try {
    if (fs.existsSync(RUNTIME_PATH)) {
      const raw = JSON.parse(fs.readFileSync(RUNTIME_PATH, 'utf8')) as RegistryData;
      if (Array.isArray(raw.repos) && Array.isArray(raw.services)) return raw;
    }
  } catch (err) {
    console.warn('[hub] runtime registry load failed, using seed:', err);
  }
  return {
    repos: [...SEED.repos],
    services: [...SEED.services],
  };
}

let data: RegistryData = load();

export function getRegistry(): RegistryData {
  return data;
}

export function persistRegistry(): boolean {
  try {
    fs.mkdirSync(path.dirname(RUNTIME_PATH), { recursive: true });
    fs.writeFileSync(RUNTIME_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    return true;
  } catch (err) {
    console.warn('[hub] runtime registry persist failed:', err);
    return false;
  }
}

export function replaceRegistry(next: RegistryData): void {
  data = next;
}

export { RUNTIME_PATH };
