import { HistoryList } from './HistoryList';

export default function HistoryPage(): React.ReactNode {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Report History</h1>
      <p className="mt-2 text-sm text-zinc-400">
        All your submitted and draft reports, most recent first.
      </p>
      <HistoryList />
    </div>
  );
}
