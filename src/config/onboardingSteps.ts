export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  targetId: string;
  route: string;
  action?: 'open-cyrex' | 'open-checklist' | 'highlight-tasks';
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'platform',
    title: 'Platform pulse',
    description: 'This is your home — service health at a glance. Green means up; amber/red need attention.',
    targetId: 'tour-home-health',
    route: '/dashboard',
  },
  {
    id: 'ai',
    title: 'Ask Cyrex',
    description: 'The Cyrex sidebar answers in natural language with live Hub context. Try “What services are running?”',
    targetId: 'tour-cyrex',
    route: '/dashboard',
    action: 'open-cyrex',
  },
  {
    id: 'repos',
    title: 'Repo Launchpad',
    description: 'Every Deepiri repo lives here — clone, launch, and jump into graphs.',
    targetId: 'tour-launchpad',
    route: '/launchpad',
  },
  {
    id: 'access',
    title: 'Access checklist',
    description: 'Confirm GitHub org access, env vars, first clone, and first run before diving into tasks.',
    targetId: 'tour-access-checklist',
    route: '/onboarding',
    action: 'open-checklist',
  },
  {
    id: 'first-task',
    title: 'Your first task',
    description: 'Team Ops consolidates tasks, notifications, messages, and analytics — start with an open task.',
    targetId: 'tour-team-tasks',
    route: '/team',
    action: 'highlight-tasks',
  },
];

export type OnboardingProgress = {
  currentStep: number;
  completed: boolean;
  startedAt: string | null;
  checklist: Record<string, boolean>;
};

const KEY = 'hub.onboarding';

export function loadOnboardingProgress(): OnboardingProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as OnboardingProgress;
  } catch {
    /* ignore */
  }
  return {
    currentStep: 0,
    completed: false,
    startedAt: null,
    checklist: {
      github: false,
      env: false,
      clone: false,
      run: false,
    },
  };
}

export function saveOnboardingProgress(p: OnboardingProgress): void {
  localStorage.setItem(KEY, JSON.stringify(p));
}
