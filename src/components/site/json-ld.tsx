import type { Profile, SiteSetting } from "@prisma/client";
import { absoluteUrl, stripHtml } from "@/lib/utils";

/** Renders JSON-LD safely (escapes "<" so content can't break out of the script tag). */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** schema.org Physician (a MedicalBusiness subtype) for the doctor / practice. */
export function physicianJsonLd(s: SiteSetting, p: Profile) {
  const sameAs = [s.facebookUrl, s.instagramUrl, s.youtubeUrl, s.linkedinUrl, s.twitterUrl].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": ["Physician", "MedicalBusiness"],
    name: p.fullName || s.siteName,
    url: absoluteUrl("/"),
    image: absoluteUrl(p.photoUrl || s.heroImageUrl || "/placeholders/doctor-portrait.svg"),
    description: s.metaDescription || stripHtml(p.shortBio || s.heroSubtitle),
    medicalSpecialty: "Ayurveda",
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.email ? { email: s.email } : {}),
    ...(s.address
      ? { address: { "@type": "PostalAddress", streetAddress: s.address, addressRegion: "Madhya Pradesh", addressCountry: "IN" } }
      : {}),
    ...(s.mapLink ? { hasMap: s.mapLink } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}
