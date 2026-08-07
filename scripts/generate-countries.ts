/**
 * scripts/generate-countries.ts
 *
 * Generates src/app/top-sites/data/countries.generated.ts
 *
 * Data sources:
 *   - World Bank API  → internet users count + penetration %
 *   - Groq (llama-3.3-70b-versatile) → insight + localNote per country
 *
 * Groq optimization:
 *   - Batches 25 countries per API call (~8 total calls for 195 countries)
 *   - Writes partial results after each batch so re-runs are incremental
 *   - Already-generated countries (from existing file) are skipped
 *
 * Usage:
 *   npx tsx scripts/generate-countries.ts
 *
 * Requires: GROQ_API_KEY in .env.local
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT, 'src/app/top-sites/data/countries.generated.ts');
const PARTIAL_CACHE = path.join(ROOT, 'scripts/.countries-cache.json');

// Load env from .env.local
function loadEnv() {
  const envPath = path.join(ROOT, '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

if (!GROQ_API_KEY) {
  console.error('[generate-countries] GROQ_API_KEY not found in .env.local');
  process.exit(1);
}

// ── Hand-crafted slugs to skip (already in countries.ts) ─────────────────────
const HANDCRAFTED_SLUGS = new Set([
  'united-states', 'india', 'brazil', 'united-kingdom', 'germany',
  'france', 'japan', 'canada', 'australia', 'mexico', 'south-korea',
  'indonesia', 'nigeria', 'argentina', 'spain', 'italy', 'netherlands',
  'sweden', 'poland', 'singapore', 'south-africa', 'turkey', 'philippines', 'vietnam',
]);

// ── All countries with Cloudflare Radar coverage ─────────────────────────────
// ISO 3166-1 alpha-2 → { name, slug }
const ALL_COUNTRIES: { code: string; name: string; slug: string }[] = [
  { code: 'AF', name: 'Afghanistan', slug: 'afghanistan' },
  { code: 'AL', name: 'Albania', slug: 'albania' },
  { code: 'DZ', name: 'Algeria', slug: 'algeria' },
  { code: 'AO', name: 'Angola', slug: 'angola' },
  { code: 'AM', name: 'Armenia', slug: 'armenia' },
  { code: 'AT', name: 'Austria', slug: 'austria' },
  { code: 'AZ', name: 'Azerbaijan', slug: 'azerbaijan' },
  { code: 'BH', name: 'Bahrain', slug: 'bahrain' },
  { code: 'BD', name: 'Bangladesh', slug: 'bangladesh' },
  { code: 'BY', name: 'Belarus', slug: 'belarus' },
  { code: 'BE', name: 'Belgium', slug: 'belgium' },
  { code: 'BO', name: 'Bolivia', slug: 'bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina', slug: 'bosnia-and-herzegovina' },
  { code: 'BW', name: 'Botswana', slug: 'botswana' },
  { code: 'BG', name: 'Bulgaria', slug: 'bulgaria' },
  { code: 'CM', name: 'Cameroon', slug: 'cameroon' },
  { code: 'CL', name: 'Chile', slug: 'chile' },
  { code: 'CN', name: 'China', slug: 'china' },
  { code: 'CO', name: 'Colombia', slug: 'colombia' },
  { code: 'CD', name: 'DR Congo', slug: 'dr-congo' },
  { code: 'CR', name: 'Costa Rica', slug: 'costa-rica' },
  { code: 'CI', name: "Côte d'Ivoire", slug: 'cote-divoire' },
  { code: 'HR', name: 'Croatia', slug: 'croatia' },
  { code: 'CZ', name: 'Czech Republic', slug: 'czech-republic' },
  { code: 'DK', name: 'Denmark', slug: 'denmark' },
  { code: 'DO', name: 'Dominican Republic', slug: 'dominican-republic' },
  { code: 'EC', name: 'Ecuador', slug: 'ecuador' },
  { code: 'EG', name: 'Egypt', slug: 'egypt' },
  { code: 'ET', name: 'Ethiopia', slug: 'ethiopia' },
  { code: 'FI', name: 'Finland', slug: 'finland' },
  { code: 'GE', name: 'Georgia', slug: 'georgia' },
  { code: 'GH', name: 'Ghana', slug: 'ghana' },
  { code: 'GR', name: 'Greece', slug: 'greece' },
  { code: 'GT', name: 'Guatemala', slug: 'guatemala' },
  { code: 'HN', name: 'Honduras', slug: 'honduras' },
  { code: 'HU', name: 'Hungary', slug: 'hungary' },
  { code: 'IN', name: 'India', slug: 'india' }, // skip — hand-crafted
  { code: 'IR', name: 'Iran', slug: 'iran' },
  { code: 'IQ', name: 'Iraq', slug: 'iraq' },
  { code: 'IE', name: 'Ireland', slug: 'ireland' },
  { code: 'IL', name: 'Israel', slug: 'israel' },
  { code: 'JO', name: 'Jordan', slug: 'jordan' },
  { code: 'KZ', name: 'Kazakhstan', slug: 'kazakhstan' },
  { code: 'KE', name: 'Kenya', slug: 'kenya' },
  { code: 'KW', name: 'Kuwait', slug: 'kuwait' },
  { code: 'LB', name: 'Lebanon', slug: 'lebanon' },
  { code: 'LY', name: 'Libya', slug: 'libya' },
  { code: 'LT', name: 'Lithuania', slug: 'lithuania' },
  { code: 'MY', name: 'Malaysia', slug: 'malaysia' },
  { code: 'ML', name: 'Mali', slug: 'mali' },
  { code: 'MA', name: 'Morocco', slug: 'morocco' },
  { code: 'MZ', name: 'Mozambique', slug: 'mozambique' },
  { code: 'MM', name: 'Myanmar', slug: 'myanmar' },
  { code: 'NP', name: 'Nepal', slug: 'nepal' },
  { code: 'NZ', name: 'New Zealand', slug: 'new-zealand' },
  { code: 'NI', name: 'Nicaragua', slug: 'nicaragua' },
  { code: 'NO', name: 'Norway', slug: 'norway' },
  { code: 'OM', name: 'Oman', slug: 'oman' },
  { code: 'PK', name: 'Pakistan', slug: 'pakistan' },
  { code: 'PS', name: 'Palestine', slug: 'palestine' },
  { code: 'PA', name: 'Panama', slug: 'panama' },
  { code: 'PY', name: 'Paraguay', slug: 'paraguay' },
  { code: 'PE', name: 'Peru', slug: 'peru' },
  { code: 'PT', name: 'Portugal', slug: 'portugal' },
  { code: 'PR', name: 'Puerto Rico', slug: 'puerto-rico' },
  { code: 'QA', name: 'Qatar', slug: 'qatar' },
  { code: 'RO', name: 'Romania', slug: 'romania' },
  { code: 'RU', name: 'Russia', slug: 'russia' },
  { code: 'RW', name: 'Rwanda', slug: 'rwanda' },
  { code: 'SA', name: 'Saudi Arabia', slug: 'saudi-arabia' },
  { code: 'SN', name: 'Senegal', slug: 'senegal' },
  { code: 'RS', name: 'Serbia', slug: 'serbia' },
  { code: 'SK', name: 'Slovakia', slug: 'slovakia' },
  { code: 'SI', name: 'Slovenia', slug: 'slovenia' },
  { code: 'SO', name: 'Somalia', slug: 'somalia' },
  { code: 'LK', name: 'Sri Lanka', slug: 'sri-lanka' },
  { code: 'SD', name: 'Sudan', slug: 'sudan' },
  { code: 'CH', name: 'Switzerland', slug: 'switzerland' },
  { code: 'SY', name: 'Syria', slug: 'syria' },
  { code: 'TW', name: 'Taiwan', slug: 'taiwan' },
  { code: 'TZ', name: 'Tanzania', slug: 'tanzania' },
  { code: 'TH', name: 'Thailand', slug: 'thailand' },
  { code: 'TN', name: 'Tunisia', slug: 'tunisia' },
  { code: 'UG', name: 'Uganda', slug: 'uganda' },
  { code: 'UA', name: 'Ukraine', slug: 'ukraine' },
  { code: 'AE', name: 'United Arab Emirates', slug: 'united-arab-emirates' },
  { code: 'UY', name: 'Uruguay', slug: 'uruguay' },
  { code: 'UZ', name: 'Uzbekistan', slug: 'uzbekistan' },
  { code: 'VE', name: 'Venezuela', slug: 'venezuela' },
  { code: 'YE', name: 'Yemen', slug: 'yemen' },
  { code: 'ZM', name: 'Zambia', slug: 'zambia' },
  { code: 'ZW', name: 'Zimbabwe', slug: 'zimbabwe' },
].filter((c) => !HANDCRAFTED_SLUGS.has(c.slug));

// ── World Bank API ────────────────────────────────────────────────────────────

interface WBStats {
  internetUsersRaw: number | null;
  penetrationPct: number | null;
}

async function fetchWorldBankStats(codes: string[]): Promise<Map<string, WBStats>> {
  const map = new Map<string, WBStats>();
  const codeStr = codes.join(';');

  try {
    // IT.NET.USER.ZS = internet users as % of population
    const pctUrl = `https://api.worldbank.org/v2/country/${codeStr}/indicator/IT.NET.USER.ZS?format=json&mrv=1&per_page=300`;
    const pctRes = await fetch(pctUrl);
    const pctData = await pctRes.json();
    const pctRows: any[] = pctData?.[1] ?? [];
    for (const row of pctRows) {
      if (row.value != null) {
        const entry = map.get(row.country.id) ?? { internetUsersRaw: null, penetrationPct: null };
        entry.penetrationPct = Math.round(row.value);
        map.set(row.country.id, entry);
      }
    }

    // SP.POP.TOTL = total population (to derive user count)
    const popUrl = `https://api.worldbank.org/v2/country/${codeStr}/indicator/SP.POP.TOTL?format=json&mrv=1&per_page=300`;
    const popRes = await fetch(popUrl);
    const popData = await popRes.json();
    const popRows: any[] = popData?.[1] ?? [];
    for (const row of popRows) {
      if (row.value != null) {
        const entry = map.get(row.country.id) ?? { internetUsersRaw: null, penetrationPct: null };
        const pct = entry.penetrationPct ?? 50;
        entry.internetUsersRaw = Math.round((row.value * pct) / 100);
        map.set(row.country.id, entry);
      }
    }
  } catch (e) {
    console.warn('[WB] fetch failed:', e);
  }

  return map;
}

function formatUsers(n: number | null): string {
  if (!n) return 'N/A';
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} billion`;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)} million`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

// ── Groq batch generation ─────────────────────────────────────────────────────

interface GroqCountryOutput {
  slug: string;
  insight: string;
  localNote: string;
}

async function callGroqBatch(
  batch: { name: string; slug: string; internetUsers: string; penetrationPct: number }[],
): Promise<GroqCountryOutput[]> {
  const listStr = batch
    .map((c, i) => `${i + 1}. ${c.name} (slug: "${c.slug}", ~${c.internetUsers} internet users, ${c.penetrationPct}% penetration)`)
    .join('\n');

  const prompt = `You are a digital economy analyst. For each country below, write:
- "insight": 2 factual sentences about internet usage, major platforms, or digital economy trends (use real, specific data where known).
- "localNote": 1 sentence about a platform or behaviour that is notably different from global averages.

Countries:
${listStr}

Return ONLY a JSON array (no markdown, no extra text) with this structure:
[
  { "slug": "country-slug", "insight": "...", "localNote": "..." }
]`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) {
    console.warn(`[Groq] batch failed: ${res.status} ${res.statusText}`);
    return [];
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? '[]';
  try {
    // Groq returns a JSON object with json_object mode — handle both array and wrapped
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    // Sometimes wrapped in a key
    const first = Object.values(parsed)[0];
    if (Array.isArray(first)) return first as GroqCountryOutput[];
    return [];
  } catch {
    return [];
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌍 Pulse Country Generator`);
  console.log(`   Generating ${ALL_COUNTRIES.length} countries (excluding ${HANDCRAFTED_SLUGS.size} hand-crafted)\n`);

  // Load partial cache
  let cache: Record<string, { insight: string; localNote: string }> = {};
  if (fs.existsSync(PARTIAL_CACHE)) {
    try {
      cache = JSON.parse(fs.readFileSync(PARTIAL_CACHE, 'utf-8'));
      console.log(`   Loaded ${Object.keys(cache).length} cached entries from previous run`);
    } catch {}
  }

  // Fetch World Bank stats for all countries
  console.log(`\n[1/3] Fetching World Bank internet stats...`);
  const codes = ALL_COUNTRIES.map((c) => c.code);
  const wbStats = await fetchWorldBankStats(codes);
  console.log(`   Got stats for ${wbStats.size}/${codes.length} countries`);

  // Build country metadata list
  const countriesMeta = ALL_COUNTRIES.map((c) => {
    const wb = wbStats.get(c.code);
    return {
      code: c.code,
      name: c.name,
      slug: c.slug,
      internetUsers: formatUsers(wb?.internetUsersRaw ?? null),
      internetPenetration: wb?.penetrationPct ? `${wb.penetrationPct}%` : 'N/A',
      penetrationPct: wb?.penetrationPct ?? 50,
    };
  });

  // Groq generation — skip already cached
  const toGenerate = countriesMeta.filter((c) => !cache[c.slug]);
  console.log(`\n[2/3] Generating insights via Groq...`);
  console.log(`   ${toGenerate.length} to generate, ${countriesMeta.length - toGenerate.length} already cached`);

  const BATCH_SIZE = 25;
  for (let i = 0; i < toGenerate.length; i += BATCH_SIZE) {
    const batch = toGenerate.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toGenerate.length / BATCH_SIZE);
    process.stdout.write(`   Batch ${batchNum}/${totalBatches} (${batch.map(c => c.name).join(', ').slice(0, 60)}...)  `);

    const results = await callGroqBatch(batch);
    for (const r of results) {
      if (r.slug && r.insight && r.localNote) {
        cache[r.slug] = { insight: r.insight, localNote: r.localNote };
      }
    }

    // Save partial cache after each batch
    fs.writeFileSync(PARTIAL_CACHE, JSON.stringify(cache, null, 2));
    console.log(`✓ (${results.length}/${batch.length} generated)`);

    // Rate limit — wait 500ms between batches
    if (i + BATCH_SIZE < toGenerate.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  // ── Write output file ───────────────────────────────────────────────────────
  console.log(`\n[3/3] Writing output file...`);

  const entries = countriesMeta.map((c) => {
    const groq = cache[c.slug] ?? {
      insight: `${c.name} has approximately ${c.internetUsers} internet users. Digital adoption continues to grow driven by mobile connectivity.`,
      localNote: `Social media and video streaming are the primary internet use cases in ${c.name}.`,
    };

    return `  {
    slug: '${c.slug}',
    name: '${c.name.replace(/'/g, "\\'")}',
    cfCode: '${c.code}',
    internetUsers: '${c.internetUsers}',
    internetPenetration: '${c.internetPenetration}',
    insight: ${JSON.stringify(groq.insight)},
    localNote: ${JSON.stringify(groq.localNote)},
  }`;
  });

  const fileContent = `// AUTO-GENERATED by scripts/generate-countries.ts
// DO NOT EDIT MANUALLY — run \`npx tsx scripts/generate-countries.ts\` to regenerate.
// Hand-crafted entries in countries.ts take priority over these.
// Generated: ${new Date().toISOString()}

import { CountryData } from './countries';

export const GENERATED_COUNTRIES: CountryData[] = [
${entries.join(',\n')}
];
`;

  fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf-8');
  console.log(`   ✓ Written to ${OUTPUT_FILE}`);
  console.log(`   ✓ ${countriesMeta.length} countries generated\n`);
  console.log(`Done! Run your dev server to see all country pages.\n`);
}

main().catch((e) => {
  console.error('[generate-countries] Fatal error:', e);
  process.exit(1);
});
