import { Metadata } from 'next';
import { CURRENT_YEAR } from '../../lib/currentYear';
import { getTrendingData, Timeframe } from '../../lib/getTrendingData';
import TrendingPageClient from './TrendingPageClient';

const BASE_URL = 'https://www.pulstraffic.com';

const DESCRIPTION =
  'The biggest climbers and decliners in the Pulse Traffic Index over 24 hours, 7 days and 30 days, measured from recorded rank snapshots.';

export const metadata: Metadata = {
  title: `Trending Websites - Biggest Rank Movers (${CURRENT_YEAR}) | Pulse`,
  description: DESCRIPTION,
  alternates: { canonical: `${BASE_URL}/trending` },
  openGraph: {
    title: `Trending Websites - Biggest Rank Movers (${CURRENT_YEAR}) | Pulse`,
    description: DESCRIPTION,
    url: `${BASE_URL}/trending`,
    siteName: 'Pulse',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${BASE_URL}/trending/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trending Websites - Biggest Rank Movers | Pulse',
    description: DESCRIPTION,
    images: [`${BASE_URL}/trending/opengraph-image`],
  },
};

export const revalidate = 3600; // ISR: re-render at most once per hour

export default async function TrendingPage() {
  const datasets = await getTrendingData();

  // Structured data: top climbers from the first timeframe that has real data
  const order: Timeframe[] = ['7d', '24h', '30d'];
  const primary = order.map((t) => datasets[t]).find((d) => d.available && d.risers.length > 0);

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      name: `Trending Websites - Biggest Rank Movers (${CURRENT_YEAR})`,
      description: DESCRIPTION,
      url: `${BASE_URL}/trending`,
      ...(primary?.snapshotAt && { dateModified: primary.snapshotAt }),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Trending', item: `${BASE_URL}/trending` },
      ],
    },
  ];

  if (primary) {
    graph.push({
      '@type': 'ItemList',
      name: `Biggest Rank Climbers (${primary.timeframe})`,
      numberOfItems: Math.min(10, primary.risers.length),
      itemListElement: primary.risers.slice(0, 10).map((s, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: s.name,
        url: `${BASE_URL}/sites/${s.id}`,
      })),
    });
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }) }}
      />
      <TrendingPageClient datasets={datasets} />
    </>
  );
}
