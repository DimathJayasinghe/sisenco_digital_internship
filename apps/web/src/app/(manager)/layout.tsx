import type { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ManagerLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-950 md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
