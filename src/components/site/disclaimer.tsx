import { ShieldAlert } from "lucide-react";

export function Disclaimer({ text, className }: { text: string; className?: string }) {
  return (
    <aside
      role="note"
      className={`flex gap-3 rounded-2xl border border-gold-300/60 bg-gold-100/50 p-4 text-sm text-forest-900 ${className ?? ""}`}
    >
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden="true" />
      <p><strong className="font-semibold">Medical disclaimer: </strong>{text}</p>
    </aside>
  );
}
