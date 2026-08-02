import { MetadataRoute } from 'next';
import { SITES } from './data/sites';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { COUNTRY_SLUGS } from './top-sites/data/countries';
import { PAIR_SLUGS } from './compare/data/pairs';
import { getReportSlugs } from './report/data/reportGenerator';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.pulstraffic.com';

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
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const countryUrls = COUNTRY_SLUGS.map((slug) => ({
    url: `${baseUrl}/top-sites/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  const compareUrls = PAIR_SLUGS.map((slug) => ({
    url: `${baseUrl}/compare/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.80,
  }));

  const reportUrls = getReportSlugs().map((slug) => ({
    url: `${baseUrl}/report/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.90,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.90,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/methodology`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    ...reportUrls,
    ...countryUrls,
    ...compareUrls,
    ...siteUrls,
  ];
}
