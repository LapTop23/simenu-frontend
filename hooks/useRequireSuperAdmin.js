// hooks/useRequireSuperAdmin.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSuperAdminSession, logoutSuperAdmin } from '../lib/api';

/**
 * useRequireSuperAdmin — the guard behind /super-admin's dashboard pages.
 * Completely independent from useRequireAuth (restaurant owners): checks a
 * different cookie via a different backend session entirely. A regular
 * owner's valid login has zero effect here — see the backend's
 * requireSuperAdmin middleware, which checks a role claim no owner token
 * ever carries.
 */
export function useRequireSuperAdmin() {
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // 'checking' | 'authorized'

  useEffect(() => {
    let isCancelled = false;

    fetchSuperAdminSession()
      .then(() => {
        if (!isCancelled) setStatus('authorized');
      })
      .catch(() => {
        if (!isCancelled) router.replace('/super-admin/login');
      });

    return () => {
      isCancelled = true;
    };
  }, [router]);

  const logout = async () => {
    await logoutSuperAdmin().catch(() => {});
    router.replace('/super-admin/login');
  };

  return { status, logout };
}
