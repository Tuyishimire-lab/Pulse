import { Metadata } from 'next';
import { ALL_COUNTRIES } from '../top-sites/data/countries';
import { SITES } from '../data/sites';
import MapPageClient from './MapPageClient';

const BASE_URL = 'https://www.pulstraffic.com';

export const metadata: Metadata = {
  title: 'Global Web Traffic Map 2026 | Pulse',
  description:
    'Interactive world map showing internet penetration and top websites by country. Click any country to see its top 20 most visited websites with live traffic data.',
  alternates: { canonical: `${BASE_URL}/map` },
  openGraph: {
    title: 'Global Web Traffic Map 2026 | Pulse',
    description:
      'Interactive world map showing internet penetration and top websites by country.',
    url: `${BASE_URL}/map`,
    siteName: 'Pulse',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Global Web Traffic Map 2026 | Pulse',
    description: 'Interactive world map showing internet penetration and top websites by country.',
  },
};

export const revalidate = 86400;

export default function MapPage() {
  // Build country lookup map — keyed by cfCode (ISO alpha-2)
  const countryMap = new Map(
    ALL_COUNTRIES.map((c) => {
      const topSiteId = c.pinnedSiteIds?.[0] ?? 'google';
      const topSite = SITES.find((s) => s.id === topSiteId);
      return [
        c.cfCode,
        {
          slug: c.slug,
          name: c.name,
          internetUsers: c.internetUsers,
          internetPenetration: c.internetPenetration,
          topSiteName: topSite?.name ?? 'Google',
          topSiteId: topSiteId,
          topSiteColor: topSite?.color ?? '#4A9EFF',
        },
      ];
    }),
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Global Web Traffic Map 2026',
    description:
      'Interactive world map showing internet penetration rates and top websites in 115 countries.',
    url: `${BASE_URL}/map`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MapPageClient countryMap={Object.fromEntries(countryMap)} />
    </>
  );
}
