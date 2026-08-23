/**
 * Groq AI Analysis Utility
 *
 * Generates editorial-quality weekly report narratives using Groq's
 * fast inference API (Llama 3). Called once per week during the cron
 * snapshot to produce 3 data-driven stories.
 *
 * Free tier friendly: single call per week, ~500 token output.
 */

interface SiteSnapshot {
  id: string;
  name: string;
  rank: number;
  rate: number;
  baseline: string;
  category: string;
}

interface CategoryTotal {
  count: number;
  totalRate: number;
}

interface AnalysisInput {
  weekSlug: string;
  totalRate: number;
  outageCount: number;
  sites: SiteSnapshot[];
  categoryTotals: Record<string, CategoryTotal>;
  // Previous week data (if available)
  prevTotalRate?: number;
  prevSites?: SiteSnapshot[];
  prevCategoryTotals?: Record<string, CategoryTotal>;
}

export interface AIStory {
  title: string;
  summary: string;
  tag: string;
  tagColor: string;
}

const TAG_COLORS: Record<string, string> = {
  'AI': '#10a37f',
  'Social': '#E1306C',
  'Search': '#4285F4',
  'E-Commerce': '#ff9900',
  'Entertainment': '#e50914',
  'Dev Tools': '#24292f',
  'Finance': '#f3ba2f',
  'News': '#ae251f',
  'Traffic': '#82c8e5',
  'Outage': '#ef4444',
  'Growth': '#4ade80',
  'Trend': '#a78bfa',
};

/**
 * Call Groq API to generate 3 editorial stories from the weekly data.
 * Returns null on any failure - caller should fall back to template stories.
 */
export async function generateAIStories(input: AnalysisInput): Promise<AIStory[] | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    // Build a compact data summary for the prompt
    const top10 = input.sites.slice(0, 10);
    const topSitesSummary = top10.map((s) =>
      `#${s.rank} ${s.name} (${s.category}) - ${s.baseline}, ${s.rate}/s`
    ).join('\n');

    const categorySummary = Object.entries(input.categoryTotals)
      .sort((a, b) => b[1].totalRate - a[1].totalRate)
      .map(([cat, v]) => {
        const prevRate = input.prevCategoryTotals?.[cat]?.totalRate;
        const change = prevRate ? (((v.totalRate - prevRate) / prevRate) * 100).toFixed(1) : 'N/A';
        return `${cat}: ${v.count} sites, ${v.totalRate}/s total (${change}% vs last week)`;
      })
      .join('\n');

    // Compute top movers if we have previous data
    let moversSummary = 'No previous week data available.';
    if (input.prevSites) {
      const prevMap = new Map(input.prevSites.map((s) => [s.id, s]));
      const movers = input.sites
        .map((s) => {
          const prev = prevMap.get(s.id);
          return { name: s.name, category: s.category, rankChange: prev ? prev.rank - s.rank : 0, baseline: s.baseline };
        })
        .filter((m) => m.rankChange !== 0)
        .sort((a, b) => b.rankChange - a.rankChange);

      const top3Up = movers.slice(0, 3).map((m) => `${m.name} (+${m.rankChange} positions, ${m.baseline})`);
      const top3Down = movers.slice(-3).reverse().map((m) => `${m.name} (${m.rankChange} positions, ${m.baseline})`);
      moversSummary = `Biggest climbers: ${top3Up.join(', ')}. Biggest drops: ${top3Down.join(', ')}.`;
    }

    const trafficChange = input.prevTotalRate
      ? `${(((input.totalRate - input.prevTotalRate) / input.prevTotalRate) * 100).toFixed(2)}%`
      : 'N/A';

    const prompt = `You are a data journalist writing for Pulse, a real-time internet traffic analytics platform. Write exactly 3 short news stories based on the following weekly data snapshot.

WEEK: ${input.weekSlug}
TOTAL TRAFFIC: ${input.totalRate.toLocaleString()} requests/second (${trafficChange} vs last week)
OUTAGES DETECTED: ${input.outageCount}

TOP 10 SITES:
${topSitesSummary}

CATEGORY BREAKDOWN:
${categorySummary}

MOVERS:
${moversSummary}

RULES:
- Each story needs: title (max 10 words), summary (2-3 sentences, max 60 words), tag (one of: AI, Social, Search, E-Commerce, Entertainment, Dev Tools, Finance, News, Traffic, Outage, Growth, Trend)
- Be factual - only reference data provided above. Do not invent statistics.
- Write in a professional but engaging tone. No clickbait.
- Focus on the most interesting patterns: category growth, rank shifts, traffic milestones.
- If outages > 0, make one story about outages.

Respond ONLY with valid JSON array, no markdown, no explanation:
[{"title":"...","summary":"...","tag":"..."},{"title":"...","summary":"...","tag":"..."},{"title":"...","summary":"...","tag":"..."}]`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 600,
        stream: false,
      }),
      signal: AbortSignal.timeout(15000), // 15s timeout
    });

    if (!response.ok) {
      console.warn(`Groq API returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    // Parse the JSON response
    const stories: { title: string; summary: string; tag: string }[] = JSON.parse(content);
    if (!Array.isArray(stories) || stories.length === 0) return null;

    // Add tag colors and validate
    return stories.slice(0, 3).map((story) => ({
      title: story.title || 'Weekly Insight',
      summary: story.summary || '',
      tag: story.tag || 'Trend',
      tagColor: TAG_COLORS[story.tag] || '#82c8e5',
    }));
  } catch (err) {
    console.warn('Groq AI analysis failed:', err);
    return null;
  }
}
