'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive actions (delete, demote) use the danger button; everything else uses primary. */
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-system replacement for `window.confirm()` — a native browser dialog
 * can't be themed and looks jarring against the rest of the app.
 * AGENTS/UI_UX_DESIGN.md's Card treatment (border-2, hard shadow, sharp
 * corners), just centered over a dim scrim.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps): ReactNode {
  const titleId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') onCancel();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-none border-2 border-zinc-900 bg-white p-6 shadow-brutal-lg dark:border-zinc-300 dark:bg-zinc-800 dark:shadow-brutal-lg-dark"
      >
        <h2 id={titleId} className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            type="button"
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
