"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Feedback } from "@prisma/client";
import { Check, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Stars } from "@/components/site/stars";
import { api } from "@/lib/client-api";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "PENDING", label: "Waiting for approval" },
  { id: "APPROVED", label: "Approved" },
  { id: "REJECTED", label: "Rejected" },
  { id: "ALL", label: "All" },
];

const STATUS_BADGE = { PENDING: "warning", APPROVED: "success", REJECTED: "danger" } as const;

export function FeedbackManager({ items: initial, status, counts }: { items: Feedback[]; status: string; counts: Record<string, number> }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [items, setItems] = useState(initial);
  useEffect(() => setItems(initial), [initial]);

  const patch = async (f: Feedback, data: Partial<Pick<Feedback, "status" | "isFeatured">>, msg: string) => {
    try {
      await api("PATCH", `/api/admin/feedback/${f.id}`, data);
      toast.success(msg);
      setItems((l) => (status !== "ALL" && data.status && data.status !== status ? l.filter((x) => x.id !== f.id) : l.map((x) => (x.id === f.id ? { ...x, ...data } : x))));
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const remove = async (f: Feedback) => {
    if (!(await confirm({ title: "Delete this feedback?", description: `Feedback from ${f.name} will be permanently deleted.` }))) return;
    try {
      await api("DELETE", `/api/admin/feedback/${f.id}`);
      setItems((l) => l.filter((x) => x.id !== f.id));
      toast.success("Deleted");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <nav className="mb-5 flex gap-1 overflow-x-auto rounded-full border bg-white p-1" aria-label="Filter feedback">
        {TABS.map((t) => {
          const n = t.id === "ALL" ? Object.values(counts).reduce((a, b) => a + b, 0) : counts[t.id] ?? 0;
          return (
            <Link key={t.id} href={`/admin/feedback?status=${t.id}`} aria-current={status === t.id ? "page" : undefined}
              className={cn("whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition", status === t.id ? "bg-forest-700 text-white" : "text-forest-800 hover:bg-forest-50")}>
              {t.label} ({n})
            </Link>
          );
        })}
      </nav>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-white p-10 text-center text-muted-foreground">Nothing here.</p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((f) => (
            <li key={f.id} className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {f.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                    <img src={f.photoUrl} alt="" className="h-11 w-11 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-100 font-serif text-forest-800">{f.name.charAt(0)}</span>
                  )}
                  <div>
                    <p className="font-medium text-forest-900">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{[f.city, f.createdAt.toLocaleDateString("en-IN")].filter(Boolean).join(" · ")}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={STATUS_BADGE[f.status as keyof typeof STATUS_BADGE] ?? "muted"}>{f.status.toLowerCase()}</Badge>
                  {f.isFeatured ? <Badge variant="gold">featured</Badge> : null}
                </div>
              </div>
              <Stars rating={f.rating} className="mt-3" />
              <p className="mt-2 flex-1 whitespace-pre-line text-sm text-forest-900">{f.message}</p>
              <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                {f.status !== "APPROVED" ? <Button size="sm" onClick={() => patch(f, { status: "APPROVED" }, "Approved – now visible on the website")}><Check /> Approve</Button> : null}
                {f.status !== "REJECTED" ? <Button size="sm" variant="outline" onClick={() => patch(f, { status: "REJECTED", isFeatured: false }, "Rejected – hidden from the website")}><X /> Reject</Button> : null}
                {f.status === "APPROVED" ? (
                  <Button size="sm" variant={f.isFeatured ? "gold" : "outline"} onClick={() => patch(f, { isFeatured: !f.isFeatured }, f.isFeatured ? "No longer featured" : "Featured on the home page")}>
                    <Star /> {f.isFeatured ? "Featured" : "Feature"}
                  </Button>
                ) : null}
                <Button size="sm" variant="ghost" className="ml-auto text-destructive hover:bg-red-50" onClick={() => remove(f)}><Trash2 /> Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
