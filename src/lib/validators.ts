import { z } from "zod";
import { detectSource } from "./video";

/*
 * Zod schemas shared by the browser (React Hook Form) and the server (API routes).
 * The server ALWAYS re-validates – never trust the client.
 * Keep this file free of server-only imports so it can be bundled for the browser.
 */

// ── helpers ────────────────────────────────────────────────────────────────
const text = (max: number) => z.string().trim().max(max, `Maximum ${max} characters`);
const optText = (max: number) => text(max).default("");
const required = (label: string, max = 200) => text(max).min(1, `${label} is required`);

const isSafeUrl = (v: string) => v === "" || /^https?:\/\/[^\s]+$/i.test(v) || (v.startsWith("/") && !v.startsWith("//"));

/** An uploaded file path (/uploads/...) or an http(s) link. Blocks javascript: etc. */
export const mediaUrl = optText(2000).refine(isSafeUrl, "Must be an uploaded file or a link starting with https://");
/** Same rule as mediaUrl, for PATCH bodies where the field may be absent. */
export const optionalMediaUrl = text(2000).refine(isSafeUrl, "Must be an uploaded file or a link starting with https://").optional();
const linkUrl = optText(500).refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Must start with https://");
const richText = z.string().max(300_000, "Content is too long").default("");
const order = z.coerce.number().int().min(0).max(100_000).default(0);
const bool = (def: boolean) => z.coerce.boolean().default(def);
const slug = optText(100).refine((v) => v === "" || /^[\p{L}\p{M}\p{N}-]+$/u.test(v), "Only letters, numbers and dashes");

/**
 * Accept either a Google Maps embed URL or the full <iframe> code copied from
 * Google Maps, and return only a safe https://www.google.com/maps/embed... URL.
 */
export function safeMapEmbed(input: string): string {
  if (!input) return "";
  const src = input.match(/src=["']([^"']+)["']/i)?.[1] ?? input.trim();
  try {
    const u = new URL(src.replace(/&amp;/g, "&"));
    const okHost = ["www.google.com", "google.com", "maps.google.com"].includes(u.hostname);
    if (u.protocol === "https:" && okHost && (u.pathname.startsWith("/maps/embed") || u.searchParams.get("output") === "embed")) {
      return u.toString();
    }
  } catch {
    /* invalid */
  }
  return "";
}

// ── constants ──────────────────────────────────────────────────────────────
export const FEEDBACK_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
export const INQUIRY_STATUSES = ["NEW", "READ", "REPLIED"] as const;
export const POST_STATUSES = ["DRAFT", "PUBLISHED"] as const;
export const VIDEO_SOURCES = ["YOUTUBE", "VIMEO", "UPLOAD"] as const;
export const ACHIEVEMENT_KINDS = ["AWARD", "CERTIFICATE", "MEMBERSHIP"] as const;
export const CATEGORY_TYPES = ["BLOG", "VIDEO"] as const;

// ── admin: singletons ──────────────────────────────────────────────────────
export const settingsSchema = z.object({
  siteName: required("Site name", 120),
  tagline: optText(120),
  logoUrl: mediaUrl,
  faviconUrl: mediaUrl,
  heroEyebrow: optText(150),
  heroTitle: optText(200),
  heroSubtitle: optText(500),
  heroImageUrl: mediaUrl,
  introTitle: optText(200),
  introText: optText(2000),
  ctaTitle: optText(200),
  ctaText: optText(500),
  phone: optText(40),
  email: optText(200).refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email"),
  whatsappNumber: optText(30).refine((v) => v === "" || /^[+\d][\d\s-]{6,20}$/.test(v), "Digits only, with country code e.g. +91 98765 43210"),
  address: optText(500),
  timings: optText(300),
  mapEmbedUrl: optText(3000).transform(safeMapEmbed),
  mapLink: linkUrl,
  facebookUrl: linkUrl,
  instagramUrl: linkUrl,
  youtubeUrl: linkUrl,
  linkedinUrl: linkUrl,
  twitterUrl: linkUrl,
  footerText: optText(500),
  disclaimer: optText(500),
  metaTitle: optText(120),
  metaDescription: optText(300),
  metaKeywords: optText(300),
  ogImageUrl: mediaUrl,
});

export const profileSchema = z.object({
  fullName: required("Full name", 120),
  title: optText(150),
  degrees: optText(200),
  designation: optText(150),
  institution: optText(250),
  shortBio: optText(1000),
  bioHtml: richText,
  academicHtml: richText,
  photoUrl: mediaUrl,
  aboutImageUrl: mediaUrl,
});

// ── admin: lists ───────────────────────────────────────────────────────────
export const qualificationSchema = z.object({
  degree: required("Degree", 200),
  institution: optText(250),
  year: optText(40),
  description: optText(500),
  order,
});

