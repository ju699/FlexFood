 export type CompressOptions = {
   maxWidth: number;
   maxHeight: number;
   mimeType: "image/jpeg" | "image/png" | "image/webp";
   quality: number; // 0..1 (ignored by PNG)
 };
 
 export async function compressImage(file: File, opts: CompressOptions): Promise<File> {
   try {
     const url = URL.createObjectURL(file);
     const img = await loadImage(url);
     URL.revokeObjectURL(url);
 
     const { targetWidth, targetHeight } = computeTargetSize(img.width, img.height, opts.maxWidth, opts.maxHeight);
     const canvas = document.createElement("canvas");
     canvas.width = targetWidth;
     canvas.height = targetHeight;
     const ctx = canvas.getContext("2d");
     if (!ctx) return file;
     ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
 
     const blob = await canvasToBlob(canvas, opts.mimeType, opts.quality);
     if (!blob) return file;
     const ext = opts.mimeType === "image/jpeg" ? "jpg" : opts.mimeType === "image/png" ? "png" : "webp";
     const name = file.name.replace(/\.[^/.]+$/, "") + `_compressed.${ext}`;
     return new File([blob], name, { type: opts.mimeType });
   } catch {
     return file;
   }
 }
 
 function loadImage(src: string): Promise<HTMLImageElement> {
   return new Promise((resolve, reject) => {
     const img = new Image();
     img.crossOrigin = "anonymous";
     img.onload = () => resolve(img);
     img.onerror = (e) => reject(e);
     img.src = src;
   });
 }
 
 function computeTargetSize(w: number, h: number, maxW: number, maxH: number) {
   const ratio = Math.min(maxW / w, maxH / h, 1);
   return {
     targetWidth: Math.round(w * ratio),
     targetHeight: Math.round(h * ratio),
   };
 }
 
 function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
   return new Promise((resolve) => {
     canvas.toBlob((blob) => resolve(blob), type, quality);
   });
 }
