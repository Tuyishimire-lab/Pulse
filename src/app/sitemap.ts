import { MetadataRoute } from 'next';
import { SITES } from './data/sites';

export default function sitemap(): MetadataRoute.Sitemap {
  // Production URL for the hosted web traffic platform
  const baseUrl = 'https://tuyishimire-lab.github.io';

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
