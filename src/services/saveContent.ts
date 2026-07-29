import { supabase } from '../lib/supabase';
import { WebsiteContent, SectionSettings } from '../types';

const EXPECTED_SUPABASE_HOST = (() => {
  try {
    const raw = (import.meta.env.VITE_PUBLIC_SUPABASE_URL as string) || '';
    if (!raw) return '';
    const parsed = new URL(raw);
    return parsed.hostname;
  } catch {
    return '';
  }
})();

function normalizeImage(value: string): string {
  if (!value || value.startsWith('/uploads/')) return value;
  return value.replace(/https?:\/\/[^/]+\.supabase\.co\//, (match) => {
    if (!EXPECTED_SUPABASE_HOST) return match;
    if (match.includes(EXPECTED_SUPABASE_HOST)) return match;
    return `https://${EXPECTED_SUPABASE_HOST}/`;
  });
}

export async function saveContent(siteId: string, content: WebsiteContent, sections: SectionSettings) {
  if (import.meta.env.DEV) console.log('saveContent - siteId:', siteId, 'expectedSupabaseHost:', EXPECTED_SUPABASE_HOST);

  if (!supabase || typeof supabase.from !== 'function') {
    const err = new Error('Supabase not configured - check your .env file');
    if (import.meta.env.DEV) console.error('saveContent - error:', err);
    throw err;
  }

  const normalizedContent: WebsiteContent = {
    ...content,
    hero: { ...content.hero, image: normalizeImage(content.hero.image) },
    story: { ...content.story, image: normalizeImage(content.story.image) },
    invitationCard: { ...content.invitationCard, image: normalizeImage(content.invitationCard.image) },
    gallery: { ...content.gallery, images: content.gallery.images.map(normalizeImage) },
  };

  const result = await supabase
    .from('site_content')
    .upsert({
      site_id: siteId,
      data: {
        ...normalizedContent,
        sections,
      },
      updated_at: new Date().toISOString(),
    });

  if (import.meta.env.DEV) console.log('saveContent - result:', result);
  return result;
}
