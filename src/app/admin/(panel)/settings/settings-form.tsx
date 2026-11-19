"use client";

import { SingletonForm, type Section } from "@/components/admin/singleton-form";
import { settingsSchema } from "@/lib/validators";

const sections: Section[] = [
  {
    title: "Website name & logo",
    fields: [
      { name: "siteName", label: "Website name *", type: "text", half: true },
      { name: "tagline", label: "Tagline (under the name)", type: "text", half: true, placeholder: "Ayurveda · Professor" },
      { name: "logoUrl", label: "Logo (optional)", type: "image", help: "Square image works best. If empty, a leaf icon is shown." },
      { name: "faviconUrl", label: "Browser tab icon (optional)", type: "image", help: "Small square image (e.g. 512×512 PNG)." },
    ],
  },
  {
    title: "Home page – top section",
    fields: [
      { name: "heroEyebrow", label: "Small line above the heading", type: "text" },
      { name: "heroTitle", label: "Main heading", type: "text" },
      { name: "heroSubtitle", label: "Text under the heading", type: "textarea", rows: 3 },
      { name: "heroImageUrl", label: "Main photo", type: "image", help: "Usually your portrait photo." },
    ],
  },
  {
    title: "Home page – introduction & call to action",
    fields: [
      { name: "introTitle", label: "Introduction heading", type: "text" },
      { name: "introText", label: "Introduction text", type: "textarea", rows: 4 },
      { name: "ctaTitle", label: "Banner heading (bottom of pages)", type: "text" },
      { name: "ctaText", label: "Banner text", type: "textarea", rows: 2 },
    ],
  },
  {
    title: "Contact details",
    description: "Shown on the Contact page, in the footer and used for the WhatsApp button.",
    fields: [
      { name: "phone", label: "Phone", type: "tel", half: true, placeholder: "+91 98765 43210" },
      { name: "email", label: "Email", type: "email", half: true },
      { name: "whatsappNumber", label: "WhatsApp number", type: "tel", half: true, placeholder: "+91 98765 43210", help: "With country code. Leave empty to hide the WhatsApp button." },
      { name: "timings", label: "Timings", type: "textarea", rows: 2, placeholder: "Mon – Sat: 10 AM – 1 PM" },
      { name: "address", label: "Address", type: "textarea", rows: 3 },
      { name: "mapEmbedUrl", label: "Google Map", type: "textarea", rows: 3, help: "In Google Maps: Share → Embed a map → Copy HTML, then paste it here." },
      { name: "mapLink", label: "Google Maps link (for “Open in Maps”)", type: "url", placeholder: "https://maps.app.goo.gl/…" },
    ],
  },
  {
    title: "Social media",
    description: "Leave empty to hide an icon.",
    fields: [
      { name: "facebookUrl", label: "Facebook", type: "url", half: true, placeholder: "https://facebook.com/…" },
      { name: "instagramUrl", label: "Instagram", type: "url", half: true, placeholder: "https://instagram.com/…" },
      { name: "youtubeUrl", label: "YouTube", type: "url", half: true, placeholder: "https://youtube.com/@…" },
      { name: "linkedinUrl", label: "LinkedIn", type: "url", half: true, placeholder: "https://linkedin.com/in/…" },
      { name: "twitterUrl", label: "X (Twitter)", type: "url", half: true, placeholder: "https://x.com/…" },
    ],
  },
  {
    title: "Footer & disclaimer",
    fields: [
      { name: "footerText", label: "Footer text", type: "textarea", rows: 2 },
      { name: "disclaimer", label: "Medical disclaimer", type: "textarea", rows: 2, help: "Shown in the footer and on article / service pages." },
    ],
  },
  {
    title: "Google & sharing (SEO)",
    description: "How your website appears in Google and when shared on WhatsApp / Facebook.",
    fields: [
      { name: "metaTitle", label: "Google title", type: "text", help: "About 50–60 characters." },
      { name: "metaDescription", label: "Google description", type: "textarea", rows: 2, help: "About 150–160 characters." },
      { name: "metaKeywords", label: "Keywords (optional)", type: "text", placeholder: "Ayurveda, Bhopal, Panchakarma" },
      { name: "ogImageUrl", label: "Sharing image (optional)", type: "image", help: "Shown when the site link is shared. 1200×630 works best." },
    ],
  },
];

export function SettingsForm({ initial }: { initial: Record<string, any> }) {
  return <SingletonForm url="/api/admin/settings" schema={settingsSchema} sections={sections} initial={initial} />;
}