export const timelineSchema = z.object({
  period: optText(60),
  title: required("Title", 200),
  organization: optText(250),
  description: optText(1000),
  order,
});

export const achievementSchema = z.object({
  kind: z.enum(ACHIEVEMENT_KINDS).default("AWARD"),
  title: required("Title", 250),
  issuer: optText(250),
  year: optText(40),
  description: optText(1000),
  imageUrl: mediaUrl,
  order,
});

export const publicationSchema = z.object({
  title: required("Title", 400),
  authors: optText(400),
  journal: optText(300),
  year: optText(40),
  url: linkUrl,
  order,
});

export const statSchema = z.object({
  label: required("Label", 80),
  value: z.coerce.number().int("Whole numbers only").min(0).max(100_000_000),
  suffix: optText(10),
  icon: optText(30),
  order,
});

export const serviceSchema = z.object({
  title: required("Title", 150),
  slug,
  icon: optText(30),
  imageUrl: mediaUrl,
  shortDescription: optText(400),
  contentHtml: richText,
  isVisible: bool(true),
  order,
  metaTitle: optText(120),
  metaDescription: optText(300),
});

export const categorySchema = z.object({
  name: required("Name", 80),
  slug,
  type: z.enum(CATEGORY_TYPES).default("BLOG"),
  order,
});

export const postSchema = z.object({
  title: required("Title", 200),
  slug,
  excerpt: optText(500),
  contentHtml: richText,
  coverImageUrl: mediaUrl,
  categoryId: optText(40).transform((v) => v || null),
  tags: optText(300),
  status: z.enum(POST_STATUSES).default("DRAFT"),
  metaTitle: optText(120),
  metaDescription: optText(300),
});

export const albumSchema = z.object({
  title: required("Title", 150),
  slug,
  description: optText(500),
  coverImageUrl: mediaUrl,
  isVisible: bool(true),
  order,
});

export const galleryImageSchema = z.object({
  albumId: required("Album", 40),
  url: mediaUrl.refine((v) => v !== "", "Image is required"),
  caption: optText(300),
  alt: optText(300),
  order,
});

export const videoSchema = z
  .object({
    title: required("Title", 200),
    description: optText(1000),
    source: z.enum(VIDEO_SOURCES).default("YOUTUBE"),
    url: mediaUrl.refine((v) => v !== "", "Video link or file is required"),
    thumbnailUrl: mediaUrl,
    categoryId: optText(40).transform((v) => v || null),
    isVisible: bool(true),
    isFeatured: bool(false),
    order,
  })
  .transform((v, ctx) => {
    if (v.source === "UPLOAD") return v;
    // Auto-detect YouTube vs Vimeo from the pasted link.
    const detected = detectSource(v.url);
    if (!detected) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "Paste a valid YouTube or Vimeo link" });
      return z.NEVER;
    }
    return { ...v, source: detected };
  });

export const feedbackAdminSchema = z.object({
  status: z.enum(FEEDBACK_STATUSES).optional(),
  isFeatured: z.coerce.boolean().optional(),
  name: text(100).optional(),
  city: text(100).optional(),
  message: text(2000).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

export const inquiryAdminSchema = z.object({
  status: z.enum(INQUIRY_STATUSES),
});

// ── public forms ───────────────────────────────────────────────────────────
const phoneRe = /^[+\d][\d\s()-]{6,19}$/;

export const contactSchema = z.object({
  name: required("Name", 100).min(2, "Please enter your name"),
  phone: required("Phone", 20).regex(phoneRe, "Enter a valid phone number"),
  email: optText(200).refine((v) => v === "" || z.email().safeParse(v).success, "Enter a valid email"),
  subject: optText(150),
  preferredTime: optText(60),
  message: required("Message", 3000).min(10, "Please write at least 10 characters"),
  // Honeypot – real users never see or fill this field.
  website: z.string().max(200).optional(),
  recaptchaToken: z.string().max(4000).optional(),
});

export const feedbackPublicSchema = z.object({
  name: required("Name", 100).min(2, "Please enter your name"),
  city: optText(100),
  rating: z.coerce.number().int().min(1, "Please choose a rating").max(5),
  message: required("Message", 2000).min(10, "Please write at least 10 characters"),
  website: z.string().max(200).optional(),
  recaptchaToken: z.string().max(4000).optional(),
});

export const PREFERRED_TIMES = ["Any time", "Morning (9 AM – 12 PM)", "Afternoon (12 – 4 PM)", "Evening (4 – 8 PM)"] as const;

// ── auth ───────────────────────────────────────────────────────────────────
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(200),
    newPassword: z
      .string()
      .min(10, "Use at least 10 characters")
      .max(200)
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const loginSchema = z.object({
  email: z.email("Enter a valid email").max(200),
  password: z.string().min(1, "Enter your password").max(200),
});
