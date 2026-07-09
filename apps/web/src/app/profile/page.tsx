'use client';

import { Role } from '@sisenco/shared-types';
import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { useCurrentUser } from '@/hooks/useAuth';
import { ProfileView } from './ProfileView';

/**
 * `/profile` sits outside the (member)/(manager) route groups — it's the one
 * page both roles reach, so it picks its own chrome (Sidebar vs Navbar) based
 * on the session's role instead of living in either group.
 */
export default function ProfilePage(): ReactNode {
  const { data: user } = useCurrentUser();

  if (user?.role === Role.MANAGER) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-900 md:flex-row">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <ProfileView />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <Navbar />
      <main>
        <ProfileView />
      </main>
    </div>
  );
}
