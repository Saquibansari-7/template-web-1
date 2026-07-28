import { supabase } from '../lib/supabase';
import { WebsiteContent, SectionSettings } from '../types';

export async function saveContent(siteId: string, content: WebsiteContent, sections: SectionSettings) {
  console.log('saveContent - siteId:', siteId);

  if (!supabase || typeof supabase.from !== 'function') {
    const err = new Error('Supabase not configured - check your .env file');
    console.error('saveContent - error:', err);
    throw err;
  }

  const result = await supabase
    .from('site_content')
    .upsert({
      site_id: siteId,
      data: {
        ...content,
        sections,
      },
      updated_at: new Date().toISOString(),
    });

  console.log('saveContent - result:', result);
  return result;
}
