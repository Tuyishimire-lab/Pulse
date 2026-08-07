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

/**
 * Main entry point. Returns a ComparePair or null if either site ID is invalid.
 *
 * Cache hit:  Supabase read only — no Groq call.
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

      if (cached) {
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
      // Cache miss — continue to generation
    }
  }

  // 2. Fetch both sites from Supabase
  const pair = await fetchSitePair(siteAId, siteBId);
  if (!pair) return null;

  // 3. Call Groq for verdict + FAQs
  const generated = await callGroqForPair(pair.siteA, pair.siteB);

  const verdict =
    generated?.verdict ??
    `${pair.siteA.name} currently ranks #${pair.siteA.rank} with ${pair.siteA.baseline} monthly visits, compared to ${pair.siteB.name} at #${pair.siteB.rank} with ${pair.siteB.baseline} monthly visits.`;

  const context =
    generated?.context ??
    `A traffic comparison between ${pair.siteA.name} and ${pair.siteB.name}.`;

  const faq: { q: string; a: string }[] =
    generated?.faq ??
    [
      {
        q: `Which gets more traffic, ${pair.siteA.name} or ${pair.siteB.name}?`,
        a: `${pair.siteA.name} receives ${pair.siteA.baseline} monthly visits (rank #${pair.siteA.rank}), while ${pair.siteB.name} receives ${pair.siteB.baseline} (rank #${pair.siteB.rank}).`,
      },
    ];

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
      // Non-fatal — page still renders even if cache write fails
    }
  }

  return { slug, siteAId, siteBId, verdict, context, faq };
}
