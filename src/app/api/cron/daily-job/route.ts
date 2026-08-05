import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '../../../../lib/supabase';
import { parseDomain } from '../../../../utils/domain';
import { generateAIStories } from '../../../../utils/groqAnalysis';

// Rank-to-traffic power law model
// Calibrated against known data: Google (#1) ≈ 85B/mo, rank #10 ≈ 6.7B/mo, rank #100 ≈ 536M/mo
// Uses modified Zipf's law: monthly_visits = ANCHOR_MONTHLY / rank^EXPONENT
const ANCHOR_MONTHLY = 85_000_000_000; // Google's approximate monthly visits
const ZIPF_EXPONENT = 1.1;

function estimateTrafficFromRank(rank: number): { dailyVisits: number; monthlyVisits: number; rate: number } {
  const clampedRank = Math.max(1, rank);
  const monthlyVisits = Math.round(ANCHOR_MONTHLY / Math.pow(clampedRank, ZIPF_EXPONENT));
  const dailyVisits = Math.round(monthlyVisits / 30.4);
  const rate = Math.max(1, Math.round(dailyVisits / 86400));
  return { dailyVisits, monthlyVisits, rate };
}

function formatBaseline(monthlyVisits: number): string {
  if (monthlyVisits >= 1_000_000_000) {
    return (monthlyVisits / 1_000_000_000).toFixed(1) + 'B / mo';
  } else if (monthlyVisits >= 1_000_000) {
    return (monthlyVisits / 1_000_000).toFixed(1) + 'M / mo';
  }
  return (monthlyVisits / 1_000).toFixed(1) + 'K / mo';
}
async function fetchKeywordsEverywhereKeywords(url: string): Promise<string[] | null> {
  const apiKey = process.env.KEYWORDSEVERYWHERE_API_KEY;
  if (!apiKey) return null;

  try {
    const domain = parseDomain(url);
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
    const domain = parseDomain(url);
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
    const domainsList = sites.map((s: any) => parseDomain(s.url));
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

    // 4. Enrich keywords only (traffic is computed from rank — no external traffic APIs needed)
    const keKeywordsMap: Record<string, string[] | null> = {};

    // Process keywords in parallel batches of 20 (lightweight: only keyword fetches)
    const KEYWORD_BATCH_SIZE = 20;

    for (let i = 0; i < sites.length; i += KEYWORD_BATCH_SIZE) {
      const batch = sites.slice(i, i + KEYWORD_BATCH_SIZE);
      await Promise.all(
        batch.map(async (site: any) => {
          try {
            let keywords = await fetchKeywordsEverywhereKeywords(site.url);
            // Fallback to Google Suggest (free) if KE fails
            if (!keywords || keywords.length === 0) {
              keywords = await fetchGoogleSuggestKeywords(site.url);
            }
            keKeywordsMap[site.id] = keywords;
          } catch (err) {
            console.warn(`Keyword enrichment failed for ${site.id}:`, err);
          }
        })
      );
    }

    // 5. Compute traffic from Cloudflare Radar rank using power law model
    // This is the primary traffic estimation — derived from rank position,
    // not from external scraping or credit-burning APIs.
    let maxRate = estimateTrafficFromRank(1).rate; // Google's estimated rate

    const updates = sites.map((site: any) => {
      const { rate, monthlyVisits } = estimateTrafficFromRank(site.rank);
      const prettyBaseline = formatBaseline(monthlyVisits);

      if (site.rank === 1) {
        maxRate = rate;
      }

      return {
        id: site.id,
        rate,
        baseline: prettyBaseline,
        progress: 0,
        rank: site.rank,
        keywords: keKeywordsMap[site.id] || null
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

    // 7. Calculate & bulk-insert 6 hourly points (matching the 6-hour cron cadence)
    // Each run covers the 6 hours since the last execution.
    const HISTORY_HOURS = 6;
    const historyInsertions: any[] = [];
    const now = new Date();

    for (let h = 0; h < HISTORY_HOURS; h++) {
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

    // 7b. Persist rank_history for sparkline tracking (keep last 7 entries per site)
    const rankHistoryUpdates = sites.map((site: any) => {
      const existingHistory: { rank: number; date: string }[] = Array.isArray(site.rank_history) ? site.rank_history : [];
      const todayStr = now.toISOString().split('T')[0];
      // Skip if we already have an entry for today
      if (existingHistory.some((h: any) => h.date === todayStr)) return null;
      const updated = [...existingHistory.slice(-6), { rank: site.rank, date: todayStr }];
      return supabase.from('sites').update({ rank_history: updated }).eq('id', site.id);
    }).filter(Boolean);

    if (rankHistoryUpdates.length > 0) {
      for (let i = 0; i < rankHistoryUpdates.length; i += 20) {
        await Promise.all(rankHistoryUpdates.slice(i, i + 20));
      }
      console.log(`Unified Cron: Updated rank_history for ${rankHistoryUpdates.length} sites.`);
    }

    // 7c. Weekly snapshot for data-driven reports (runs once per week on Monday)
    const dayOfWeek = now.getUTCDay(); // 0=Sun, 1=Mon
    if (dayOfWeek === 1) {
      try {
        // Compute ISO week slug
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNum = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        const weekSlug = `${d.getUTCFullYear()}-w${String(weekNum).padStart(2, '0')}`;

        // Check if snapshot already exists for this week
        const { data: existingSnapshot } = await supabase
          .from('weekly_snapshots')
          .select('id')
          .eq('week_slug', weekSlug)
          .single();

        if (!existingSnapshot) {
          // Build site summaries for the snapshot
          const sitesSnapshot = sites.map((site: any) => {
            const upd = finalUpdates.find((u: any) => u.id === site.id);
            return {
              id: site.id,
              name: site.name,
              url: site.url,
              rank: site.rank,
              rate: upd?.rate ?? site.rate,
              baseline: upd?.baseline ?? site.baseline,
              category: site.category,
              color: site.color,
              logo: site.logo,
              keywords: upd?.keywords ?? site.keywords ?? null,
            };
          });

          // Pre-compute category totals
          const categoryTotals: Record<string, { count: number; totalRate: number }> = {};
          sitesSnapshot.forEach((s: any) => {
            if (!categoryTotals[s.category]) categoryTotals[s.category] = { count: 0, totalRate: 0 };
            categoryTotals[s.category].count++;
            categoryTotals[s.category].totalRate += s.rate;
          });

          const totalRate = sitesSnapshot.reduce((sum: number, s: any) => sum + s.rate, 0);

          // Count outages from marquee (if available)
          let outageCount = 0;
          try {
            const baseUrl = process.env.VERCEL_URL
              ? `https://${process.env.VERCEL_URL}`
              : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
            const outageRes = await fetch(`${baseUrl}/api/marquee`, { signal: AbortSignal.timeout(5000) });
            if (outageRes.ok) {
              const marqueeData = await outageRes.json();
              if (Array.isArray(marqueeData)) {
                outageCount = marqueeData.filter((m: any) => m.type === 'outage').length;
              }
            }
          } catch { /* non-critical */ }

          const mondayDate = new Date(now);
          const diff = mondayDate.getUTCDate() - (mondayDate.getUTCDay() || 7) + 1;
          mondayDate.setUTCDate(diff);
          mondayDate.setUTCHours(0, 0, 0, 0);

          // Fetch previous week's snapshot for AI analysis comparison
          const prevMondayDate = new Date(mondayDate);
          prevMondayDate.setDate(prevMondayDate.getDate() - 7);
          const prevD = new Date(Date.UTC(prevMondayDate.getFullYear(), prevMondayDate.getMonth(), prevMondayDate.getDate()));
          const prevDayNum = prevD.getUTCDay() || 7;
          prevD.setUTCDate(prevD.getUTCDate() + 4 - prevDayNum);
          const prevYearStart = new Date(Date.UTC(prevD.getUTCFullYear(), 0, 1));
          const prevWeekNum = Math.ceil((((prevD.getTime() - prevYearStart.getTime()) / 86400000) + 1) / 7);
          const prevWeekSlug = `${prevD.getUTCFullYear()}-w${String(prevWeekNum).padStart(2, '0')}`;

          let prevSnapshot: any = null;
          try {
            const { data: prevData } = await supabase
              .from('weekly_snapshots')
              .select('sites_data, category_totals, total_rate')
              .eq('week_slug', prevWeekSlug)
              .single();
            prevSnapshot = prevData;
          } catch { /* no previous snapshot */ }

          // Generate AI-powered editorial stories via Groq
          let aiStories = null;
          try {
            aiStories = await generateAIStories({
              weekSlug,
              totalRate,
              outageCount,
              sites: sitesSnapshot,
              categoryTotals,
              prevTotalRate: prevSnapshot?.total_rate,
              prevSites: prevSnapshot?.sites_data,
              prevCategoryTotals: prevSnapshot?.category_totals,
            });
            if (aiStories) {
              console.log(`Unified Cron: Groq generated ${aiStories.length} AI stories for ${weekSlug}.`);
            }
          } catch (aiErr) {
            console.warn('Unified Cron: AI story generation failed:', aiErr);
          }

          const { error: snapError } = await supabase
            .from('weekly_snapshots')
            .insert({
              week_slug: weekSlug,
              snapshot_date: mondayDate.toISOString(),
              sites_data: sitesSnapshot,
              category_totals: categoryTotals,
              total_rate: totalRate,
              outage_count: outageCount,
              ai_stories: aiStories,
            });

          if (snapError) {
            console.error('Unified Cron: Failed to create weekly snapshot:', snapError);
          } else {
            console.log(`Unified Cron: Created weekly snapshot for ${weekSlug} (${sitesSnapshot.length} sites, ${totalRate} total rate${aiStories ? ', AI stories included' : ''}).`);
          }
        }
      } catch (snapErr) {
        console.warn('Unified Cron: Weekly snapshot generation failed:', snapErr);
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
      message: `Pro cron completed: enriched ${sites.length} sites, ${historyInsertions.length} history points (${HISTORY_HOURS}h cadence)`,
      enrichedCount: sites.length,
      historyNodesAddedCount: historyInsertions.length,
      historyNodesDeletedCount: deletedCount || 0
    });

  } catch (error: any) {
    console.error('Unified Cron Ingestion Exception:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
