import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LeafSprig, Ornament } from "./icons";

type Crumb = { href?: string; label: string };

/** Banner at the top of inner pages, with breadcrumbs. */
export function PageHeader({ title, subtitle, crumbs = [] }: { title: string; subtitle?: string; crumbs?: Crumb[] }) {
  return (
    <section className="bg-leaf-pattern relative overflow-hidden border-b border-border/60">
      <LeafSprig className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 text-forest-300/40" />
      <LeafSprig className="pointer-events-none absolute -right-6 -top-4 h-48 w-48 rotate-180 text-gold-300/40" />
      <div className="container relative py-14 text-center md:py-20">
        <nav aria-label="Breadcrumb" className="mb-4 flex justify-center">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <li><Link href="/" className="hover:text-forest-800">Home</Link></li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                {c.href ? <Link href={c.href} className="hover:text-forest-800">{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <h1 className="heading-lg mx-auto max-w-3xl">{title}</h1>
        <Ornament className="mt-4 justify-center" />
        {subtitle ? <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{subtitle}</p> : null}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, text, center = true }: { eyebrow?: string; title: string; text?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto mb-12 max-w-2xl text-center" : "mb-10 max-w-2xl"}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="heading-lg mt-3">{title}</h2>
      <Ornament className={center ? "mt-4 justify-center" : "mt-4"} />
      {text ? <p className="mt-4 text-muted-foreground">{text}</p> : null}
    </div>
  );
}
