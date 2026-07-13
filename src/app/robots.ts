import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/todos'],
    },
    sitemap: 'https://pulstraffic.com/sitemap.xml',
  };
}
