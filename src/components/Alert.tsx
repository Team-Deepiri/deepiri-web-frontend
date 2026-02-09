import React from 'react';
import { motion} from 'framer-motion';
import { useState, useEffect } from 'react';

// TYPES
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

const DefaultIcon: React.FC<{ variant: AlertType }> = ({ variant }) => {
  switch (variant) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
      return <InfoIcon />;
  }
};

const Alert: React.FC<AlertProps> = ({
  id,
  title,
  message,
  type,
  position,
  dismissible,
  actions,
  icon,
  duration,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!isVisible) {
    return null;
  }

  // Build CSS classes
  const alertClasses = [
    'alert',
    `alert--${type}`,
    `alert--${position}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={alertClasses}
      role="alert"
      aria-live="polite"
      id={id}
    >
      {/* Icon */}
      <div className="alert__icon">
        {icon || <DefaultIcon variant={type} />}
      </div>

      {/* Content */}
      <div className="alert__content">
        <div className="alert__title">{title}</div>
        <div className="alert__message">{message}</div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="alert__actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className="alert__action"
                onClick={action.onClick}
                type="button"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          className="alert__dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss alert"
          type="button"
        >
          <XIcon />
        </button>
      )}
    </div>
  );
};

export default { InfoIcon, WarningIcon, ErrorIcon, SuccessIcon, Alert };