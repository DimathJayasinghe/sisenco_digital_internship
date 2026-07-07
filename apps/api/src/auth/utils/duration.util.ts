const DURATION_PATTERN = /^(\d+)(s|m|h|d)$/;

const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

/**
 * Parses a jsonwebtoken-style duration string (e.g. "7d", "24h", "30m") into
 * milliseconds, so the same JWT_EXPIRES_IN value can size the cookie's maxAge.
 */
export function parseDurationMs(value: string): number {
  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) {
    throw new Error(
      `Invalid duration format: "${value}". Expected e.g. "7d", "24h", "30m", "60s".`,
    );
  }

  const [, amount, unit] = match;
  return Number(amount) * UNIT_TO_MS[unit];
}
