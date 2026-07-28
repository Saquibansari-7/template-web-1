import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function createClientIfConfigured(): SupabaseClient | null {
  let url = typeof supabaseUrl === 'string' ? supabaseUrl.trim() : '';
  const key = typeof supabasePublishableKey === 'string' ? supabasePublishableKey.trim() : '';

  if (!url || !key) {
    console.error('[supabase] Missing env vars: VITE_PUBLIC_SUPABASE_URL / VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
    return null;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  console.log('[supabase] Using URL:', url);

  return createClient(url, key, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = createClientIfConfigured();
