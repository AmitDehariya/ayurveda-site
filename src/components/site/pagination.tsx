import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Server-rendered pagination that keeps the other query params (search, category). */
export function Pagination({ page, pages, basePath, params }: { page: number; pages: number; basePath: string; params: Record<string, string> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const sp = new URLSearchParams({ ...params, ...(p > 1 ? { page: String(p) } : {}) });
    if (p <= 1) sp.delete("page");
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const item = "grid h-10 min-w-10 place-items-center rounded-full border px-3 text-sm transition";
  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={cn(item, "bg-white hover:bg-forest-50")} rel="prev" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Link>
      ) : null}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link key={p} href={href(p)} aria-current={p === page ? "page" : undefined} className={cn(item, p === page ? "border-forest-700 bg-forest-700 text-cream-50" : "bg-white hover:bg-forest-50")}>
          {p}
        </Link>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} className={cn(item, "bg-white hover:bg-forest-50")} rel="next" aria-label="Next page"><ChevronRight className="h-4 w-4" /></Link>
      ) : null}
    </nav>
  );
}
