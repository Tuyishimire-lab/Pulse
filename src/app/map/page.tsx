import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { ALL_COUNTRIES } from '../top-sites/data/countries';
import { getSites } from '../../lib/getSites';
import MapClientWrapper from './MapClientWrapper';
import { CURRENT_YEAR } from '../../lib/currentYear';

const BASE_URL = 'https://www.pulstraffic.com';

export const metadata: Metadata = {
  title: `Global Web Traffic Map ${CURRENT_YEAR} | Pulse`,
  description:
    'Interactive world globe showing internet penetration, the distinctive local platform in each country (from Cloudflare Radar), and connected online population across 115+ countries.',
  alternates: { canonical: `${BASE_URL}/map` },
  openGraph: {
    title: `Global Web Traffic Map ${CURRENT_YEAR} | Pulse`,
    description:
      'Interactive world globe showing internet penetration, the distinctive local platform in each country (from Cloudflare Radar), and connected online population across 115+ countries.',
    url: `${BASE_URL}/map`,
    siteName: 'Pulse',
    type: 'website',
    locale: 'en_US',
    images: [{ url: `${BASE_URL}/map/opengraph-image`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Global Web Traffic Map ${CURRENT_YEAR} | Pulse`,
    description:
      'Interactive world globe showing internet penetration, the distinctive local platform in each country (from Cloudflare Radar), and connected online population across 115+ countries.',
    images: [`${BASE_URL}/map/opengraph-image`],
  },
};

export const revalidate = 86400;

// Platforms that top almost every country's Radar list (search, OS/telemetry, CDN, Meta apps,
// ChatGPT). Always skipped so each country's distinctive platform shows through.
const GLOBAL_GIANTS = new Set([
  'google', 'youtube', 'facebook', 'instagram', 'whatsapp', 'apple', 'microsoft', 'office',
  'bing', 'copilot', 'cloudflare', 'chatgpt', 'openai', 'aws',
]);

// Radar ranks DNS lookups, so apps that phone home everywhere (Adobe, Spotify, Snapchat...) also
// rank highly worldwide. Any site in the top 15 of more than a third of countries is treated as
// global, so the exclusion list stays data-driven as rankings change.
const UBIQUITY_SHARE = 1 / 3;
const RADAR_HEAD = 15;
const MIN_ROWS_FOR_UBIQUITY = 20;

function ubiquitousSites(rankings: Map<string, RankingRow>): Set<string> {
  const out = new Set(GLOBAL_GIANTS);
  if (rankings.size < MIN_ROWS_FOR_UBIQUITY) return out;
  const freq = new Map<string, number>();
  for (const r of rankings.values()) {
    for (const id of new Set((r.site_ids ?? []).slice(0, RADAR_HEAD))) freq.set(id, (freq.get(id) ?? 0) + 1);
  }
  for (const [id, n] of freq) if (n / rankings.size > UBIQUITY_SHARE) out.add(id);
  return out;
}

interface RankingRow {
  cf_code: string;
  site_ids: string[] | null;
  updated_at: string;
}

async function getCountryRankings(): Promise<Map<string, RankingRow>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';
  if (!url || !key) return new Map();
  try {
    const { data } = await createClient(url, key)
      .from('country_rankings')
      .select('cf_code, site_ids, updated_at');
    return new Map(((data ?? []) as RankingRow[]).map((r) => [r.cf_code.toUpperCase(), r]));
  } catch {
    return new Map();
  }
}

export default async function MapPage() {
  // Live site data (names/colors) + Cloudflare Radar country rankings
  const [liveSites, rankings] = await Promise.all([getSites(), getCountryRankings()]);
  const siteById = Object.fromEntries(liveSites.map((s) => [s.id, s]));
  const globalSites = ubiquitousSites(rankings);

  // Build country lookup map - keyed by cfCode (ISO alpha-2)
  const countryMap = new Map(
    ALL_COUNTRIES.map((c) => {
      const topSiteId = c.pinnedSiteIds?.[0] ?? 'google';
      const topSite = siteById[topSiteId];

      let usersRaw = 0;
      const lowerUsers = (c.internetUsers || '').toLowerCase();
      if (lowerUsers.includes('billion')) {
        usersRaw = (parseFloat(lowerUsers) || 1) * 1000;
      } else if (lowerUsers.includes('million')) {
        usersRaw = parseFloat(lowerUsers) || 1;
      } else if (lowerUsers.includes('k')) {
        usersRaw = (parseFloat(lowerUsers) || 1) / 1000;
      } else {
        usersRaw = parseFloat(lowerUsers) || 10;
      }

      // Distinctive platform: Cloudflare Radar ranking first, curated pinned list as fallback
      const ranking = rankings.get(c.cfCode.toUpperCase());
      const pickLocal = (ids: string[]) => ids.find((id) => siteById[id] && !globalSites.has(id));
      const radarLocal = pickLocal((ranking?.site_ids ?? []).slice(0, RADAR_HEAD));
      const curatedLocal = radarLocal ? undefined : pickLocal(c.pinnedSiteIds ?? []);
      const localId = radarLocal ?? curatedLocal ?? null;
      const localSite = localId ? siteById[localId] : undefined;

      return [
        c.cfCode.toUpperCase(),
        {
          slug: c.slug,
          name: c.name,
          internetUsers: c.internetUsers,
          internetUsersMillions: usersRaw,
          internetPenetration: c.internetPenetration,
          topSiteName: topSite?.name ?? 'Google',
          topSiteId: topSiteId,
          topSiteColor: topSite?.color ?? '#4A9EFF',
          localPlatformId: localId,
          localPlatformName: localSite?.name ?? null,
          localPlatformSource: radarLocal ? ('radar' as const) : curatedLocal ? ('curated' as const) : null,
          radarUpdatedAt: radarLocal ? ranking?.updated_at ?? null : null,
        },
      ];
    }),
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Pulse Global Web Traffic Map',
        url: `${BASE_URL}/map`,
        description:
          'Interactive world map showing internet penetration rates and top websites in 115+ countries.',
        applicationCategory: 'DataVisualization',
        operatingSystem: 'All',
        creator: {
          '@type': 'Organization',
          name: 'Pulse',
          url: BASE_URL,
        },
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
            name: 'Global Map',
            item: `${BASE_URL}/map`,
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
      <MapClientWrapper countryMap={Object.fromEntries(countryMap)} />
    </>
  );
}
