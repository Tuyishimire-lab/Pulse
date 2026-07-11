import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase';

// Helper to query Keywords Everywhere domain traffic API
async function fetchKeywordsEverywhereTraffic(url: string): Promise<number | null> {
  const apiKey = process.env.KEYWORDSEVERYWHERE_API_KEY;
  if (!apiKey) return null;

  try {
    const domain = url.replace('https://', '').replace('http://', '').replace('www.', '');
    const formData = new URLSearchParams();
    formData.append('domain', domain);
    formData.append('country', 'us');

    const res = await fetch('https://api.keywordseverywhere.com/v1/get_domain_traffic', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData,
      signal: AbortSignal.timeout(6000)
    });

    if (!res.ok) return null;
    const json = await res.json();
    
    // Parse common traffic fields returned in the JSON response
    if (json) {
      const trafficVal = json.traffic || 
                         (json.data && json.data.traffic) || 
                         (Array.isArray(json.data) && json.data[0] && json.data[0].traffic) ||
                         (json.data && typeof json.data === 'object' && Object.values(json.data)[0] && (Object.values(json.data)[0] as any).traffic);
      
      if (trafficVal !== undefined && trafficVal !== null) {
        return Number(trafficVal);
      }
    }
    return null;
  } catch (err) {
    console.warn(`Keywords Everywhere API failed for ${url}:`, err);
    return null;
  }
}

// Helper to scrape StatShow for traffic estimates
async function scrapeStatShow(url: string): Promise<number | null> {
  try {
    const domain = url.replace('https://', '').replace('http://', '').replace('www.', '');
    const res = await fetch(`https://www.statshow.com/www/${domain}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return null;
    const text = await res.text();
    
    const match = text.match(/([\d,]+)\s+daily\s+visitors/i) || 
                  text.match(/daily\s+visitors.*?<b>([\d,]+)<\/b>/i) ||
                  text.match(/<div[^>]*class="[^"]*stat_value[^"]*"[^>]*>([\d,]+)<\/div>/i);
    
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Fallback helper to scrape HypStat
async function scrapeHypStat(url: string): Promise<number | null> {
  try {
    const domain = url.replace('https://', '').replace('http://', '').replace('www.', '');
    const res = await fetch(`https://hypstat.com/www/${domain}`, {
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' 
      },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) return null;
    const text = await res.text();
    
    const match = text.match(/([\d,]+)\s+unique\s+visitors/i) ||
                  text.match(/unique\s+visitors.*?<b>([\d,]+)<\/b>/i);
    
    if (match && match[1]) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return null;
  } catch (err) {
    return null;
  }
}

