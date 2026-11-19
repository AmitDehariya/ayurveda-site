"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ZodType } from "zod";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { ResourceForm } from "./resource-form";
import type { FieldDef } from "./fields";
import { api } from "@/lib/client-api";

type Item = { id: string; [k: string]: any };

export type RowView = {
  title: string;
  subtitle?: string;
  image?: string;
  badges?: { label: string; variant?: BadgeProps["variant"] }[];
};

type Props = {
  resource: string; // REST resource name, e.g. "services"
  items: Item[];
  schema: ZodType;
  fields: FieldDef[];
  defaults: Record<string, any>;
  row: (item: Item) => RowView;
  singular: string; // "service"
  /** Values always sent on create (e.g. category type). */
  fixedValues?: Record<string, any>;
  ordered?: boolean;
  toggle?: { field: string; label: string };
  previewHref?: (item: Item) => string | null;
  wide?: boolean;
  emptyText?: string;
  /** Convert a saved item into form values (e.g. null → ""). */
  toForm?: (item: Item) => Record<string, any>;
  /** Extra button(s) per row, e.g. "Manage photos". */
  extraAction?: (item: Item) => React.ReactNode;
};

/**
 * Generic list + add/edit/delete/reorder UI used by most admin sections.
 * Data comes from the server page; after each change we refresh it.
 */
export function ResourceManager(props: Props) {
  const { resource, schema, fields, defaults, row, singular, fixedValues, ordered, toggle, previewHref, wide, emptyText, toForm, extraAction } = props;
  const router = useRouter();
  const search = useSearchParams();
  const confirm = useConfirm();
  const [items, setItems] = useState(props.items);
  const [editing, setEditing] = useState<Item | "new" | null>(null);

  useEffect(() => setItems(props.items), [props.items]);
  // Allow deep links like /admin/blog?new=1 from the dashboard.
  useEffect(() => {
    if (search.get("new") === "1") setEditing("new");
  }, [search]);

  const refresh = () => router.refresh();

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    const prev = items;
    setItems(next);
    try {
      await api("POST", `/api/admin/${resource}/reorder`, { ids: next.map((i) => i.id) });
      refresh();
    } catch (e) {
      setItems(prev);
      toast.error((e as Error).message);
    }
  };

  const setToggle = async (item: Item, value: boolean) => {
    if (!toggle) return;
    setItems((list) => list.map((i) => (i.id === item.id ? { ...i, [toggle.field]: value } : i)));
    try {
      await api("PATCH", `/api/admin/${resource}/${item.id}`, { [toggle.field]: value });
      toast.success(value ? `${toggle.label}: on` : `${toggle.label}: off`);
      refresh();
    } catch (e) {
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, [toggle.field]: !value } : i)));
      toast.error((e as Error).message);
    }
  };

  const remove = async (item: Item) => {
    const { title } = row(item);
    if (!(await confirm({ title: `Delete this ${singular}?`, description: `“${title}” will be permanently deleted.` }))) return;
    try {
      await api("DELETE", `/api/admin/${resource}/${item.id}`);
      setItems((list) => list.filter((i) => i.id !== item.id));
      toast.success("Deleted");
      refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const formInitial = (item: Item | "new") => {
    if (item === "new") return { ...defaults, ...fixedValues };
    const base = toForm ? toForm(item) : item;
    const out: Record<string, any> = {};
    for (const f of fields) out[f.name] = base[f.name] ?? defaults[f.name] ?? "";
    return { ...out, ...fixedValues };
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing("new")}><Plus /> Add {singular}</Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-10 text-center text-muted-foreground">
          {emptyText ?? `Nothing here yet. Click “Add ${singular}” to create the first one.`}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const v = row(item);
            const href = previewHref?.(item);
            return (
              <li key={item.id} className="flex flex-col gap-3 rounded-2xl border bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:p-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {v.image !== undefined ? (
                    // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail of arbitrary URLs
                    <img src={v.image || "/placeholders/leaf-pattern.svg"} alt="" className="h-14 w-20 shrink-0 rounded-lg bg-muted object-cover" />
                  ) : null}
                  <div className="min-w-0">
                    <p className="truncate font-medium text-forest-900">{v.title || "(untitled)"}</p>
                    {v.subtitle ? <p className="truncate text-sm text-muted-foreground">{v.subtitle}</p> : null}
                    {v.badges?.length ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {v.badges.map((b) => <Badge key={b.label} variant={b.variant}>{b.label}</Badge>)}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1 sm:justify-end">
                  {toggle ? (
                    <label className="mr-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch checked={!!item[toggle.field]} onCheckedChange={(c) => setToggle(item, c)} aria-label={`${toggle.label}: ${v.title}`} />
                      {toggle.label}
                    </label>
                  ) : null}
                  {ordered ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" title="Move up"><ArrowUp /></Button>
                      <Button size="icon" variant="ghost" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down" title="Move down"><ArrowDown /></Button>
                    </>
                  ) : null}
                  {href ? (
                    <Button asChild size="icon" variant="ghost" title="View on website">
                      <a href={href} target="_blank" rel="noopener" aria-label={`View ${v.title} on website`}><ExternalLink /></a>
                    </Button>
                  ) : null}
                  {extraAction?.(item)}
                  <Button size="sm" variant="outline" onClick={() => setEditing(item)}><Pencil /> Edit</Button>
                  <Button size="icon" variant="ghost" className="text-destructive hover:bg-red-50" onClick={() => remove(item)} aria-label={`Delete ${v.title}`} title="Delete"><Trash2 /></Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing ? (
        <ResourceForm
          key={editing === "new" ? "new" : editing.id}
          open
          onOpenChange={(o) => {
            if (!o) {
              setEditing(null);
              if (search.get("new")) router.replace(window.location.pathname);
            }
          }}
          title={editing === "new" ? `Add ${singular}` : `Edit ${singular}`}
          schema={schema}
          fields={fields}
          initial={formInitial(editing)}
          method={editing === "new" ? "POST" : "PUT"}
          url={editing === "new" ? `/api/admin/${resource}` : `/api/admin/${resource}/${editing.id}`}
          wide={wide}
          onSaved={() => refresh()}
        />
      ) : null}
    </div>
  );
}
