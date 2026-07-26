// app/forgot-password/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { requestPasswordReset } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Forgot Password — SiMenu';
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      // Always shows the same success state regardless of whether the email
      // actually matched an account — mirrors the backend's deliberately
      // uninformative response, so this page can't be used to check which
      // emails have SiMenu accounts either.
      setIsSubmitted(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl italic text-ink">Reset your password</h1>
          <p className="mt-1 text-sm text-ink/50">We'll email you a link to choose a new one.</p>
        </div>

        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm shadow-ink/5">
          {isSubmitted ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-basil/10">
                <span className="text-2xl text-basil">✓</span>
              </div>
              <p className="text-sm text-ink/70">
                If an account exists for <span className="font-semibold">{email}</span>, a password reset link has
                been sent. Please check your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <p className="mb-4 rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{error}</p>}

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink/60">Email</span>
                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="[email protected]"
                  className="w-full rounded-lg border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-basil"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-2xl bg-chili py-3 font-semibold text-paper shadow-md shadow-chili/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-sm text-ink/50">
          Remembered your password?{' '}
          <a href="/login" className="font-semibold text-basil hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
