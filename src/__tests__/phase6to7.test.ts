import { describe, expect, it } from 'vitest';
import { buildCyrexContext } from '../services/cyrexService';
import { ONBOARDING_STEPS, loadOnboardingProgress } from '../config/onboardingSteps';

describe('Phase 6–7 helpers', () => {
  it('builds cyrex context from health + events', () => {
    const ctx = buildCyrexContext({
      page: '/dashboard',
      selectedService: 'api-gateway',
      services: [
        {
          serviceId: 'api-gateway',
          status: 'up',
          latencyMs: 40,
          healthBand: 'green',
        },
        {
          serviceId: 'jobs',
          status: 'down',
          latencyMs: null,
          healthBand: 'red',
        },
      ],
      events: [
        { id: '1', producer: 'synapse', type: 'pulse' },
        { id: '2', producer: 'sugarGlider', type: 'error', error: true },
      ],
    });
    expect(ctx.page).toBe('/dashboard');
    expect(ctx.healthSummary.down).toBe(1);
    expect(ctx.recentEvents).toHaveLength(2);
  });

  it('has five onboarding steps', () => {
    expect(ONBOARDING_STEPS).toHaveLength(5);
    expect(loadOnboardingProgress().completed).toBe(false);
  });
});
