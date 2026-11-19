import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/site/hero";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/page-header";
import { StatsCounter } from "@/components/site/stats-counter";
import { PostCard, ServiceCard } from "@/components/site/cards";
import { VideoCard } from "@/components/site/video-card";
import { TestimonialSlider } from "@/components/site/testimonial-slider";
import { CtaBanner } from "@/components/site/cta-banner";
import { SmartImage } from "@/components/site/smart-image";
import { getProfile, getSettings } from "@/lib/settings";
import { getApprovedFeedback, getLatestPosts, getStats, getVideos, getVisibleServices } from "@/lib/queries";

// Re-generated in the background at most every 5 minutes, and immediately after any admin change.
export const revalidate = 300;

export default async function HomePage() {
  const [settings, profile, stats, services, posts, videos, testimonials] = await Promise.all([
    getSettings(),
    getProfile(),
    getStats(),
    getVisibleServices(),
    getLatestPosts(3),
    getVideos(),
    getApprovedFeedback(8),
  ]);

  return (
    <>
      <Hero
        eyebrow={settings.heroEyebrow}
        title={settings.heroTitle || settings.siteName}
        subtitle={settings.heroSubtitle}
        imageUrl={settings.heroImageUrl || profile.photoUrl}
        name={profile.fullName}
        designation={profile.designation}
        degrees={profile.degrees}
      />

      {/* Intro */}
      <section className="section">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-soft">
              <SmartImage src={profile.aboutImageUrl || profile.photoUrl} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-6 right-6 hidden rounded-2xl bg-forest-800 px-6 py-4 text-cream-50 shadow-soft sm:block">
              <p className="font-serif text-lg">{profile.designation}</p>
              <p className="max-w-[16rem] text-xs text-cream-200/80">{profile.institution}</p>
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={0.1}>
            <p className="eyebrow">About the doctor</p>
            <h2 className="heading-lg mt-3">{settings.introTitle || `Meet ${profile.fullName}`}</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">{settings.introText || profile.shortBio}</p>
            {settings.introText && profile.shortBio ? <p className="mt-4 leading-relaxed text-muted-foreground">{profile.shortBio}</p> : null}
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["Personalised consultation", "Classical Ayurveda approach", "Diet & lifestyle guidance", "Academic & research background"].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-forest-800"><CheckCircle2 className="h-4 w-4 text-gold-600" aria-hidden="true" />{t}</li>
              ))}
            </ul>
            <Button asChild variant="outline" className="mt-8"><Link href="/about">Read full profile <ArrowRight /></Link></Button>
          </Reveal>
        </div>
      </section>

      {/* Highlights */}
      {stats.length > 0 && (
        <section className="bg-forest-900 py-14">
          <div className="container"><StatsCounter stats={stats} /></div>
        </section>
      )}

      {/* Services */}
      {services.length > 0 && (
        <section className="section">
          <div className="container">
            <Reveal><SectionHeading eyebrow="Treatments" title="Consultations & therapies" text="Ayurvedic care planned around your constitution, lifestyle and health goals." /></Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((s, i) => (
                <Reveal key={s.id} delay={i * 0.08}><ServiceCard service={s} /></Reveal>
              ))}
            </div>
            <div className="mt-10 text-center"><Button asChild variant="outline"><Link href="/services">All services <ArrowRight /></Link></Button></div>
          </div>
        </section>
      )}

      {/* Articles */}
      {posts.length > 0 && (
        <section className="section bg-cream-100">
          <div className="container">
            <Reveal><SectionHeading eyebrow="Knowledge" title="Latest articles" text="Ayurveda health tips for everyday living." /></Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p, i) => <Reveal key={p.id} delay={i * 0.08}><PostCard post={p} /></Reveal>)}
            </div>
            <div className="mt-10 text-center"><Button asChild variant="outline"><Link href="/blog">Read all articles <ArrowRight /></Link></Button></div>
          </div>
        </section>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <section className="section">
          <div className="container">
            <Reveal><SectionHeading eyebrow="Watch" title="Video highlights" text="Lectures, talks and health awareness videos." /></Reveal>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.slice(0, 3).map((v, i) => <Reveal key={v.id} delay={i * 0.08}><VideoCard video={v} compact /></Reveal>)}
            </div>
            <div className="mt-10 text-center"><Button asChild variant="outline"><Link href="/videos">More videos <ArrowRight /></Link></Button></div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="section bg-leaf-pattern">
          <div className="container">
            <Reveal><SectionHeading eyebrow="Kind words" title="What people say" /></Reveal>
            <Reveal><TestimonialSlider items={testimonials} /></Reveal>
            <div className="mt-8 text-center"><Button asChild variant="link"><Link href="/feedback">Share your feedback <ArrowRight /></Link></Button></div>
          </div>
        </section>
      )}

      <CtaBanner title={settings.ctaTitle || "Begin your journey to balanced health"} text={settings.ctaText} />
    </>
  );
}
