'use client';

import dynamic from 'next/dynamic';
import { SiteConfig } from '../data/sites';
import { ComparePair } from './data/pairs';

// ssr: false must live in a Client Component in the App Router
const CompareHubClient = dynamic(() => import('./CompareHubClient'), { ssr: false });

interface Props {
  sites: SiteConfig[];
  pairs: ComparePair[];
}

export default function CompareHubWrapper({ sites, pairs }: Props) {
  return <CompareHubClient sites={sites} pairs={pairs} />;
}
