import { Metadata } from 'next';
import { SITES } from '../data/sites';
import { getRadarStats } from '../../lib/getRadarStats';
import {
  SITE_TO_STATUSPAGE_ID,
  resolveSiteHealth,
  type MonitoredPlatformStatus,
} from '../../lib/statusResolver';
import { fetchOutagesData } from '../api/outages/route';
import StatusPageClient from './StatusPageClient';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Live Internet Outage & Platform Status Tracker - Pulse',
  description:
    'Real-time internet outage monitor, BGP/ASN disruption feed, and live operational health checks for ChatGPT, GitHub, Cloudflare, Discord, Reddit, Vercel, and top global platforms.',
  alternates: {
    canonical: 'https://www.pulstraffic.com/status',
  },
  openGraph: {
    title: 'Live Internet Outage & Platform Status Tracker - Pulse',
    description:
      'Monitor real-time internet disruptions, Cloudflare Radar ASN outage annotations, and live Statuspage health across major web platforms.',
    url: 'https://www.pulstraffic.com/status',
    siteName: 'Pulse',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Internet Outage & Platform Status Tracker - Pulse',
    description:
      'Real-time internet outage monitor, BGP/ASN disruption feed, and live operational status for major platforms.',
  },
};

export default async function StatusPage() {
  const monitoredIds = Object.keys(SITE_TO_STATUSPAGE_ID);

  const [radarStats, outagePayload, platformStatuses] = await Promise.all([
    getRadarStats('global'),
    fetchOutagesData(),
    Promise.all(
      monitoredIds.map(async (id): Promise<MonitoredPlatformStatus | null> => {
        const site = SITES.find((s) => s.id === id);
        if (!site) return null;
        const status = await resolveSiteHealth(site.id);
        return {
          id: site.id,
          name: site.name,
          domain: site.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
          category: site.category,
          color: site.color,
          logo: site.logo,
          rank: site.rank,
          status,
        };
      })
    ),
  ]);

  const validPlatforms = platformStatuses
    .filter((p): p is MonitoredPlatformStatus => p !== null)
    .sort((a, b) => a.rank - b.rank);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Live Internet Outage & Platform Status Tracker - Pulse',
        description:
          'Real-time internet outage monitor, BGP/ASN disruption feed, and live operational health checks across major global platforms.',
        url: 'https://www.pulstraffic.com/status',
        publisher: {
          '@type': 'Organization',
          name: 'Pulse',
          url: 'https://www.pulstraffic.com',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.pulstraffic.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Live Status & Outages',
            item: 'https://www.pulstraffic.com/status',
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
      <StatusPageClient
        initialPlatforms={validPlatforms}
        initialOutages={outagePayload.outages}
        outageSource={outagePayload.source}
        radarStats={radarStats}
      />
    </>
  );
}
