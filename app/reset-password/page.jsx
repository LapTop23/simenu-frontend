// app/reset-password/page.jsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword } from '../../lib/api';
import PasswordInput from '../../components/PasswordInput';

export default function ResetPasswordRoute() {
  return (
    <Suspense fallback={<FullScreenState message="Loading…" />}>
      <ResetPasswordPage />
    </Suspense>
  );
}

function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Reset Password — SiMenu';
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('This link is missing its reset token. Please use the link from your email.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(token, password);
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'This reset link is invalid or has expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl italic text-ink">Choose a new password</h1>
        </div>

        <div className="rounded-3xl border border-sand bg-white p-6 shadow-sm shadow-ink/5">
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-basil/10">
                <span className="text-2xl text-basil">✓</span>
              </div>
              <p className="text-sm text-ink/70">Your password has been reset successfully.</p>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="mt-6 w-full rounded-2xl bg-chili py-3 font-semibold text-paper shadow-md shadow-chili/30"
              >
                Go to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <p className="mb-4 rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{error}</p>}

              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink/60">New password</span>
                <PasswordInput
                  name="new-password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </label>

              <label className="mt-4 block">
                <span className="mb-1 block text-xs font-semibold text-ink/60">Confirm new password</span>
                <PasswordInput
                  name="confirm-password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full rounded-2xl bg-chili py-3 font-semibold text-paper shadow-md shadow-chili/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          )}
        </div>
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
