// app/verify-email/page.jsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail, resendVerificationEmail } from '../../lib/api';

export default function VerifyEmailRoute() {
  return (
    <Suspense fallback={<FullScreenState message="Loading…" />}>
      <VerifyEmailPage />
    </Suspense>
  );
}

function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'

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
      .then(({ restaurant }) => {
        setStatus('success');
        // Verifying now logs the owner in immediately (see auth.controller.js#verifyEmail)
        // — a brief pause lets them read the confirmation before landing in their workspace.
        setTimeout(() => router.push(`/portal?res=${restaurant.slug}`), 1500);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'This verification link is invalid or has expired.');
      });
  }, [token, router]);

  const handleResend = async () => {
    if (!resendEmail.trim()) return;
    setResendStatus('sending');
    try {
      await resendVerificationEmail(resendEmail.trim());
      setResendStatus('sent');
    } catch {
      setResendStatus('idle');
    }
  };

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
            <p className="mt-2 text-sm text-ink/60">You're all set — taking you to your dashboard…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-chili/10">
              <span className="text-2xl text-chili">✕</span>
            </div>
            <h1 className="font-display text-xl font-semibold text-ink">Verification failed</h1>
            <p className="mt-2 text-sm text-chili">{message}</p>

            {resendStatus === 'sent' ? (
              <p className="mt-5 text-xs font-medium text-basil">
                If that email has an account needing verification, a new link is on its way.
              </p>
            ) : (
              <div className="mt-5 space-y-2 text-left">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold text-ink/60">Get a new verification link</span>
                  <input
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="[email protected]"
                    className="w-full rounded-lg border border-sand px-3 py-2 text-sm text-ink outline-none focus:border-basil"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === 'sending' || !resendEmail.trim()}
                  className="w-full rounded-xl bg-basil py-2 text-sm font-semibold text-paper disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resendStatus === 'sending' ? 'Sending…' : 'Resend verification email'}
                </button>
              </div>
            )}

            <a href="/login" className="mt-5 inline-block text-xs font-semibold text-ink/50 hover:text-ink">
              Back to login
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
