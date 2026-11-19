"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2, Upload, Film } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadFile } from "@/lib/upload-client";
import { acceptAttr, UPLOAD_RULES, type UploadKind } from "@/lib/upload-rules";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (url: string) => void;
  kind?: UploadKind;
  id?: string;
  invalid?: boolean;
};

/**
 * Image / video picker for admin forms:
 *  - click or drag & drop a file → instant local preview → uploads with a progress bar
 *  - or paste a link
 *  - remove button
 */
export function MediaField({ value, onChange, kind = "image", id, invalid }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);
  const [showLink, setShowLink] = useState(false);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const local = URL.createObjectURL(file);
    setPreview(local);
    setProgress(0);
    try {
      const url = await uploadFile(file, kind, setProgress);
      onChange(url);
      toast.success(kind === "video" ? "Video uploaded" : "Image uploaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setProgress(null);
      setPreview(null);
    }
  };

  const shown = preview ?? value;
  const uploading = progress !== null;
  const Icon = kind === "video" ? Film : ImagePlus;

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed bg-muted/40 transition",
          drag ? "border-forest-600 bg-forest-50" : invalid ? "border-destructive" : "border-input",
        )}
      >
        {shown ? (
          <div className="relative">
            {kind === "video" ? (
              <video src={shown} controls preload="metadata" className="max-h-64 w-full bg-black" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- preview of arbitrary/local blob URLs
              <img src={shown} alt="Selected" className="max-h-64 w-full object-contain" />
            )}
            {uploading && (
              <div className="absolute inset-0 grid place-items-center bg-white/75">
                <div className="w-2/3 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-forest-700" />
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-forest-100">
                    <div className="h-full bg-forest-600 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 text-sm font-medium text-forest-900">Uploading… {progress}%</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button type="button" id={id} onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center gap-2 px-4 py-8 text-center">
            <Icon className="h-8 w-8 text-forest-600" aria-hidden="true" />
            <span className="text-sm font-medium text-forest-900">Click to choose {kind === "video" ? "a video" : "a photo"}, or drag it here</span>
            <span className="text-xs text-muted-foreground">{UPLOAD_RULES[kind].label}</span>
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept={acceptAttr(kind)} className="hidden" onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }} />

      <div className="flex flex-wrap gap-2">
        {shown ? (
          <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <Upload /> Change
          </Button>
        ) : null}
        {value && !uploading ? (
          <Button type="button" size="sm" variant="ghost" className="text-destructive hover:bg-red-50" onClick={() => onChange("")}>
            <Trash2 /> Remove
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="ghost" onClick={() => setShowLink((s) => !s)}>
          <Link2 /> {showLink ? "Hide link" : "Use a link instead"}
        </Button>
      </div>
      {showLink && (
        <Input value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder="https://…" aria-label="File link" />
      )}
    </div>
  );
}
