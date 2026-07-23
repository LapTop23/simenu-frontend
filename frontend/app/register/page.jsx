// app/register/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerOwner } from '../../lib/api';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function RegisterPage() {
  const router = useRouter();
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (!SLUG_PATTERN.test(slug)) {
      setError('Your restaurant\'s web address may only contain lowercase letters, numbers, and hyphens.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { restaurant } = await registerOwner({ slug, restaurantName, email, password });
      router.push(`/dashboard?res=${restaurant.slug}`);
    } catch (err) {
      setError(err.message || 'Something went wrong while creating your account.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-basil/30 text-xl font-semibold text-basil">
            S
          </div>
          <h1 className="font-display text-2xl italic text-ink">Set up your restaurant</h1>
          <p className="mt-1 text-sm text-ink/50">Free to start — takes about a minute.</p>
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
            <input
              type="password"
              name="new-password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full rounded-lg border border-sand px-3 py-2.5 text-sm text-ink outline-none focus:border-basil"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
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
