import Image, { type ImageProps } from "next/image";

const OPTIMISABLE_HOSTS = ["res.cloudinary.com", "i.ytimg.com", "img.youtube.com", "i.vimeocdn.com"];

/** True when next/image can optimise this URL (local file or a configured host). */
export function canOptimise(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return OPTIMISABLE_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

/**
 * next/image wrapper that falls back to an unoptimised image for arbitrary
 * external URLs (an admin may paste any image link), instead of throwing.
 */
export function SmartImage({ src, alt, fallback = "/placeholders/leaf-pattern.svg", ...rest }: Omit<ImageProps, "src"> & { src?: string | null; fallback?: string }) {
  const url = src || fallback;
  return <Image src={url} alt={alt} unoptimized={!canOptimise(url)} {...rest} />;
}
