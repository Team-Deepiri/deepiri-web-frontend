/**
 * Google OAuth Utility using Google Identity Services
 * Frontend OAuth: Uses Google Identity Services to authenticate with Google
 * Gets the Google ID token and sends it to backend for verification
 * Docker Integration: Client ID comes from VITE_GOOGLE_CLIENT_ID environment variable
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '189687247902-o04ua363vbpfhpkjr4qbhr6slbsgdjhi.apps.googleusercontent.com';

let isGoogleLoaded = false;
let googleLoadPromise: Promise<void> | null = null;

/**
 * Load Google Identity Services script if not already loaded
 */
async function loadGoogleIdentityServices(): Promise<void> {
  if (isGoogleLoaded && (window as any).google?.accounts?.id) {
    return; // Already loaded
  }

  if (googleLoadPromise) {
    return googleLoadPromise; // Already loading
  }

  googleLoadPromise = new Promise<void>((resolve, reject) => {
    // Check if already loaded
    if ((window as any).google?.accounts?.id) {
      isGoogleLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      isGoogleLoaded = true;
      resolve();
    };
    script.onerror = () => {
      googleLoadPromise = null;
      reject(new Error('Failed to load Google Identity Services'));
    };
    document.head.appendChild(script);
  });

  return googleLoadPromise;
}

/**
 * Initialize Google Identity Services and trigger sign-in via popup
 * Returns a promise that resolves with the Google ID token
 */
export async function signInWithGoogle(): Promise<string> {
  // Load Google Identity Services script
  await loadGoogleIdentityServices();

  return new Promise<string>((resolve, reject) => {
    // Store resolve/reject for callback
    (window as any).__googleOAuthResolve = resolve;
    (window as any).__googleOAuthReject = reject;

    // Initialize Google Identity Services with callback
    (window as any).google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => {
        if (response.credential) {
          // Clean up
          delete (window as any).__googleOAuthResolve;
          delete (window as any).__googleOAuthReject;
          // Return the ID token
          resolve(response.credential);
        } else {
          const rejectFn = (window as any).__googleOAuthReject;
          if (rejectFn) {
            delete (window as any).__googleOAuthResolve;
            delete (window as any).__googleOAuthReject;
            rejectFn(new Error('No credential received from Google'));
          }
        }
      },
    });

    // Use OAuth2 flow to get ID token via popup
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'openid profile email',
      callback: async (tokenResponse: any) => {
        if (tokenResponse.access_token) {
          try {
            // Exchange access token for ID token by calling Google's userinfo endpoint
            // But we need the ID token, not access token
            // Let's use a different approach - redirect flow to get ID token
            const resolveFn = (window as any).__googleOAuthResolve;
            const rejectFn = (window as any).__googleOAuthReject;
            
            if (rejectFn) {
              delete (window as any).__googleOAuthResolve;
              delete (window as any).__googleOAuthReject;
              rejectFn(new Error('OAuth2 token flow not supported. Please use ID token flow.'));
            }
          } catch (error) {
            const rejectFn = (window as any).__googleOAuthReject;
            if (rejectFn) {
              delete (window as any).__googleOAuthResolve;
              delete (window as any).__googleOAuthReject;
              rejectFn(error);
            }
          }
        }
      },
    });

    // Try One Tap first, if not available, show popup
    (window as any).google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // One Tap not available, trigger popup by rendering and clicking a button
        const buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'fixed';
        buttonContainer.style.top = '-9999px';
        buttonContainer.style.left = '-9999px';
        buttonContainer.id = 'google-signin-trigger';
        
        document.body.appendChild(buttonContainer);
        
        // Render Google sign-in button
        (window as any).google.accounts.id.renderButton(buttonContainer, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
        });

        // Find and click the button
        setTimeout(() => {
          const button = buttonContainer.querySelector('div[role="button"]');
          if (button) {
            (button as HTMLElement).click();
          } else {
            const rejectFn = (window as any).__googleOAuthReject;
            if (rejectFn) {
              delete (window as any).__googleOAuthResolve;
              delete (window as any).__googleOAuthReject;
              rejectFn(new Error('Failed to trigger Google sign-in'));
            }
          }
          
          // Clean up button container after a delay
          setTimeout(() => {
            if (document.body.contains(buttonContainer)) {
              document.body.removeChild(buttonContainer);
            }
          }, 5000);
        }, 100);
      }
    });
  });
}

