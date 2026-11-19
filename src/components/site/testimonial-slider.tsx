"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Stars } from "./stars";
import { SmartImage } from "./smart-image";

type T = { id: string; name: string; city: string; rating: number; message: string; photoUrl: string };

export function TestimonialSlider({ items }: { items: T[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + count) % count), [count]);

  // Auto-advance every 6s, paused on hover/focus.
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, count, go]);

  if (!count) return null;
  const t = items[index];

  return (
    <div
      className="relative mx-auto max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Testimonials"
    >
      <div className="relative min-h-[300px] overflow-hidden rounded-3xl border bg-white p-8 shadow-soft sm:p-12">
        <Quote className="absolute right-8 top-8 h-16 w-16 text-gold-200" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.figure
            key={t.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            aria-live={paused ? "polite" : "off"}
          >
            <Stars rating={t.rating} />
            <blockquote className="relative mt-5 font-serif text-xl leading-relaxed text-forest-900 sm:text-2xl">“{t.message}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              {t.photoUrl ? (
                <SmartImage src={t.photoUrl} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-100 font-serif text-lg text-forest-800" aria-hidden="true">
                  {t.name.charAt(0)}
                </span>
              )}
              <span>
                <span className="block font-medium text-forest-900">{t.name}</span>
                {t.city ? <span className="block text-sm text-muted-foreground">{t.city}</span> : null}
              </span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" onClick={() => go(-1)} className="grid h-10 w-10 place-items-center rounded-full border bg-white text-forest-800 transition hover:bg-forest-50" aria-label="Previous testimonial">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex gap-2">
            {items.map((it, i) => (
              <button
                key={it.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-forest-700" : "w-2.5 bg-forest-200 hover:bg-forest-300"}`}
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} className="grid h-10 w-10 place-items-center rounded-full border bg-white text-forest-800 transition hover:bg-forest-50" aria-label="Next testimonial">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
