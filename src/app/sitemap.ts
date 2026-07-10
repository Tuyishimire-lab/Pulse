import { MetadataRoute } from 'next';
import { SITES } from './data/sites';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pulstraffic.com';

  const siteUrls = SITES.map((site) => ({
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
