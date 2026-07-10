import { Metadata } from 'next';
import { SITES } from '../../data/sites';
import SitePageClient from './SitePageClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const site = SITES.find((s) => s.id === id);
  
  if (!site) {
    return {
      title: 'Pulse - Domain Not Found',
      description: 'The requested domain traffic statistics page was not found.'
    };
  }

  return {
    title: `${site.name} Real-Time Traffic & Analytics Tracker - Pulse`,
    description: `See live visitor counters, average bounce rates, session durations, device splits, and geographic traffic origins for ${site.url.replace('https://', '')} in real-time.`
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <SitePageClient id={id} />;
}
