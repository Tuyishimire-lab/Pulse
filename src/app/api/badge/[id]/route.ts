import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { SITES } from '../../../data/sites';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

/**
 * Fetches badge data from Supabase, cached by Next.js for 5 minutes.
 * unstable_cache is backed by the shared ISR/fetch cache on Vercel — unlike a
 * module-level Map it survives cold starts and is shared across function instances.
 */
const getCachedBadgeData = unstable_cache(
  async (siteId: string) => {
    if (!supabaseUrl || !supabaseKey) return null;
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('sites')
        .select('rank, baseline, name')
        .eq('id', siteId)
        .single();
      return data ?? null;
    } catch {
      return null;
    }
  },
  ['badge-data'],
  { revalidate: 300, tags: ['badge'] } // 5-minute TTL; invalidate with revalidateTag('badge')
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const siteId = id.toLowerCase();

  // Find site from static list as fallback
  const site = SITES.find((s) => s.id === siteId);

  let rank = site?.rank || 999;
  let baseline = site?.baseline || 'N/A';
  let siteName = site?.name || siteId.toUpperCase();
  let brandColor = site?.color || '#0047AB';

  // Fetch from Supabase via durable Next.js cache (survives cold starts)
  const liveData = await getCachedBadgeData(siteId);
  if (liveData) {
    if (liveData.rank) rank = liveData.rank;
    if (liveData.baseline) baseline = liveData.baseline;
    if (liveData.name) siteName = liveData.name;
  }

  // Calculate approximate PTI score for badge
  const ptiScore = Math.max(1.0, Math.round((100.0 - 15.0 * Math.log10(Math.max(1, rank))) * 10) / 10).toFixed(1);

  // Generate SVG Badge Markup
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="340" height="54" viewBox="0 0 340 54" fill="none">
  <rect width="340" height="54" rx="14" fill="#02020a" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
  
  <!-- Left Side: Brand Logo & Name -->
  <circle cx="28" cy="27" r="10" fill="${brandColor}" fill-opacity="0.25" stroke="${brandColor}" stroke-width="1.5"/>
  <circle cx="28" cy="27" r="4" fill="${brandColor}"/>
  
  <text x="46" y="24" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800">${escapeXml(siteName)}</text>
  <text x="46" y="38" fill="#6d8196" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600">PULSE TRAFFIC INDEX</text>
  
  <!-- Divider -->
  <line x1="180" y1="12" x2="180" y2="42" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
  
  <!-- Right Side: Metrics -->
  <g transform="translate(195, 0)">
    <!-- Rank Pill -->
    <rect x="0" y="16" width="62" height="22" rx="7" fill="rgba(130,200,229,0.12)" stroke="rgba(130,200,229,0.3)" stroke-width="1"/>
    <text x="31" y="31" fill="#82c8e5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" text-anchor="middle">#${rank}</text>
    
    <!-- PTI Score Pill -->
    <rect x="68" y="16" width="64" height="22" rx="7" fill="rgba(16,185,129,0.12)" stroke="rgba(16,185,129,0.3)" stroke-width="1"/>
    <text x="100" y="31" fill="#10b981" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" text-anchor="middle">${ptiScore} PTI</text>
  </g>
</svg>
`.trim();

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
