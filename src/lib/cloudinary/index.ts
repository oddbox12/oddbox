/**
 * Normal Cloudinary Integration for Oddbox Studio
 * Supports standard Cloudinary delivery URLs: https://res.cloudinary.com/<cloud_name>/...
 * Image/Video transformations: f_auto, q_auto, responsive sizes, video posters
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "thumb" | "scale";
  quality?: number | "auto";
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  gravity?: "auto" | "face" | "center";
}

/**
 * Returns optimized public Cloudinary delivery URL
 * If the input url is already a Cloudinary URL or external URL, handles it gracefully.
 */
export function getOptimizedImageUrl(
  src: string | undefined | null,
  options: CloudinaryTransformOptions = {}
): string {
  if (!src) return "/images/placeholder.jpg";

  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    "oddbox-studio";

  // If already a Cloudinary URL, inject transformations if not present
  if (src.includes("res.cloudinary.com")) {
    const parts = src.split("/upload/");
    if (parts.length === 2) {
      const transformParts: string[] = ["f_auto", "q_auto"];
      if (options.width) transformParts.push(`w_${options.width}`);
      if (options.height) transformParts.push(`h_${options.height}`);
      if (options.crop) transformParts.push(`c_${options.crop}`);
      if (options.quality && options.quality !== "auto") transformParts.push(`q_${options.quality}`);
      if (options.gravity) transformParts.push(`g_${options.gravity}`);

      const transformStr = transformParts.join(",");
      // Check if transformation is already at the start
      if (!parts[1].startsWith("f_auto") && !parts[1].startsWith("w_")) {
        return `${parts[0]}/upload/${transformStr}/${parts[1]}`;
      }
    }
    return src;
  }

  // If it's a relative path or local /images/ URL, return as-is for local development fallback
  if (src.startsWith("/") || src.startsWith("http://localhost")) {
    return src;
  }

  // If it's an external URL (e.g. Wix static), return as-is
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // Otherwise treat src as Cloudinary public ID
  const transformParts: string[] = ["f_auto", "q_auto"];
  if (options.width) transformParts.push(`w_${options.width}`);
  if (options.height) transformParts.push(`h_${options.height}`);
  if (options.crop) transformParts.push(`c_${options.crop}`);
  if (options.quality && options.quality !== "auto") transformParts.push(`q_${options.quality}`);

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformParts.join(",")}/${src}`;
}

/**
 * Optimized thumbnail transformation (small, lightweight for masonry gallery & CMS tables)
 */
export function getThumbnailUrl(src: string | undefined | null, width = 600): string {
  return getOptimizedImageUrl(src, { width, quality: "auto", format: "auto", crop: "limit" });
}

/**
 * High-resolution lightbox transformation (for high-fidelity photography view)
 */
export function getLightboxUrl(src: string | undefined | null, width = 1800): string {
  return getOptimizedImageUrl(src, { width, quality: 90, format: "auto", crop: "limit" });
}

/**
 * Video poster/thumbnail transformation
 */
export function getVideoPosterUrl(videoPublicId: string): string {
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    "oddbox-studio";
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_0,f_jpg,q_auto,w_800/${videoPublicId}.jpg`;
}

