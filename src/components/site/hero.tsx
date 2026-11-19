"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, GraduationCap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SmartImage } from "./smart-image";
import { LeafSprig } from "./icons";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  name: string;
  designation: string;
  degrees: string;
};

export function Hero({ eyebrow, title, subtitle, imageUrl, name, designation, degrees }: Props) {
  const reduce = useReducedMotion();
  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <section className="bg-leaf-pattern relative -mt-20 overflow-hidden pt-20">
      <div className="pointer-events-none absolute -right-32 top-10 h-[480px] w-[480px] rounded-full bg-gold-200/40 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-[360px] w-[360px] rounded-full bg-forest-200/50 blur-3xl" aria-hidden="true" />
      <LeafSprig className="pointer-events-none absolute left-[42%] top-24 hidden h-24 w-24 animate-float-slow text-forest-400/40 lg:block" />

      <div className="container relative grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {eyebrow ? (
            <motion.p {...fade(0)} className="eyebrow">
              <span className="h-px w-8 bg-gold-500" aria-hidden="true" /> {eyebrow}
            </motion.p>
          ) : null}
          <motion.h1 {...fade(0.1)} className="heading-xl mt-5">{title}</motion.h1>
          <motion.div {...fade(0.2)} className="mt-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-forest-800 text-gold-300"><GraduationCap className="h-5 w-5" aria-hidden="true" /></span>
            <p className="leading-tight">
              <span className="block font-serif text-lg font-semibold text-forest-900">{name}</span>
              <span className="text-sm text-muted-foreground">{[designation, degrees].filter(Boolean).join(" · ")}</span>
            </p>
          </motion.div>
          {subtitle ? <motion.p {...fade(0.3)} className="mt-6 max-w-xl text-lg leading-relaxed text-forest-800/80">{subtitle}</motion.p> : null}
          <motion.div {...fade(0.4)} className="mt-9 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/contact?subject=Consultation">Book Inquiry <ArrowRight /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/contact"><MessageCircle /> Contact</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          {...(reduce ? {} : { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } })}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="absolute -inset-4 rounded-t-full border border-gold-400/50" aria-hidden="true" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-forest-100 shadow-soft">
            <SmartImage src={imageUrl} alt={`Portrait of ${name}`} fill priority sizes="(min-width: 1024px) 420px, 90vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-5 -left-4 rounded-2xl border bg-white/95 px-5 py-4 shadow-soft backdrop-blur sm:-left-10">
            <p className="font-serif text-lg text-forest-900">Ayurveda</p>
            <p className="text-xs text-muted-foreground">Ancient wisdom · Modern care</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
