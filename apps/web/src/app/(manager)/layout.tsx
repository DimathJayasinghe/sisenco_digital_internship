import type { ReactNode } from 'react';
import { ChatWidget } from '@/components/ai/ChatWidget';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ManagerLayout({ children }: { children: ReactNode }): ReactNode {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-100 dark:bg-zinc-900 md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1">{children}</main>
      <ChatWidget />
    </div>
  );
}
