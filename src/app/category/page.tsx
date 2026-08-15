import { Metadata } from 'next';
import { getSites } from '../../lib/getSites';
import { CATEGORIES } from '../data/sites';
import CategoryIndexClient, { CategorySummary } from './CategoryIndexClient';

const BASE_URL = 'https://www.pulstraffic.com';

const CATEGORY_DETAILS: Record<string, { description: string; icon: string; color: string }> = {
  search: {
    description: 'Global search engines and multi-modal information discovery platforms processing billions of daily queries.',
    icon: '🔍',
    color: '#4285F4',
  },
  social: {
    description: 'Social networks, short-form video feeds, and community discussion spaces connecting billions worldwide.',
    icon: '💬',
    color: '#E1306C',
  },
  ai: {
    description: 'Generative AI assistants, reasoning models, and neural productivity agents reshaping internet interaction.',
    icon: '⚡',
    color: '#10a37f',
  },
  reference: {
    description: 'Collaborative encyclopedias, open educational libraries, and verifiable global knowledge repositories.',
    icon: '📚',
    color: '#72777D',
  },
  ecommerce: {
    description: 'Online retail marketplaces, direct-to-consumer platforms, and international logistics ecosystems.',
    icon: '🛍️',
    color: '#ff9900',
  },
  entertainment: {
    description: 'On-demand video streaming, live broadcasts, digital audio hubs, and interactive gaming networks.',
    icon: '🎬',
    color: '#e50914',
  },
  news: {
    description: 'Breaking news outlets, global journalism publications, and financial market media channels.',
    icon: '📰',
    color: '#ae251f',
  },
  finance: {
    description: 'Digital banking services, global cryptocurrency exchanges, payment gateways, and trading terminals.',
    icon: '📈',
    color: '#f3ba2f',
  },
  dev: {
    description: 'Code repositories, package managers, developer question-and-answer forums, and cloud infrastructure.',
    icon: '💻',
    color: '#24292f',
  },
};

export const metadata: Metadata = {
  title: 'Website Categories — Global Web Traffic Rankings (2026) | Pulse',
  description:
    'Explore website traffic rankings, visitor velocity, and market share across 9 major industries including Search, AI, Social Media, E-Commerce, Dev Tools, and Streaming.',
  alternates: {
    canonical: `${BASE_URL}/category`,
  },
  openGraph: {
    title: 'Website Categories — Global Web Traffic Rankings (2026) | Pulse',
    description:
      'Explore website traffic rankings, visitor velocity, and market share across 9 major industries. Powered by the Pulse Traffic Index.',
    url: `${BASE_URL}/category`,
    siteName: 'Pulse',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Categories — Global Web Traffic Rankings (2026) | Pulse',
    description:
      'Explore website traffic rankings, visitor velocity, and market share across 9 major industries.',
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export const revalidate = 3600;

export default async function CategoryIndexPage() {
  const allSites = await getSites();

  let totalTrackedTraffic = 0;
  const categoryGroups: Record<string, typeof allSites> = {};

  for (const site of allSites) {
    totalTrackedTraffic += site.rate;
    if (!categoryGroups[site.category]) {
      categoryGroups[site.category] = [];
    }
    categoryGroups[site.category].push(site);
  }

  const categorySummaries: CategorySummary[] = CATEGORIES.filter((c) => c.id !== 'all').map((c) => {
    const sites = (categoryGroups[c.id] || []).sort((a, b) => a.rank - b.rank);
    const totalRate = sites.reduce((sum, s) => sum + s.rate, 0);
    const meta = CATEGORY_DETAILS[c.id] || {
      description: `Leading websites in the ${c.label} sector ranked by real-time traffic volume.`,
      icon: '🌐',
      color: '#82c8e5',
    };

    return {
      id: c.id,
      label: c.label,
      color: meta.color,
      description: meta.description,
      icon: meta.icon,
      siteCount: sites.length,
      totalRate,
      topSites: sites.slice(0, 3),
    };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Website Traffic Rankings by Category (2026)',
        description: 'Explore global web traffic share, audience momentum, and real-time visitor flow segmented across 9 major industry sectors.',
        url: `${BASE_URL}/category`,
        numberOfItems: categorySummaries.length,
        itemListElement: categorySummaries.map((cat, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: `${cat.label} Websites`,
          url: `${BASE_URL}/category/${cat.id}`,
          description: cat.description,
        })),
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
            name: 'Categories',
            item: `${BASE_URL}/category`,
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
      <CategoryIndexClient
        categories={categorySummaries}
        totalTrackedTraffic={totalTrackedTraffic}
      />
    </>
  );
}
