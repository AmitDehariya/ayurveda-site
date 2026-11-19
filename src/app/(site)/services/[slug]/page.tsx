import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/page-header";
import { RichContent } from "@/components/site/rich-content";
import { SmartImage } from "@/components/site/smart-image";
import { Disclaimer } from "@/components/site/disclaimer";
import { DynamicIcon } from "@/components/site/icons";
import { getServiceBySlug, getVisibleServices } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { safeDecode, shareImage } from "@/lib/utils";

export const revalidate = 300;

// Pages are generated on first visit and then cached (on-demand ISR); admin changes refresh them.
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getServiceBySlug(safeDecode((await params).slug));
  if (!s) return { title: "Service not found" };
  return {
    title: s.metaTitle || s.title,
    description: s.metaDescription || s.shortDescription,
    alternates: { canonical: `/services/${s.slug}` },
    openGraph: { images: [shareImage(s.imageUrl)] },
  };
}

export default async function ServicePage({ params }: Props) {
  const slug = safeDecode((await params).slug);
  const [service, all, settings] = await Promise.all([getServiceBySlug(slug), getVisibleServices(), getSettings()]);
  if (!service) notFound();
  const others = all.filter((s) => s.id !== service.id);

  return (
    <>
      <PageHeader title={service.title} subtitle={service.shortDescription} crumbs={[{ href: "/services", label: "Services" }, { label: service.title }]} />
      <section className="section">
        <div className="container grid gap-12 lg:grid-cols-[1fr_320px]">
          <article>
            {service.imageUrl ? (
              <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl shadow-soft">
                <SmartImage src={service.imageUrl} alt={service.title} fill priority sizes="(min-width: 1024px) 800px, 100vw" className="object-cover" />
              </div>
            ) : null}
            <RichContent html={service.contentHtml} />
            <Disclaimer text={settings.disclaimer} className="mt-10" />
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl bg-forest-800 p-6 text-cream-50 shadow-soft">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-400 text-forest-950"><DynamicIcon name={service.icon} className="h-6 w-6" aria-hidden="true" /></span>
              <h2 className="mt-4 font-serif text-2xl text-cream-50">Interested in {service.title}?</h2>
              <p className="mt-2 text-sm text-cream-200/85">Send an inquiry and we will get back to you to discuss whether it suits you.</p>
              <Button asChild variant="gold" className="mt-5 w-full">
                <Link href={`/contact?subject=${encodeURIComponent(service.title)}`}>Send inquiry <ArrowRight /></Link>
              </Button>
              {settings.phone ? (
                <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="mt-3 flex items-center justify-center gap-2 text-sm text-cream-100 hover:text-gold-300"><Phone className="h-4 w-4" aria-hidden="true" />{settings.phone}</a>
              ) : null}
            </div>
            {others.length > 0 && (
              <nav className="rounded-3xl border bg-white p-6" aria-label="Other services">
                <h2 className="font-serif text-lg">Other services</h2>
                <ul className="mt-3 space-y-1">
                  {others.map((o) => (
                    <li key={o.id}>
                      <Link href={`/services/${o.slug}`} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-forest-800 hover:bg-forest-50">
                        {o.title} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
