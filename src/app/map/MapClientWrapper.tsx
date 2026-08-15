'use client';

import dynamic from 'next/dynamic';

// ssr: false must live in a Client Component in the App Router
const MapPageClient = dynamic(() => import('./MapPageClient'), { ssr: false });

interface Props {
  countryMap: Record<string, {
    slug: string;
    name: string;
    internetUsers: string;
    internetUsersMillions?: number;
    internetPenetration: string;
    topSiteName: string;
    topSiteId: string;
    topSiteColor: string;
  }>;
}

export default function MapClientWrapper({ countryMap }: Props) {
  return <MapPageClient countryMap={countryMap} />;
}
