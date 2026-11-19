/** Upload limits – shared by the browser (early feedback) and the server (enforcement). */
export const UPLOAD_RULES = {
  image: {
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as Record<string, string>,
    maxBytes: 5 * 1024 * 1024,
    label: "JPG, PNG or WebP image up to 5 MB",
  },
  video: {
    types: { "video/mp4": "mp4" } as Record<string, string>,
    maxBytes: 100 * 1024 * 1024,
    label: "MP4 video up to 100 MB",
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_RULES;

export function checkUpload(kind: UploadKind, type: string, size: number): string | null {
  const rule = UPLOAD_RULES[kind];
  if (!rule) return "Unknown upload type";
  if (!rule.types[type]) return `Please choose a ${rule.label}.`;
  if (size <= 0) return "The file is empty.";
  if (size > rule.maxBytes) return `File is too large. Maximum is ${Math.round(rule.maxBytes / 1024 / 1024)} MB.`;
  return null;
}

export function acceptAttr(kind: UploadKind) {
  return Object.keys(UPLOAD_RULES[kind].types).join(",");
}
