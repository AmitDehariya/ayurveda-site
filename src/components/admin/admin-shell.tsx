"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  BarChart3, ExternalLink, Images, Inbox, KeyRound, LayoutDashboard, Leaf, LogOut, Menu,
  MessageSquareHeart, Newspaper, Settings, UserRound, Video, X,
} from "lucide-react";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

type Counts = { inquiries: number; feedback: number };

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/inquiries", label: "Inquiries", Icon: Inbox, badge: "inquiries" as const },
  { href: "/admin/feedback", label: "Feedback", Icon: MessageSquareHeart, badge: "feedback" as const },
  { href: "/admin/blog", label: "Articles", Icon: Newspaper },
  { href: "/admin/services", label: "Services", Icon: Leaf },
  { href: "/admin/gallery", label: "Gallery", Icon: Images },
  { href: "/admin/videos", label: "Videos", Icon: Video },
  { href: "/admin/profile", label: "Profile & About", Icon: UserRound },
  { href: "/admin/stats", label: "Home Numbers", Icon: BarChart3 },
  { href: "/admin/settings", label: "Site Settings", Icon: Settings },
  { href: "/admin/password", label: "Change Password", Icon: KeyRound },
];

export function AdminShell({ children, counts, adminName }: { children: React.ReactNode; counts: Counts; adminName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav className="flex h-full flex-col" aria-label="Admin">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-400 text-forest-950"><Leaf className="h-5 w-5" aria-hidden="true" /></span>
        <div className="leading-tight">
          <p className="font-serif text-lg text-cream-50">Admin Panel</p>
          <p className="text-xs text-cream-200/70">Hello, {adminName || "Doctor"}</p>
        </div>
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {NAV.map(({ href, label, Icon, badge }) => {
          const n = badge ? counts[badge] : 0;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-cream-100/85 transition hover:bg-forest-800 hover:text-cream-50",
                  isActive(href) && "bg-forest-800 text-cream-50 shadow-inner",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {n > 0 ? <span className="rounded-full bg-gold-400 px-2 py-0.5 text-xs font-semibold text-forest-950">{n}</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1 border-t border-cream-100/10 p-3">
        <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream-100/85 hover:bg-forest-800">
          <ExternalLink className="h-5 w-5" aria-hidden="true" /> View website
        </a>
        <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream-100/85 hover:bg-forest-800">
          <LogOut className="h-5 w-5" aria-hidden="true" /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-cream-50">
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-forest-900 lg:block">{nav}</aside>

        {/* Mobile top bar + drawer */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-forest-900 px-4 text-cream-50 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-forest-800" aria-label="Open menu" aria-expanded={open}>
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-serif text-lg">Admin Panel</span>
          <span className="w-10" />
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
            <button type="button" className="absolute inset-0 bg-forest-950/60" onClick={() => setOpen(false)} aria-label="Close menu" />
            <aside className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-forest-900 shadow-2xl">
              <button type="button" onClick={() => setOpen(false)} className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-full text-cream-50 hover:bg-forest-800" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              {nav}
            </aside>
          </div>
        )}

        <div className="lg:pl-64">
          <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">{children}</main>
        </div>
      </div>
    </ConfirmProvider>
  );
}

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl text-forest-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
