// hooks/useRequireAuth.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchCurrentSession, logoutOwner } from '../lib/api';

/**
 * useRequireAuth — the shared guard behind both /dashboard and /admin.
 *
 * On mount, checks whether a valid login cookie exists AND belongs to the
 * specific restaurant (`restaurantSlug`) this page is trying to show. This
 * second check matters just as much as the first: without it, a logged-in
 * owner could view or edit a DIFFERENT restaurant's dashboard just by
 * editing the `?res=` slug in the address bar. If either check fails, redirects
 * to /login instead of rendering anything from this page.
 *
 * @param {string|null} restaurantSlug - the `?res=` value this page is for
 * @returns {{ status: 'checking'|'authorized', ownerEmail: string|null, logout: () => void }}
 */
export function useRequireAuth(restaurantSlug) {
  const router = useRouter();
  const [status, setStatus] = useState('checking');
  const [ownerEmail, setOwnerEmail] = useState(null);

  useEffect(() => {
    if (!restaurantSlug) return;

    let isCancelled = false;

    fetchCurrentSession()
      .then(({ owner, restaurant }) => {
        if (isCancelled) return;

        if (restaurant.slug !== restaurantSlug) {
          // Logged in, but as a DIFFERENT restaurant — do not grant access.
          router.replace(`/login?redirectTo=${encodeURIComponent(`/dashboard?res=${restaurantSlug}`)}`);
          return;
        }

        setOwnerEmail(owner.email);
        setStatus('authorized');
      })
      .catch(() => {
        if (!isCancelled) {
          router.replace(`/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [restaurantSlug, router]);

  const logout = async () => {
    await logoutOwner().catch(() => {});
    router.replace('/login');
  };

  return { status, ownerEmail, logout };
}
