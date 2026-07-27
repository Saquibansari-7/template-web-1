import { supabase } from '../lib/supabase';

export async function uploadImage(file: File): Promise<string | null> {
  if (!supabase || typeof supabase.from !== 'function') {
    return null;
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
  const filePath = `wedding/${fileName}`;

  const { error } = await supabase.storage
    .from('wedding')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload failed:', error);
    return null;
  }

  const { data: publicData } = supabase.storage
    .from('wedding')
    .getPublicUrl(filePath);

  return publicData?.publicUrl || null;
}
