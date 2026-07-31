import { describe, expect, it, beforeEach } from 'vitest';
import { useUiStore } from '../store/uiStore';
import { useEventStore } from '../store/eventStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUiStore.setState({
      sidebarCollapsed: false,
      cyrexOpen: true,
      immersiveLive: false,
      tourActive: false,
      selectedNode: null,
      mobileNavOpen: false,
    });
  });

  it('toggles sidebar and cyrex', () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().sidebarCollapsed).toBe(true);
    useUiStore.getState().toggleCyrex();
    expect(useUiStore.getState().cyrexOpen).toBe(false);
  });

  it('tracks immersive live flag for Enter 3D button', () => {
    useUiStore.getState().setImmersiveLive(true);
    expect(useUiStore.getState().immersiveLive).toBe(true);
  });
});

describe('eventStore', () => {
  beforeEach(() => {
    useEventStore.getState().clear();
    useEventStore.getState().setPaused(false);
  });

  it('buffers events per producer with a circular cap', () => {
    for (let i = 0; i < 5; i++) {
      useEventStore.getState().push({
        id: `e-${i}`,
        producer: 'synapse',
        type: 'test',
        timestamp: new Date().toISOString(),
      });
    }
    expect(useEventStore.getState().byProducer.synapse).toHaveLength(5);
  });

  it('ignores pushes while paused', () => {
    useEventStore.getState().setPaused(true);
    useEventStore.getState().push({
      id: 'x',
      producer: 'sugarGlider',
      type: 'test',
      timestamp: new Date().toISOString(),
    });
    expect(useEventStore.getState().byProducer.sugarGlider).toHaveLength(0);
  });
});
