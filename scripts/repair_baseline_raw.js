/**
 * repair_baseline_raw.js
 *
 * Scans all rows in the Supabase 'sites' table and repairs any
 * stale or desynchronized 'baseline_raw' values to match 'baseline'.
 */

process.loadEnvFile('.env.local');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing in environment.');
  process.exit(1);
}

const sb = createClient(supabaseUrl, supabaseKey);

function parseTraffic(str) {
  if (!str) return 0;
  const match = str.replace(/,/g, '').trim().match(/^([0-9.]+)\s*([BKMGT])?/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  if (isNaN(num)) return 0;
  const unit = (match[2] || '').toUpperCase();
  const mults = {
    T: 1_000_000_000_000,
    B: 1_000_000_000,
    M: 1_000_000,
    K: 1_000,
  };
  return Math.round(num * (mults[unit] ?? 1));
}

async function run() {
  console.log('Fetching all sites from Supabase...');
  const { data: sites, error } = await sb
    .from('sites')
    .select('id, name, baseline, baseline_raw');

  if (error || !sites) {
    console.error('Failed to fetch sites:', error);
    process.exit(1);
  }

  console.log(`Found ${sites.length} sites in Supabase.`);
  let fixedCount = 0;

  for (const site of sites) {
    const expectedRaw = parseTraffic(site.baseline);
    if (expectedRaw > 0 && site.baseline_raw !== expectedRaw) {
      console.log(
        `Fixing ${site.id} (${site.name}): current baseline_raw=${site.baseline_raw} -> new=${expectedRaw} (baseline: "${site.baseline}")`
      );
      const { error: updateErr } = await sb
        .from('sites')
        .update({ baseline_raw: expectedRaw })
        .eq('id', site.id);

      if (updateErr) {
        console.error(`Error updating ${site.id}:`, updateErr);
      } else {
        fixedCount++;
      }
    }
  }

  console.log(`\nRepair completed: ${fixedCount} sites updated.`);

  // Verify BBC and NY Times specifically
  const { data: check } = await sb
    .from('sites')
    .select('id, name, rank, rate, baseline, baseline_raw')
    .in('id', ['bbc', 'nytimes']);

  console.log('\nVerification of bbc & nytimes in Supabase:');
  console.log(JSON.stringify(check, null, 2));
}

run();
