import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITES } from '../../data/sites';
import { getSites } from '../../../lib/getSites';
import { COMPARE_PAIRS, getPairBySlug, getAllCompareSlugs, parsePairSlug } from '../data/pairs';
import { generateDynamicPair } from './generateDynamicPair';
import ComparePageClient from './ComparePageClient';

const BASE_URL = 'https://www.pulstraffic.com';

interface PageProps {
  params: Promise<{ pair: string }>;
}

export async function generateStaticParams() {
  const slugs = getAllCompareSlugs();
  return slugs.map((slug) => ({ pair: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pair: slug } = await params;

  const known = getPairBySlug(slug);
  const parsed = parsePairSlug(slug);

  // Use live data for metadata so baseline/rank are accurate
  const sites = await getSites();
  const siteA = sites.find((s) => s.id === (known?.siteAId ?? parsed?.siteAId));
  const siteB = sites.find((s) => s.id === (known?.siteBId ?? parsed?.siteBId));

  if (!siteA || !siteB) return { title: 'Comparison Not Found | Pulse' };

  const title = `${siteA.name} vs ${siteB.name}: Traffic Comparison (2026) | Pulse`;
  const description = `See a real-time traffic comparison between ${siteA.name} and ${siteB.name}. Compare monthly visits, global rank, visit rate, and more. ${siteA.name} receives ${siteA.baseline} vs ${siteB.baseline} for ${siteB.name}.`;
  const url = `${BASE_URL}/compare/${slug}`;

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
      images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${url}/opengraph-image`],
    },
  };
}

export const dynamicParams = true;
export const revalidate = 3600; // ISR: re-render at most once per hour

export default async function ComparePage({ params }: PageProps) {
  const { pair: slug } = await params;

  const known = getPairBySlug(slug);
  const parsed = parsePairSlug(slug);

  const siteAId = known?.siteAId ?? parsed?.siteAId;
  const siteBId = known?.siteBId ?? parsed?.siteBId;

  // Use live data for rank/baseline — arbitrated by engine
  const allSites = await getSites();
  const siteA = allSites.find((s) => s.id === siteAId);
  const siteB = allSites.find((s) => s.id === siteBId);

  if (!siteA || !siteB) notFound();

  // Resolve pair data: hand-crafted first, then Groq-generated dynamic fallback
  let pairData = known ?? null;
  if (!pairData && siteAId && siteBId) {
    pairData = await generateDynamicPair(siteAId, siteBId);
  }

  // All other pairs for the navigation pill strip (excluding current)
  const related = COMPARE_PAIRS.filter((p) => p.slug !== slug);

  // JSON-LD: WebPage + FAQPage + BreadcrumbList
  const faqItems = pairData?.faq ?? [];
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `${siteA.name} vs ${siteB.name}: Traffic Comparison (2026)`,
        description: `Real-time traffic comparison between ${siteA.name} and ${siteB.name}.`,
        url: `${BASE_URL}/compare/${slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Compare', item: `${BASE_URL}/compare` },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${siteA.name} vs ${siteB.name}`,
            item: `${BASE_URL}/compare/${slug}`,
          },
        ],
      },
      ...(faqItems.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: faqItems.map((faq) => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComparePageClient
        siteA={siteA}
        siteB={siteB}
        pairData={pairData}
        related={related}
        allSites={allSites}
      />
    </>
  );
}
