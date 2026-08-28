export type DeepiriRole =
  | 'ai_ml'
  | 'qa_support'
  | 'software_developer'
  | 'it'
  | 'admin'
  | 'leadership';

export interface RoleMeta {
  id: DeepiriRole;
  label: string;
  shortLabel: string;
  description: string;
  githubTeam: string;
  color: string;
  icon: string;
}

export const ROLES: Record<DeepiriRole, RoleMeta> = {
  ai_ml: {
    id: 'ai_ml',
    label: 'AI / ML',
    shortLabel: 'AI/ML',
    description: 'AI Systems, ML, MLOps, Data Engineering',
    githubTeam: 'AI/ML Team',
    color: '#7c3aed',
    icon: '🧠',
  },
  qa_support: {
    id: 'qa_support',
    label: 'QA / Support Engineer',
    shortLabel: 'QA/Support',
    description: 'QA, DevOps, Support',
    githubTeam: 'QA Team',
    color: '#059669',
    icon: '🧪',
  },
  software_developer: {
    id: 'software_developer',
    label: 'Software Developer',
    shortLabel: 'Software',
    description: 'Full Stack, Backend, Frontend, Cloud/Infra/Security',
    githubTeam: 'Infrastructure / Application Team',
    color: '#0ea5e9',
    icon: '💻',
  },
  it: {
    id: 'it',
    label: 'IT / Security & Operations',
    shortLabel: 'IT',
    description: 'IT, Security & Operations Support — can attend any meeting',
    githubTeam: 'IT / Security & Operations',
    color: '#f59e0b',
    icon: '🛡️',
  },
  admin: {
    id: 'admin',
    label: 'Admin',
    shortLabel: 'Admin',
    description: 'Platform admin — full access',
    githubTeam: 'Admin',
    color: '#ef4444',
    icon: '⚡',
  },
  leadership: {
    id: 'leadership',
    label: 'Leadership',
    shortLabel: 'Lead',
    description: 'Management & leadership',
    githubTeam: 'Leadership',
    color: '#111827',
    icon: '👑',
  },
};

export const ROLE_OPTIONS: { value: DeepiriRole; label: string; hint: string }[] = [
  { value: 'ai_ml', label: 'AI / ML', hint: 'AI Systems, ML, MLOps, Data Eng' },
  { value: 'qa_support', label: 'QA / Support Engineer', hint: 'QA, DevOps, Support' },
  { value: 'software_developer', label: 'Software Developer', hint: 'Full Stack, Backend, Frontend, Infra' },
  { value: 'it', label: 'IT / Security & Operations', hint: 'Can attend any meeting' },
  { value: 'admin', label: 'Admin', hint: 'Full platform access' },
  { value: 'leadership', label: 'Leadership', hint: 'Management + all meetings' },
];
