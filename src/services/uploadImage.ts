import { supabase } from '../lib/supabase';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export async function uploadImage(siteId: string, file: File): Promise<string | null> {
  if (!supabase || typeof supabase.from !== 'function' || !supabase.storage) {
    const err = new Error('Supabase is not configured. Check VITE_PUBLIC_SUPABASE_URL / VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY.');
    if (import.meta.env.DEV) console.error('[uploadImage]', err.message);
    throw err;
  }

  if (file.size > MAX_FILE_SIZE) {
    const err = new Error(`Image must be 5MB or smaller. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
    if (import.meta.env.DEV) console.error('[uploadImage]', err.message);
    throw err;
  }

  const fileExt = (file.name.split('.').pop() || '').toLowerCase();
  if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(fileExt)) {
    const err = new Error(`Only JPG, PNG, WebP, and GIF images are allowed.`);
    if (import.meta.env.DEV) console.error('[uploadImage]', err.message);
    throw err;
  }
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
  const filePath = `${siteId}/${fileName}`;

  if (import.meta.env.DEV) console.log('[uploadImage] uploading to bucket=sites path=', filePath, 'size=', file.size, 'type=', file.type);

  const { data, error } = await supabase.storage
    .from('sites')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    const msg = error.message || String(error);
    if (import.meta.env.DEV) console.error('[uploadImage] upload failed:', error, 'message=', msg);

    if (msg.includes('Bucket not found') || msg.toLowerCase().includes('bucket')) {
      throw new Error('Storage bucket "sites" not found. Create it in Supabase Storage.');
    }
    if (msg.includes('Unauthorized') || msg.toLowerCase().includes('jwt')) {
      throw new Error('Storage upload unauthorized. Check Storage RLS policies.');
    }
    throw new Error(`Image upload failed: ${msg}`);
  }

  if (import.meta.env.DEV) console.log('[uploadImage] uploaded:', data?.path);

  const { data: publicData } = supabase.storage
    .from('sites')
    .getPublicUrl(filePath);

  const publicUrl = publicData?.publicUrl || null;
  if (import.meta.env.DEV) console.log('[uploadImage] publicUrl:', publicUrl);
  return publicUrl;
}
