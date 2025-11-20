// Type augmentation for react-hot-toast
import type { ComponentType } from 'react';

declare module 'react-hot-toast' {
  interface DefaultToast {
    (message: string, options?: any): string;
    success: (message: string, options?: any) => string;
    error: (message: string, options?: any) => string;
    loading: (message: string, options?: any) => string;
    custom: (content: any, options?: any) => string;
    promise: <T>(promise: Promise<T> | (() => Promise<T>), msgs: any, opts?: any) => Promise<T>;
    dismiss: (toastId?: string) => void;
    info: (message: string, options?: any) => string;
  }
  
  const toast: DefaultToast;
  export default toast;
  
  export const Toaster: ComponentType<any>;
}

