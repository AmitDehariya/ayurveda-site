"use client";

import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Camera, CheckCircle2, Loader2, Send, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { feedbackPublicSchema } from "@/lib/validators";
import { UPLOAD_RULES } from "@/lib/upload-rules";
import { Honeypot } from "./honeypot";
import { useRecaptcha } from "./use-recaptcha";
import { cn } from "@/lib/utils";

type Values = z.input<typeof feedbackPublicSchema>;

/** Shrink a photo in the browser (max 800px, JPEG) so uploads are small and fast. */
async function downscale(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

function RatingInput({ value, onChange, invalid }: { value: number; onChange: (n: number) => void; invalid?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div role="radiogroup" aria-label="Rating" aria-invalid={invalid} className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(Math.min(5, (value || 0) + 1)); }
            if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(Math.max(1, (value || 2) - 1)); }
          }}
          tabIndex={value ? (value === n ? 0 : -1) : n === 1 ? 0 : -1}
          className="rounded p-0.5 transition hover:scale-110"
        >
          <Star className={cn("h-8 w-8", n <= (hover || value) ? "fill-gold-400 text-gold-400" : "text-gold-200")} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function FeedbackForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const [photo, setPhoto] = useState<{ blob: Blob; preview: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const getToken = useRecaptcha();
  const { register, control, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(feedbackPublicSchema, undefined, { raw: true }),
    defaultValues: { name: "", city: "", rating: 0, message: "", website: "" },
  });

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    if (!UPLOAD_RULES.image.types[file.type]) return setServerError("Please choose a JPG, PNG or WebP photo.");
    if (file.size > 15 * 1024 * 1024) return setServerError("That photo is too large.");
    setServerError("");
    const blob = await downscale(file);
    setPhoto({ blob, preview: URL.createObjectURL(blob) });
  };

  const onSubmit = async (values: Values) => {
    setServerError("");
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => fd.append(k, String(v ?? "")));
    const token = await getToken("feedback");
    if (token) fd.append("recaptchaToken", token);
    if (photo) fd.append("photo", photo.blob, "photo.jpg");
    try {
      const res = await fetch("/api/feedback", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Object.entries((data.fields ?? {}) as Record<string, string>).forEach(([k, m]) => setError(k as keyof Values, { message: m }));
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }
      reset();
      setPhoto(null);
      setDone(true);
    } catch {
      setServerError("Network error – please try again.");
    }
  };

  if (done) {
    return (
      <div role="status" className="mt-6 rounded-2xl bg-white p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-forest-600" aria-hidden="true" />
        <h3 className="mt-3 font-serif text-xl">Thank you for your feedback!</h3>
        <p className="mt-2 text-sm text-muted-foreground">It will appear on the website after review.</p>
        <Button variant="outline" className="mt-5" onClick={() => setDone(false)}>Write another</Button>
      </div>
    );
  }

  const err = (k: keyof Values) => errors[k]?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative mt-5 space-y-5" noValidate>
      <Honeypot registration={register("website")} />
      {serverError ? <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{serverError}</p> : null}

      <div className="space-y-2">
        <span className="text-sm font-medium text-forest-900" id="rating-label">Your rating *</span>
        <Controller control={control} name="rating" render={({ field }) => <RatingInput value={Number(field.value) || 0} onChange={field.onChange} invalid={!!err("rating")} />} />
        {err("rating") ? <p className="text-xs text-destructive">{err("rating")}</p> : null}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fb-name">Name *</Label>
          <Input id="fb-name" autoComplete="name" aria-invalid={!!err("name")} {...register("name")} />
          {err("name") ? <p className="text-xs text-destructive">{err("name")}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fb-city">City</Label>
          <Input id="fb-city" autoComplete="address-level2" {...register("city")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fb-message">Your experience *</Label>
        <Textarea id="fb-message" rows={4} aria-invalid={!!err("message")} {...register("message")} />
        {err("message") ? <p className="text-xs text-destructive">{err("message")}</p> : null}
      </div>
      <div className="space-y-2">
        <span className="text-sm font-medium text-forest-900">Photo (optional)</span>
        {photo ? (
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
            <img src={photo.preview} alt="Your selected photo" className="h-16 w-16 rounded-full object-cover" />
            <Button type="button" variant="ghost" size="sm" onClick={() => setPhoto(null)}><X /> Remove</Button>
          </div>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Camera /> Add a photo</Button>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} Submit feedback
      </Button>
      <p className="text-xs text-muted-foreground">Feedback is reviewed before it is published.</p>
    </form>
  );
}
