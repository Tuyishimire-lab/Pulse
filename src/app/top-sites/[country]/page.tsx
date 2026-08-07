import { Metadata } from 'next';
import { SITES } from '../../data/sites';
import { ALL_COUNTRIES, getCountryBySlug, COUNTRY_SLUGS } from '../data/countries';
import CountryPageClient from './CountryPageClient';
import { notFound } from 'next/navigation';

const BASE_URL = 'https://www.pulstraffic.com';

interface PageProps {
  params: Promise<{ country: string }>;
}

export async function generateStaticParams() {
  return COUNTRY_SLUGS.map((slug) => ({ country: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country: slug } = await params;
  const countryData = getCountryBySlug(slug);

  if (!countryData) {
    return { title: 'Country Not Found | Pulse' };
  }

  const title = `Most Visited Websites in ${countryData.name} (2026) | Pulse`;
  const description = `Discover the top 20 most visited websites in ${countryData.name} with live real-time visitor counters. See monthly traffic estimates, rankings, and internet statistics for ${countryData.internetUsers} users.`;
  const url = `${BASE_URL}/top-sites/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Pulse',
      type: 'website',
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

export const dynamicParams = true; // allow ISR for generated countries not pre-rendered
export const revalidate = 86400;   // ISR: re-render at most once per day

export default async function CountryPage({ params }: PageProps) {
  const { country: slug } = await params;
  const countryData = getCountryBySlug(slug);

  if (!countryData) notFound();

  // Build the ordered site list for this country
  // Pinned sites come first in their specified order, then the rest of SITES
  const pinnedIds = countryData.pinnedSiteIds ?? [];
  const pinned = pinnedIds
    .map((id) => SITES.find((s) => s.id === id))
    .filter(Boolean) as typeof SITES;
  const rest = SITES.filter((s) => !pinnedIds.includes(s.id));
  const orderedSites = [...pinned, ...rest].slice(0, 20);

  // JSON-LD: ItemList + BreadcrumbList schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: `Top 20 Most Visited Websites in ${countryData.name} (2026)`,
        description: `Ranked list of the most visited websites in ${countryData.name} by monthly traffic.`,
        url: `${BASE_URL}/top-sites/${slug}`,
        numberOfItems: orderedSites.length,
        itemListElement: orderedSites.map((site, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: site.name,
          url: site.url,
          description: `${site.name}: ${site.baseline} monthly visits`,
        })),
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
            name: 'Top Sites',
            item: `${BASE_URL}/top-sites/united-states`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: countryData.name,
            item: `${BASE_URL}/top-sites/${slug}`,
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
      <CountryPageClient
        countryData={countryData}
        sites={orderedSites}
        allCountries={ALL_COUNTRIES}
      />
    </>
  );
}
