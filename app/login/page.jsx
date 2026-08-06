// app/login/page.jsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginOwner, fetchCurrentSession, resendVerificationEmail } from '../../lib/api';
import PasswordInput from '../../components/PasswordInput';

export default function LoginPageRoute() {
  return (
    <Suspense fallback={<FullScreenState message="Loading…" />}>
      <LoginPage />
    </Suspense>
  );
}

function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'

  useEffect(() => {
    document.title = 'Log In — SiMenu';
  }, []);

  // If already logged in (a valid cookie from an earlier visit), skip the
  // login form entirely and go to the workspace picker.
  useEffect(() => {
    fetchCurrentSession()
      .then(({ restaurant }) => {
        router.replace(`/portal?res=${restaurant.slug}`);
      })
      .catch(() => setIsCheckingSession(false));
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNeedsVerification(false);

    try {
      const { restaurant } = await loginOwner({ email, password, rememberMe });
      const redirectTo = searchParams.get('redirectTo');
      router.push(redirectTo || `/portal?res=${restaurant.slug}`);
    } catch (err) {
      setError(err.message || 'Something went wrong while logging in.');
      // Matches the specific message auth.controller.js#login sends for an
      // unverified account — used here purely to decide whether to show
      // the resend option, not for anything security-sensitive.
      setNeedsVerification((err.message || '').toLowerCase().includes('verify your email'));
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await resendVerificationEmail(email);
      setResendStatus('sent');
    } catch {
      setResendStatus('idle');
    }
  };

  if (isCheckingSession) return <FullScreenState message="Checking your session…" />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-basil/30 text-xl font-semibold text-basil">
            S
          </div>
          <h1 className="font-display text-2xl italic text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-ink/50">Log in to manage your restaurant on SiMenu.</p>
        </div>

        {/*
          A real <form> with a real onSubmit, standard input types, and
          correct `autoComplete` values — this combination is exactly what
          lets Chrome/Google Password Manager (and other browsers) recognize
          this as a genuine login form: offering to save the password after
          a successful login, and offering to autofill it on return visits.
        */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-sand bg-white p-6 shadow-sm shadow-ink/5">
          {error && <p className="mb-4 rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{error}</p>}

          {needsVerification && (
            <div className="mb-4">
              {resendStatus === 'sent' ? (
                <p className="text-xs font-medium text-basil">
                  If that email has an account needing verification, a new link is on its way.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === 'sending'}
                  className="text-xs font-semibold text-basil hover:underline disabled:opacity-50"
                >
                  {resendStatus === 'sending' ? 'Sending…' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/60">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="[email protected]"
              className="w-full rounded-lg border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-basil"
            />
          </label>

          <label className="mt-4 block">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink/60">Password</span>
              <a href="/forgot-password" className="text-xs font-semibold text-basil hover:underline">
                Forgot password?
              </a>
            </div>
            <PasswordInput
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </label>

          <label className="mt-4 flex items-center gap-2 text-sm text-ink/70">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-sand accent-basil"
            />
            Remember me for 30 days
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-2xl bg-chili py-3 font-semibold text-paper shadow-md shadow-chili/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/50">
          New to SiMenu?{' '}
          <a href="/register" className="font-semibold text-basil hover:underline">
            Create an account
          </a>
        </p>
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
