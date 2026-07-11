import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Validate if it is a valid http/https URL
const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
};

// Create a generic chainable mock client to avoid compile-time/run-time crashes before keys are configured
const createMockClient = () => {
  const chainable = {
    select: () => chainable,
    order: () => chainable,
    eq: () => chainable,
    limit: () => chainable,
    then: (cb: any) => Promise.resolve({ data: null, error: null }).then(cb),
    on: () => chainable,
    subscribe: () => ({})
  };

  return {
    from: () => chainable,
    channel: () => chainable,
    removeChannel: () => {}
  } as any;
};

export const isSupabaseConfigured = !!(isValidUrl(supabaseUrl) && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Warning: Supabase credentials are missing or invalid. Falling back to mock client (will use local static data).'
  );
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();


