import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUiStore } from '../store/uiStore';
import { useAuth } from '../contexts/AuthContext';

const IMMERSIVE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_IMMERSIVE_URL) ||
  'http://localhost:5174';

const ImmersiveButton: React.FC = () => {
  const immersiveLive = useUiStore((s) => s.immersiveLive);
  const { token } = useAuth();

  const openImmersive = () => {
    // Avoid noopener so Immersive can signal deepiri:immersive-ready via window.opener
    const win = window.open(IMMERSIVE_URL, '_blank');
    if (!win) return;

    const payload = {
      type: 'deepiri:auth',
      token: token ?? localStorage.getItem('token'),
      source: 'portal',
    };

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      try {
        win.postMessage(payload, IMMERSIVE_URL);
      } catch {
        /* cross-origin until loaded */
      }
      if (attempts >= 12 || win.closed) window.clearInterval(timer);
    }, 250);
  };

  return (
    <AnimatePresence>
      {immersiveLive && (
        <motion.button
          type="button"
          className="portal-immersive-btn"
          onClick={openImmersive}
          initial={{ opacity: 0, scale: 0.9, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -4 }}
          transition={{ duration: 0.25 }}
          aria-label="Enter 3D Immersive"
        >
          Enter 3D <span aria-hidden>✦</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ImmersiveButton;
