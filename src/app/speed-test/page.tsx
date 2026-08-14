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
  return <SpeedTestClient />;
}
