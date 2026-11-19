"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { DynamicIcon } from "./icons";

type Stat = { id: string; label: string; value: number; suffix: string; icon: string };

function CountUp({ value, run }: { value: number; run: boolean }) {
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!run) return;
    if (reduce) return setN(value);
    const start = performance.now();
    const duration = 1600;
    let frame = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, value, reduce]);
  return <>{n.toLocaleString("en-IN")}</>;
}

export function StatsCounter({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  if (!stats.length) return null;
  return (
    <div ref={ref} className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {stats.map((s) => (
        <div key={s.id} className="group rounded-2xl border border-cream-100/10 bg-forest-800/60 p-6 text-center transition hover:-translate-y-1 hover:bg-forest-800">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-gold-400/15 text-gold-300 transition group-hover:scale-110">
            <DynamicIcon name={s.icon} className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="font-serif text-3xl font-semibold text-cream-50 sm:text-4xl">
            <span className="sr-only">{s.value.toLocaleString("en-IN")}{s.suffix}</span>
            <span aria-hidden="true"><CountUp value={s.value} run={inView} />{s.suffix}</span>
          </p>
          <p className="mt-1 text-sm text-cream-200/80">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
