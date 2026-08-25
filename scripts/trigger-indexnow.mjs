import { SITES, CATEGORIES } from '../src/app/data/sites.ts';
import { COUNTRY_SLUGS } from '../src/app/top-sites/data/countries.ts';
import { getAllCompareSlugs } from '../src/app/compare/data/pairs.ts';

const API_KEY = '14eac490de1941d88e198247a1246901';
const HOST = 'www.pulstraffic.com';
const BASE_URL = `https://${HOST}`;
const KEY_LOCATION = `${BASE_URL}/${API_KEY}.txt`;

async function main() {
  console.log(`[IndexNow] Checking key file at ${KEY_LOCATION}...`);
  try {
    const keyCheck = await fetch(KEY_LOCATION, { signal: AbortSignal.timeout(6000) });
    if (keyCheck.ok) {
      const text = (await keyCheck.text()).trim();
      console.log(`[IndexNow] Key file online: status=${keyCheck.status}, content="${text}"`);
    } else {
      console.log(`[IndexNow] Key file returned HTTP ${keyCheck.status} (Vercel deployment may still be building). Proceeding with submission...`);
    }
  } catch (err) {
    console.log(`[IndexNow] Note: Could not pre-fetch key file (${err.message}). Proceeding...`);
  }

  // Gather all URLs
  const urlSet = new Set();

  // Core pages
  urlSet.add(BASE_URL);
  urlSet.add(`${BASE_URL}/trending`);
  urlSet.add(`${BASE_URL}/top-sites`);
  urlSet.add(`${BASE_URL}/map`);
  urlSet.add(`${BASE_URL}/compare`);
  urlSet.add(`${BASE_URL}/category`);
  urlSet.add(`${BASE_URL}/methodology`);
  urlSet.add(`${BASE_URL}/about`);
  urlSet.add(`${BASE_URL}/privacy`);
  urlSet.add(`${BASE_URL}/terms`);

  // Categories
  CATEGORIES.forEach(c => urlSet.add(`${BASE_URL}/category/${c.id}`));

  // Countries
  COUNTRY_SLUGS.forEach(slug => urlSet.add(`${BASE_URL}/top-sites/${slug}`));

  // Compare pages
  const compareSlugs = getAllCompareSlugs();
  compareSlugs.forEach(slug => urlSet.add(`${BASE_URL}/compare/${slug}`));

  // Site pages
  SITES.forEach(s => urlSet.add(`${BASE_URL}/sites/${s.id}`));

  const urls = Array.from(urlSet);
  console.log(`[IndexNow] Prepared ${urls.length} unique URLs to submit.`);

  const payload = {
    host: HOST,
    key: API_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  const endpoints = [
    { name: 'IndexNow Central', url: 'https://api.indexnow.org/indexnow' },
    { name: 'Microsoft Bing', url: 'https://www.bing.com/indexnow' },
    { name: 'Yandex', url: 'https://yandex.com/indexnow' },
  ];

  for (const ep of endpoints) {
    try {
      console.log(`\n[IndexNow] Submitting ${urls.length} URLs to ${ep.name} (${ep.url})...`);
      const res = await fetch(ep.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });

      const responseText = await res.text();
      console.log(`[IndexNow] ${ep.name} Response: HTTP ${res.status} (${res.statusText})`);
      if (responseText) {
        console.log(`  Body: ${responseText}`);
      }

      if (res.status === 200 || res.status === 202) {
        console.log(`  ✅ SUCCESS: ${ep.name} accepted ${urls.length} URLs for instant indexing!`);
      } else {
        console.log(`  ⚠️ Status details: ${res.status} - check if key file has finished deploying.`);
      }
    } catch (err) {
      console.error(`  ❌ Error submitting to ${ep.name}:`, err.message);
    }
  }

  console.log('\n[IndexNow] Batch trigger complete.');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
