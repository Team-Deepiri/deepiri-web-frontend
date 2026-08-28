import type { DeepiriRole } from '../types/roles';
import type { LucideIcon } from 'lucide-react';
import {
  Megaphone, Database, ListChecks, Calendar, FileText, Code2, Zap,
  BarChart3, Wrench, GitBranch, MessageSquare, Bot, ClipboardList,
  Shield, Settings, Users, Rocket,
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

// RBAC: admin/leadership/it see all via canAccessTool; others filtered by roles
export const TOOLS: DeepiriTool[] = [
  // Comms
  {
    id: 'create-announcement',
    label: 'Create Announcement',
    description: 'Post to #announcements — forwarded from Discord via Norozo',
    route: '/tools/announce',
    icon: Megaphone,
    color: '#7c3aed',
    roles: ['admin', 'leadership', 'it'],
    category: 'comms',
  },
  {
    id: 'announcements-feed',
    label: 'Announcements',
    description: 'View all announcements (Norozo → Discord #announcements)',
    route: '/dashboard#announcements',
    icon: Megaphone,
    color: '#7c3aed',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership'],
    category: 'comms',
  },
  {
    id: 'events',
    label: 'Events',
    description: 'Create and RSVP to team events',
    route: '/events',
    icon: Calendar,
    color: '#0ea5e9',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership'],
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
    roles: ['software_developer', 'it', 'admin', 'leadership'],
    category: 'catalog',
  },
  {
    id: 'jobs',
    label: 'Jobs',
    description: 'Async work & test runs',
    route: '/ops/jobs',
    icon: ListChecks,
    color: '#f59e0b',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership'],
    category: 'catalog',
  },
  {
    id: 'documents',
    label: 'Documents',
    description: 'Shared docs, decks, wikis',
    route: '/documents',
    icon: FileText,
    color: '#6366f1',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership'],
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
    roles: ['software_developer', 'ai_ml', 'it', 'admin', 'leadership'],
    category: 'dev',
  },
  {
    id: 'pr-impact',
    label: 'PR Impact',
    description: 'PR risk & review',
    route: '/pr-impact',
    icon: Zap,
    color: '#f97316',
    roles: ['software_developer', 'it', 'admin', 'leadership'],
    category: 'dev',
  },
  {
    id: 'ops-hub',
    label: 'Ops Hub',
    description: 'Truss, telemetry, gateway',
    route: '/ops',
    icon: Wrench,
    color: '#dc2626',
    roles: ['it', 'admin', 'leadership', 'qa_support', 'software_developer'],
    category: 'ops',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Usage & insights',
    route: '/analytics',
    icon: BarChart3,
    color: '#8b5cf6',
    roles: ['admin', 'leadership', 'it'],
    category: 'ops',
  },
  {
    id: 'profile',
    label: 'Profile & Roles',
    description: 'Manage your role & settings',
    route: '/profile',
    icon: Users,
    color: '#6b7280',
    roles: ['ai_ml', 'qa_support', 'software_developer', 'it', 'admin', 'leadership'],
    category: 'comms',
  },
];

export function canAccessTool(userRole: DeepiriRole | null, tool: DeepiriTool): boolean {
  if (!userRole) return false;
  if (userRole === 'admin' || userRole === 'leadership' || userRole === 'it') return true;
  return tool.roles.includes(userRole);
}

export function getToolsForRole(role: DeepiriRole | null): DeepiriTool[] {
  if (!role) return [];
  if (role === 'admin' || role === 'leadership' || role === 'it') return TOOLS;
  return TOOLS.filter(t => t.roles.includes(role));
}
