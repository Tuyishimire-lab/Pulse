import { Metadata } from 'next';
import { ALL_COUNTRIES } from '../top-sites/data/countries';
import { getSites } from '../../lib/getSites';
import MapClientWrapper from './MapClientWrapper';

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

export default async function MapPage() {
  // Use live data so country tooltip shows the correct top site name/color
  const liveSites = await getSites();
  const siteById = Object.fromEntries(liveSites.map((s) => [s.id, s]));

  // Build country lookup map - keyed by cfCode (ISO alpha-2)
  const countryMap = new Map(
    ALL_COUNTRIES.map((c) => {
      const topSiteId = c.pinnedSiteIds?.[0] ?? 'google';
      const topSite = siteById[topSiteId];

      let usersRaw = 0;
      const lowerUsers = (c.internetUsers || '').toLowerCase();
      if (lowerUsers.includes('billion')) {
        usersRaw = (parseFloat(lowerUsers) || 1) * 1000;
      } else if (lowerUsers.includes('million')) {
        usersRaw = parseFloat(lowerUsers) || 1;
      } else if (lowerUsers.includes('k')) {
        usersRaw = (parseFloat(lowerUsers) || 1) / 1000;
      } else {
        usersRaw = parseFloat(lowerUsers) || 10;
      }

      return [
        c.cfCode,
        {
          slug: c.slug,
          name: c.name,
          internetUsers: c.internetUsers,
          internetUsersMillions: usersRaw,
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
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Pulse Global Web Traffic Map',
        url: `${BASE_URL}/map`,
        description:
          'Interactive world map showing internet penetration rates and top websites in 115+ countries.',
        applicationCategory: 'DataVisualization',
        operatingSystem: 'All',
        creator: {
          '@type': 'Organization',
          name: 'Pulse',
          url: BASE_URL,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: BASE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Global Map',
            item: `${BASE_URL}/map`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MapClientWrapper countryMap={Object.fromEntries(countryMap)} />
    </>
  );
}