export async function GET(request: Request) {
  // 1. Authorize Cron trigger in production
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { success: false, message: 'Database client is not configured' },
      { status: 500 }
    );
  }

  const oprApiKey = process.env.OPENPAGERANK_API_KEY;
  if (!oprApiKey) {
    return NextResponse.json(
      { success: false, message: 'Open PageRank API Key missing in environment' },
      { status: 500 }
    );
  }

  try {
    // 2. Fetch all current sites from Supabase
    const { data: sites, error: fetchError } = await supabase
      .from('sites')
      .select('*')
      .order('rank', { ascending: true });

    if (fetchError || !sites || sites.length === 0) {
      return NextResponse.json(
        { success: false, error: fetchError?.message || 'No sites found' },
        { status: 500 }
      );
    }

    // 3. Query Open PageRank API for all domains in one single request
    const domainsList = sites.map((s: any) => {
      return s.url.replace('https://', '').replace('http://', '').replace('www.', '');
    });
    const domainsQuery = domainsList.map((d: string) => `domains[]=${d}`).join('&');

    const oprRes = await fetch(`https://openpagerank.com/api/v1.0/getPageRank?${domainsQuery}`, {
      headers: {
        'API-OPR': oprApiKey
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!oprRes.ok) {
      throw new Error(`Open PageRank API responded with status ${oprRes.status}`);
    }

    const oprData = await oprRes.json();
    const rankMap: Record<string, { pageRank: number; globalRank: number }> = {};
    
    if (oprData && Array.isArray(oprData.response)) {
      oprData.response.forEach((item: any) => {
        rankMap[item.domain] = {
          pageRank: parseFloat(item.page_rank_decimal) || 0,
          globalRank: parseInt(item.rank) || 9999999
        };
      });
    }

    // 4. Select a rotating batch of 10 random sites to scrape and fetch organic traffic metrics on this run
    const shuffledSites = [...sites].sort(() => 0.5 - Math.random());
    const sitesToEnrich = shuffledSites.slice(0, 10);
    
    const scrapedVisitsMap: Record<string, number | null> = {};
    const keTrafficMap: Record<string, number | null> = {};

    await Promise.all(
      sitesToEnrich.map(async (site: any) => {
        // Run Keywords Everywhere traffic API in parallel with web scrapers
        const [keTraffic, statShowVisits] = await Promise.all([
          fetchKeywordsEverywhereTraffic(site.url),
          scrapeStatShow(site.url)
        ]);

        let visits = statShowVisits;
        if (visits === null) {
          visits = await scrapeHypStat(site.url);
        }

        scrapedVisitsMap[site.id] = visits;
        keTrafficMap[site.id] = keTraffic;
      })
    );

    // 5. Blending & calibration updates
    let maxRate = 32382; // fallback Google rate

    const updates = sites.map((site: any) => {
      const domainKey = site.url.replace('https://', '').replace('http://', '').replace('www.', '');
      const oprStats = rankMap[domainKey] || { pageRank: 4.5, globalRank: 1000000 };

      // Calculate logarithmic PageRank baseline traffic
      const prEst = Math.round(Math.pow(10, oprStats.pageRank * 0.8 + 1.4));

      // Get metrics from our rotating batch
      const keTraffic = keTrafficMap[site.id];
      const scraperVisits = scrapedVisitsMap[site.id];
      
      let finalDailyVisits = prEst;

      if (keTraffic !== undefined && keTraffic !== null && keTraffic > 0) {
        const keDailyVisits = Math.round(keTraffic / 30);
        if (scraperVisits !== undefined && scraperVisits !== null && scraperVisits > 0) {
          // Priority 1: Blend Keywords Everywhere (70%), Scraper (20%), and PageRank (10%)
          finalDailyVisits = Math.round(keDailyVisits * 0.7 + scraperVisits * 0.2 + prEst * 0.1);
        } else {
          // Priority 2: Blend Keywords Everywhere (85%) and PageRank (15%)
          finalDailyVisits = Math.round(keDailyVisits * 0.85 + prEst * 0.15);
        }
      } else if (scraperVisits !== undefined && scraperVisits !== null && scraperVisits > 0) {
        // Priority 3: Blend Scraper (80%) and PageRank (20%)
        finalDailyVisits = Math.round(scraperVisits * 0.8 + prEst * 0.2);
      } else {
        // Fallback: If not enriched on this run, decay/blend previous database value slightly with PageRank
        const previousDailyVisits = site.rate * 86400;
        if (previousDailyVisits > 0) {
          finalDailyVisits = Math.round(previousDailyVisits * 0.85 + prEst * 0.15);
        }
      }

      // Compute rate (visits per second)
      const calculatedRate = Math.max(1, Math.round(finalDailyVisits / 86400));
      if (site.id === 'google') {
        maxRate = calculatedRate;
      }

      // Compute pretty baseline string
      const monthlyVisits = finalDailyVisits * 30.4;
      let prettyBaseline = '';
      if (monthlyVisits >= 1000000000) {
        prettyBaseline = (monthlyVisits / 1000000000).toFixed(1) + 'B / mo';
      } else if (monthlyVisits >= 1000000) {
        prettyBaseline = (monthlyVisits / 1000000).toFixed(1) + 'M / mo';
      } else {
        prettyBaseline = (monthlyVisits / 1000).toFixed(1) + 'K / mo';
      }

      return {
        id: site.id,
        rate: calculatedRate,
        baseline: prettyBaseline,
        progress: 0,
        rank: oprStats.globalRank !== 9999999 ? site.rank : site.rank
      };
    });

    // 6. Recalculate progress values relative to maxRate
    const finalUpdates = updates.map((upd: any) => {
      upd.progress = parseFloat(Math.min(100, (upd.rate / maxRate) * 100).toFixed(2));
      return upd;
    });

    // Write updates to Supabase (in parallel batches)
    const dbUpdates = finalUpdates.map((upd: any) => {
      return supabase
        .from('sites')
        .update({
          rate: upd.rate,
          baseline: upd.baseline,
          progress: upd.progress
        })
        .eq('id', upd.id);
    });

    const chunkSize = 20;
    for (let i = 0; i < dbUpdates.length; i += chunkSize) {
      const chunk = dbUpdates.slice(i, i + chunkSize);
      await Promise.all(chunk);
    }

    return NextResponse.json({
      success: true,
      message: 'Website statistics enriched successfully using multi-source blending algorithm (Keywords Everywhere + PageRank + Scraper)',
      sitesEnrichedCount: sites.length,
      enrichedThisRun: sitesToEnrich.map((s: any) => s.id)
    });

  } catch (error: any) {
    console.error('Enrichment Exception:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
