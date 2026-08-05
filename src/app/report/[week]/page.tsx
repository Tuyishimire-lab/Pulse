import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  generateWeeklyReport,
  getReportSlugs,
  parsReportSlug,
} from '../data/reportGenerator';
import ReportPageClient from './ReportPageClient';

const BASE_URL = 'https://www.pulstraffic.com';

interface PageProps {
  params: Promise<{ week: string }>;
}

export async function generateStaticParams() {
  const slugs = await getReportSlugs();
  return slugs.map((slug) => ({ week: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { week: slug } = await params;
  const date = parsReportSlug(slug);
  if (!date) return { title: 'Report Not Found | Pulse' };

  const report = await generateWeeklyReport(slug);
  const title = `${report.headline} | Pulse`;
  const description = `${report.subheadline}. Track internet traffic trends, outage summaries, AI platform growth, and the top 100 most visited websites globally.`;
  const url = `${BASE_URL}/report/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Pulse',
      type: 'article',
      locale: 'en_US',
      publishedTime: report.publishedDate,
      images: [{ url: `${BASE_URL}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/opengraph-image`],
    },
  };
}

export const dynamicParams = true;
export const revalidate = 3600; // ISR: re-check hourly to pick up new snapshots

export default async function ReportPage({ params }: PageProps) {
  const { week: slug } = await params;
  const date = parsReportSlug(slug);
  if (!date) notFound();

  const report = await generateWeeklyReport(slug);

  // JSON-LD: Article schema for search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: report.headline,
    description: report.subheadline,
    datePublished: report.publishedDate,
    dateModified: report.publishedDate,
    url: `${BASE_URL}/report/${slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'Pulse',
      url: BASE_URL,
      logo: { '@type': 'ImageObject', url: `${BASE_URL}/icon.png` },
    },
    author: {
      '@type': 'Organization',
      name: 'Pulse',
      url: BASE_URL,
    },
    about: {
      '@type': 'Thing',
      name: 'Internet Traffic Statistics',
    },
  };

  // Collect adjacent week slugs for navigation
  const allSlugs = await getReportSlugs();
  const currentIdx = allSlugs.indexOf(slug);
  const prevSlug = currentIdx < allSlugs.length - 1 ? allSlugs[currentIdx + 1] : null;
  const nextSlug = currentIdx > 0 ? allSlugs[currentIdx - 1] : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReportPageClient report={report} prevSlug={prevSlug} nextSlug={nextSlug} />
    </>
  );
}
