import type { SVGProps } from "react";
import {
  Leaf, Flower2, Sprout, HeartPulse, Droplets, Sun, Moon, Apple, Baby, Brain, Stethoscope,
  GraduationCap, Users, BookOpen, Award, Activity, Sparkles, Flame, Wind, Salad, type LucideIcon,
} from "lucide-react";

/** Icons the admin can pick for services / stats (by name). */
export const ICONS: Record<string, LucideIcon> = {
  leaf: Leaf, flower: Flower2, sprout: Sprout, heart: HeartPulse, droplets: Droplets, sun: Sun,
  moon: Moon, apple: Apple, baby: Baby, brain: Brain, stethoscope: Stethoscope,
  graduation: GraduationCap, users: Users, book: BookOpen, award: Award, activity: Activity,
  sparkles: Sparkles, flame: Flame, wind: Wind, salad: Salad,
};

export const ICON_NAMES = Object.keys(ICONS);

export function DynamicIcon({ name, ...props }: { name: string } & React.ComponentProps<LucideIcon>) {
  const Icon = ICONS[name] ?? Leaf;
  return <Icon {...props} />;
}

// Brand icons (lucide no longer ships brand logos).
type P = SVGProps<SVGSVGElement>;
export const FacebookIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v9h4v-9h3l.5-4h-3.5V8.8c0-.5.3-.8.5-.8Z" /></svg>
);
export const InstagramIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
);
export const YoutubeIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .6 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15V9l5.8 3-5.8 3Z" /></svg>
);
export const LinkedinIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6.1V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5Z" /></svg>
);
export const XIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" /></svg>
);
export const WhatsappIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" /></svg>
);

/** Decorative leaf sprig used as a motif. */
export function LeafSprig({ className, ...p }: P) {
  return (
    <svg viewBox="0 0 120 120" fill="none" aria-hidden="true" className={className} {...p}>
      <path d="M10 110C40 80 70 50 110 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M38 82c-14-2-22-12-22-26 14 2 22 12 22 26Z" fill="currentColor" opacity=".55" />
      <path d="M38 82c2-14 12-22 26-22-2 14-12 22-26 22Z" fill="currentColor" opacity=".35" />
      <path d="M62 58c-12-2-19-11-19-23 12 2 19 11 19 23Z" fill="currentColor" opacity=".55" />
      <path d="M62 58c2-12 11-19 23-19-2 12-11 19-23 19Z" fill="currentColor" opacity=".35" />
      <path d="M84 36c-10-2-16-9-16-19 10 2 16 9 16 19Z" fill="currentColor" opacity=".55" />
      <path d="M84 36c2-10 9-16 19-16-2 10-9 16-19 16Z" fill="currentColor" opacity=".35" />
    </svg>
  );
}

/** Small ornamental divider (leaf between two lines). */
export function Ornament({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-gold-500 ${className ?? ""}`} aria-hidden="true">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-400" />
      <Leaf className="h-4 w-4" />
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-400" />
    </div>
  );
}
