import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ONBOARDING_STEPS,
  loadOnboardingProgress,
  saveOnboardingProgress,
} from '../../config/onboardingSteps';
import { useUiStore } from '../../store/uiStore';
import AccessChecklist from './AccessChecklist';
import './TourOverlay.css';

function fireConfetti(): void {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const colors = ['#6366f1', '#22c55e', '#f59e0b', '#06b6d4', '#f472b6'];
  const parts = Array.from({ length: 80 }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * 80,
    r: 3 + Math.random() * 4,
    c: colors[Math.floor(Math.random() * colors.length)],
    vy: 2 + Math.random() * 4,
    vx: -2 + Math.random() * 4,
  }));
  let frame = 0;
  const tick = () => {
    frame += 1;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (frame < 90) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}

const TourOverlay: React.FC = () => {
  const tourActive = useUiStore((s) => s.tourActive);
  const setTourActive = useUiStore((s) => s.setTourActive);
  const setCyrexOpen = useUiStore((s) => s.setCyrexOpen);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(loadOnboardingProgress);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);

  const step = ONBOARDING_STEPS[progress.currentStep] ?? null;
  const pct = useMemo(
    () => Math.round(((progress.completed ? ONBOARDING_STEPS.length : progress.currentStep) / ONBOARDING_STEPS.length) * 100),
    [progress]
  );

  useEffect(() => {
    if (!tourActive || !step) return;
    navigate(step.route);
    if (step.action === 'open-cyrex') setCyrexOpen(true);
    if (step.action === 'open-checklist') setShowChecklist(true);
    else setShowChecklist(false);

    const measure = () => {
      const el = document.querySelector(`[data-tour-id="${step.targetId}"]`);
      if (el) setRect(el.getBoundingClientRect());
      else setRect(null);
    };
    const t = window.setTimeout(measure, 350);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [tourActive, step, navigate, setCyrexOpen]);

  useEffect(() => {
    saveOnboardingProgress(progress);
  }, [progress]);

  if (!tourActive || !step) return null;

  const pad = 10;
  const spot =
    rect != null
      ? {
          top: Math.max(0, rect.top - pad),
          left: Math.max(0, rect.left - pad),
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }
      : null;

  const finish = () => {
    const next = { ...progress, completed: true, currentStep: ONBOARDING_STEPS.length - 1 };
    setProgress(next);
    saveOnboardingProgress(next);
    fireConfetti();
    setTourActive(false);
    navigate('/dashboard');
  };

  const next = () => {
    if (progress.currentStep >= ONBOARDING_STEPS.length - 1) {
      finish();
      return;
    }
    setProgress((p) => ({
      ...p,
      currentStep: p.currentStep + 1,
      startedAt: p.startedAt ?? new Date().toISOString(),
    }));
  };

  const back = () => {
    setProgress((p) => ({ ...p, currentStep: Math.max(0, p.currentStep - 1) }));
  };

  const skip = () => {
    setTourActive(false);
  };

  return (
    <>
      <div className="tour-overlay" aria-modal="true" role="dialog" aria-label="Onboarding tour">
        <div
          className="tour-spotlight"
          style={
            spot
              ? {
                  clipPath: `polygon(0% 0%, 0% 100%, ${spot.left}px 100%, ${spot.left}px ${spot.top}px, ${
                    spot.left + spot.width
                  }px ${spot.top}px, ${spot.left + spot.width}px ${spot.top + spot.height}px, ${spot.left}px ${
                    spot.top + spot.height
                  }px, ${spot.left}px 100%, 100% 100%, 100% 0%)`,
                }
              : undefined
          }
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            className="tour-tooltip"
            style={
              rect
                ? {
                    top: Math.min(window.innerHeight - 200, rect.bottom + 12),
                    left: Math.min(window.innerWidth - 360, Math.max(12, rect.left)),
                  }
                : { top: '35%', left: '50%', transform: 'translateX(-50%)' }
            }
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="tour-progress" aria-hidden>
              <div className="tour-progress-bar" style={{ width: `${pct}%` }} />
            </div>
            <p className="tour-step-meta">
              Step {progress.currentStep + 1} / {ONBOARDING_STEPS.length}
            </p>
            <h2>{step.title}</h2>
            <p>{step.description}</p>
            <div className="tour-actions">
              <button type="button" onClick={skip} aria-label="Skip tour">
                Skip
              </button>
              <button type="button" onClick={back} disabled={progress.currentStep === 0} aria-label="Previous step">
                Back
              </button>
              <button type="button" className="is-primary" onClick={next} aria-label="Next step">
                {progress.currentStep >= ONBOARDING_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {showChecklist && (
        <AccessChecklist
          value={progress.checklist}
          onChange={(checklist) => setProgress((p) => ({ ...p, checklist }))}
          onClose={() => setShowChecklist(false)}
        />
      )}
    </>
  );
};

export default TourOverlay;
