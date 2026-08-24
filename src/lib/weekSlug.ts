/**
 * Shared utility: returns the current ISO 8601 week slug.
 * Format: "YYYY-wNN"  e.g. "2026-w31"
 *
 * Single implementation shared by NavHeader, Footer, and any other component
 * that needs to link to the current weekly report.
 */
export function getCurrentWeekSlug(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return d.getUTCFullYear() + '-w' + String(week).padStart(2, '0');
}
