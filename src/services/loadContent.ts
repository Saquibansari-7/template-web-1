import { supabase } from '../lib/supabase';
import { WebsiteContent } from '../types';

export async function loadContent(siteId: string) {
  if (!supabase || typeof supabase.from !== 'function') {
    const err = new Error('Supabase not configured - check your .env file');
    console.error('[loadContent]', err.message);
    throw err;
  }

  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('site_id', siteId)
    .single();

  if (error) {
    console.error('[loadContent] Supabase error:', error);
    throw error;
  }

  console.log('[loadContent] loaded for siteId:', siteId, 'hasData:', !!data?.data);
  return data?.data;
}
