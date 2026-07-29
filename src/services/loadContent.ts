import { supabase } from '../lib/supabase';
import { WebsiteContent } from '../types';

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
  const normalized = value.replace(/https?:\/\/[^/]+\.supabase\.co\//, (match) => {
    if (!EXPECTED_SUPABASE_HOST) return match;
    if (match.includes(EXPECTED_SUPABASE_HOST)) return match;
    return `https://${EXPECTED_SUPABASE_HOST}/`;
  });
  return normalized;
}

function sanitize(content: WebsiteContent): WebsiteContent {
  return {
    ...content,
    hero: { ...content.hero, image: normalizeImage(content.hero.image) },
    story: { ...content.story, image: normalizeImage(content.story.image) },
    invitationCard: { ...content.invitationCard, image: normalizeImage(content.invitationCard.image) },
    gallery: { ...content.gallery, images: content.gallery.images.map(normalizeImage) },
  };
}

export async function loadContent(siteId: string) {
  if (!supabase || typeof supabase.from !== 'function') {
    const err = new Error('Supabase not configured - check your .env file');
    if (import.meta.env.DEV) console.error('[loadContent]', err.message);
    throw err;
  }

  const { data, error } = await supabase
    .from('site_content')
    .select('data')
    .eq('site_id', siteId)
    .single();

  if (error) {
    if (import.meta.env.DEV) console.error('[loadContent] Supabase error:', error);
    throw error;
  }

  const raw = data?.data as Partial<WebsiteContent> | undefined;
  if (!raw) return null;

  const sanitized = sanitize(raw as WebsiteContent);
  if (import.meta.env.DEV) {
    console.log('[loadContent] FINAL heroImage:', sanitized.hero.image);
    console.log('[loadContent] FINAL storyImage:', sanitized.story.image);
    console.log('[loadContent] FINAL invitationImage:', sanitized.invitationCard.image);
  }
  return sanitized;
}
