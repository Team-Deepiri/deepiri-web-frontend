import React from 'react';
import { loadOnboardingProgress, ONBOARDING_STEPS } from '../../config/onboardingSteps';

const ProgressTracker: React.FC = () => {
  const p = loadOnboardingProgress();
  const pct = p.completed
    ? 100
    : Math.round((p.currentStep / Math.max(1, ONBOARDING_STEPS.length)) * 100);
  if (p.completed) return null;
  return (
    <div className="progress-tracker" title="Onboarding progress" aria-label={`Onboarding ${pct}%`}>
      <span>{pct}%</span>
      <div className="progress-tracker-bar">
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default ProgressTracker;
