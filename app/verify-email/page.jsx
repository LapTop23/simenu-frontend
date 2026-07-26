// app/verify-email/page.jsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmail } from '../../lib/api';

export default function VerifyEmailRoute() {
  return (
    <Suspense fallback={<FullScreenState message="Loading…" />}>
      <VerifyEmailPage />
    </Suspense>
  );
}

function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    document.title = 'Verify Email — SiMenu';
  }, []);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token was provided. Please use the link from your email.');
      return;
    }

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'This verification link is invalid or has expired.');
      });
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm rounded-3xl border border-sand bg-white p-8 text-center shadow-sm shadow-ink/5">
        {status === 'verifying' && <p className="text-sm text-ink/60">Verifying your email…</p>}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-basil/10">
              <span className="text-2xl text-basil">✓</span>
            </div>
            <h1 className="font-display text-xl font-semibold text-ink">Email verified</h1>
            <p className="mt-2 text-sm text-ink/60">Your email has been confirmed. You're all set.</p>
            <a
              href="/login"
              className="mt-6 inline-block w-full rounded-2xl bg-chili py-3 font-semibold text-paper shadow-md shadow-chili/30"
            >
              Go to login
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-chili/10">
              <span className="text-2xl text-chili">✕</span>
            </div>
            <h1 className="font-display text-xl font-semibold text-ink">Verification failed</h1>
            <p className="mt-2 text-sm text-chili">{message}</p>
            <p className="mt-4 text-xs text-ink/50">
              You can request a new verification email from your dashboard after logging in.
            </p>
            <a
              href="/login"
              className="mt-6 inline-block w-full rounded-2xl bg-basil py-3 font-semibold text-paper"
            >
              Go to login
            </a>
          </>
        )}
      </div>
    </div>
  );
}

function FullScreenState({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6 text-center">
      <p className="text-sm text-ink/50">{message}</p>
    </div>
  );
}
