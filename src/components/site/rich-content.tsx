import { sanitizeRichText } from "@/lib/sanitize";
import { cn } from "@/lib/utils";

/** Renders admin-authored HTML after sanitising it (XSS protection). */
export function RichContent({ html, className }: { html: string; className?: string }) {
  const clean = sanitizeRichText(html);
  if (!clean) return null;
  return <div className={cn("rich-content", className)} dangerouslySetInnerHTML={{ __html: clean }} />;
}
