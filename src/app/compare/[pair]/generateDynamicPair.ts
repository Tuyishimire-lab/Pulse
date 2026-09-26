/**
 * generateDynamicPair.ts
 *
 * Generates a ComparePair for any two valid site IDs not already in pairs.ts.
 *
 * Optimization strategy (avoids redundant Groq API calls):
 *   1. Check `compare_cache` Supabase table first.
 *   2. If a cached row exists → return it immediately (zero Groq calls).
 *   3. If not → call Groq to generate verdict + 3 FAQs.
 *   4. Store the result in `compare_cache` so future builds/requests use the cache.
 *
 * Groq is called AT MOST ONCE per pair, ever.
 * The cache lives in Supabase, so it survives deploys and cold starts.
 */

import { createClient } from '@supabase/supabase-js';
import { ComparePair } from '../data/pairs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  '';

const groqApiKey = process.env.GROQ_API_KEY || '';

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

interface SiteBasic {
  id: string;
  name: string;
  baseline: string;
  rank: number;
  category: string;
}

/**
 * Calls Groq to generate a verdict, context, and 3 FAQ items for a site pair.
 * Uses llama-3.3-70b-versatile for speed and cost efficiency.
 * Batches all 3 outputs in a single API call.
 */
async function callGroqForPair(
  siteA: SiteBasic,
  siteB: SiteBasic,
): Promise<{ verdict: string; context: string; faq: { q: string; a: string }[] } | null> {
  if (!groqApiKey) return null;

  const prompt = `You are a web traffic analyst. Generate a concise, factual comparison for the following two websites.

Site A: ${siteA.name} (rank #${siteA.rank}, ${siteA.baseline} monthly visits, category: ${siteA.category})
Site B: ${siteB.name} (rank #${siteB.rank}, ${siteB.baseline} monthly visits, category: ${siteB.category})

Return ONLY valid JSON with this exact structure (no markdown, no extra text):
{
  "verdict": "2-3 sentence verdict on which site has more traffic and why",
  "context": "1 sentence neutral context describing the nature of this comparison",
  "faq": [
    { "q": "question 1", "a": "answer 1 (2-3 sentences)" },
    { "q": "question 2", "a": "answer 2 (2-3 sentences)" },
    { "q": "question 3", "a": "answer 3 (2-3 sentences)" }
  ]
}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    if (!parsed.verdict || !parsed.context || !Array.isArray(parsed.faq)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Fetches both sites from Supabase by ID.
 * Returns null if either site doesn't exist.
 */
async function fetchSitePair(
  siteAId: string,
  siteBId: string,
): Promise<{ siteA: SiteBasic; siteB: SiteBasic } | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('sites')
      .select('id, name, baseline, rank, category')
      .in('id', [siteAId, siteBId]);

    if (error || !data || data.length < 2) return null;
    const a = data.find((s) => s.id === siteAId);
    const b = data.find((s) => s.id === siteBId);
    if (!a || !b) return null;
    return { siteA: a, siteB: b };
  } catch {
    return null;
  }
}

function parseTrafficBaseline(baseline: string): number {
  if (!baseline) return 0;
  const m = baseline.match(/([\d.]+)\s*([BMK]?)/i);
  if (!m) return 0;
  let val = parseFloat(m[1]);
  const unit = m[2]?.toUpperCase();
  if (unit === 'B') val *= 1e9;
  else if (unit === 'M') val *= 1e6;
  else if (unit === 'K') val *= 1e3;
  return val;
}

function isBasicFallbackVerdict(v?: string | null): boolean {
  if (!v) return true;
  return /currently ranks #\d+ with .* monthly visits, compared to .* at #\d+/i.test(v);
}

function synthesizeAnalyticalVerdict(siteA: SiteBasic, siteB: SiteBasic): string {
  const valA = parseTrafficBaseline(siteA.baseline);
  const valB = parseTrafficBaseline(siteB.baseline);
  const leader = valA >= valB ? siteA : siteB;
  const trailing = valA >= valB ? siteB : siteA;
  const maxV = Math.max(valA, valB);
  const minV = Math.max(1, Math.min(valA, valB));
  const ratio = Number((maxV / minV).toFixed(1));
  const rankDelta = Math.abs(siteA.rank - siteB.rank);

  let primary = '';
  if (ratio >= 2.0) {
    primary = `${leader.name} commands a decisive ${ratio}x traffic lead over ${trailing.name}, registering approximately ${leader.baseline} monthly visits compared to ${trailing.baseline}.`;
  } else if (ratio >= 1.15) {
    primary = `${leader.name} holds a clear traffic advantage over ${trailing.name} (${leader.baseline} vs ${trailing.baseline} monthly visits), capturing roughly ${ratio}x higher volume.`;
  } else {
    primary = `${leader.name} and ${trailing.name} operate in close traffic parity (${leader.baseline} vs ${trailing.baseline} monthly visits), separated by only a slight volume margin.`;
  }

  const rankPart = rankDelta > 0
    ? ` On global rankings, ${leader.name} holds position #${leader.rank} while ${trailing.name} sits at #${trailing.rank} (${rankDelta} positions spread).`
    : '';

  const catPart = siteA.category === siteB.category
    ? ` Within the ${leader.category} space, ${leader.name} captures the primary share of audience reach and visitor velocity.`
    : ` Comparing ${leader.name}'s ${leader.category} platform with ${trailing.name}'s ${trailing.category} footprint, ${leader.name} demonstrates wider digital reach.`;

  return `${primary}${rankPart}${catPart}`;
}

