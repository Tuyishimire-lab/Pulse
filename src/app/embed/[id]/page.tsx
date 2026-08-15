import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITES } from '../../data/sites';
import { getSites } from '../../../lib/getSites';
import EmbedWidgetClient from './EmbedWidgetClient';

interface EmbedProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ theme?: string; compact?: string }>;
}

export async function generateMetadata({ params }: EmbedProps): Promise<Metadata> {
  const { id } = await params;
  const sites = await getSites();
  const site = sites.find((s) => s.id === id);

  if (!site) return { title: 'Traffic Widget | Pulse' };

  return {
    title: `${site.name} Live Traffic Widget | Pulse`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function EmbedPage({ params, searchParams }: EmbedProps) {
  const { id } = await params;
  const { theme, compact } = await searchParams;
  const sites = await getSites();
  const site = sites.find((s) => s.id === id);

  if (!site) notFound();

  return (
    <EmbedWidgetClient
      site={site}
      theme={theme === 'light' ? 'light' : 'dark'}
      compact={compact === 'true'}
    />
  );
}
