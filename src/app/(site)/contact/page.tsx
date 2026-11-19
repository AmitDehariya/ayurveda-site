import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { SocialLinks } from "@/components/site/social-links";
import { WhatsappIcon } from "@/components/site/icons";
import { Disclaimer } from "@/components/site/disclaimer";
import { ContactForm } from "@/components/site/contact-form";
import { getSettings } from "@/lib/settings";
import { digitsOnly } from "@/lib/utils";
import { safeMapEmbed } from "@/lib/validators";

export const metadata: Metadata = {
  title: "Contact & Inquiry",
  description: "Send an inquiry, find the clinic / college address, timings and contact details.",
  alternates: { canonical: "/contact" },
};

type Props = { searchParams: Promise<{ subject?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const [settings, sp] = await Promise.all([getSettings(), searchParams]);
  const defaultSubject = (sp.subject ?? "").slice(0, 120);
  const map = safeMapEmbed(settings.mapEmbedUrl);
  const wa = digitsOnly(settings.whatsappNumber);

  const info = [
    settings.address && { Icon: MapPin, label: "Address", value: <span className="whitespace-pre-line">{settings.address}</span> },
    settings.phone && { Icon: Phone, label: "Phone", value: <a href={`tel:${settings.phone.replace(/\s/g, "")}`} className="hover:underline">{settings.phone}</a> },
    settings.email && { Icon: Mail, label: "Email", value: <a href={`mailto:${settings.email}`} className="break-all hover:underline">{settings.email}</a> },
    settings.timings && { Icon: Clock, label: "Timings", value: <span className="whitespace-pre-line">{settings.timings}</span> },
  ].filter(Boolean) as { Icon: typeof MapPin; label: string; value: React.ReactNode }[];

  return (
    <>
      <PageHeader title="Contact & Inquiry" subtitle="Have a question or want to book a consultation? Send a message – we usually reply within 1–2 working days." crumbs={[{ label: "Contact" }]} />
      <section className="section">
        <div className="container grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-2xl">Send an inquiry</h2>
            <p className="mt-1 text-sm text-muted-foreground">Fields marked * are required.</p>
            <ContactForm defaultSubject={defaultSubject} />
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-forest-800 p-6 text-cream-50 shadow-soft sm:p-8">
              <h2 className="font-serif text-2xl text-cream-50">Get in touch</h2>
              <ul className="mt-6 space-y-5">
                {info.map(({ Icon, label, value }) => (
                  <li key={label} className="flex gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-400/15 text-gold-300"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <div><p className="text-xs uppercase tracking-wider text-gold-200">{label}</p><div className="mt-0.5 text-sm text-cream-100">{value}</div></div>
                  </li>
                ))}
              </ul>
              {wa ? (
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:brightness-105">
                  <WhatsappIcon className="h-5 w-5" /> Chat on WhatsApp
                </a>
              ) : null}
              <SocialLinks settings={settings} className="mt-6 text-cream-100" />
            </div>
            <Disclaimer text={settings.disclaimer} />
          </aside>
        </div>

        {map ? (
          <div className="container mt-12">
            <div className="overflow-hidden rounded-3xl border shadow-sm">
              <iframe src={map} title="Location map" className="h-[380px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
            {settings.mapLink ? (
              <a href={settings.mapLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-forest-700 hover:underline">
                Open in Google Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
