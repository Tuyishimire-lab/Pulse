import type { SiteConfig } from '../app/data/sites';
import type { SiteDetails } from '../app/data/details';
import type { SiteCountryRank } from './getCountrySites';
import { getCompareSlug } from '../app/compare/data/pairs';
import { CURRENT_YEAR } from './currentYear';

export interface SiteFaqCompetitorLink {
  id: string;
  name: string;
  rank: number;
  baseline: string;
  compareSlug: string;
}

export interface SiteFaqCountryLink {
  name: string;
  slug: string;
  rank: number;
  flag: string;
}

export interface SiteFaqItem {
  id: string;
  question: string;
  /** Plain-text answer used verbatim inside FAQPage JSON-LD acceptedAnswer.text */
  answerText: string;
  /** Optional structured competitor links rendered as interactive badges in the UI */
  competitorLinks?: SiteFaqCompetitorLink[];
  /** Optional structured country links rendered as interactive badges in the UI */
  countryLinks?: SiteFaqCountryLink[];
}

function formatAnnualTraffic(baselineRaw: number, rate: number): string {
  const monthly = baselineRaw > 0 ? baselineRaw : rate * 30 * 86400;
  const annual = monthly * 12;
  if (annual >= 1e12) return `${(annual / 1e12).toFixed(2)} trillion`;
  if (annual >= 1e9) return `${(annual / 1e9).toFixed(1)} billion`;
  if (annual >= 1e6) return `${(annual / 1e6).toFixed(0)} million`;
  return annual.toLocaleString('en-US');
}

export function generateSiteFaq(
  site: SiteConfig,
  details: SiteDetails,
  categoryLabel: string,
  categoryRank: number,
  categoryTotal: number,
  competitors: SiteConfig[],
  countryRankings: SiteCountryRank[]
): SiteFaqItem[] {
  const cleanHost = site.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const dailyVisits = Math.round(site.rate * 86400).toLocaleString('en-US');
  const annualText = formatAnnualTraffic(site.baselineRaw || 0, site.rate);

  // Q1: Monthly & Annual Traffic Volume
  const q1: SiteFaqItem = {
    id: 'monthly-traffic',
    question: `How much traffic does ${site.name} (${cleanHost}) get per month in ${CURRENT_YEAR}?`,
    answerText: `As of ${CURRENT_YEAR}, ${site.name} (${cleanHost}) receives approximately ${site.baseline} monthly visits, ranking #${site.rank} globally and #${categoryRank} out of ${categoryTotal} tracked platforms in the ${categoryLabel} category. At a real-time velocity of ~${site.rate.toLocaleString('en-US')} visits per second (~${dailyVisits} visits per day), ${site.name} generates an estimated ${annualText} annualized visits.`,
  };

  // Q2: Top Competitors & Alternatives
  const topPeers = competitors.slice(0, 4);
  const competitorLinks: SiteFaqCompetitorLink[] = topPeers.map((peer) => ({
    id: peer.id,
    name: peer.name,
    rank: peer.rank,
    baseline: peer.baseline,
    compareSlug: getCompareSlug(site.id, peer.id),
  }));

  const peersProse =
    topPeers.length > 0
      ? topPeers
          .map((p) => `${p.name} (#${p.rank} globally, ${p.baseline}/mo)`)
          .join(', ')
      : `other leading ${categoryLabel} platforms`;

  const q2: SiteFaqItem = {
    id: 'competitors',
    question: `What are the top competitors and alternatives to ${site.name}?`,
    answerText: `In the ${categoryLabel} sector, ${site.name}'s closest traffic competitors are ${peersProse}. While ${site.name} holds Global Rank #${site.rank} with ${site.baseline} monthly visits, users and analysts frequently benchmark its audience reach and engagement velocity against these direct ${categoryLabel} peers.`,
    competitorLinks,
  };

  // Q3: Geographic Footprint & Country Rankings
  const topGeos = details.geographies.slice(0, 3);
  const geoProse =
    topGeos.length > 0
      ? topGeos.map((g) => `${g.country} (${g.percentage}%)`).join(', ')
      : 'the United States, India, and the United Kingdom';

  const topCountries = countryRankings.slice(0, 8);
  const countryCount = countryRankings.length;
  const countryRankProse =
    countryCount > 0
      ? ` Furthermore, ${site.name} ranks inside the national Top 20 most-visited websites across ${countryCount} tracked countries, including ${topCountries
          .slice(0, 4)
          .map((c) => `${c.name} (#${c.rank})`)
          .join(', ')}.`
      : '';

  const q3: SiteFaqItem = {
    id: 'geography',
    question: `Which countries send the most traffic to ${site.name}?`,
    answerText: `The largest regional traffic sources for ${site.name} are ${geoProse}.${countryRankProse} Regional distribution reflects ${site.name}'s localization footprint, mobile broadband penetration, and market adoption across key internet economies.`,
    countryLinks: topCountries.map((c) => ({
      name: c.name,
      slug: c.slug,
      rank: c.rank,
      flag: c.flag,
    })),
  };

  // Q4: User Engagement, Bounce Rate & Device Split
  const dominantDevice =
    details.mobileShare >= details.desktopShare
      ? `mobile devices (${details.mobileShare}% mobile vs. ${details.desktopShare}% desktop)`
      : `desktop workstations (${details.desktopShare}% desktop vs. ${details.mobileShare}% mobile)`;

  const q4: SiteFaqItem = {
    id: 'engagement',
    question: `What is ${site.name}'s bounce rate, session duration, and device split?`,
    answerText: `${site.name} records an average session duration of ${details.visitDuration} and an estimated bounce rate of ${details.bounceRate}. Audience access is led by ${dominantDevice}, reflecting how users interact with ${site.name}'s ${details.businessModel.toLowerCase()} ecosystem across web and mobile interfaces.`,
  };

  return [q1, q2, q3, q4];
}
