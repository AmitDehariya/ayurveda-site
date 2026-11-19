import Link from "next/link";
import { Leaf } from "lucide-react";
import { SmartImage } from "./smart-image";
import { cn } from "@/lib/utils";

export function Logo({ siteName, logoUrl, tagline, light }: { siteName: string; logoUrl?: string; tagline?: string; light?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label={`${siteName} – home`}>
      {logoUrl ? (
        <SmartImage src={logoUrl} alt="" width={44} height={44} className="h-11 w-11 rounded-full object-contain" />
      ) : (
        <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-800 text-gold-300 shadow-soft transition-transform group-hover:rotate-12">
          <Leaf className="h-5 w-5" />
        </span>
      )}
      <span className="flex flex-col leading-tight">
        <span className={cn("font-serif text-lg font-semibold", light ? "text-cream-50" : "text-forest-900")}>{siteName}</span>
        {tagline ? (
          <span className={cn("text-[11px] uppercase tracking-[0.18em]", light ? "text-gold-200" : "text-gold-700")}>{tagline}</span>
        ) : null}
      </span>
    </Link>
  );
}
