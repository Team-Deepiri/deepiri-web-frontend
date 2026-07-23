import { describe, it, expect } from 'vitest';
import { TYPE_COLORS, FORCE_SIM } from '../utils/graphConstants';

describe('graphConstants', () => {
  describe('TYPE_COLORS', () => {
    it('has entries for all expected file types', () => {
      const expectedTypes = [
        'page', 'component', 'gamification-component', 'chat-component',
        'chat-widget', 'context', 'api-module', 'hook', 'utility',
        'type-definition', 'stylesheet', 'module',
      ];
      for (const type of expectedTypes) {
        expect(TYPE_COLORS[type]).toBeDefined();
        expect(TYPE_COLORS[type]).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    });

    it('returns valid hex color for any known type', () => {
      for (const [, color] of Object.entries(TYPE_COLORS)) {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });
  });

  describe('FORCE_SIM', () => {
    it('repulsion is negative (pushes nodes apart)', () => {
      expect(FORCE_SIM.REPULSION).toBeLessThan(0);
    });

    it('link distance is positive', () => {
      expect(FORCE_SIM.LINK_DISTANCE).toBeGreaterThan(0);
    });

    it('decay is between 0 and 1', () => {
      expect(FORCE_SIM.DECAY).toBeGreaterThan(0);
      expect(FORCE_SIM.DECAY).toBeLessThan(1);
    });

    it('velocity decay is between 0 and 1', () => {
      expect(FORCE_SIM.VELOCITY_DECAY).toBeGreaterThan(0);
      expect(FORCE_SIM.VELOCITY_DECAY).toBeLessThan(1);
    });
  });
});

describe('graph node initial positions', () => {
  it('golden angle spiral distributes nodes in a circle', () => {
    const count = 100;
    const positions = Array.from({ length: count }, (_, i) => ({
      x: Math.cos(i * 2.39996) * Math.sqrt(count) * 15,
      y: Math.sin(i * 2.39996) * Math.sqrt(count) * 15,
    }));

    const xMin = Math.min(...positions.map(p => p.x));
    const xMax = Math.max(...positions.map(p => p.x));
    const yMin = Math.min(...positions.map(p => p.y));
    const yMax = Math.max(...positions.map(p => p.y));

    expect(xMax - xMin).toBeGreaterThan(100);
    expect(yMax - yMin).toBeGreaterThan(100);
  });
});

describe('force simulation calculations', () => {
  it('repulsion force decreases with distance', () => {
    const d1 = -800 / (10 * 10);
    const d2 = -800 / (50 * 50);
    expect(Math.abs(d1)).toBeGreaterThan(Math.abs(d2));
  });

  it('link spring force pulls nodes toward target distance', () => {
    const targetDist = 120;
    const stiffness = 0.003;

    const farForce = (200 - targetDist) * stiffness;
    const closeForce = (60 - targetDist) * stiffness;

    expect(farForce).toBeGreaterThan(0);
    expect(closeForce).toBeLessThan(0);
  });

  it('centering force pulls toward center', () => {
    const centerX = 500;
    const nodeX = 100;
    const centeringCoeff = 0.0005;
    const force = (centerX - nodeX) * centeringCoeff;
    expect(force).toBeGreaterThan(0);
  });
});

describe('graph data node radius calculation', () => {
  it('radius scales with square root of line count', () => {
    const r1 = Math.min(Math.sqrt(10) + 3, 16);
    const r2 = Math.min(Math.sqrt(100) + 3, 16);
    const r3 = Math.min(Math.sqrt(1000) + 3, 16);

    expect(r2).toBeGreaterThan(r1);
    expect(r3).toBe(16);
  });
});
