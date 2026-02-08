import { supabase } from "@/config/supabase";

export const uploadImage = async (
  file: File,
  path: string
): Promise<string> => {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "";
  if (!bucket) throw new Error("Supabase bucket non configuré");
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

export const uploadImageResumable = async (
  file: File,
  path: string,
  onProgress?: (percent: number) => void
): Promise<string> => {
  const url = await uploadImage(file, path);
  if (onProgress) onProgress(100);
  return url;
};
