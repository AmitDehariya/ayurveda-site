import "server-only";
import { cache } from "react";
import type { Profile, SiteSetting } from "@prisma/client";
import { prisma } from "./prisma";

export const DEFAULT_DISCLAIMER =
  "Information on this website is for educational purposes and is not a substitute for a personal medical consultation.";

/** Used when the database is empty or not reachable, so the site never crashes. */
export const defaultSettings: SiteSetting = {
  id: 1,
  siteName: "Dr. Deepmala Mourya – Ayurveda",
  tagline: "Ayurvedic Physician & Professor",
  logoUrl: "",
  faviconUrl: "",
  heroEyebrow: "Ayurveda · Wellness · Education",
  heroTitle: "Holistic healing through the wisdom of Ayurveda",
  heroSubtitle:
    "Personalised Ayurvedic consultation, diet and lifestyle guidance rooted in classical texts and modern understanding.",
  heroImageUrl: "/placeholders/doctor-portrait.svg",
  introTitle: "Welcome",
  introText: "",
  ctaTitle: "Begin your journey to balanced health",
  ctaText: "Send an inquiry and we will get back to you to schedule a consultation.",
  phone: "",
  email: "",
  whatsappNumber: "",
  address: "Bhopal, Madhya Pradesh, India",
  timings: "",
  mapEmbedUrl: "",
  mapLink: "",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  linkedinUrl: "",
  twitterUrl: "",
  footerText: "",
  disclaimer: DEFAULT_DISCLAIMER,
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  ogImageUrl: "",
  updatedAt: new Date(0),
};

export const defaultProfile: Profile = {
  id: 1,
  fullName: "Dr. Deepmala Mourya",
  title: "Ayurvedic Physician",
  degrees: "",
  designation: "Professor",
  institution: "",
  shortBio: "",
  bioHtml: "",
  academicHtml: "",
  photoUrl: "/placeholders/doctor-portrait.svg",
  aboutImageUrl: "",
  updatedAt: new Date(0),
};

/** Cached per request (React `cache`) – layout, metadata and pages share one query. */
export const getSettings = cache(async (): Promise<SiteSetting> => {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });
    return row ? { ...row, disclaimer: row.disclaimer || DEFAULT_DISCLAIMER } : defaultSettings;
  } catch (err) {
    console.warn("[settings] falling back to defaults:", (err as Error).message.split("\n")[0]);
    return defaultSettings;
  }
});

export const getProfile = cache(async (): Promise<Profile> => {
  try {
    return (await prisma.profile.findUnique({ where: { id: 1 } })) ?? defaultProfile;
  } catch {
    return defaultProfile;
  }
});
