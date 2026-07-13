import { MetadataRoute } from 'next';
import { SITES } from './data/sites';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const revalidate = 86400; // Revalidate sitemap at most once a day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pulstraffic.com';

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

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    ...siteUrls,
  ];
}
