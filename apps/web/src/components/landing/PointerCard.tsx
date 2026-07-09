'use client';

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const MAX_SHADOW_OFFSET = 10;

interface PointerCardProps {
  children: ReactNode;
  /** Stagger delay (ms) for the scroll-reveal transition, e.g. index * 100. */
  revealDelayMs?: number;
  className?: string;
}

/**
 * Landing-page feature card: fades/slides up the first time it scrolls into
 * view, and its hard offset shadow tracks the pointer while hovered (offset
 * only, no blur — stays in the flat neo-brutalist idiom). Both effects are
 * skipped under prefers-reduced-motion.
 */
export function PointerCard({
  children,
  revealDelayMs = 0,
  className,
}: PointerCardProps): ReactNode {
  const nodeRef = useRef<HTMLDivElement>(null);
  const reduceMotionRef = useRef(false);
  const [visible, setVisible] = useState(false);
  const [shadow, setShadow] = useState<string | undefined>(undefined);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotionRef.current) {
      setVisible(true);
      return;
    }
    const node = nodeRef.current;
    if (!node) return;
    let revealTimer: ReturnType<typeof setTimeout> | undefined;
    // The stagger is applied here, as a delayed state update, rather than a
    // CSS `transition-delay` — a `transition-delay` set once and left on the
    // element would also delay every future hover-driven box-shadow
    // transition indefinitely (transition-all covers both), making the
    // later cards' pointer tracking feel unresponsive forever, not just
    // during the one-time entrance animation.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          revealTimer = setTimeout(() => setVisible(true), revealDelayMs);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(revealTimer);
    };
  }, [revealDelayMs]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>): void {
    if (reduceMotionRef.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;
    const x = Math.round((0.5 - relX) * 2 * MAX_SHADOW_OFFSET);
    const y = Math.round((0.5 - relY) * 2 * MAX_SHADOW_OFFSET);
    setShadow(`${x}px ${y}px 0 0 var(--pointer-shadow-color)`);
  }

  return (
    <Card
      ref={nodeRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShadow(undefined)}
      style={shadow ? { boxShadow: shadow } : undefined}
      className={cn(
        '[--pointer-shadow-color:#18181b] dark:[--pointer-shadow-color:#d4d4d8]',
        'transition-all duration-300 ease-out motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className,
      )}
    >
      {children}
    </Card>
  );
}
