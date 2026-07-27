import { supabase } from '../lib/supabase';
import { WebsiteContent } from '../types';

const DEFAULT_SITE_ID = 'default';

export async function loadContent(siteId: string): Promise<WebsiteContent | null> {
  if (!supabase || typeof supabase.from !== 'function') {
    return null;
  }

  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('site_id', siteId)
    .maybeSingle();

  if (error || !data?.data) {
    return null;
  }

  return data.data as WebsiteContent;
}
