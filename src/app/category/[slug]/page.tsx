import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSites } from '../../../lib/getSites';
import { CATEGORIES } from '../../data/sites';
import CategoryPageClient from './CategoryPageClient';
import { CURRENT_YEAR } from '../../../lib/currentYear';

const BASE_URL = 'https://www.pulstraffic.com';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static pages for all 9 categories (excluding "all")
export async function generateStaticParams() {
  return CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({ slug: c.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.id === slug);
  if (!category) return { title: 'Category Not Found | Pulse' };

  const title = `${category.label} Websites - Traffic Rankings ${CURRENT_YEAR} | Pulse`;
  const description = `Compare traffic, global ranks, and visitor metrics for the top ${category.label.toLowerCase()} websites in ${CURRENT_YEAR}. Real-time data powered by the Pulse Traffic Index engine.`;
  const url = `${BASE_URL}/category/${slug}`;

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

export const dynamicParams = false; // only allow the 9 pre-built slugs
export const revalidate = 3600;

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  const category = CATEGORIES.find((c) => c.id === slug && c.id !== 'all');
  if (!category) notFound();

  // Fetch live sites from Supabase
  const allSites = await getSites();

  // Filter to this category
  const categorySites = allSites.filter((s) => s.category === slug);

  if (categorySites.length === 0) notFound();

  // Build per-category totals for the "share of total" stat
  const categoryTotals: Record<string, { count: number; totalRate: number }> = {};
  for (const site of allSites) {
    if (!categoryTotals[site.category]) {
      categoryTotals[site.category] = { count: 0, totalRate: 0 };
    }
    categoryTotals[site.category].count += 1;
    categoryTotals[site.category].totalRate += site.rate;
  }

  const allCategoriesExceptAll = CATEGORIES.filter((c) => c.id !== 'all');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${category.label} Websites - Traffic Rankings ${CURRENT_YEAR}`,
    description: `Top ${category.label.toLowerCase()} websites ranked by global traffic in ${CURRENT_YEAR}.`,
    url: `${BASE_URL}/category/${slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'Categories', item: `${BASE_URL}/category` },
        { '@type': 'ListItem', position: 3, name: category.label, item: `${BASE_URL}/category/${slug}` },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CategoryPageClient
        slug={slug}
        label={category.label}
        sites={categorySites}
        allCategories={allCategoriesExceptAll}
        categoryTotals={categoryTotals}
      />
    </>
  );
}
