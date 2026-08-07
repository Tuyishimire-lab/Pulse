import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { SITES } from '../../data/sites';

export const revalidate = 3600; // Revalidate at most once per hour

interface RadarRankItem {
  rank: number;
  domain: string;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawLocation = searchParams.get('location') || 'global';
  const location = rawLocation.toLowerCase() === 'global' ? 'global' : rawLocation.toUpperCase();
  const hasLocation = location !== 'global';
  
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!token) {
    // Generate some mock country rankings
    const mockRanks: Record<string, number> = {};
    if (location === 'US') {
      mockRanks['google'] = 2;
      mockRanks['youtube'] = 1;
      mockRanks['amazon'] = 4;
      mockRanks['chatgpt'] = 5;
      mockRanks['github'] = 8;
    } else if (location === 'IN') {
      mockRanks['google'] = 1;
      mockRanks['youtube'] = 2;
      mockRanks['facebook'] = 3;
      mockRanks['instagram'] = 4;
      mockRanks['chatgpt'] = 10;
    } else if (location === 'JP') {
      mockRanks['yahoo'] = 2;
      mockRanks['google'] = 1;
      mockRanks['youtube'] = 3;
      mockRanks['chatgpt'] = 12;
    }
    return NextResponse.json({
      success: true,
      source: 'mock',
      inMemory: hasLocation,
      ranks: mockRanks
    });
  }

  try {
    const locationQuery = hasLocation ? `&location=${location}` : '';
    const res = await fetch(`https://api.cloudflare.com/client/v4/radar/ranking/top?limit=100&format=json${locationQuery}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: `Cloudflare Radar Ranking API returned status: ${res.status}`
      }, { status: res.status });
    }

    const data = await res.json();
    if (!data.success || !data.result || !data.result.top_0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid response format from Cloudflare Radar rankings API'
      }, { status: 400 });
    }

    const radarRanks: RadarRankItem[] = data.result.top_0;
    
    // Create domain to rank map
    const rankMap = new Map<string, number>();
    radarRanks.forEach((item) => {
      rankMap.set(item.domain.toLowerCase(), item.rank);
    });

    // Match and update sites
    const updates: { id: string; rank: number; baseline_raw?: number }[] = [];
    const ranksObj: Record<string, number> = {};
    
    let currentSites = SITES;
    if (isSupabaseConfigured) {
      const { data: dbSites, error } = await supabase
        .from('sites')
        .select('id, url, rank, baseline_raw');
      if (!error && dbSites) {
        currentSites = dbSites as any[];
      }
    }

    currentSites.forEach((site) => {
      // Extract domain from URL
      const domain = site.url
        .replace('https://', '')
        .replace('http://', '')
        .replace('www.', '')
        .split('/')[0]
        .toLowerCase();
      
      const newRank = rankMap.get(domain);
      if (newRank !== undefined) {
        ranksObj[site.id] = newRank;
        if (newRank !== site.rank) {
          // Carry baseline_raw forward: use existing DB value or fall back to static seed
          const staticEntry = SITES.find((s) => s.id === site.id);
          updates.push({
            id: site.id,
            rank: newRank,
            baseline_raw: (site as any).baseline_raw ?? staticEntry?.baselineRaw,
          });
        }
      }
    });

    // Write updates to Supabase ONLY if we are in GLOBAL mode and there are updates
    if (!hasLocation && isSupabaseConfigured && updates.length > 0) {
      const dbUpdates = updates.map((upd) => {
        const payload: Record<string, unknown> = { rank: upd.rank };
        if (upd.baseline_raw !== undefined) payload.baseline_raw = upd.baseline_raw;
        return supabase
          .from('sites')
          .update(payload)
          .eq('id', upd.id);
      });

      // Perform updates in chunks to avoid rate limits
      const chunkSize = 10;
      for (let i = 0; i < dbUpdates.length; i += chunkSize) {
        await Promise.all(dbUpdates.slice(i, i + chunkSize));
      }
    }

    return NextResponse.json({
      success: true,
      source: 'cloudflare',
      inMemory: hasLocation,
      syncedCount: updates.length,
      ranks: ranksObj,
      updates
    });

  } catch (err: any) {
    console.error('Failed to sync rankings:', err);
    return NextResponse.json({
      success: false,
      error: err.message
    }, { status: 500 });
  }
}
