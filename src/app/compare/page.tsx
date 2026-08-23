import { Metadata } from 'next';
import { getSites } from '../../lib/getSites';
import { COMPARE_PAIRS } from './data/pairs';
import CompareHubWrapper from './CompareHubWrapper';
import Link from 'next/link';

const BASE_URL = 'https://www.pulstraffic.com';

export const metadata: Metadata = {
  title: 'Compare Website Traffic, Ranks & Visitor Metrics (2026) | Pulse',
  description:
    'Compare web traffic, global rankings, and statistical visitor metrics between any two top websites. Powered by the Pulse Traffic Index (PTI).',
  alternates: { canonical: `${BASE_URL}/compare` },
  openGraph: {
    title: 'Compare Website Traffic, Ranks & Visitor Metrics (2026) | Pulse',
    description:
      'Compare web traffic, global rankings, and statistical visitor metrics between any two top websites. Powered by the Pulse Traffic Index (PTI).',
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
      'Compare web traffic, global rankings, and statistical visitor metrics between any two top websites.',
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default async function ComparePage() {
  // Use live Supabase data so compare hub dropdowns show accurate rank/baseline
  const sites = await getSites();

  // Static pair directory - rendered server-side for SEO
  const pairDirectory = (
    <section className="sr-only" aria-label="All comparison pairs">
      <h2>All Website Traffic Comparisons</h2>
      <ul>
        {COMPARE_PAIRS.map((pair) => (
          <li key={pair.slug}>
            <Link href={`/compare/${pair.slug}`}>{pair.slug.replace(/-/g, ' ').replace(' vs ', ' vs ')}</Link>
            <p>{pair.context}</p>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <>
      {pairDirectory}
      <CompareHubWrapper sites={sites} pairs={COMPARE_PAIRS} />
    </>
  );
}
