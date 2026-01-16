/**
 * Google Sign-In Button Component
 * Frontend OAuth: Uses Google Identity Services to render a Google sign-in button
 * When clicked, it triggers Google OAuth and passes the ID token to the callback
 * Docker Integration: Client ID comes from VITE_GOOGLE_CLIENT_ID environment variable
 */

import React, { useEffect, useRef } from 'react';

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '189687247902-o04ua363vbpfhpkjr4qbhr6slbsgdjhi.apps.googleusercontent.com';

/**
 * Google Sign-In Button Component
 * Renders a Google sign-in button using Google Identity Services
 */
const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ 
  onSuccess, 
  onError,
  className = '' 
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = (): Promise<void> => {
      if ((window as any).google?.accounts?.id) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(script);
      });
    };

    // Initialize and render button
    const initButton = async () => {
      try {
        if (!buttonRef.current || isInitialized.current) {
          return;
        }

        await loadGoogleScript();

        // Initialize Google Identity Services
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError?.(new Error('No credential received from Google'));
            }
          },
        });

        // Render the Google sign-in button
        (window as any).google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
        });

        isInitialized.current = true;
      } catch (error) {
        console.error('Error initializing Google sign-in button:', error);
        onError?.(error as Error);
      }
    };

    initButton();
  }, [onSuccess, onError]);

  return (
    <div 
      ref={buttonRef} 
      className={className}
      style={{ minHeight: '40px' }}
    />
  );
};

export default GoogleSignInButton;

