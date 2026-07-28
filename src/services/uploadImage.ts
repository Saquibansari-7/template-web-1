import { supabase } from '../lib/supabase';

export async function uploadImage(siteId: string, file: File) {
  if (!supabase || typeof supabase.storage !== 'object') {
    const err = new Error('Supabase not configured - check your .env file');
    console.error('[uploadImage]', err.message);
    throw err;
  }

  const path = `${siteId}/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from('wedding')
    .upload(path, file);

  if (error) {
    console.error('[uploadImage] upload failed:', error);
    throw error;
  }

  const { data: publicData } = supabase.storage
    .from('wedding')
    .getPublicUrl(path);

  return publicData.publicUrl;
}
