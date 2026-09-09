/**
 * Browser-side image compression utility using HTML5 Canvas.
 *
 * Compresses raster photos (JPEG, PNG, WEBP) down to standard web dimensions
 * and converts to WebP before uploading to Supabase Storage.
 *
 * Benefits:
 * - Users can upload raw 15-30MB camera photos without manual resizing.
 * - Files are shrunk by ~90-98% (typically ~150KB - 500KB) with pristine visual quality.
 * - Prevents hitting Supabase Storage 1GB quota and 2GB/mo egress bandwidth limits.
 * - Safely passes non-compressible files (PDF, animated GIF) through unmodified.
 */

export interface ImageCompressionOptions {
  /** Maximum width or height in pixels. Defaults to 1600. */
  maxDimension?: number;
  /** Compression quality (0.0 to 1.0). Defaults to 0.85. */
  quality?: number;
  /** Target MIME type for raster output. Defaults to 'image/webp'. */
  mimeType?: "image/webp" | "image/jpeg";
  /** Files already smaller than this byte count will skip re-compression. Defaults to 300KB. */
  skipIfSmallerThan?: number;
}

/**
 * Checks if a file is a compressible raster photo (excluding animated GIF / SVG).
 */
function isCompressibleImage(file: File): boolean {
  const type = file.type.toLowerCase();
  return (
    type === "image/jpeg" || type === "image/jpg" || type === "image/png" || type === "image/webp"
  );
}

/**
 * Compresses an image in the client browser before uploading to server/storage.
 * Guaranteed safe: if anything fails or in non-browser context, resolves the original file.
 */
export async function compressImage(
  file: File,
  options: ImageCompressionOptions = {},
): Promise<File> {
  // Guard against server-side rendering
  if (typeof window === "undefined") return file;

  // Only compress standard photo raster formats
  if (!isCompressibleImage(file)) {
    return file;
  }

  const {
    maxDimension = 1600,
    quality = 0.85,
    mimeType = "image/webp",
    skipIfSmallerThan = 300 * 1024, // 300 KB
  } = options;

  // If already lightweight, no need to touch it
  if (file.size <= skipIfSmallerThan) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (!width || !height) {
        resolve(file);
        return;
      }

      // Calculate scaled dimensions while preserving aspect ratio
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // High quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          // If compression resulted in a larger file (rare), keep original
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const ext = mimeType === "image/webp" ? "webp" : "jpg";
          const newFileName = `${baseName}.${ext}`;

          const compressedFile = new File([blob], newFileName, {
            type: blob.type || mimeType,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        mimeType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}
