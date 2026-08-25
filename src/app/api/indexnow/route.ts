import { NextResponse } from 'next/server';
import { submitToIndexNow } from '@/lib/indexnow';
import { SITES, CATEGORIES } from '@/app/data/sites';
import { COUNTRY_SLUGS } from '@/app/top-sites/data/countries';
import { getAllCompareSlugs } from '@/app/compare/data/pairs';
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
    `${BASE_URL}/methodology`,
    `${BASE_URL}/about`,
  ];

  // Categories
  CATEGORIES.forEach((cat) => {
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

  // Sites from database or static
  let activeSites = SITES;
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('sites')
        .select('id')
        .order('rank', { ascending: true })
        .limit(300);
      if (data && data.length > 0) {
        activeSites = data as any[];
      }
    } catch (e) {
      console.warn('IndexNow API: Using static sites fallback:', e);
    }
  }

  activeSites.forEach((site) => {
    urls.push(`${BASE_URL}/sites/${site.id}`);
  });

  return urls;
}

export async function POST(request: Request) {
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit to IndexNow' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Quick submission of core hub and trending URLs on GET
    const coreUrls = [
      BASE_URL,
      `${BASE_URL}/trending`,
      `${BASE_URL}/top-sites`,
      `${BASE_URL}/map`,
      `${BASE_URL}/compare`,
      `${BASE_URL}/category`,
    ];

    const result = await submitToIndexNow(coreUrls);

    return NextResponse.json({
      success: result.success,
      status: result.status,
      message: result.message,
      submittedCount: result.submittedCount,
      keyLocation: `${BASE_URL}/14eac490de1941d88e198247a1246901.txt`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit to IndexNow' },
      { status: 500 }
    );
  }
}
