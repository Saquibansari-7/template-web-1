import { supabase } from '../lib/supabase';
import { WebsiteContent, SectionSettings } from '../types';

const DEFAULT_SITE_ID = 'default';

export async function saveContent(
  siteId: string,
  content: WebsiteContent,
  sections: SectionSettings
): Promise<void> {
  if (!supabase || typeof supabase.from !== 'function') {
    return;
  }

  const dataToSave = {
    ...content,
    sections,
  };

  const { error } = await supabase
    .from('site_content')
    .upsert({
      site_id: siteId,
      data: dataToSave,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Failed to save content:', error);
  }
}
