/**
 * Canonical ISO 8601 Week Slug Utilities
 * Format: "YYYY-wNN" e.g. "2026-w44"
 *
 * Single source of truth for week calculation, normalization, and memoization.
 * Enforces React.cache() Object.is() argument equality across generateMetadata
 * and page components.
 */

/**
 * Returns total number of ISO weeks in a given Gregorian year (52 or 53).
 * A year has 53 ISO weeks if January 1 is a Thursday (or Wednesday in a leap year),
 * or December 28 falls in week 53.
 */
export function getISOWeeksInYear(year: number): number {
  const dec28 = new Date(Date.UTC(year, 11, 28));
  return getISOWeek(dec28).week;
}

/**
 * Returns the ISO 8601 week number and ISO week-numbering year for a given date.
 */
export function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return {
    week,
    year: d.getUTCFullYear(),
  };
}

/**
 * Converts a Date object to a canonical ISO week slug ("YYYY-wNN").
 */
export function weekSlugFromDate(date: Date): string {
  const { week, year } = getISOWeek(date);
  return `${year}-w${String(week).padStart(2, '0')}`;
}

/**
 * Shared utility: returns the current ISO 8601 week slug.
 * Format: "YYYY-wNN" e.g. "2026-w44"
 */
export function getCurrentWeekSlug(): string {
  return weekSlugFromDate(new Date());
}

/**
 * Parses an ISO week slug ("YYYY-wNN") to the UTC Date of that week's Monday.
 * Returns null if the slug format is invalid.
 */
export function parseReportSlug(slug: string): Date | null {
  const match = slug.trim().toLowerCase().match(/^(\d{4})-w(\d{2})$/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const week = parseInt(match[2], 10);
  if (week < 1 || week > 53) return null;

  // Jan 4th is always in week 1 of ISO 8601
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(Date.UTC(year, 0, 4 - jan4Day + 1));
  const targetMonday = new Date(week1Monday.getTime() + (week - 1) * 7 * 86400000);
  return targetMonday;
}

/**
 * Normalizes any Date, string, null, or undefined input to a canonical ISO week slug ("YYYY-wNN").
 * Enforces React 19 cache() Object.is() memoization key equality.
 */
export function normalizeReportSlug(dateOrSlug?: Date | string | null): string {
  if (!dateOrSlug || dateOrSlug === 'latest') {
    return getCurrentWeekSlug();
  }
  if (dateOrSlug instanceof Date) {
    if (isNaN(dateOrSlug.getTime())) {
      return getCurrentWeekSlug();
    }
    const slug = weekSlugFromDate(dateOrSlug);
    const match = slug.match(/^(\d{4})-w(\d{2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 1000 && year <= 9999) {
        return slug;
      }
    }
    return getCurrentWeekSlug();
  }
  if (typeof dateOrSlug !== 'string') {
    return getCurrentWeekSlug();
  }
  const str = dateOrSlug.trim().toLowerCase();
  if (!str || str === 'latest') {
    return getCurrentWeekSlug();
  }
  const weekMatch = str.match(/^(\d{4})-w(\d{1,2})$/);
  if (weekMatch) {
    const year = parseInt(weekMatch[1], 10);
    const week = parseInt(weekMatch[2], 10);
    if (year >= 1000 && year <= 9999 && week >= 1 && week <= 53) {
      return `${weekMatch[1]}-w${String(week).padStart(2, '0')}`;
    }
    return getCurrentWeekSlug();
  }
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const slug = weekSlugFromDate(parsed);
    const match = slug.match(/^(\d{4})-w(\d{2})$/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 1000 && year <= 9999) {
        return slug;
      }
    }
  }
  return getCurrentWeekSlug();
}

/**
 * Calculates Year-over-Year week slug matching ISO year and week numbers directly.
 * Eliminates 1-week calendar phase shift caused by ISO 53-week years (e.g. 2026/2027).
 */
export function getYoYWeekSlug(currentSlug: string): string | null {
  const match = currentSlug.trim().toLowerCase().match(/^(\d{4})-w(\d{2})$/);
  if (!match) return null;
  const currentYear = parseInt(match[1], 10);
  const currentWeek = parseInt(match[2], 10);
  const targetYear = currentYear - 1;
  const maxWeeksInTargetYear = getISOWeeksInYear(targetYear);
  const targetWeek = Math.min(currentWeek, maxWeeksInTargetYear);
  return `${targetYear}-w${String(targetWeek).padStart(2, '0')}`;
}

/**
 * Calculates a historical week slug N weeks prior to the given slug.
 */
export function getPriorWeekSlug(slug: string, weeksAgo = 1): string | null {
  const monday = parseReportSlug(slug);
  if (!monday) return null;
  const priorMonday = new Date(monday.getTime() - weeksAgo * 7 * 86400000);
  return weekSlugFromDate(priorMonday);
}
