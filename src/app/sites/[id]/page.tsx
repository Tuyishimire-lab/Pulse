import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITES, CATEGORIES } from '../../data/sites';
import { getSiteById, getSites } from '../../../lib/getSites';
import { getSiteEnrichment } from '../../../lib/getSiteEnrichment';
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
      canonical: `https://www.pulstraffic.com/sites/${site.id}`,
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

  // Fetch live site, full catalog (for category rank & peers), and enrichment in parallel
  const [site, allSites, enrichment] = await Promise.all([
    getSiteById(id),
    getSites(),
    getSiteEnrichment(id),
  ]);

  // Unknown slug → hard 404 (not a soft-200 "Domain Not Found" shell)
  if (!site) notFound();

  const siteName = site.name;
  const siteUrl = site.url;
  const baseline = site.baseline;
  const rank = site.rank;

  // Compute Category Rank & Closest Category Competitors
  const categoryObj = CATEGORIES.find((c) => c.id === site.category);
  const categoryLabel = categoryObj ? categoryObj.label : site.category;
  const categorySites = allSites
    .filter((s) => s.category === site.category)
    .sort((a, b) => a.rank - b.rank);

  const catIndex = categorySites.findIndex((s) => s.id === site.id);
  const categoryRank = catIndex >= 0 ? catIndex + 1 : 1;
  const categoryTotal = categorySites.length || 1;

  // Pick up to 4 closest competitors by rank distance within the same category
  const categoryCompetitors = categorySites
    .filter((s) => s.id !== site.id)
    .sort((a, b) => Math.abs(a.rank - site.rank) - Math.abs(b.rank - site.rank))
    .slice(0, 4)
    .sort((a, b) => a.rank - b.rank);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
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
            },
            {
              '@type': 'PropertyValue',
              'name': `${categoryLabel} Category Rank`,
              'value': categoryRank,
            }
          ]
        }
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
            name: categoryLabel,
            item: `https://www.pulstraffic.com/category/${site.category}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: siteName,
            item: `https://www.pulstraffic.com/sites/${id}`,
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
      <SitePageClient
        id={id}
        initialSite={site}
        initialEnrichment={enrichment}
        categoryRank={categoryRank}
        categoryTotal={categoryTotal}
        categoryLabel={categoryLabel}
        categoryCompetitors={categoryCompetitors}
      />
    </>
  );
}