function synthesizeAnalyticalContext(siteA: SiteBasic, siteB: SiteBasic): string {
  if (siteA.category === siteB.category) {
    return `Head-to-head digital audience and engagement benchmark within the global ${siteA.category} sector.`;
  }
  return `Cross-sector digital audience and traffic velocity comparison between ${siteA.name} (${siteA.category}) and ${siteB.name} (${siteB.category}).`;
}

function synthesizeAnalyticalFaq(siteA: SiteBasic, siteB: SiteBasic): { q: string; a: string }[] {
  const valA = parseTrafficBaseline(siteA.baseline);
  const valB = parseTrafficBaseline(siteB.baseline);
  const leader = valA >= valB ? siteA : siteB;
  const trailing = valA >= valB ? siteB : siteA;
  const maxV = Math.max(valA, valB);
  const minV = Math.max(1, Math.min(valA, valB));
  const ratio = Number((maxV / minV).toFixed(1));

  return [
    {
      q: `Which platform receives more monthly visits, ${siteA.name} or ${siteB.name}?`,
      a: `${leader.name} leads in web traffic with approximately ${leader.baseline} monthly visits compared to ${trailing.baseline} for ${trailing.name} (a ${ratio}x volume ratio).`,
    },
    {
      q: `How do the global ranks of ${siteA.name} and ${siteB.name} compare?`,
      a: `${leader.name} ranks #${leader.rank} globally while ${trailing.name} ranks #${trailing.rank}, representing a difference of ${Math.abs(siteA.rank - siteB.rank)} positions.`,
    },
    {
      q: `What are the primary operational categories for ${siteA.name} and ${siteB.name}?`,
      a: `${siteA.name} is categorized under ${siteA.category}, whereas ${siteB.name} operates in the ${siteB.category} space. Both maintain distinct digital audience footprints.`,
    },
  ];
}

/**
 * Main entry point. Returns a ComparePair or null if either site ID is invalid.
 *
 * Cache hit:  Supabase read only - no Groq call.
 * Cache miss: Supabase read + 1 Groq call + Supabase write.
 */
export async function generateDynamicPair(
  siteAId: string,
  siteBId: string,
): Promise<ComparePair | null> {
  const slug = `${siteAId}-vs-${siteBId}`;
  const sb = getSupabase();

  // 1. Check Supabase cache
  if (sb) {
    try {
      const { data: cached } = await sb
        .from('compare_cache')
        .select('pair_slug, site_a_id, site_b_id, verdict, context, faq')
        .eq('pair_slug', slug)
        .single();

      if (cached && !isBasicFallbackVerdict(cached.verdict)) {
        return {
          slug: cached.pair_slug,
          siteAId: cached.site_a_id,
          siteBId: cached.site_b_id,
          verdict: cached.verdict,
          context: cached.context,
          faq: cached.faq as { q: string; a: string }[],
        };
      }
    } catch {
      // Cache miss - continue to generation
    }
  }

  // 2. Fetch both sites from Supabase
  const pair = await fetchSitePair(siteAId, siteBId);
  if (!pair) return null;

  // 3. Call Groq for verdict + FAQs (if configured) or use intelligent synthesis
  const generated = await callGroqForPair(pair.siteA, pair.siteB);

  const verdict =
    generated?.verdict ?? synthesizeAnalyticalVerdict(pair.siteA, pair.siteB);

  const context =
    generated?.context ?? synthesizeAnalyticalContext(pair.siteA, pair.siteB);

  const faq: { q: string; a: string }[] =
    generated?.faq ?? synthesizeAnalyticalFaq(pair.siteA, pair.siteB);

  // 4. Store in Supabase cache for all future builds/requests
  if (sb) {
    try {
      await sb.from('compare_cache').upsert(
        {
          pair_slug: slug,
          site_a_id: siteAId,
          site_b_id: siteBId,
          verdict,
          context,
          faq,
          generated_at: new Date().toISOString(),
        },
        { onConflict: 'pair_slug' },
      );
    } catch {
      // Non-fatal - page still renders even if cache write fails
    }
  }

  return { slug, siteAId, siteBId, verdict, context, faq };
}
