import React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

export interface ToastAction {
    label: string;
    onClick: () => void;
}

export interface ToastProps {
    id?: string;
    title: string;
    message: string;
    type: ToastType;
    position: ToastPosition;
    dismissible: boolean;
    actions?: ToastAction[];
    icon?: React.ReactNode;
    duration?: number; // in milliseconds
    onDismiss?: () => void;
}

