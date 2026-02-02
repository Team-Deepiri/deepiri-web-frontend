import React from 'react';

export type AlertType = 'success' | 'error' | 'info' | 'warning';

export type AlertPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export interface AlertAction {
    label: string;
    onClick: () => void;
}

export interface AlertProps {
    id?: string;
    title: string;
    message: string;
    type: AlertType;
    position: AlertPosition;
    dismissible: boolean;
    actions?: AlertAction[];
    icon?: React.ReactNode;
    duration?: number; // in milliseconds
    onDismiss?: () => void;
}

// ICONS
const SuccessIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z"
      fill="currentColor"
    />
  </svg>
);

const ErrorIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z"
      fill="currentColor"
    />
  </svg>
);

const WarningIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M0 20H20L10 0L0 20ZM11 17H9V15H11V17ZM11 13H9V9H11V13Z"
      fill="currentColor"
    />
  </svg>
);

const InfoIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V9H11V15ZM11 7H9V5H11V7Z"
      fill="currentColor"
    />
  </svg>
);

const XIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M12.5 3.5L3.5 12.5M3.5 3.5L12.5 12.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);