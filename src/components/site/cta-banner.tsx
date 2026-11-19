import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeafSprig } from "./icons";
import { Reveal } from "./reveal";

export function CtaBanner({ title, text }: { title: string; text: string }) {
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-800 via-forest-700 to-forest-900 px-6 py-14 text-center text-cream-50 shadow-soft sm:px-12">
            <LeafSprig className="pointer-events-none absolute -left-6 -top-6 h-40 w-40 text-gold-300/25" />
            <LeafSprig className="pointer-events-none absolute -bottom-8 -right-6 h-48 w-48 rotate-180 text-gold-300/20" />
            <h2 className="relative mx-auto max-w-2xl font-serif text-3xl text-cream-50 sm:text-4xl">{title}</h2>
            {text ? <p className="relative mx-auto mt-4 max-w-xl text-cream-200/90">{text}</p> : null}
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="/contact">Book an Inquiry <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-cream-100/40 text-cream-50 hover:bg-cream-50/10">
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
