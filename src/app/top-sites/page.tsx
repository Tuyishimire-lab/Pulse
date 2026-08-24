import { Metadata } from 'next';
import { ALL_COUNTRIES } from './data/countries';
import TopSitesHubClient from './TopSitesHubClient';
import { CURRENT_YEAR } from '../../lib/currentYear';

const BASE_URL = 'https://www.pulstraffic.com';

export const metadata: Metadata = {
  title: `Top Websites by Country (${CURRENT_YEAR}) — Browse ${ALL_COUNTRIES.length} Countries | Pulse`,
  description:
    `Discover the most visited websites in ${ALL_COUNTRIES.length} countries worldwide. ` +
    `Compare internet penetration, local platform preferences, and real-time traffic estimates ` +
    `powered by the Pulse Traffic Index.`,
  alternates: {
    canonical: `${BASE_URL}/top-sites`,
  },
  openGraph: {
    title: `Top Websites by Country (${CURRENT_YEAR}) | Pulse`,
    description:
      `Browse the most visited websites in ${ALL_COUNTRIES.length} countries. ` +
      `Real-time traffic rankings powered by the Pulse Traffic Index.`,
    url: `${BASE_URL}/top-sites`,
    siteName: 'Pulse',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Top Websites by Country (${CURRENT_YEAR}) | Pulse`,
    description:
      `Browse the most visited websites in ${ALL_COUNTRIES.length} countries worldwide.`,
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export const revalidate = 86400;

export default function TopSitesHubPage() {
  // Pass the full country list to the client so every country gets a card →
  // direct internal link, eliminating the orphan page problem.
  return <TopSitesHubClient countries={ALL_COUNTRIES} />;
}
