export const TYPE_COLORS: Record<string, string> = {
  'page': '#6366f1',
  'component': '#8b5cf6',
  'gamification-component': '#a855f7',
  'chat-component': '#c084fc',
  'chat-widget': '#d946ef',
  'context': '#f97316',
  'api-module': '#10b981',
  'hook': '#f59e0b',
  'utility': '#06b6d4',
  'type-definition': '#64748b',
  'stylesheet': '#ec4899',
  'module': '#94a3b8',
};

export const FORCE_SIM = {
  REPULSION: -800,
  CENTERING: 0.0005,
  LINK_DISTANCE: 120,
  LINK_STRENGTH: 0.003,
  DECAY: 0.0228,
  VELOCITY_DECAY: 0.4,
  CHARGE: -200,
  COLLISION_RADIUS_BASE: 15,
  COLLISION_RADIUS_MAX: 16,
} as const;
