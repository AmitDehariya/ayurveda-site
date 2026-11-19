import type { Metadata } from "next";
import Link from "next/link";
import { Award, BadgeCheck, BookOpen, ExternalLink, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, SectionHeading } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { RichContent } from "@/components/site/rich-content";
import { SmartImage } from "@/components/site/smart-image";
import { PhotoGrid } from "@/components/site/photo-grid";
import { getProfile } from "@/lib/settings";
import { getAboutData } from "@/lib/queries";
import { shareImage } from "@/lib/utils";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  return {
    title: `About ${p.fullName}`,
    description: p.shortBio || `${p.fullName} – ${p.designation}, ${p.institution}`,
    alternates: { canonical: "/about" },
    openGraph: { images: [shareImage(p.photoUrl)] },
  };
}

const KIND_META: Record<string, { label: string; Icon: typeof Award }> = {
  AWARD: { label: "Award", Icon: Award },
  CERTIFICATE: { label: "Certificate", Icon: BadgeCheck },
  MEMBERSHIP: { label: "Membership", Icon: Users },
};

export default async function AboutPage() {
  const [profile, { qualifications, timeline, achievements, publications }] = await Promise.all([getProfile(), getAboutData()]);
  const awards = achievements.filter((a) => a.kind !== "CERTIFICATE");
  const certificates = achievements.filter((a) => a.kind === "CERTIFICATE");

  return (
    <>
      <PageHeader title={`About ${profile.fullName}`} subtitle={[profile.designation, profile.institution].filter(Boolean).join(", ")} crumbs={[{ label: "About" }]} />

      {/* Bio */}
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[380px_1fr]">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-forest-100 shadow-soft">
                <SmartImage src={profile.photoUrl} alt={`Portrait of ${profile.fullName}`} fill priority sizes="(min-width: 1024px) 380px, 100vw" className="object-cover" />
              </div>
              <div className="mt-6 rounded-2xl border bg-white p-5">
                <p className="font-serif text-xl text-forest-900">{profile.fullName}</p>
                {profile.degrees ? <p className="mt-1 text-sm text-gold-700">{profile.degrees}</p> : null}
                <p className="mt-2 text-sm text-muted-foreground">{profile.title}</p>
                <Button asChild className="mt-5 w-full"><Link href="/contact">Book an inquiry</Link></Button>
              </div>
            </div>
          </Reveal>
          <div className="space-y-12">
            <Reveal>
              <p className="eyebrow">Biography</p>
              <h2 className="heading-lg mt-3">Dedicated to authentic Ayurveda</h2>
              {profile.shortBio ? <p className="mt-5 text-lg text-forest-800/80">{profile.shortBio}</p> : null}
              <RichContent html={profile.bioHtml} className="mt-6" />
            </Reveal>

            {profile.academicHtml ? (
              <Reveal className="rounded-3xl border bg-cream-100 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-800 text-gold-300"><GraduationCap className="h-5 w-5" aria-hidden="true" /></span>
                  <h2 className="font-serif text-2xl">Academic role</h2>
                </div>
                <RichContent html={profile.academicHtml} className="mt-4 prose-base" />
              </Reveal>
            ) : null}

            {qualifications.length > 0 && (
              <Reveal>
                <h2 className="font-serif text-2xl">Qualifications</h2>
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {qualifications.map((q) => (
                    <li key={q.id} className="rounded-2xl border bg-white p-5 transition hover:shadow-soft">
                      <p className="font-medium text-forest-900">{q.degree}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{[q.institution, q.year].filter(Boolean).join(" · ")}</p>
                      {q.description ? <p className="mt-2 text-sm text-forest-800/80">{q.description}</p> : null}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="section bg-cream-100">
          <div className="container">
            <SectionHeading eyebrow="Journey" title="Experience timeline" />
            <ol className="relative mx-auto max-w-3xl border-l-2 border-gold-300 pl-8">
              {timeline.map((t, i) => (
                <li key={t.id} className="relative mb-10 last:mb-0">
                  <span className="absolute -left-[42px] top-1 grid h-5 w-5 place-items-center rounded-full border-4 border-cream-100 bg-forest-700" aria-hidden="true" />
                  <Reveal delay={i * 0.05}>
                    <p className="text-sm font-semibold text-gold-700">{t.period}</p>
                    <h3 className="mt-1 font-serif text-xl text-forest-900">{t.title}</h3>
                    {t.organization ? <p className="text-sm text-forest-800">{t.organization}</p> : null}
                    {t.description ? <p className="mt-2 text-sm text-muted-foreground">{t.description}</p> : null}
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading eyebrow="Recognition" title="Awards & achievements" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {awards.map((a, i) => {
                const { label, Icon } = KIND_META[a.kind] ?? KIND_META.AWARD;
                return (
                  <Reveal key={a.id} delay={i * 0.06}>
                    <div className="h-full rounded-2xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-soft">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-100 text-gold-700"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gold-700">{label}{a.year ? ` · ${a.year}` : ""}</p>
                      <h3 className="mt-1 font-serif text-lg text-forest-900">{a.title}</h3>
                      {a.issuer ? <p className="text-sm text-forest-800">{a.issuer}</p> : null}
                      {a.description ? <p className="mt-2 text-sm text-muted-foreground">{a.description}</p> : null}
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Publications */}
      {publications.length > 0 && (
        <section className="section bg-cream-100">
          <div className="container max-w-4xl">
            <SectionHeading eyebrow="Research" title="Publications" />
            <ul className="space-y-4">
              {publications.map((p) => (
                <li key={p.id} className="flex gap-4 rounded-2xl border bg-white p-5">
                  <BookOpen className="mt-1 h-5 w-5 shrink-0 text-gold-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-forest-900">
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline">{p.title}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
                      ) : p.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{[p.authors, p.journal, p.year].filter(Boolean).join(" · ")}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Certificates */}
      {certificates.length > 0 && (
        <section className="section">
          <div className="container">
            <SectionHeading eyebrow="Credentials" title="Certificates" />
            {certificates.some((c) => c.imageUrl) ? (
              <PhotoGrid photos={certificates.filter((c) => c.imageUrl).map((c) => ({ id: c.id, url: c.imageUrl, caption: [c.title, c.issuer, c.year].filter(Boolean).join(" · "), alt: c.title }))} />
            ) : null}
            {certificates.filter((c) => !c.imageUrl).length > 0 && (
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {certificates.filter((c) => !c.imageUrl).map((c) => (
                  <li key={c.id} className="flex gap-3 rounded-xl border bg-white p-4"><BadgeCheck className="h-5 w-5 text-gold-600" aria-hidden="true" />{[c.title, c.issuer, c.year].filter(Boolean).join(" · ")}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </>
  );
}
