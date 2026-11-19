import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Build a URL-friendly slug. Unicode letters are kept so Hindi titles still
 * produce readable (and SEO-friendly) slugs instead of an empty string.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

/** decodeURIComponent that never throws (malformed URLs just return the input). */
export function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function formatDate(date: Date | string | null | undefined, opts?: Intl.DateTimeFormatOptions) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", opts ?? { day: "numeric", month: "long", year: "numeric" });
}

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function truncate(text: string, length = 160) {
  return text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text;
}

export function absoluteUrl(path = "/") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Pick the first usable social-sharing image. SVGs are skipped because
 * Facebook / WhatsApp / X don't render them; falls back to the generated /og PNG.
 */
export function shareImage(...candidates: (string | null | undefined)[]): string {
  return candidates.find((c) => c && !/\.svg(\?|$)/i.test(c)) || "/og";
}

/** Keep only digits for wa.me / tel: links. */
export function digitsOnly(value: string) {
  return value.replace(/[^\d]/g, "");
}

export function splitTags(tags: string): string[] {
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function readingTime(html: string) {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
