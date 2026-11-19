"use client";

import type { Achievement, Publication, Qualification, TimelineItem } from "@prisma/client";
import { ResourceManager } from "@/components/admin/resource-manager";
import { SingletonForm, type Section } from "@/components/admin/singleton-form";
import { Tabs } from "@/components/admin/tabs";
import { achievementSchema, profileSchema, publicationSchema, qualificationSchema, timelineSchema } from "@/lib/validators";

const sections: Section[] = [
  {
    title: "Basic details",
    fields: [
      { name: "fullName", label: "Full name *", type: "text", half: true, placeholder: "Dr. Deepmala Mourya …" },
      { name: "degrees", label: "Degrees", type: "text", half: true, placeholder: "BAMS, MD (Ayurveda)" },
      { name: "designation", label: "Designation", type: "text", half: true, placeholder: "Professor" },
      { name: "title", label: "Title / speciality", type: "text", half: true, placeholder: "Ayurvedic Physician" },
      { name: "institution", label: "College / institution", type: "text", placeholder: "Government Ayurveda College, Bhopal" },
    ],
  },
  {
    title: "Photos",
    fields: [
      { name: "photoUrl", label: "Your photo (portrait)", type: "image", help: "A clear, upright photo works best." },
      { name: "aboutImageUrl", label: "Second photo (clinic / college / teaching)", type: "image", help: "Shown in the introduction on the home page." },
    ],
  },
  {
    title: "Biography",
    fields: [
      { name: "shortBio", label: "Short introduction", type: "textarea", rows: 3, help: "2–3 sentences, used on the home page and in Google." },
      { name: "bioHtml", label: "Full biography", type: "richtext" },
      { name: "academicHtml", label: "Academic role (as professor)", type: "richtext" },
    ],
  },
];

const KIND_LABEL: Record<string, string> = { AWARD: "Award", CERTIFICATE: "Certificate", MEMBERSHIP: "Membership" };

type Props = {
  profile: Record<string, any>;
  qualifications: Qualification[];
  timeline: TimelineItem[];
  achievements: Achievement[];
  publications: Publication[];
};

export function ProfileEditor({ profile, qualifications, timeline, achievements, publications }: Props) {
  return (
    <Tabs
      tabs={[
        { id: "bio", label: "Biography & photo", content: <SingletonForm url="/api/admin/profile" schema={profileSchema} sections={sections} initial={profile} /> },
        {
          id: "qualifications",
          label: `Qualifications (${qualifications.length})`,
          content: (
            <ResourceManager
              resource="qualifications"
              singular="qualification"
              items={qualifications}
              schema={qualificationSchema}
              ordered
              fields={[
                { name: "degree", label: "Degree *", type: "text", placeholder: "MD (Ayurveda) – Kayachikitsa" },
                { name: "institution", label: "University / college", type: "text", half: true },
                { name: "year", label: "Year", type: "text", half: true, placeholder: "2012" },
                { name: "description", label: "Note (optional)", type: "textarea", rows: 2 },
              ]}
              defaults={{ degree: "", institution: "", year: "", description: "" }}
              previewHref={() => "/about"}
              row={(q) => ({ title: q.degree, subtitle: [q.institution, q.year].filter(Boolean).join(" · ") })}
            />
          ),
        },
        {
          id: "timeline",
          label: `Experience (${timeline.length})`,
          content: (
            <ResourceManager
              resource="timeline"
              singular="timeline entry"
              items={timeline}
              schema={timelineSchema}
              ordered
              fields={[
                { name: "period", label: "Period", type: "text", half: true, placeholder: "2015 – Present" },
                { name: "title", label: "Role / milestone *", type: "text", half: true, placeholder: "Professor" },
                { name: "organization", label: "Organisation", type: "text" },
                { name: "description", label: "Description", type: "textarea", rows: 3 },
              ]}
              defaults={{ period: "", title: "", organization: "", description: "" }}
              previewHref={() => "/about"}
              row={(t) => ({ title: t.title, subtitle: [t.period, t.organization].filter(Boolean).join(" · ") })}
            />
          ),
        },
        {
          id: "achievements",
          label: `Awards & certificates (${achievements.length})`,
          content: (
            <ResourceManager
              resource="achievements"
              singular="award / certificate"
              items={achievements}
              schema={achievementSchema}
              ordered
              fields={[
                { name: "kind", label: "Type", type: "select", half: true, options: Object.entries(KIND_LABEL).map(([value, label]) => ({ value, label })) },
                { name: "year", label: "Year", type: "text", half: true },
                { name: "title", label: "Title *", type: "text" },
                { name: "issuer", label: "Given by", type: "text" },
                { name: "description", label: "Description", type: "textarea", rows: 2 },
                { name: "imageUrl", label: "Photo / scan (optional)", type: "image", help: "Certificates with a photo are shown in a gallery on the About page." },
              ]}
              defaults={{ kind: "AWARD", year: "", title: "", issuer: "", description: "", imageUrl: "" }}
              previewHref={() => "/about"}
              row={(a) => ({ title: a.title, subtitle: [a.issuer, a.year].filter(Boolean).join(" · "), image: a.imageUrl || undefined, badges: [{ label: KIND_LABEL[a.kind] ?? a.kind, variant: "gold" }] })}
            />
          ),
        },
        {
          id: "publications",
          label: `Publications (${publications.length})`,
          content: (
            <ResourceManager
              resource="publications"
              singular="publication"
              items={publications}
              schema={publicationSchema}
              ordered
              fields={[
                { name: "title", label: "Title *", type: "text" },
                { name: "authors", label: "Authors", type: "text" },
                { name: "journal", label: "Journal / conference", type: "text", half: true },
                { name: "year", label: "Year", type: "text", half: true },
                { name: "url", label: "Link (optional)", type: "url", placeholder: "https://…" },
              ]}
              defaults={{ title: "", authors: "", journal: "", year: "", url: "" }}
              previewHref={() => "/about"}
              row={(p) => ({ title: p.title, subtitle: [p.journal, p.year].filter(Boolean).join(" · ") })}
            />
          ),
        },
      ]}
    />
  );
}
