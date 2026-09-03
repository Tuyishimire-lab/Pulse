import { NextRequest, NextResponse } from 'next/server';
import { SITES } from '@/app/data/sites';

// Helpers to clean domain
function cleanDomain(input: string): string {
  let domain = input.trim().toLowerCase();
  domain = domain.replace(/^https?:\/\//, '');
  domain = domain.replace(/^www\./, '');
  domain = domain.split('/')[0];
  domain = domain.split('?')[0];
  domain = domain.split('#')[0];
  return domain;
}

// Brand color palette generation based on domain hash
const BRAND_COLORS = [
  '#3b82f6', '#10b981', '#6366f1', '#ec4899', '#8b5cf6',
  '#f59e0b', '#06b6d4', '#14b8a6', '#f43f5e', '#3ecf8e',
];

function getBrandColor(domain: string): { color: string; glow: string } {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = BRAND_COLORS[Math.abs(hash) % BRAND_COLORS.length];
  return {
    color,
    glow: color + '33', // 20% opacity
  };
}

function formatBaseline(monthlyVisits: number): string {
  if (monthlyVisits >= 1_000_000_000) {
    return (monthlyVisits / 1_000_000_000).toFixed(1) + 'B / mo';
  } else if (monthlyVisits >= 1_000_000) {
    return (monthlyVisits / 1_000_000).toFixed(1) + 'M / mo';
  } else if (monthlyVisits >= 1_000) {
    return (monthlyVisits / 1_000).toFixed(0) + 'K / mo';
  }
  return monthlyVisits.toLocaleString() + ' / mo';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawInput = searchParams.get('url') || searchParams.get('domain') || '';

  if (!rawInput) {
    return NextResponse.json(
      { success: false, error: 'Domain or URL parameter is required' },
      { status: 400 }
    );
  }

  const domain = cleanDomain(rawInput);
  if (!domain || !domain.includes('.')) {
    return NextResponse.json(
      { success: false, error: 'Invalid domain format' },
      { status: 400 }
    );
  }

  // 1. Check if domain is already in our indexed catalog
  const existing = SITES.find(
    (s) => cleanDomain(s.url) === domain || s.id === domain.split('.')[0]
  );
  if (existing) {
    return NextResponse.json({
      success: true,
      source: 'catalog',
      domain,
      name: existing.name,
      category: existing.category,
      rank: existing.rank,
      baseline: existing.baseline,
      baselineRaw: existing.baselineRaw,
      rate: existing.rate,
      logo: existing.logo,
      color: existing.color,
      glow: existing.glow,
    });
  }

  // 2. Query Open PageRank if API key is configured
  let oprRank: number | null = null;
  let pageRankDecimal: number | null = null;
  const oprApiKey = process.env.OPENPAGERANK_API_KEY;

  if (oprApiKey) {
    try {
      const oprRes = await fetch(
        `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${encodeURIComponent(domain)}`,
        {
          headers: { 'API-OPR': oprApiKey },
          signal: AbortSignal.timeout(4000),
        }
      );
      if (oprRes.ok) {
        const data = await oprRes.json();
        const item = data?.response?.[0];
        if (item && typeof item.rank === 'number' && item.rank > 0) {
          oprRank = item.rank;
          pageRankDecimal = item.page_rank_decimal;
        }
      }
    } catch {
      // Fall through to algorithmic estimation
    }
  }

  // 3. Compute PTI traffic estimation
  let estimatedMonthly: number;
  let estimatedRank: number;

  if (oprRank && oprRank > 0) {
    estimatedRank = oprRank;
    if (oprRank <= 100) {
      estimatedMonthly = Math.round(50_000_000_000 / Math.pow(oprRank, 1.15));
    } else if (oprRank <= 1_000) {
      estimatedMonthly = Math.round(8_000_000_000 / Math.pow(oprRank, 0.95));
    } else if (oprRank <= 10_000) {
      estimatedMonthly = Math.round(2_500_000_000 / Math.pow(oprRank, 0.85));
    } else if (oprRank <= 100_000) {
      estimatedMonthly = Math.round(800_000_000 / Math.pow(oprRank, 0.75));
    } else {
      estimatedMonthly = Math.max(10_000, Math.round(200_000_000 / Math.pow(oprRank, 0.65)));
    }
  } else {
    // Domain heuristic estimate based on length and TLD
    const baseDomain = domain.split('.')[0];
    const isCommercial = domain.endsWith('.com') || domain.endsWith('.io') || domain.endsWith('.ai');
    estimatedRank = Math.max(5000, Math.min(250000, baseDomain.length * 9500));
    estimatedMonthly = isCommercial ? 15_000_000 : 3_500_000;
  }

  // Live velocity rate (visits per second)
  const SECONDS_PER_MONTH = 2_628_000;
  const rate = Math.max(1, Math.round(estimatedMonthly / SECONDS_PER_MONTH));
  const { color, glow } = getBrandColor(domain);

  // Auto-infer name and logo
  const parts = domain.split('.')[0];
  const name = parts.charAt(0).toUpperCase() + parts.slice(1);
  const logo = name.slice(0, 2);

  // Auto-infer category
  let category = 'dev';
  if (domain.endsWith('.ai') || domain.includes('gpt') || domain.includes('bot')) category = 'ai';
  else if (domain.includes('shop') || domain.includes('store') || domain.includes('buy')) category = 'ecommerce';
  else if (domain.includes('news') || domain.includes('daily') || domain.includes('times')) category = 'news';
  else if (domain.includes('tv') || domain.includes('stream') || domain.includes('play')) category = 'entertainment';
  else if (domain.includes('bank') || domain.includes('pay') || domain.includes('coin') || domain.includes('finance')) category = 'finance';
  else if (domain.includes('social') || domain.includes('chat') || domain.includes('app')) category = 'social';

  return NextResponse.json({
    success: true,
    source: oprRank ? 'openpagerank-calibrated' : 'pti-heuristic',
    domain,
    name,
    category,
    rank: estimatedRank,
    pageRankScore: pageRankDecimal,
    monthlyVisits: estimatedMonthly,
    baseline: formatBaseline(estimatedMonthly),
    rate,
    logo,
    color,
    glow,
  });
}
