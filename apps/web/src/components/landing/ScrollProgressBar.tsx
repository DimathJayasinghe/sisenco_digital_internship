'use client';

import { useEffect, useState, type ReactNode } from 'react';

/** Thin fixed bar at the top of the landing page tracking scroll progress. */
export function ScrollProgressBar(): ReactNode {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    function updateProgress(): void {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = scrollable > 0 ? window.scrollY / scrollable : 0;
      setProgress(Math.min(1, Math.max(0, fraction)));
      ticking = false;
    }

    function handleScroll(): void {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateProgress);
    }

    updateProgress();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
      <div
        className="h-full bg-violet-600 dark:bg-violet-500"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
