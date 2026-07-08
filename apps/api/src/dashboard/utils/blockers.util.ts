import { NO_BLOCKER_VALUES } from '../dashboard.constants';

export function hasOpenBlocker(blockers: string): boolean {
  const normalized = blockers.trim().toLowerCase();
  return normalized.length > 0 && !NO_BLOCKER_VALUES.has(normalized);
}
