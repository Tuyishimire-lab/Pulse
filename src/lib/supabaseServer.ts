import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env';

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', false);
const supabaseServiceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY', false);

export const isServerSupabaseConfigured = Boolean(supabaseUrl && supabaseServiceKey);

export const supabaseAdmin = isServerSupabaseConfigured
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;
