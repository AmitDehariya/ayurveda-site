import type { SiteSetting } from "@prisma/client";
import { FacebookIcon, InstagramIcon, LinkedinIcon, XIcon, YoutubeIcon } from "./icons";
import { cn } from "@/lib/utils";

export function SocialLinks({ settings, className }: { settings: SiteSetting; className?: string }) {
  const links = [
    { href: settings.facebookUrl, label: "Facebook", Icon: FacebookIcon },
    { href: settings.instagramUrl, label: "Instagram", Icon: InstagramIcon },
    { href: settings.youtubeUrl, label: "YouTube", Icon: YoutubeIcon },
    { href: settings.linkedinUrl, label: "LinkedIn", Icon: LinkedinIcon },
    { href: settings.twitterUrl, label: "X (Twitter)", Icon: XIcon },
  ].filter((l) => l.href);

  if (!links.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {links.map(({ href, label, Icon }) => (
        <li key={label}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="grid h-10 w-10 place-items-center rounded-full border border-current/20 transition hover:-translate-y-0.5 hover:bg-gold-400 hover:text-forest-950"
          >
            <Icon className="h-4 w-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}
