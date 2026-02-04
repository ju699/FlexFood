import { storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export const uploadImage = async (
  file: File,
  path: string
): Promise<string> => {
  const r = ref(storage, path);
  const snap = await uploadBytes(r, file);
  return await getDownloadURL(snap.ref);
};
