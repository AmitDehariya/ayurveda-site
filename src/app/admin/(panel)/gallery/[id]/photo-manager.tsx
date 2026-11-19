"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GalleryImage } from "@prisma/client";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { api } from "@/lib/client-api";
import { uploadFile } from "@/lib/upload-client";
import { acceptAttr, UPLOAD_RULES } from "@/lib/upload-rules";
import { cn } from "@/lib/utils";

type Pending = { key: string; name: string; preview: string; progress: number; error?: string };

export function PhotoManager({ albumId, coverImageUrl, images: initial }: { albumId: string; coverImageUrl: string; images: GalleryImage[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState(initial);
  const [pending, setPending] = useState<Pending[]>([]);
  const [drag, setDrag] = useState(false);
  const [cover, setCover] = useState(coverImageUrl);

  useEffect(() => setImages(initial), [initial]);

  /** Upload files one after another, each with its own preview + progress bar. */
  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => {
      if (!UPLOAD_RULES.image.types[f.type]) {
        toast.error(`${f.name}: only JPG, PNG or WebP images`);
        return false;
      }
      return true;
    });
    if (!list.length) return;
    const items = list.map((f, i) => ({ key: `${Date.now()}-${i}`, name: f.name, preview: URL.createObjectURL(f), progress: 0 }));
    setPending((p) => [...p, ...items]);

    let added = 0;
    for (const [i, file] of list.entries()) {
      const key = items[i].key;
      try {
        const url = await uploadFile(file, "image", (pct) => setPending((p) => p.map((x) => (x.key === key ? { ...x, progress: pct } : x))));
        const caption = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120);
        await api("POST", "/api/admin/images", { albumId, url, caption: "", alt: caption });
        added++;
        setPending((p) => p.filter((x) => x.key !== key));
        URL.revokeObjectURL(items[i].preview);
      } catch (e) {
        setPending((p) => p.map((x) => (x.key === key ? { ...x, error: (e as Error).message } : x)));
      }
    }
    if (added) toast.success(`${added} photo${added === 1 ? "" : "s"} added`);
    router.refresh();
  };

  const saveCaption = async (img: GalleryImage, caption: string) => {
    if (caption === img.caption) return;
    try {
      await api("PATCH", `/api/admin/images/${img.id}`, { caption, alt: caption || img.alt });
      setImages((l) => l.map((x) => (x.id === img.id ? { ...x, caption } : x)));
      toast.success("Caption saved");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...images];
    const t = index + dir;
    if (t < 0 || t >= next.length) return;
    [next[index], next[t]] = [next[t], next[index]];
    const prev = images;
    setImages(next);
    try {
      await api("POST", "/api/admin/images/reorder", { ids: next.map((i) => i.id) });
    } catch (e) {
      setImages(prev);
      toast.error((e as Error).message);
    }
  };

  const remove = async (img: GalleryImage) => {
    if (!(await confirm({ title: "Delete this photo?", description: "The photo will be removed from the album and the website." }))) return;
    try {
      await api("DELETE", `/api/admin/images/${img.id}`);
      setImages((l) => l.filter((x) => x.id !== img.id));
      toast.success("Photo deleted");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const makeCover = async (img: GalleryImage) => {
    try {
      await api("PATCH", `/api/admin/albums/${albumId}`, { coverImageUrl: img.url });
      setCover(img.url);
      toast.success("Album cover updated");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        className={cn("mb-6 rounded-2xl border-2 border-dashed bg-white p-8 text-center transition", drag ? "border-forest-600 bg-forest-50" : "border-input")}
      >
        <UploadCloud className="mx-auto h-10 w-10 text-forest-600" aria-hidden="true" />
        <p className="mt-3 font-medium text-forest-900">Drag & drop photos here</p>
        <p className="text-sm text-muted-foreground">{UPLOAD_RULES.image.label} each – you can select many at once</p>
        <Button type="button" className="mt-4" onClick={() => inputRef.current?.click()}><ImagePlus /> Choose photos</Button>
        <input ref={inputRef} type="file" multiple accept={acceptAttr("image")} className="hidden" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
      </div>

      {pending.length > 0 && (
        <ul className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {pending.map((p) => (
            <li key={p.key} className="overflow-hidden rounded-xl border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img src={p.preview} alt="" className="aspect-square w-full object-cover opacity-60" />
              <div className="p-2">
                {p.error ? (
                  <p className="text-xs text-destructive">{p.error}</p>
                ) : (
                  <>
                    <div className="h-1.5 overflow-hidden rounded-full bg-forest-100"><div className="h-full bg-forest-600 transition-all" style={{ width: `${p.progress}%` }} /></div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Uploading {p.progress}%</p>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {images.length === 0 && pending.length === 0 ? (
        <p className="rounded-2xl border border-dashed bg-white p-10 text-center text-muted-foreground">No photos yet.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <li key={img.id} className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img src={img.url} alt={img.alt || img.caption} className="aspect-square w-full object-cover" />
                {cover === img.url ? <span className="absolute left-2 top-2 rounded-full bg-gold-400 px-2 py-0.5 text-xs font-medium text-forest-950">Cover</span> : null}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-2">
                <Input defaultValue={img.caption} placeholder="Add a caption…" aria-label="Caption" className="h-9 text-xs" maxLength={300} onBlur={(e) => saveCaption(img, e.target.value.trim())} />
                <div className="flex items-center justify-between">
                  <div className="flex">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move earlier" title="Move earlier"><ArrowLeft /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Move later" title="Move later"><ArrowRight /></Button>
                  </div>
                  <div className="flex">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => makeCover(img)} disabled={cover === img.url} aria-label="Use as album cover" title="Use as album cover"><Star /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-red-50" onClick={() => remove(img)} aria-label="Delete photo" title="Delete"><Trash2 /></Button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
