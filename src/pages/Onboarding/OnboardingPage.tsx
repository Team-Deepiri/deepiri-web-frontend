import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUiStore } from '../../store/uiStore';
import { loadOnboardingProgress, ONBOARDING_STEPS, saveOnboardingProgress } from '../../config/onboardingSteps';
import AccessChecklist from '../../components/onboarding/AccessChecklist';
import './Onboarding.css';

const OnboardingPage: React.FC = () => {
  const setTourActive = useUiStore((s) => s.setTourActive);
  const [progress, setProgress] = React.useState(loadOnboardingProgress);
  const [checklistOpen, setChecklistOpen] = React.useState(false);

  useEffect(() => {
    saveOnboardingProgress(progress);
  }, [progress]);

  const start = () => {
    const next = {
      ...progress,
      completed: false,
      startedAt: progress.startedAt ?? new Date().toISOString(),
    };
    setProgress(next);
    setTourActive(true);
  };

  return (
    <div className="onboarding-page" data-tour-id="tour-onboarding">
      <h1>Start Here</h1>
      <p className="onboarding-lead">
        A five-step tour of the Client Hub — platform health, Cyrex, repos, access, and your first task.
      </p>

      <div className="onboarding-actions">
        <button type="button" className="onboarding-primary" onClick={start}>
          {progress.completed ? 'Replay tour' : progress.startedAt ? 'Resume tour' : 'Begin tour'}
        </button>
        <button type="button" onClick={() => setChecklistOpen(true)}>
          Access checklist
        </button>
        <Link to="/dashboard">Skip to Home</Link>
      </div>

      <ol className="onboarding-steps">
        {ONBOARDING_STEPS.map((s, i) => (
          <li key={s.id} className={i < progress.currentStep || progress.completed ? 'is-done' : ''}>
            <strong>{s.title}</strong>
            <span>{s.description}</span>
          </li>
        ))}
      </ol>

      {checklistOpen && (
        <AccessChecklist
          value={progress.checklist}
          onChange={(checklist) => setProgress((p) => ({ ...p, checklist }))}
          onClose={() => setChecklistOpen(false)}
        />
      )}
    </div>
  );
};

export default OnboardingPage;
