/**
 * metrics.ts
 *
 * Canonical traffic parsing and comparison utilities.
 * Ensures that what is displayed on the UI is 100% consistent with
 * winner badges, rankings, and disparity calculations.
 */

/**
 * Parses human-formatted traffic strings (e.g. "580.0M / mo", "1.2B", "850K")
 * into normalized raw integers.
 */
export function parseTrafficMetric(str?: string | number | null, fallback = 0): number {
  if (typeof str === 'number') {
    return isNaN(str) ? fallback : Math.round(str);
  }
  if (!str || typeof str !== 'string') {
    return fallback;
  }

  // Remove commas, whitespace, and non-numeric leading garbage
  const cleaned = str.replace(/,/g, '').trim();
  const match = cleaned.match(/^([0-9.]+)\s*([BKMGT])?/i);
  if (!match) {
    return fallback;
  }

  const num = parseFloat(match[1]);
  if (isNaN(num)) {
    return fallback;
  }

  const unit = (match[2] || '').toUpperCase();
  const multipliers: Record<string, number> = {
    T: 1_000_000_000_000,
    B: 1_000_000_000,
    M: 1_000_000,
    K: 1_000,
  };

  const multiplier = multipliers[unit] ?? 1;
  return Math.round(num * multiplier);
}

/**
 * Determines the winner between two metric values.
 * Returns:
 *   - 'a' if site A wins
 *   - 'b' if site B wins
 *   - null if it's an exact tie (preventing false/arbitrary winners)
 *
 * @param valA Metric value for site A
 * @param valB Metric value for site B
 * @param higherIsBetter True for visits/rate, False for rank (lower rank number is better)
 */
export function compareMetric(
  valA: number,
  valB: number,
  higherIsBetter = true,
): 'a' | 'b' | null {
  if (valA === valB) return null;
  if (higherIsBetter) {
    return valA > valB ? 'a' : 'b';
  }
  return valA < valB ? 'a' : 'b';
}
