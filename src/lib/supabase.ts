import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function createClientIfConfigured(): SupabaseClient | null {
  let url = typeof supabaseUrl === 'string' ? supabaseUrl.trim() : '';
  const key = typeof supabasePublishableKey === 'string' ? supabasePublishableKey.trim() : '';

  if (!url || !key) {
    if (import.meta.env.DEV) console.error('[supabase] Missing env vars: VITE_PUBLIC_SUPABASE_URL / VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    return null;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  if (import.meta.env.DEV) console.log('[supabase] Using URL:', url);

  return createClient(url, key, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabase = createClientIfConfigured();
