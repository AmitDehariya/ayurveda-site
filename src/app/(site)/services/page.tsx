import type { Metadata } from "next";
import { PageHeader } from "@/components/site/page-header";
import { ServiceCard } from "@/components/site/cards";
import { Reveal } from "@/components/site/reveal";
import { Disclaimer } from "@/components/site/disclaimer";
import { CtaBanner } from "@/components/site/cta-banner";
import { getVisibleServices } from "@/lib/queries";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Services & Treatments",
  description: "Ayurvedic consultations and therapies – Panchakarma, diet & lifestyle counselling, women's health and more.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getVisibleServices(), getSettings()]);
  return (
    <>
      <PageHeader title="Services & Treatments" subtitle="Ayurvedic consultations and therapies, planned for you after a personal assessment." crumbs={[{ label: "Services" }]} />
      <section className="section">
        <div className="container">
          {services.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s, i) => <Reveal key={s.id} delay={(i % 3) * 0.08}><ServiceCard service={s} /></Reveal>)}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Services will be listed here soon.</p>
          )}
          <Disclaimer text={settings.disclaimer} className="mx-auto mt-12 max-w-3xl" />
        </div>
      </section>
      <CtaBanner title={settings.ctaTitle || "Not sure which service is right for you?"} text={settings.ctaText} />
    </>
  );
}
