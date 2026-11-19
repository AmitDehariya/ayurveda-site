"use client";

import { checkUpload, type UploadKind } from "./upload-rules";

type SignResponse =
  | { mode: "server" }
  | { mode: "cloudinary"; uploadUrl: string; fields: Record<string, string> };

/** POST a FormData with upload progress (fetch() can't report upload progress). */
function xhrUpload(url: string, form: FormData, onProgress?: (pct: number) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data: any = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data?.error?.message || data?.error || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

/**
 * Upload an image or video from the admin panel and return its public URL.
 * Uses direct-to-Cloudinary upload when configured, otherwise the server route.
 */
export async function uploadFile(file: File, kind: UploadKind, onProgress?: (pct: number) => void): Promise<string> {
  const problem = checkUpload(kind, file.type, file.size);
  if (problem) throw new Error(problem);

  const signRes = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, type: file.type, size: file.size }),
  });
  const sign = (await signRes.json().catch(() => ({}))) as SignResponse & { error?: string };
  if (!signRes.ok) throw new Error(sign.error || "Upload not allowed");

  const form = new FormData();
  if (sign.mode === "cloudinary") {
    Object.entries(sign.fields).forEach(([k, v]) => form.append(k, v));
    form.append("file", file);
    const data = await xhrUpload(sign.uploadUrl, form, onProgress);
    return data.secure_url as string;
  }
  form.append("kind", kind);
  form.append("file", file);
  const data = await xhrUpload("/api/admin/upload", form, onProgress);
  return data.url as string;
}
