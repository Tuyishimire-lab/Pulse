import { Metadata } from 'next';
import { getSites } from '../../../lib/getSites';
import { COUNTRY_NAV, getCountryBySlug, COUNTRY_SLUGS } from '../data/countries';
import { resolveCountrySites, ensureTwentyCountrySites } from '../../../lib/getCountrySites';
import CountryPageClient from './CountryPageClient';
import { notFound } from 'next/navigation';
import { CURRENT_YEAR } from '../../../lib/currentYear';

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
  if (!countryData) return { title: 'Country Not Found | Pulse' };
  const title = `Most Visited Websites in ${countryData.name} (${CURRENT_YEAR}) | Pulse`;
  const description = `Discover the top 20 most visited websites in ${countryData.name} with live real-time visitor counters. See monthly traffic estimates, rankings, and internet statistics for ${countryData.internetUsers} users.`;
  const url = `${BASE_URL}/top-sites/${slug}`;
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: 'Pulse', type: 'website', locale: 'en_US', images: [{ url: `${url}/opengraph-image`, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [`${url}/opengraph-image`] },
  };
}

export const dynamicParams = true;
export const revalidate = 86400;

export default async function CountryPage({ params }: PageProps) {
  const { country: slug } = await params;
  const countryData = getCountryBySlug(slug);
  if (!countryData) notFound();

  const liveSites = await getSites();

  const pinnedIds = countryData.pinnedSiteIds ?? [];
  let orderedSites: typeof liveSites;
  let dataSource = 'pinned';

  if (pinnedIds.length > 0) {
    const fullPinnedIds = ensureTwentyCountrySites(pinnedIds, countryData.cfCode, liveSites);
    orderedSites = fullPinnedIds
      .map((id) => liveSites.find((s) => s.id === id))
      .filter(Boolean) as typeof liveSites;
  } else {
    const resolved = await resolveCountrySites(countryData.cfCode, liveSites);
    dataSource = resolved.source;
    const fullIds = ensureTwentyCountrySites(resolved.siteIds, countryData.cfCode, liveSites);
    orderedSites = fullIds
      .map((id) => liveSites.find((s) => s.id === id))
      .filter(Boolean) as typeof liveSites;
  }

  orderedSites = orderedSites.slice(0, 20);

  const topSocialSite = orderedSites.find((s) => s.category === 'social')?.name ?? 'Facebook';
  const faqEntries = [
    {
      q: `What is the most visited website in ${countryData.name}?`,
      a: `${orderedSites[0]?.name ?? 'Google'} is the most visited website in ${countryData.name}, receiving approximately ${orderedSites[0]?.baseline ?? 'billions of'} visits per month. ${countryData.localNote}`,
    },
    {
      q: `How many people use the internet in ${countryData.name}?`,
      a: `${countryData.name} has approximately ${countryData.internetUsers} internet users, representing a ${countryData.internetPenetration} internet penetration rate. ${countryData.insight.split(/(?<=[.!?])\s+/)[1]?.trim() ?? ''}`,
    },
    {
      q: `Which social media platform is most popular in ${countryData.name}?`,
      a: `Based on traffic data, ${topSocialSite} is the leading social media platform in ${countryData.name}. ${countryData.localNote}`,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: `Top 20 Most Visited Websites in ${countryData.name} (${CURRENT_YEAR})`,
        description: `Ranked list of the most visited websites in ${countryData.name} by monthly traffic.`,
        url: `${BASE_URL}/top-sites/${slug}`,
        numberOfItems: orderedSites.length,
        itemListElement: orderedSites.map((site, index) => ({
          '@type': 'ListItem', position: index + 1, name: site.name, url: site.url,
          description: `${site.name}: ${site.baseline} monthly visits`,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Top Sites', item: `${BASE_URL}/top-sites` },
          { '@type': 'ListItem', position: 3, name: countryData.name, item: `${BASE_URL}/top-sites/${slug}` },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqEntries.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <CountryPageClient countryData={countryData} sites={orderedSites} allCountries={COUNTRY_NAV} dataSource={dataSource} />
    </>
  );
}
