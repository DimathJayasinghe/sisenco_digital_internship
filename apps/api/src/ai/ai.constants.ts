/**
 * Fast/cost-effective default — this assistant answers questions over a
 * manager's own team-report context, not open-ended deep reasoning.
 * Pinned to an explicit stable version rather than a `-latest` alias, so
 * behavior doesn't shift silently on a Google-side model rotation — verify
 * against `ai.models.list()` if this ever starts 404ing with "no longer
 * available to new users" (it happened once already, to `gemini-2.5-flash`).
 *
 * Note: a free-tier API key is capped at 20 requests/day for this model
 * (separate from, and much lower than, the app's own 20-req/60s throttle).
 * Exceeding it surfaces as a 429 RESOURCE_EXHAUSTED from the Gemini API,
 * which AiService logs and turns into a generic 502 for the user — swap in
 * a billed API key before demoing if this starts happening.
 */
export const GEMINI_MODEL = 'gemini-3.5-flash';
