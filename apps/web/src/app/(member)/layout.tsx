import type { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';

export default function MemberLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
