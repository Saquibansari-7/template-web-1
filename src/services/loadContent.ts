import { supabase } from '../lib/supabase';
import { WebsiteContent, PartialWebsiteContent, SectionSettings } from '../types';
import { resolveSite, SiteRow } from '../lib/siteResolver';

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

export function mergeDeep<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };

  for (const key of Object.keys(source) as Array<keyof T>) {
    const srcVal = source[key];
    const tgtVal = target[key];

    if (
      srcVal &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      (output as Record<string, unknown>)[String(key)] = mergeDeep(
        tgtVal as object,
        srcVal as object,
      ) as T[typeof key];
    } else if (Array.isArray(srcVal)) {
      (output as Record<string, unknown>)[String(key)] = srcVal;
    } else if (srcVal !== undefined) {
      (output as Record<string, unknown>)[String(key)] = srcVal;
    }
  }

  return output;
}

export async function loadContentByCustomer(customer: string) {
  const url = (import.meta.env.VITE_PUBLIC_SUPABASE_URL as string | undefined)?.trim();
  const key = (import.meta.env.VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim();
  if (!url || !key) return null;

  const site = await resolveSite(customer, url, key);
  if (!site || !site.data) return null;

  const { defaultContent } = await import('../context/WebsiteContext');
  const raw = site.data as Partial<WebsiteContent>;
  const merged = mergeDeep(defaultContent, raw);

  if (import.meta.env.DEV) {
    console.log('[loadContentByCustomer] merged for', customer, merged.hero.image);
  }

  return { site, content: merged };
}
