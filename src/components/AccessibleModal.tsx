import React, { useEffect, useRef, useCallback } from 'react';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const AccessibleModal: React.FC<AccessibleModalProps> = ({ isOpen, onClose, title, children, className }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!overlayRef.current) return;
    const focusable = overlayRef.current.querySelectorAll(FOCUSABLE);
    if (focusable.length === 0) return;

    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    previousFocus.current = document.activeElement as HTMLElement;

    const timer = setTimeout(() => {
      const el = overlayRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      trapFocus(e);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousFocus.current?.focus();
    };
  }, [isOpen, onClose, trapFocus]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={`modal-overlay ${className || ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      }}
    >
      <div
        role="document"
        style={{
          background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 16, padding: 24, maxWidth: 560, width: '90%',
          maxHeight: '85vh', overflow: 'auto', color: '#e2e8f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.06)',
              color: '#94a3b8', width: 32, height: 32, borderRadius: 8,
              cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AccessibleModal;
