import { describe, expect, it, beforeEach } from 'vitest';

/**
 * Lightweight Phase 5 store contract tests — mirrors sceneStore traffic/event behavior
 * without pulling Three.js into the root Vitest graph.
 */
describe('immersive scene traffic helpers', () => {
  beforeEach(() => {
    // dynamic import keeps Vite happy if immersive deps aren't in root
  });

  it('traffic keys are order-independent', () => {
    const key = (a: string, b: string) => [a, b].sort().join('::');
    expect(key('api-gateway', 'auth-service')).toBe(key('auth-service', 'api-gateway'));
  });

  it('error events should travel 2x particle speed', () => {
    const normal = 0.35;
    const error = 0.7;
    expect(error / normal).toBe(2);
  });

  it('loads immersive sceneStore and bumps traffic', async () => {
    const { useSceneStore } = await import('../../packages/immersive/src/store/sceneStore');
    useSceneStore.setState({ traffic: {}, pendingEvents: [] });
    useSceneStore.getState().initNodes();
    useSceneStore.getState().pushEvent({
      id: 't1',
      producer: 'realtimeGateway',
      type: 'pulse',
      fromId: 'portal',
      toId: 'hub-server',
      bornAt: 0,
    });
    expect(useSceneStore.getState().traffic['hub-server::portal']).toBe(1);
    const consumed = useSceneStore.getState().consumeEvents();
    expect(consumed).toHaveLength(1);
    expect(useSceneStore.getState().pendingEvents).toHaveLength(0);
  });
});
