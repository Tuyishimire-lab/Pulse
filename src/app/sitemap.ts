import { MetadataRoute } from 'next';
import { SITES, CATEGORIES } from './data/sites';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { COUNTRY_SLUGS } from './top-sites/data/countries';
import { getAllCompareSlugs } from './compare/data/pairs';
import { getReportSlugs, parsReportSlug } from './report/data/reportGenerator';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pulstraffic.com';
  const now = new Date();

  let activeSites = SITES;

  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('sites')
        .select('id')
        .order('rank', { ascending: true });
      if (data && data.length > 0) {
        activeSites = data as any[];
      }
    } catch (e) {
      console.error('Sitemap: Failed to load sites from database, falling back to static schema:', e);
    }
  }

  const siteUrls = activeSites.map((site) => ({
    url: `${baseUrl}/sites/${site.id}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.80,
  }));

  const countryUrls = COUNTRY_SLUGS.map((slug) => ({
    url: `${baseUrl}/top-sites/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Hub page that links to every country - high priority since it provides
  // internal link equity to all the individual country pages.
  const topSitesHub = {
    url: `${baseUrl}/top-sites`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.92,
  };

  // Pre-rendered and hand-crafted comparisons
  const compareSlugs = getAllCompareSlugs();
  const compareUrls = compareSlugs.map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.80,
  }));

  const reportSlugs = await getReportSlugs();
  const reportUrls = reportSlugs.map((slug) => {
    const reportDate = parsReportSlug(slug) || now;
    return {
      url: `${baseUrl}/report/${slug}`,
      lastModified: reportDate,
      changeFrequency: 'weekly' as const,
      priority: 0.90,
    };
  });

  const categoryUrls = CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
    url: `${baseUrl}/category/${c.id}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.88,
  }));

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/category`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.90,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.90,
    },
    {
      url: `${baseUrl}/speed-test`,
      lastModified: new Date('2026-08-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.90,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified: new Date('2026-08-11'),
      changeFrequency: 'monthly' as const,
      priority: 0.60,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date('2026-08-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.50,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date('2026-08-01'),
      changeFrequency: 'monthly' as const,
      priority: 0.50,
    },
    ...categoryUrls,
    ...reportUrls,
    topSitesHub,
    ...countryUrls,
    ...compareUrls,
    ...siteUrls,
  ];
}
