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

// Helper to query Keywords Everywhere domain ranking keywords
async function fetchKeywordsEverywhereKeywords(url: string): Promise<string[] | null> {
  const apiKey = process.env.KEYWORDSEVERYWHERE_API_KEY;
  if (!apiKey) return null;

  try {
    const domain = url.replace('https://', '').replace('http://', '').replace('www.', '');
    const formData = new URLSearchParams();
    formData.append('domain', domain);
    formData.append('country', 'us');
    formData.append('currency', 'usd');

    const res = await fetch('https://api.keywordseverywhere.com/v1/get_domain_keywords', {
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

    if (json && Array.isArray(json.data)) {
      return json.data.slice(0, 5).map((item: any) => item.keyword);
    }
    return null;
  } catch (err) {
    console.warn(`Keywords Everywhere keywords query failed for ${url}:`, err);
    return null;
  }
}

// Helper to query Google Suggest queries for free brand keywords (100% Free Fallback)
async function fetchGoogleSuggestKeywords(url: string): Promise<string[] | null> {
  try {
    const domain = url.replace('https://', '').replace('http://', '').replace('www.', '');
    const brand = domain.split('.')[0];
    const suggestUrl = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(brand)}`;
    
    const res = await fetch(suggestUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) return null;
    const data = await res.json();

    if (Array.isArray(data) && Array.isArray(data[1])) {
      const suggestions = data[1]
        .filter((item: string) => !item.startsWith('http://') && !item.startsWith('https://') && item.trim().length > 0)
        .map((item: string) => {
          // 1. Strip out the brand name case-insensitively
          let cleaned = item.toLowerCase().replace(brand.toLowerCase(), '').trim();
          
          // 2. Handle empty queries
          if (cleaned.length === 0) {
            return 'Search';
          }
          
          // 3. Remove common verbs and generic words
          const stopwords = ['login', 'sign up', 'signup', 'download', 'app', 'website', 'free', 'online', 'web', 'com', 'org', 'net'];
          let words = cleaned.split(' ').filter(w => !stopwords.includes(w) && w.trim().length > 0);
          
          if (words.length === 0) {
            words = cleaned.split(' ');
          }
          
          // 4. Capitalize and format acronyms
          const capitalized = words.map(w => {
            if (['api', 'gpt', 'tv', 'aws', 'pdf', 'csv', 'rss', 'url', 'seo'].includes(w.toLowerCase())) {
              return w.toUpperCase();
            }
            return w.charAt(0).toUpperCase() + w.slice(1);
          }).join(' ');
          
          return capitalized;
        })
        .filter((item: string) => item.length > 0)
        .filter((item: string, index: number, self: string[]) => self.indexOf(item) === index)
        .slice(0, 5);
      return suggestions;
    }
    return null;
  } catch (err) {
    console.warn(`Google Suggest keywords query failed for ${url}:`, err);
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

    // [New Segment] Sync rankings with Cloudflare Radar (Once daily inside cron)
    const cfRadarToken = process.env.CLOUDFLARE_API_TOKEN;
    if (cfRadarToken) {
      try {
        const cfRes = await fetch('https://api.cloudflare.com/client/v4/radar/ranking/top?limit=100&format=json', {
          headers: {
            'Authorization': `Bearer ${cfRadarToken}`,
            'Accept': 'application/json'
          },
          signal: AbortSignal.timeout(6000)
        });
        if (cfRes.ok) {
          const cfData = await cfRes.json();
          if (cfData.success && cfData.result && cfData.result.top_0) {
            const radarRanks = cfData.result.top_0;
            const rankMap = new Map<string, number>();
            radarRanks.forEach((item: any) => {
              rankMap.set(item.domain.toLowerCase(), item.rank);
            });

            // Match and prepare updates
            const rankUpdates: { id: string; rank: number }[] = [];
            sites.forEach((site: any) => {
              const domain = site.url
                .replace('https://', '')
                .replace('http://', '')
                .replace('www.', '')
                .split('/')[0]
                .toLowerCase();
              
              const newRank = rankMap.get(domain);
              if (newRank !== undefined && newRank !== site.rank) {
                rankUpdates.push({ id: site.id, rank: newRank });
                // Mutate the local array so subsequent OPR steps also have the updated rank!
                site.rank = newRank;
              }
            });

            // Write updates to Supabase
            if (rankUpdates.length > 0) {
              const dbUpdates = rankUpdates.map((upd) => 
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
              console.log(`Unified Cron: Synced ${rankUpdates.length} rankings with Cloudflare Radar.`);
            }
          }
        }
      } catch (err) {
        console.warn('Unified Cron: Failed to sync rankings with Cloudflare Radar:', err);
      }
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
    const keKeywordsMap: Record<string, string[] | null> = {};

    await Promise.all(
      sitesToEnrich.map(async (site: any) => {
        // Run Keywords Everywhere traffic/keywords API in parallel with web scrapers
        let [keTraffic, keKeywords, statShowVisits] = await Promise.all([
          fetchKeywordsEverywhereTraffic(site.url),
          fetchKeywordsEverywhereKeywords(site.url),
          scrapeStatShow(site.url)
        ]);

        // Fallback: If Keywords Everywhere keywords failed/no credits, try Google Suggest API (100% free)
        if (keKeywords === null || keKeywords.length === 0) {
          keKeywords = await fetchGoogleSuggestKeywords(site.url);
        }

        let visits = statShowVisits;
        if (visits === null) {
          visits = await scrapeHypStat(site.url);
        }

        scrapedVisitsMap[site.id] = visits;
        keTrafficMap[site.id] = keTraffic;
        keKeywordsMap[site.id] = keKeywords;
      })
    );

    // 5. Blending & calibration updates for domain metadata
    let maxRate = 32382; // fallback Google rate

    const updates = sites.map((site: any) => {
      const domainKey = site.url.replace('https://', '').replace('http://', '').replace('www.', '');
      const oprStats = rankMap[domainKey] || { pageRank: 4.5, globalRank: 1000000 };

      // Calculate logarithmic PageRank baseline traffic
      const prEst = Math.round(Math.pow(10, oprStats.pageRank * 0.8 + 1.4));

      // Get metrics from our rotating batch
      const keTraffic = keTrafficMap[site.id];
      const keKeywords = keKeywordsMap[site.id];
      const scraperVisits = scrapedVisitsMap[site.id];
      
      let finalDailyVisits = prEst;

      if (keTraffic !== undefined && keTraffic !== null && keTraffic > 0) {
        const keDailyVisits = Math.round(keTraffic / 30);
        if (scraperVisits !== undefined && scraperVisits !== null && scraperVisits > 0) {
          finalDailyVisits = Math.round(keDailyVisits * 0.7 + scraperVisits * 0.2 + prEst * 0.1);
        } else {
          finalDailyVisits = Math.round(keDailyVisits * 0.85 + prEst * 0.15);
        }
      } else if (scraperVisits !== undefined && scraperVisits !== null && scraperVisits > 0) {
        finalDailyVisits = Math.round(scraperVisits * 0.8 + prEst * 0.2);
      } else {
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
        rank: oprStats.globalRank !== 9999999 ? site.rank : site.rank,
        keywords: keKeywords || null
      };
    });

    // 6. Recalculate progress values relative to maxRate
    const finalUpdates = updates.map((upd: any) => {
      upd.progress = parseFloat(Math.min(100, (upd.rate / maxRate) * 100).toFixed(2));
      return upd;
    });

    // Write updates to Supabase (in parallel batches)
    const dbUpdates = finalUpdates.map((upd: any) => {
      const updatePayload: any = {
        rate: upd.rate,
        baseline: upd.baseline,
        progress: upd.progress
      };
      if (upd.keywords !== null) {
        updatePayload.keywords = upd.keywords;
      }
      return supabase
        .from('sites')
        .update(updatePayload)
        .eq('id', upd.id);
    });

    const chunkSize = 20;
    for (let i = 0; i < dbUpdates.length; i += chunkSize) {
      const chunk = dbUpdates.slice(i, i + chunkSize);
      await Promise.all(chunk);
    }

    // 7. Calculate & bulk-insert 24 hourly points for the entire past day
    // This allows the cron to run only once per day while maintaining complete hourly wave history logs.
    const historyInsertions: any[] = [];
    const now = new Date();

    for (let h = 0; h < 24; h++) {
      const timestamp = new Date(now.getTime() - h * 60 * 60 * 1000);
      const hourValue = timestamp.getHours();
      
      finalUpdates.forEach((upd: any) => {
        // Calculate site-specific phase-shifted wave
        const phaseOffset = (upd.rank * 7) % 24;
        const shiftedHour = (hourValue + phaseOffset) % 24;
        const baseCircadian = Math.sin((shiftedHour - 9) / 24 * 2 * Math.PI) * 28;
        const noise = (Math.random() - 0.5) * 14;
        const visitsPercentage = Math.max(20, Math.min(98, Math.round(62 + baseCircadian + noise)));

        historyInsertions.push({
          site_id: upd.id,
          visits_percentage: visitsPercentage,
          timestamp: timestamp.toISOString()
        });
      });
    }

    // Bulk insert history nodes (in chunks of 400 rows to avoid request limits)
    const insertChunkSize = 400;
    for (let i = 0; i < historyInsertions.length; i += insertChunkSize) {
      const chunk = historyInsertions.slice(i, i + insertChunkSize);
      const { error: historyError } = await supabase
        .from('traffic_history')
        .insert(chunk);

      if (historyError) {
        console.error('Unified Cron: Failed to insert history chunk:', historyError);
      }
    }

    // 8. Database hygiene cleanup: delete records older than 7 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const { error: deleteError, count: deletedCount } = await supabase
      .from('traffic_history')
      .delete({ count: 'exact' })
      .lt('timestamp', cutoffDate.toISOString());

    if (deleteError) {
      console.error('Unified Cron: Failed to clean up database history:', deleteError);
    }

    return NextResponse.json({
      success: true,
      message: 'Unified Vercel Hobby-compliant daily cron execution completed successfully',
      enrichedRotatingBatch: sitesToEnrich.map((s: any) => s.id),
      historyNodesAddedCount: historyInsertions.length,
      historyNodesDeletedCount: deletedCount || 0
    });

  } catch (error: any) {
    console.error('Unified Cron Ingestion Exception:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
