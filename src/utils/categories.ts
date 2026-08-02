/**
 * Maps site category keys to their display colors.
 * Used in AnalyticsPanel category distribution bar and legend.
 */
export const CATEGORY_COLORS: Record<string, string> = {
  search: '#3b82f6',
  social: '#ec4899',
  ai: '#a78bfa',
  reference: '#94a3b8',
  ecommerce: '#a855f7',
  shopping: '#a855f7',
  entertainment: '#f97316',
  news: '#f59e0b',
  media: '#f59e0b',
  finance: '#10b981',
  dev: '#6366f1',
};

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] ?? '#3b82f6';
}
