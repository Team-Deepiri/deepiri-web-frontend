import React from 'react';
import {
  FiHome, FiSettings, FiUser, FiBell, FiMessageSquare,
  FiCode, FiTarget, FiZap, FiBarChart2, FiTrendingUp,
  FiActivity, FiCalendar, FiStar, FiAward, FiCompass,
  FiPackage, FiLayers, FiCpu, FiDatabase, FiGitBranch,
  FiSearch, FiAlertTriangle, FiCheckCircle, FiArrowRight,
  FiFileText, FiDownload, FiMaximize2, FiMinimize2,
  FiRefreshCw, FiFilter, FiLink2, FiBox, FiChevronDown,
  FiChevronRight, FiExternalLink, FiEye, FiEyeOff, FiMapPin,
} from 'react-icons/fi';

export type IconName = string;

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  home: FiHome,
  settings: FiSettings,
  user: FiUser,
  bell: FiBell,
  message: FiMessageSquare,
  code: FiCode,
  target: FiTarget,
  zap: FiZap,
  chart: FiBarChart2,
  trending: FiTrendingUp,
  activity: FiActivity,
  calendar: FiCalendar,
  star: FiStar,
  award: FiAward,
  compass: FiCompass,
  package: FiPackage,
  layers: FiLayers,
  cpu: FiCpu,
  database: FiDatabase,
  git: FiGitBranch,
  search: FiSearch,
  alert: FiAlertTriangle,
  check: FiCheckCircle,
  arrow: FiArrowRight,
  file: FiFileText,
  download: FiDownload,
  maximize: FiMaximize2,
  minimize: FiMinimize2,
  refresh: FiRefreshCw,
  filter: FiFilter,
  link: FiLink2,
  box: FiBox,
  'chevron-down': FiChevronDown,
  'chevron-right': FiChevronRight,
  external: FiExternalLink,
  eye: FiEye,
  'eye-off': FiEyeOff,
  network: FiMapPin,
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

/**
 * Renders a Lucide icon by string name.
 * Falls back to a generic dot if the name isn't recognized.
 */
export const Icon: React.FC<IconProps> = ({ name, size = 16, className }) => {
  const Component = ICON_MAP[name.toLowerCase()];
  if (!Component) {
    return <span className={className} style={{ width: size, height: size, display: 'inline-block' }} />;
  }
  return <Component size={size} className={className} />;
};

export default Icon;
