import { NextResponse } from 'next/server';
import {
  generateWeeklyReport,
  normalizeReportSlug,
  parseReportSlug,
  getCurrentWeekSlug,
  getYoYWeekSlug,
  getISOWeeksInYear,
  type WeeklyReport,
} from '../../report/data/reportGenerator';

export const dynamic = 'force-dynamic';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Validates the raw ?week query parameter.
 * Returns parsed information or structured error with status 400 / 404.
 */
function validateWeekQuery(rawWeek: string | null): {
  valid: boolean;
  slug?: string;
  isLatest?: boolean;
  status?: number;
  error?: string;
} {
  // Case 1: Missing, empty, or 'latest'
  if (!rawWeek || rawWeek.trim().toLowerCase() === 'latest') {
    return {
      valid: true,
      slug: getCurrentWeekSlug(),
      isLatest: true,
    };
  }

  const trimmed = rawWeek.trim();

  // Case 2: Malformed format / SQL injection check (must match YYYY-wNN or YYYY-wN)
  const formatMatch = trimmed.match(/^(\d{4})-w(\d{1,2})$/i);
  if (!formatMatch) {
    return {
      valid: false,
      status: 400,
      error: 'Invalid week parameter format. Expected "latest" or "YYYY-wNN".',
    };
  }

  const year = parseInt(formatMatch[1], 10);
  const weekNum = parseInt(formatMatch[2], 10);

  // Case 3: Semantic ISO week boundaries (e.g. 2026-w99, 2026-w00, 1999-w99)
  const maxWeeks = getISOWeeksInYear(year);
  if (weekNum < 1 || weekNum > 53 || weekNum > maxWeeks || year < 2000 || year > 2100) {
    return {
      valid: false,
      status: 404,
      error: `Report not found for week ${trimmed}`,
    };
  }

  const mondayDate = parseReportSlug(trimmed);
  if (!mondayDate) {
    return {
      valid: false,
      status: 404,
      error: `Report not found for week ${trimmed}`,
    };
  }

  return {
    valid: true,
    slug: normalizeReportSlug(trimmed),
    isLatest: false,
  };
}

/**
 * OPTIONS /api/report
 * CORS pre-flight handler.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * GET /api/report
 * Public REST endpoint returning weekly report JSON payload.
 *
 * Query Parameters:
 *   ?week=latest (default) | ?week=YYYY-wNN
 */
export async function GET(request: Request) {
  let searchParams: URLSearchParams;
  try {
    searchParams = new URL(request.url).searchParams;
  } catch {
    searchParams = new URLSearchParams();
  }

  const rawWeek = searchParams.get('week');
  const validation = validateWeekQuery(rawWeek);

  if (!validation.valid || !validation.slug) {
    return NextResponse.json(
      { error: validation.error || 'Invalid week parameter' },
      {
        status: validation.status || 400,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const slug = validation.slug;

  let report: WeeklyReport;
  try {
    report = await generateWeeklyReport(slug);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown generation error';
    return NextResponse.json(
      { error: `Report not found for week ${slug}: ${message}` },
      {
        status: 404,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  if (!report || !report.sites || report.sites.length === 0) {
    return NextResponse.json(
      { error: `Report not found for week ${slug}` },
      {
        status: 404,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Two-tiered edge caching lifecycle (Proposal P4 / B28.5)
  // Active/current (<7d) -> s-maxage=3600, stale-while-revalidate=86400
  // Archived (>=7d) -> max-age=31536000, immutable
  const monday = parseReportSlug(slug);
  const isArchived =
    !validation.isLatest && monday
      ? Date.now() - monday.getTime() >= 7 * 24 * 60 * 60 * 1000
      : false;

  const cacheControlHeader = isArchived
    ? 'public, max-age=31536000, immutable'
    : 'public, s-maxage=3600, stale-while-revalidate=86400';

  const yoyWeekSlug =
    report.multiPeriodBaselines?.yoySlug ?? getYoYWeekSlug(report.slug) ?? null;

  const responsePayload = {
    week: report.slug,
    yoyWeekSlug,
    cachedAt: new Date().toISOString(),
    report: {
      ...report,
      sites_data: report.sites,
    },
    ...report,
    sites_data: report.sites,
  };

  return NextResponse.json(responsePayload, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      'Cache-Control': cacheControlHeader,
    },
  });
}
