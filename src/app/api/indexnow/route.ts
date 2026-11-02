import { NextResponse } from 'next/server';
import { cronAuthError } from '@/lib/auth';
import { submitToIndexNow } from '@/lib/indexnow';
import { SITES, CATEGORIES } from '@/app/data/sites';
import { COUNTRY_SLUGS } from '@/app/top-sites/data/countries';
import { getAllCompareSlugs } from '@/app/compare/data/pairs';
import { getReportSlugs } from '@/app/report/data/reportGenerator';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const BASE_URL = 'https://www.pulstraffic.com';

async function getAllSiteUrls(): Promise<string[]> {
  const urls: string[] = [
    BASE_URL,
    `${BASE_URL}/trending`,
    `${BASE_URL}/map`,
    `${BASE_URL}/compare`,
    `${BASE_URL}/top-sites`,
    `${BASE_URL}/category`,
    `${BASE_URL}/report`,
    `${BASE_URL}/methodology`,
    `${BASE_URL}/about`,
  ];

  // Categories (exclude 'all' since it's an aggregate filter, not a valid slug route)
  CATEGORIES.filter((cat) => cat.id !== 'all').forEach((cat) => {
    urls.push(`${BASE_URL}/category/${cat.id}`);
  });

  // Country hubs
  COUNTRY_SLUGS.forEach((slug) => {
    urls.push(`${BASE_URL}/top-sites/${slug}`);
  });

  // Comparisons
  const compareSlugs = getAllCompareSlugs();
  compareSlugs.forEach((slug) => {
    urls.push(`${BASE_URL}/compare/${slug}`);
  });

  // Weekly reports
  try {
    const reportSlugs = await getReportSlugs();
    reportSlugs.forEach((slug) => {
      urls.push(`${BASE_URL}/report/${slug}`);
    });
  } catch (e) {
    console.warn('IndexNow API: Using static reports fallback:', e);
  }

  // Sites from database or static
  let activeSites: { id: string }[] = SITES;
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('sites')
        .select('id')
        .order('rank', { ascending: true })
        .limit(300);
      if (data && data.length > 0) {
        activeSites = data;
      }
    } catch (e) {
      console.warn('IndexNow API: Using static sites fallback:', e);
    }
  }

  activeSites.forEach((site) => {
    urls.push(`${BASE_URL}/sites/${site.id}`);
  });

  return Array.from(new Set(urls));
}

export async function POST(request: Request) {
  const authError = cronAuthError(request);
  if (authError) return authError;

  try {
    const body = await request.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body?.urls) && body.urls.length > 0
      ? body.urls
      : await getAllSiteUrls();

    const result = await submitToIndexNow(urls);

    return NextResponse.json({
      success: result.success,
      status: result.status,
      message: result.message,
      submittedCount: result.submittedCount,
      keyLocation: `${BASE_URL}/14eac490de1941d88e198247a1246901.txt`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit to IndexNow';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const authError = cronAuthError(request);
  if (authError) return authError;

  try {
    // Quick submission of core hub and trending URLs on GET
    const coreUrls = [
      BASE_URL,
      `${BASE_URL}/trending`,
      `${BASE_URL}/top-sites`,
      `${BASE_URL}/map`,
      `${BASE_URL}/compare`,
      `${BASE_URL}/category`,
      `${BASE_URL}/report`,
    ];

    const result = await submitToIndexNow(coreUrls);

    return NextResponse.json({
      success: result.success,
      status: result.status,
      message: result.message,
      submittedCount: result.submittedCount,
      keyLocation: `${BASE_URL}/14eac490de1941d88e198247a1246901.txt`,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit to IndexNow';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
