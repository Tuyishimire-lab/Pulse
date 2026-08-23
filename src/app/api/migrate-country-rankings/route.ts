import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { error: checkError } = await supabase.from('country_rankings').select('cf_code').limit(1);
  if (!checkError) {
    return NextResponse.json({ ok: true, message: 'country_rankings table already exists' });
  }
  return NextResponse.json({
    ok: false,
    message: 'Table missing. Run this SQL in the Supabase SQL Editor:',
    sql: "CREATE TABLE IF NOT EXISTS public.country_rankings (cf_code TEXT PRIMARY KEY, site_ids TEXT[] NOT NULL DEFAULT '{}', source TEXT NOT NULL DEFAULT 'radar', updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()); ALTER TABLE public.country_rankings ENABLE ROW LEVEL SECURITY; CREATE POLICY \"service_role_all\" ON public.country_rankings FOR ALL USING (true);"
  }, { status: 400 });
}
