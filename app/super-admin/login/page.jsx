// app/super-admin/login/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginSuperAdmin } from '../../../lib/api';
import PasswordInput from '../../../components/PasswordInput';

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Super Admin — SiMenu';
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await loginSuperAdmin({ email, password });
      router.push('/super-admin');
    } catch (err) {
      setError(err.message || 'Something went wrong while logging in.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-xl font-semibold text-white">
            S
          </div>
          <h1 className="font-display text-xl italic text-white">Super Admin</h1>
          <p className="mt-1 text-xs text-white/40">Internal SiMenu operations panel</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/5 p-6">
          {error && <p className="mb-4 rounded-lg bg-chili/20 px-3 py-2 text-xs font-medium text-chili">{error}</p>}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/50">Email</span>
            <input
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm text-white outline-none focus:border-white/30"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold text-white/50">Password</span>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              inputClassName="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2.5 pr-10 text-sm text-white outline-none focus:border-white/30"
              toggleClassName="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-white/40 hover:text-white/70"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 w-full rounded-2xl bg-white py-3 font-semibold text-ink transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
