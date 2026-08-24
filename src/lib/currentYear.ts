/**
 * Current calendar year, evaluated once at module-load time.
 *
 * Import this constant everywhere a year appears in page titles, descriptions,
 * or JSON-LD instead of hardcoding a specific year. Evaluated during the
 * Next.js build (ISR/SSG) or at request time (SSR), so it always reflects
 * the real year without manual updates come January.
 *
 * @example
 *   import { CURRENT_YEAR } from '@/lib/currentYear';
 *   title: `Global Web Traffic Map ${CURRENT_YEAR} | Pulse`
 */
export const CURRENT_YEAR: number = new Date().getFullYear();
