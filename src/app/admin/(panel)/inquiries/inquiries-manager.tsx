"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Inquiry } from "@prisma/client";
import { ChevronDown, Download, Mail, MailCheck, MailOpen, Phone, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { WhatsappIcon } from "@/components/site/icons";
import { api } from "@/lib/client-api";
import { cn, digitsOnly } from "@/lib/utils";

type Props = { items: Inquiry[]; total: number; page: number; pages: number; status: string; q: string; counts: Record<string, number> };

const FILTERS = [
  { id: "", label: "All" },
  { id: "NEW", label: "New" },
  { id: "READ", label: "Read" },
  { id: "REPLIED", label: "Replied" },
];
const BADGE = { NEW: "gold", READ: "muted", REPLIED: "success" } as const;

export function InquiriesManager({ items: initial, total, page, pages, status, q, counts }: Props) {
  const router = useRouter();
  const confirm = useConfirm();
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState<string | null>(null);
  const [search, setSearch] = useState(q);
  useEffect(() => setItems(initial), [initial]);

  const qs = (extra: Record<string, string | number>) => {
    const p = new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}) });
    Object.entries(extra).forEach(([k, v]) => (v === "" ? p.delete(k) : p.set(k, String(v))));
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  const setStatus = async (inq: Inquiry, next: Inquiry["status"], quiet = false) => {
    try {
      await api("PATCH", `/api/admin/inquiries/${inq.id}`, { status: next });
      setItems((l) => l.map((x) => (x.id === inq.id ? { ...x, status: next } : x)));
      if (!quiet) toast.success(`Marked as ${next.toLowerCase()}`);
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const toggle = (inq: Inquiry) => {
    const opening = open !== inq.id;
    setOpen(opening ? inq.id : null);
    // Opening a new message marks it as read automatically.
    if (opening && inq.status === "NEW") setStatus(inq, "READ", true);
  };

  const remove = async (inq: Inquiry) => {
    if (!(await confirm({ title: "Delete this inquiry?", description: `The message from ${inq.name} will be permanently deleted.` }))) return;
    try {
      await api("DELETE", `/api/admin/inquiries/${inq.id}`);
      setItems((l) => l.filter((x) => x.id !== inq.id));
      toast.success("Deleted");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav className="flex gap-1 overflow-x-auto rounded-full border bg-white p-1" aria-label="Filter inquiries">
          {FILTERS.map((f) => {
            const n = f.id ? counts[f.id] ?? 0 : Object.values(counts).reduce((a, b) => a + b, 0);
            return (
              <Link key={f.id} href={`/admin/inquiries${qs({ status: f.id, page: "" })}`} aria-current={status === f.id ? "page" : undefined}
                className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition", status === f.id ? "bg-forest-700 text-white" : "text-forest-800 hover:bg-forest-50")}>
                {f.label} ({n})
              </Link>
            );
          })}
        </nav>
        <div className="flex gap-2">
          <form className="flex flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); router.push(`/admin/inquiries${qs({ q: search.trim(), page: "" })}`); }} role="search">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, phone, email…" aria-label="Search inquiries" className="lg:w-64" maxLength={100} />
            <Button type="submit" size="icon" className="h-10 w-10 shrink-0" aria-label="Search"><Search /></Button>
          </form>
          <Button asChild variant="outline" className="shrink-0">
            <a href={`/api/admin/export/inquiries${qs({})}`} download><Download /> Export CSV</a>
          </Button>
        </div>
      </div>

      {q ? <p className="mb-3 text-sm text-muted-foreground">{total} result{total === 1 ? "" : "s"} for “{q}” · <Link className="underline" href={`/admin/inquiries${status ? `?status=${status}` : ""}`}>clear</Link></p> : null}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-white p-10 text-center text-muted-foreground">No inquiries found.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((inq) => {
            const isOpen = open === inq.id;
            const wa = digitsOnly(inq.phone);
            return (
              <li key={inq.id} className={cn("overflow-hidden rounded-2xl border bg-white shadow-sm", inq.status === "NEW" && "border-gold-400")}>
                <button type="button" onClick={() => toggle(inq)} aria-expanded={isOpen} className="flex w-full items-center gap-3 p-4 text-left hover:bg-cream-50">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", inq.status === "NEW" ? "bg-gold-500" : "bg-transparent")} aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate text-forest-900", inq.status === "NEW" && "font-semibold")}>{inq.name} {inq.subject ? <span className="font-normal text-muted-foreground">– {inq.subject}</span> : null}</p>
                    <p className="truncate text-sm text-muted-foreground">{inq.message}</p>
                  </div>
                  <div className="hidden shrink-0 text-right sm:block">
                    <Badge variant={BADGE[inq.status as keyof typeof BADGE] ?? "muted"}>{inq.status.toLowerCase()}</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{inq.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <ChevronDown className={cn("h-5 w-5 shrink-0 text-muted-foreground transition", isOpen && "rotate-180")} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="border-t bg-cream-50/60 p-4 sm:p-5">
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div><dt className="text-xs text-muted-foreground">Phone</dt><dd>{inq.phone || "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Email</dt><dd className="break-all">{inq.email || "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Preferred contact time</dt><dd>{inq.preferredTime || "—"}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">Received</dt><dd>{inq.createdAt.toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</dd></div>
                    </dl>
                    <p className="mt-4 whitespace-pre-line rounded-xl border bg-white p-4 text-forest-900">{inq.message}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {inq.phone ? <Button asChild size="sm" variant="outline"><a href={`tel:${inq.phone.replace(/\s/g, "")}`}><Phone /> Call</a></Button> : null}
                      {wa ? <Button asChild size="sm" variant="outline"><a href={`https://wa.me/${wa.length === 10 ? `91${wa}` : wa}`} target="_blank" rel="noopener noreferrer"><WhatsappIcon className="h-4 w-4" /> WhatsApp</a></Button> : null}
                      {inq.email ? <Button asChild size="sm" variant="outline"><a href={`mailto:${inq.email}?subject=${encodeURIComponent(`Re: ${inq.subject || "Your inquiry"}`)}`}><Mail /> Reply by email</a></Button> : null}
                      <span className="flex-1" />
                      {inq.status !== "REPLIED" ? <Button size="sm" onClick={() => setStatus(inq, "REPLIED")}><MailCheck /> Mark as replied</Button> : null}
                      {inq.status !== "NEW" ? <Button size="sm" variant="ghost" onClick={() => setStatus(inq, "NEW")}><MailOpen /> Mark as unread</Button> : null}
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-red-50" onClick={() => remove(inq)}><Trash2 /> Delete</Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Pagination">
          {page > 1 ? <Button asChild variant="outline" size="sm"><Link href={`/admin/inquiries${qs({ page: page - 1 })}`}>Previous</Link></Button> : null}
          <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
          {page < pages ? <Button asChild variant="outline" size="sm"><Link href={`/admin/inquiries${qs({ page: page + 1 })}`}>Next</Link></Button> : null}
        </nav>
      )}
    </div>
  );
}
