import Link from "next/link";
import type { SiteSetting } from "@prisma/client";
import { Clock, Mail, MapPin, Phone, ShieldAlert } from "lucide-react";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";
import { SocialLinks } from "./social-links";
import { LeafSprig } from "./icons";

export function Footer({ settings, services }: { settings: SiteSetting; services: { title: string; slug: string }[] }) {
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-forest-900 text-cream-100">
      <LeafSprig className="pointer-events-none absolute -right-10 -top-6 h-64 w-64 text-forest-700/40" />
      <div className="container relative grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo siteName={settings.siteName} tagline={settings.tagline} logoUrl={settings.logoUrl} light />
          {settings.footerText ? <p className="text-sm leading-relaxed text-cream-200/80">{settings.footerText}</p> : null}
          <SocialLinks settings={settings} className="text-cream-100" />
        </div>

        <div>
          <h2 className="mb-4 font-serif text-lg text-gold-200">Quick links</h2>
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-cream-200/85 transition hover:text-gold-300">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-lg text-gold-200">Services</h2>
          <ul className="space-y-2 text-sm">
            {services.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="text-cream-200/85 transition hover:text-gold-300">{s.title}</Link>
              </li>
            ))}
            {!services.length && <li className="text-cream-200/60">Coming soon</li>}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-serif text-lg text-gold-200">Contact</h2>
          <ul className="space-y-3 text-sm text-cream-200/85">
            {settings.address && (
              <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" /><span className="whitespace-pre-line">{settings.address}</span></li>
            )}
            {settings.phone && (
              <li className="flex gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" /><a className="hover:text-gold-300" href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a></li>
            )}
            {settings.email && (
              <li className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" /><a className="break-all hover:text-gold-300" href={`mailto:${settings.email}`}>{settings.email}</a></li>
            )}
            {settings.timings && (
              <li className="flex gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" /><span className="whitespace-pre-line">{settings.timings}</span></li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-100/10">
        <div className="container flex flex-col gap-3 py-6 text-xs text-cream-200/70 md:flex-row md:items-center md:justify-between">
          <p className="flex items-start gap-2"><ShieldAlert className="h-4 w-4 shrink-0 text-gold-300" />{settings.disclaimer}</p>
          <p className="shrink-0">© {year} {settings.siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
