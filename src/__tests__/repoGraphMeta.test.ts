import { describe, expect, it } from 'vitest';
import { classifyKind, communityFromPath } from '../utils/repoGraphMeta';

describe('repoGraphMeta', () => {
  it('labels communities from path prefixes', () => {
    expect(communityFromPath('src/pages/Home.tsx')).toBe('src/pages');
    expect(communityFromPath('packages/server/src/index.ts')).toBe('packages/server');
    expect(communityFromPath('README.md')).toBe('README.md');
  });

  it('classifies file kinds', () => {
    expect(classifyKind('src/pages/OpsHub.tsx')).toBe('page');
    expect(classifyKind('src/hooks/useImmersiveStatus.ts')).toBe('hook');
    expect(classifyKind('src/services/hubClient.ts')).toBe('service');
    expect(classifyKind('src/utils/api.ts')).toBe('util');
  });
});
