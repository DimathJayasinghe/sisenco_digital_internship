/**
 * Fast/cost-effective default — this assistant answers questions over a
 * manager's own team-report context, not open-ended deep reasoning.
 * Pinned to an explicit stable version rather than a `-latest` alias, so
 * behavior doesn't shift silently on a Google-side model rotation — verify
 * against `ai.models.list()` if this ever starts 404ing with "no longer
 * available to new users" (it happened once already, to `gemini-2.5-flash`).
 */
export const GEMINI_MODEL = 'gemini-3.5-flash';
