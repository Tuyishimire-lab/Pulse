import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get('id');

  if (!siteId) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const sb = createClient(supabaseUrl, supabaseKey);

  // Fetch all three enrichment tables in parallel
  const [webVitalsRes, wikiRes, securityRes] = await Promise.allSettled([
    sb.from('site_webvitals').select('*').eq('site_id', siteId).maybeSingle(),
    sb.from('site_wiki_views').select('*').eq('site_id', siteId).maybeSingle(),
    sb.from('site_security').select('*').eq('site_id', siteId).maybeSingle(),
  ]);

  const webVitals = webVitalsRes.status === 'fulfilled' ? webVitalsRes.value.data : null;
  const wikiViews = wikiRes.status === 'fulfilled' ? wikiRes.value.data : null;
  const security = securityRes.status === 'fulfilled' ? securityRes.value.data : null;

  return NextResponse.json(
    { webVitals, wikiViews, security },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    },
  );
}
