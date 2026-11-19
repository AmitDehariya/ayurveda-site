import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { FloatingActions } from "@/components/site/floating-actions";
import { JsonLd, physicianJsonLd } from "@/components/site/json-ld";
import { getProfile, getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

async function getFooterServices() {
  try {
    return await prisma.service.findMany({
      where: { isVisible: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: { title: true, slug: true },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, profile, services] = await Promise.all([getSettings(), getProfile(), getFooterServices()]);
  return (
    <>
      <JsonLd data={physicianJsonLd(settings, profile)} />
      <Navbar siteName={settings.siteName} tagline={settings.tagline} logoUrl={settings.logoUrl} phone={settings.phone} />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} services={services} />
      <FloatingActions whatsappNumber={settings.whatsappNumber} siteName={settings.siteName} />
    </>
  );
}
