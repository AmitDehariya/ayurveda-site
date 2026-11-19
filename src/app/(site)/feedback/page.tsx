import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { Stars } from "@/components/site/stars";
import { SmartImage } from "@/components/site/smart-image";
import { Reveal } from "@/components/site/reveal";
import { FeedbackForm } from "@/components/site/feedback-form";
import { getApprovedFeedback } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Feedback & Testimonials",
  description: "Read what patients and students say, and share your own experience.",
  alternates: { canonical: "/feedback" },
};

export default async function FeedbackPage() {
  const items = await getApprovedFeedback();
  return (
    <>
      <PageHeader title="Feedback & Testimonials" subtitle="Your experience helps others. Feedback is published after review." crumbs={[{ label: "Feedback" }]} />
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1fr_420px]">
          <div>
            <h2 className="heading-lg mb-8 text-3xl">What people say</h2>
            {items.length ? (
              <ul className="columns-1 gap-5 md:columns-2">
                {items.map((f, i) => (
                  <li key={f.id} className="mb-5 break-inside-avoid">
                    <Reveal delay={(i % 4) * 0.05}>
                      <figure className="rounded-2xl border bg-white p-6 shadow-sm">
                        <Stars rating={f.rating} />
                        <blockquote className="mt-3 leading-relaxed text-forest-900">“{f.message}”</blockquote>
                        <figcaption className="mt-4 flex items-center gap-3">
                          {f.photoUrl ? (
                            <SmartImage src={f.photoUrl} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                          ) : (
                            <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-100 font-serif text-forest-800" aria-hidden="true">{f.name.charAt(0)}</span>
                          )}
                          <span>
                            <span className="block text-sm font-medium text-forest-900">{f.name}</span>
                            <span className="block text-xs text-muted-foreground">{[f.city, formatDate(f.createdAt, { month: "short", year: "numeric" })].filter(Boolean).join(" · ")}</span>
                          </span>
                        </figcaption>
                      </figure>
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Be the first to share your feedback.</p>
            )}
          </div>
          <aside id="share" className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border bg-cream-100 p-6 sm:p-8">
              <h2 className="font-serif text-2xl">Share your feedback</h2>
              <FeedbackForm />
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
