/** Recent-activity feed length (GET /dashboard/activity). */
export const ACTIVITY_FEED_LIMIT = 20;

/**
 * `blockers` is a required free-text field (DATABASE.md §3) — every report has
 * *some* value, even when there's nothing to report. These normalized values
 * are treated as "no blocker" for the "open blockers" summary metric; anything
 * else counts as an open blocker. A heuristic, not a structured flag — there is
 * no dedicated boolean column for this.
 */
export const NO_BLOCKER_VALUES = new Set(['none', 'n/a', 'na', 'no blockers', 'nothing', '-']);
