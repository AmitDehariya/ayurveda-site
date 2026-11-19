import { Star } from "lucide-react";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={`flex gap-0.5 ${className ?? ""}`} role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= rating ? "fill-gold-400 text-gold-400" : "text-gold-200"}`} aria-hidden="true" />
      ))}
    </div>
  );
}
