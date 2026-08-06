// app/register/page.jsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { registerOwner, resendVerificationEmail } from '../../lib/api';
import PasswordInput from '../../components/PasswordInput';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Only these four are self-serve — Premium requires payment setup before
// activation, which isn't built yet (no card collection exists), so it's
// deliberately never offered as a normal signup path here. The backend
// independently rejects a 'premium' plan at registration too, regardless of
// what this page shows — see auth.controller.js#register.
const SELF_SERVE_PLANS = ['free', 'starter', 'growth', 'business'];
const PLAN_LABELS = { free: 'Free', starter: 'Starter', growth: 'Growth', business: 'Business' };

export default function RegisterPageRoute() {
  return (
    <Suspense fallback={<FullScreenState message="Loading…" />}>
      <RegisterPage />
    </Suspense>
  );
}

function RegisterPage() {
  const searchParams = useSearchParams();
  const requestedPlan = searchParams.get('plan');

  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState(null);
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'sending' | 'sent'

  useEffect(() => {
    document.title = 'Create Your Account — SiMenu';
  }, []);

  // Auto-suggests a URL-safe slug from the restaurant name, but stops
  // auto-updating the moment the owner types into the slug field directly —
  // never fights the person actively editing it.
  const handleNameChange = (value) => {
    setRestaurantName(value);
    if (!slugManuallyEdited) {
      setSlug(
        value
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  // Premium isn't self-serve yet (no payment collection built) — rather than
  // let someone fill out the whole form and hit a confusing rejection at the
  // very end, show this dedicated screen immediately if that's what was requested.
  if (requestedPlan === 'premium') {
    return (
      <FullScreenState
        title="Premium requires a quick setup call"
        message="Premium includes unlimited tables and the AI menu assistant, and needs payment arranged before your account is activated — this isn't self-serve yet. Please contact us and we'll get you set up."
        action={{ label: 'Sign up for a different plan instead', href: '/register' }}
      />
    );
  }

  const plan = SELF_SERVE_PLANS.includes(requestedPlan) ? requestedPlan : 'free';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!restaurantName.trim()) {
      setError('Restaurant name is required.');
      return;
    }
    if (!SLUG_PATTERN.test(slug)) {
      setError('Your restaurant\'s web address may only contain lowercase letters, numbers, and hyphens.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      await registerOwner({ slug, restaurantName, email, password, plan, agreedToTerms });
      // No redirect — strict email verification means there's no login
      // session yet to redirect with (register() deliberately issues no
      // cookie). Show a clear "check your email" confirmation right here instead.
      setRegisteredEmail(email.trim().toLowerCase());
    } catch (err) {
      setError(err.message || 'Something went wrong while creating your account.');
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await resendVerificationEmail(registeredEmail);
      setResendStatus('sent');
    } catch {
      setResendStatus('idle');
    }
  };

  // Shown immediately after a successful registration — there's no login
  // session yet (strict verification means register() issues no cookie), so
  // this replaces the old "redirect straight to the dashboard" behavior.
  if (registeredEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper px-4 text-center">
        <div className="w-full max-w-sm rounded-3xl border border-sand bg-white p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-basil/10 text-2xl">
            ✉️
          </div>
          <h1 className="font-display text-xl italic text-ink">Check your email</h1>
          <p className="mt-2 text-sm text-ink/60">
            We've sent a verification link to <span className="font-semibold text-ink">{registeredEmail}</span>.
            Click it to activate your account — you won't be able to log in until you do.
          </p>

          {resendStatus === 'sent' ? (
            <p className="mt-5 text-xs font-medium text-basil">
              If that email has an account needing verification, a new link is on its way.
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === 'sending'}
              className="mt-5 text-xs font-semibold text-basil hover:underline disabled:opacity-50"
            >
              {resendStatus === 'sending' ? 'Sending…' : "Didn't get it? Resend the email"}
            </button>
          )}

          <p className="mt-6 text-sm text-ink/50">
            Already verified?{' '}
            <a href="/login" className="font-semibold text-basil hover:underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-basil/30 text-xl font-semibold text-basil">
            S
          </div>
          <h1 className="font-display text-2xl italic text-ink">Set up your restaurant</h1>
          <p className="mt-1 text-sm text-ink/50">
            {plan === 'free'
              ? 'Free to start — takes about a minute.'
              : `Signing up for the ${PLAN_LABELS[plan]} plan — your first month is free.`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-sand bg-white p-6 shadow-sm shadow-ink/5">
          {error && <p className="mb-4 rounded-lg bg-chili/10 px-3 py-2 text-xs font-medium text-chili">{error}</p>}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink/60">Restaurant name</span>
            <input
              type="text"
              name="organization"
              autoComplete="organization"
              required
              value={restaurantName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Savory Foods"
              className="w-full rounded-lg border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-basil"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold text-ink/60">Your restaurant's web address</span>
            <div className="flex items-center rounded-lg border border-sand focus-within:border-basil">
              <span className="pl-3 text-sm text-ink/40">simenu.app/menu?res=</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  setSlug(e.target.value.toLowerCase());
                }}
                placeholder="savory-foods"
                className="min-w-0 flex-1 rounded-r-lg py-2.5 pl-1 pr-3 text-sm text-ink outline-none"
              />
            </div>
          </label>

          <label className="mt-4 block">
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
            <span className="mb-1 block text-xs font-semibold text-ink/60">Password</span>
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

          <label className="mt-4 flex items-start gap-2 text-xs text-ink/70">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              required
              className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-sand accent-basil"
            />
            <span>
              I agree to the{' '}
              <a href="/legal/terms" target="_blank" rel="noopener noreferrer" className="font-semibold text-basil hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/legal/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-basil hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !agreedToTerms}
            className="mt-6 w-full rounded-2xl bg-chili py-3 font-semibold text-paper shadow-md shadow-chili/30 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Creating your account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/50">
          Already have an account?{' '}
          <a href="/login" className="font-semibold text-basil hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

function FullScreenState({ title, message, action }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      {title && <h1 className="mb-2 font-display text-xl italic text-ink">{title}</h1>}
      <p className="max-w-sm text-sm text-ink/60">{message}</p>
      {action && (
        <a href={action.href} className="mt-5 text-sm font-semibold text-basil hover:underline">
          {action.label}
        </a>
      )}
    </div>
  );
}
