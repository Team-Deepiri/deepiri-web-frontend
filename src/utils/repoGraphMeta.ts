/**
 * Pure helpers mirrored from Hub GraphBuilder community labeling —
 * kept here so the SPA can unit-test without starting Fastify.
 */
export function communityFromPath(relPath: string): string {
  const parts = relPath.split(/[/\\]/).filter(Boolean);
  if (parts[0] === 'packages' && parts[1]) return `packages/${parts[1]}`;
  if (parts[0] === 'src' && parts[1]) return `src/${parts[1]}`;
  if (parts[0] === 'platform-services' && parts[1] && parts[2]) {
    return `${parts[1]}/${parts[2]}`;
  }
  if (parts.length >= 2) return `${parts[0]}/${parts[1]}`;
  return parts[0] ?? 'root';
}

export function classifyKind(relPath: string): string {
  const lower = relPath.toLowerCase();
  if (lower.includes('/pages/') || lower.includes('/page/')) return 'page';
  if (lower.includes('/components/') || lower.includes('/component/')) return 'component';
  if (lower.includes('/hooks/')) return 'hook';
  if (lower.includes('/api/') || lower.includes('/routes/') || lower.includes('/services/'))
    return 'service';
  if (lower.includes('/store/') || lower.includes('/context')) return 'state';
  if (lower.includes('/utils/') || lower.includes('/lib/') || lower.includes('/helpers/'))
    return 'util';
  if (lower.includes('/types/') || lower.endsWith('.d.ts')) return 'type';
  if (lower.includes('/test') || lower.includes('__tests__') || lower.includes('.spec.'))
    return 'test';
  return 'module';
}
