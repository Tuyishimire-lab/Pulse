import { Metadata } from 'next';
import SpeedTestClient from './SpeedTestClient';

const BASE_URL = 'https://www.pulstraffic.com';

export const metadata: Metadata = {
  title: 'Internet Speed Test - Check Your Connection Speed | Pulse',
  description:
    'Test your internet download speed, upload speed, ping, jitter, and connection quality. Advanced speed test with bufferbloat detection and a Pulse Quality Score.',
  alternates: { canonical: `${BASE_URL}/speed-test` },
  openGraph: {
    title: 'Internet Speed Test - Check Your Connection Speed | Pulse',
    description:
      'Test your internet download speed, upload speed, ping, jitter, and connection quality with precision.',
    url: `${BASE_URL}/speed-test`,
    siteName: 'Pulse',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Internet Speed Test - Check Your Connection Speed | Pulse',
    description:
      'Test your internet download speed, upload speed, ping, jitter, and connection quality with precision.',
    images: [`${BASE_URL}/opengraph-image`],
  },
};

export default function SpeedTestPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Pulse Internet Speed Test',
        url: `${BASE_URL}/speed-test`,
        description: 'Test your internet download speed, upload speed, latency ping, jitter, and connection quality with real-time bufferbloat diagnostics.',
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
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
            name: 'Speed Test',
            item: `${BASE_URL}/speed-test`,
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
      <SpeedTestClient />
    </>
  );
}
