"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { NAV_LINKS } from "./nav-links";
import { cn } from "@/lib/utils";

type Props = { siteName: string; tagline: string; logoUrl: string; phone: string };

export function Navbar({ siteName, tagline, logoUrl, phone }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation and lock body scroll while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled ? "border-b border-border/60 bg-cream-50/90 shadow-sm backdrop-blur-md" : "bg-transparent",
      )}
    >
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <nav className="container flex h-20 items-center justify-between gap-4" aria-label="Main">
        <Logo siteName={siteName} tagline={tagline} logoUrl={logoUrl} />

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3 py-2 text-sm font-medium text-forest-800 transition-colors hover:text-forest-950",
                  "after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-gold-500 after:transition-transform hover:after:scale-x-100",
                  isActive(l.href) && "text-forest-950 after:scale-x-100",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="gold" className="hidden sm:inline-flex">
            <Link href="/contact">Book Inquiry</Link>
          </Button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full text-forest-900 hover:bg-forest-50 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-20 z-40 overflow-y-auto bg-cream-50 lg:hidden"
          >
            <ul className="container flex flex-col gap-1 py-6">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn(
                      "block rounded-xl px-4 py-3 font-serif text-xl text-forest-900 hover:bg-forest-50",
                      isActive(l.href) && "bg-forest-100",
                    )}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="mt-4 flex flex-col gap-3 px-4">
                <Button asChild variant="gold" size="lg">
                  <Link href="/contact">Book Inquiry</Link>
                </Button>
                {phone ? (
                  <Button asChild variant="outline" size="lg">
                    <a href={`tel:${phone.replace(/\s/g, "")}`}><Phone /> {phone}</a>
                  </Button>
                ) : null}
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
