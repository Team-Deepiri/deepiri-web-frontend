import type { DeepiriRole } from '../types/roles';
import type { LucideIcon } from 'lucide-react';
import {
  Megaphone, Database, ListChecks, Calendar, FileText, Code2, Zap,
  BarChart3, Wrench, GitBranch, MessageSquare, Bot, ClipboardList,
  Shield, Settings, Users, Rocket, Eye, Lock, Palette, Image as ImageIcon,
} from 'lucide-react';

export interface DeepiriTool {
  id: string;
  label: string;
  description: string;
  route: string;
  icon: LucideIcon;
  color: string;
  roles: DeepiriRole[]; // who can see it; admin/leadership/it see all anyway via hasRole
  category: 'comms' | 'catalog' | 'ops' | 'dev';
}

// RBAC: admin/leadership/it/owner see all via canAccessTool; others filtered by roles
export const TOOLS: DeepiriTool[] = [
  // Comms — tightened: only admin + owner can create announcements per TODO #13
  {
    id: 'create-announcement',
    label: 'Create Announcement',
    description: 'Post to #announcements — forwarded from Discord via Norozo (admin/owner only)',
    route: '/tools/announce',
    icon: Megaphone,
    color: '#7c3aed',
    roles: ['admin', 'owner'],
    category: 'comms',
  },
  {
    id: 'announcements-feed',
    label: 'Announcements',
    description: 'View all announcements (Norozo → Discord #announcements)',
    route: '/dashboard#announcements',
    icon: Megaphone,
    color: '#7c3aed',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'comms',
  },
  {
    id: 'events',
    label: 'Events',
    description: 'Create and RSVP to team events',
    route: '/events',
    icon: Calendar,
    color: '#0ea5e9',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'comms',
  },
  {
    id: 'people',
    label: 'People',
    description: 'Org directory — roles, titles, contributions',
    route: '/people',
    icon: Users,
    color: '#0ea5e9',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'comms',
  },
  // Catalog
  {
    id: 'registry',
    label: 'Registry',
    description: 'Service catalog & health',
    route: '/ops/registry',
    icon: Database,
    color: '#059669',
    roles: ['software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'catalog',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    description: 'Async work & test runs',
    route: '/ops/jobs',
    icon: ListChecks,
    color: '#f59e0b',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'catalog',
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'Shared docs, decks, wikis',
    route: '/documents',
    icon: FileText,
    color: '#6366f1',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'catalog',
  },
  {
    id: 'vizult',
    label: 'Deepiri Vizult',
    description: 'Vizult renders via Jobs — trigger & view outputs',
    route: '/ops/jobs?type=vizult',
    icon: Eye,
    color: '#ec4899',
    roles: ['ai_ml', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'catalog',
  },
  // Dev
  {
    id: 'codebase',
    label: 'Codebase',
    description: 'Code graph & impact',
    route: '/codebase',
    icon: Code2,
    color: '#111827',
    roles: ['software_developer', 'ai_ml', 'it', 'admin', 'leadership', 'owner'],
    category: 'dev',
  },
  {
    id: 'pr-impact',
    label: 'PR Impact',
    description: 'PR risk & review',
    route: '/pr-impact',
    icon: Zap,
    color: '#f97316',
    roles: ['software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'dev',
  },
  {
    id: 'github',
    label: 'GitHub',
    description: 'PRs, branches, QA workflow — connect GitHub OAuth',
    route: '/tools/github',
    icon: GitBranch,
    color: '#111827',
    roles: ['software_developer', 'qa_support', 'ai_ml', 'it', 'admin', 'leadership', 'owner'],
    category: 'dev',
  },
  {
    id: 'ops-hub',
    label: 'Ops Hub',
    description: 'Truss, telemetry, gateway — admin/owner only',
    route: '/ops',
    icon: Wrench,
    color: '#dc2626',
    roles: ['admin', 'owner'],
    category: 'ops',
  },
  {
    id: 'ops-monitor',
    label: 'Ops Monitor',
    description: 'VM & jobs queue monitor — admin/owner only',
    route: '/ops',
    icon: BarChart3,
    color: '#dc2626',
    roles: ['admin', 'owner'],
    category: 'ops',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Usage & insights',
    route: '/analytics',
    icon: BarChart3,
    color: '#8b5cf6',
    roles: ['admin', 'leadership', 'it', 'owner'],
    category: 'ops',
  },
  {
    id: 'integrations',
    label: 'Integrations',
    description: 'GitHub/Slack/Google OAuth status & logos',
    route: '/profile?section=integrations',
    icon: Settings,
    color: '#06b6d4',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'ops',
  },
  {
    id: 'security',
    label: 'Security — 2FA',
    description: 'TOTP two-factor setup, backup codes, device check',
    route: '/profile?section=security',
    icon: Shield,
    color: '#059669',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'ops',
  },
  {
    id: 'theme',
    label: 'Theme',
    description: 'Dark / Light toggle — persists to profile',
    route: '/profile?section=preferences',
    icon: Palette,
    color: '#6366f1',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'ops',
  },
  {
    id: 'profile-picture',
    label: 'Profile Picture',
    description: 'Upload avatar with guardrails & moderation',
    route: '/profile?section=personal',
    icon: ImageIcon,
    color: '#f59e0b',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'comms',
  },
  {
    id: 'platform-secrets',
    label: 'Platform Secrets',
    description: 'Owner-only — secrets & impersonation (owner superset)',
    route: '/ops',
    icon: Lock,
    color: '#0f172a',
    roles: ['owner'],
    category: 'ops',
  },
  {
    id: 'profile',
    label: 'Profile & Roles',
    description: 'Manage your role & settings',
    route: '/profile',
    icon: Users,
    color: '#6b7280',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership', 'owner'],
    category: 'comms',
  },
];

export function canAccessTool(userRole: DeepiriRole | null, tool: DeepiriTool): boolean {
  if (!userRole) return false;
  if (userRole === 'admin' || userRole === 'leadership' || userRole === 'it' || userRole === 'owner') return true;
  return tool.roles.includes(userRole);
}

export function getToolsForRole(role: DeepiriRole | null): DeepiriTool[] {
  if (!role) return [];
  if (role === 'admin' || role === 'leadership' || role === 'it' || role === 'owner') return TOOLS;
  return TOOLS.filter(t => t.roles.includes(role));
}
