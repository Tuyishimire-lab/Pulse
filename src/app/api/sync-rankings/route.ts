import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { SITES } from '../../data/sites';

export const dynamic = 'force-dynamic';

interface RadarRankItem {
  rank: number;
  domain: string;
}

export async function GET() {
  const token = process.env.CLOUDFLARE_API_TOKEN;

  if (!token) {
    return NextResponse.json({
      success: true,
      source: 'mock',
      message: 'Cloudflare token not set. Skipping rank synchronization.'
    });
  }

  try {
    const res = await fetch('https://api.cloudflare.com/client/v4/radar/ranking/top?limit=100&format=json', {
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
    const updates: { id: string; rank: number }[] = [];
    const baseSites = isSupabaseConfigured ? [] : SITES; // Fetching from Supabase if configured
    
    let currentSites = SITES;
    if (isSupabaseConfigured) {
      const { data: dbSites, error } = await supabase.from('sites').select('id, url, rank');
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
      if (newRank !== undefined && newRank !== site.rank) {
        updates.push({ id: site.id, rank: newRank });
      }
    });

    // Write updates to Supabase in batches if configured
    if (isSupabaseConfigured && updates.length > 0) {
      const dbUpdates = updates.map((upd) => 
        supabase
          .from('sites')
          .update({ rank: upd.rank })
          .eq('id', upd.id)
      );

      // Perform updates
      const chunkSize = 10;
      for (let i = 0; i < dbUpdates.length; i += chunkSize) {
        await Promise.all(dbUpdates.slice(i, i + chunkSize));
      }
    }

    return NextResponse.json({
      success: true,
      source: 'cloudflare',
      syncedCount: updates.length,
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
