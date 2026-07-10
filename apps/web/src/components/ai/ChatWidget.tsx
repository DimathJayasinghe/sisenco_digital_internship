'use client';

import { MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAiChat } from '@/hooks/useAi';
import { getApiErrorMessage } from '@/lib/api/error';
import { cn } from '@/lib/utils';

interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
}

// Gemini replies use plain markdown (bold, bullet/numbered lists) — render it
// instead of showing literal "**"/"*" characters. Structure only, no color
// overrides, so bubbles keep inheriting the text color set on their wrapper.
const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="underline">
      {children}
    </a>
  ),
};

/**
 * Floating chat widget — AGENTS/UI_UX_DESIGN.md §7 ("bottom-right, surface
 * tone, toggleable"). Manager Dashboard only (rendered from (manager)/layout.tsx,
 * which is already role-gated by middleware.ts + the API's @Roles(MANAGER)
 * on POST /ai/chat). Message history is client-side/ephemeral — nothing is
 * persisted, matching the module's "answer over current context" scope.
 */
export function ChatWidget(): ReactNode {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const chat = useAiChat();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, chat.isPending]);

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const message = input.trim();
    if (!message || chat.isPending) return;

    setMessages((current) => [...current, { role: 'user', content: message }]);
    setInput('');
    chat.mutate(
      { message },
      {
        onSuccess: (response) => {
          setMessages((current) => [...current, { role: 'assistant', content: response.reply }]);
        },
        onError: (error) => {
          setMessages((current) => [
            ...current,
            { role: 'assistant', content: getApiErrorMessage(error) },
          ]);
        },
      },
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col border-2 border-zinc-900 bg-white shadow-brutal-lg dark:border-zinc-300 dark:bg-zinc-800 dark:shadow-brutal-lg-dark">
          <div className="flex items-center justify-between border-b-2 border-zinc-900 px-4 py-3 dark:border-zinc-300">
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">AI Assistant</p>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Ask about this week&apos;s reports — who&apos;s submitted, what&apos;s blocked,
                workload by project.
              </p>
            ) : (
              messages.map((entry, index) => (
                <div
                  key={index}
                  className={cn(
                    'max-w-[85%] border-2 px-3 py-2 text-sm',
                    entry.role === 'user'
                      ? 'ml-auto whitespace-pre-wrap border-zinc-900 bg-violet-600 text-white dark:border-zinc-300'
                      : 'border-zinc-900 bg-zinc-100 text-zinc-800 dark:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-200',
                  )}
                >
                  {entry.role === 'assistant' ? (
                    <ReactMarkdown components={markdownComponents}>{entry.content}</ReactMarkdown>
                  ) : (
                    entry.content
                  )}
                </div>
              ))
            )}
            {chat.isPending && (
              <div className="max-w-[85%] border-2 border-zinc-900 bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400">
                Thinking…
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t-2 border-zinc-900 p-3 dark:border-zinc-300"
          >
            <div className="flex-1">
              <Input
                label="Message"
                className="py-2 text-sm"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question…"
                autoComplete="off"
              />
            </div>
            <Button
              type="submit"
              disabled={chat.isPending || !input.trim()}
              aria-label="Send message"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex h-12 w-12 items-center justify-center border-2 border-zinc-900 bg-violet-600 text-white shadow-brutal-violet transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none dark:border-zinc-300"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
}
