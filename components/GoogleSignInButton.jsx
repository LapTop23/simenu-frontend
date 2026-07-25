// components/GoogleSignInButton.jsx
'use client';

import { useEffect, useRef } from 'react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * GoogleSignInButton — loads Google's own "Sign In With Google" script and
 * renders Google's official button widget (not a custom-styled lookalike —
 * Google's terms require using their real button, which also means it
 * automatically matches whatever language/theme the visitor's browser
 * prefers). On success, Google hands back a signed "credential" (an ID
 * token) via `onCredential`; this component never sees or handles a Google
 * password itself — that happens entirely on Google's own page/popup.
 */
export default function GoogleSignInButton({ onCredential }) {
  const buttonRef = useRef(null);
  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential; // Always call the latest handler, without re-initializing Google's script on every render.

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set — the Google sign-in button will not render.');
      return;
    }

    function initializeAndRender() {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => callbackRef.current(response.credential),
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      });
    }

    if (window.google?.accounts?.id) {
      initializeAndRender();
      return undefined;
    }

    // Load Google's script once; if this component mounts again before it
    // finishes loading (fast navigation), the existing script tag is reused
    // rather than duplicated.
    const existingScript = document.getElementById('google-identity-script');
    if (existingScript) {
      existingScript.addEventListener('load', initializeAndRender);
      return () => existingScript.removeEventListener('load', initializeAndRender);
    }

    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeAndRender;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  return <div ref={buttonRef} className="flex justify-center" />;
}
