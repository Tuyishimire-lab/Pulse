import { Metadata } from 'next';
import { SITES } from '../../data/sites';
import { getSiteById } from '../../../lib/getSites';
import SitePageClient from './SitePageClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return SITES.map((site) => ({
    id: site.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  // Use live Supabase data so baseline/rank in metadata are always accurate
  const site = await getSiteById(id);

  if (!site) {
    return {
      title: 'Pulse - Domain Not Found',
      description: 'The requested domain traffic statistics page was not found.'
    };
  }

  const titleText = `${site.name} Real-Time Traffic & Analytics Tracker - Pulse`;
  const descText = `See live visitor counters, average bounce rates, session durations, device splits, and geographic traffic origins for ${site.url.replace('https://', '')} in real-time. ${site.name} receives approximately ${site.baseline} monthly visits (Global Rank #${site.rank}).`;

  return {
    title: titleText,
    description: descText,
    alternates: {
      canonical: `/sites/${site.id}`,
    },
    openGraph: {
      title: titleText,
      description: descText,
      url: `https://www.pulstraffic.com/sites/${site.id}`,
      siteName: 'Pulse',
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: titleText,
      description: descText,
    }
  };
}

export const dynamicParams = true;
export const revalidate = 3600; // ISR: re-render at most once per hour

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // Fetch live data so JSON-LD schema reflects engine-authoritative rank/baseline
  const site = await getSiteById(id);

  const siteName = site ? site.name : 'Domain';
  const siteUrl = site ? site.url : '';
  const baseline = site ? site.baseline : '';
  const rank = site ? site.rank : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': `${siteName} Real-Time Traffic & Analytics Tracker - Pulse`,
    'description': `See live visitor counters, average bounce rates, session durations, device splits, and geographic traffic origins for ${siteUrl.replace('https://', '')} in real-time.`,
    'url': `https://www.pulstraffic.com/sites/${id}`,
    'mainEntity': {
      '@type': 'Dataset',
      'name': `${siteName} Traffic Analytics`,
      'description': `Estimated baseline traffic statistics for ${siteUrl}.`,
      'identifier': siteUrl,
      'temporalCoverage': 'Ongoing real-time data stream',
      'license': 'https://creativecommons.org/licenses/by/4.0/',
      'creator': {
        '@type': 'Organization',
        'name': 'Pulse',
        'url': 'https://www.pulstraffic.com'
      },
      'variableMeasured': [
        {
          '@type': 'PropertyValue',
          'name': 'Estimated Monthly Visits',
          'value': baseline,
        },
        {
          '@type': 'PropertyValue',
          'name': 'Global Rank',
          'value': rank,
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SitePageClient id={id} />
    </>
  );
}
