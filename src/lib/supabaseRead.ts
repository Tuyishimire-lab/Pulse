import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env';

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL', false);
const supabaseAnonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', false) || getEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', false);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
