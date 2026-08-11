import { Metadata } from 'next';
import { getSites } from '../../lib/getSites';
import { COMPARE_PAIRS } from './data/pairs';
import CompareHubWrapper from './CompareHubWrapper';

const BASE_URL = 'https://www.pulstraffic.com';

export const metadata: Metadata = {
  title: 'Compare Website Traffic, Ranks & Visitor Metrics (2026) | Pulse',
  description:
    'Compare web traffic, global rankings, and real-time visitor metrics between any two top websites. Custom platform comparison engine with live traffic telemetry.',
  alternates: { canonical: `${BASE_URL}/compare` },
  openGraph: {
    title: 'Compare Website Traffic, Ranks & Visitor Metrics (2026) | Pulse',
    description:
      'Compare web traffic, global rankings, and real-time visitor metrics between any two top websites.',
    url: `${BASE_URL}/compare`,
    siteName: 'Pulse',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Website Traffic, Ranks & Visitor Metrics (2026) | Pulse',
    description:
      'Compare web traffic, global rankings, and real-time visitor metrics between any two top websites.',
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default async function ComparePage() {
  // Use live Supabase data so compare hub dropdowns show accurate rank/baseline
  const sites = await getSites();
  return <CompareHubWrapper sites={sites} pairs={COMPARE_PAIRS} />;
}
