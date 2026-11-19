import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { checkUpload, UPLOAD_RULES, type UploadKind } from "./upload-rules";

/*
 * ─── Storage module ─────────────────────────────────────────────────────────
 * Everything that touches file storage lives here, so the provider can be
 * swapped (e.g. for S3) without changing the rest of the app.
 *
 *  • Cloudinary – used when CLOUDINARY_* env vars are set (production).
 *    Admin uploads go DIRECTLY from the browser to Cloudinary using a signed
 *    request (see signUpload), because serverless hosts such as Vercel limit
 *    request bodies to ~4.5 MB – far below the 100 MB video limit.
 *  • Local disk – fallback for development: files go to ./uploads and are
 *    served by src/app/uploads/[...path]/route.ts.
 */

export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "uploads");

export function isCloudinaryEnabled() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const folder = () => process.env.CLOUDINARY_FOLDER || "dr-deepmala-mourya";

/** Detect the real file type from its first bytes – don't trust the browser's MIME type. */
export function sniffMime(buf: Uint8Array): string | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...buf.subarray(start, end));
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length >= 8 && buf[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (buf.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (buf.length >= 12 && ascii(4, 8) === "ftyp") return "video/mp4";
  return null;
}

/**
 * Validate and store a file that has reached the server.
 * Returns the public URL. Throws an Error with a user-friendly message.
 */
export async function saveUpload(file: File, kind: UploadKind): Promise<string> {
  const precheck = checkUpload(kind, file.type, file.size);
  if (precheck) throw new UploadError(precheck);

  const buf = new Uint8Array(await file.arrayBuffer());
  const real = sniffMime(buf);
  if (!real || !UPLOAD_RULES[kind].types[real]) throw new UploadError(`This file doesn't look like a valid ${UPLOAD_RULES[kind].label}.`);
  const ext = UPLOAD_RULES[kind].types[real];

  if (isCloudinaryEnabled()) {
    configureCloudinary();
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: folder(), resource_type: kind === "video" ? "video" : "image" },
        (err, res) => (err || !res ? reject(err ?? new Error("Upload failed")) : resolve(res)),
      );
      stream.end(Buffer.from(buf));
    });
    return result.secure_url;
  }

  const now = new Date();
  const sub = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  const dir = path.join(LOCAL_UPLOAD_DIR, sub);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return `/uploads/${sub}/${name}`;
}

export class UploadError extends Error {}

/**
 * Signed parameters for a direct browser → Cloudinary upload.
 * `allowed_formats` is part of the signature, so the browser can't change it.
 */
export function signUpload(kind: UploadKind) {
  configureCloudinary();
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: folder(),
    allowed_formats: Object.values(UPLOAD_RULES[kind].types).join(","),
  };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!);
  return {
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${kind === "video" ? "video" : "image"}/upload`,
    fields: { ...params, timestamp: String(timestamp), api_key: process.env.CLOUDINARY_API_KEY!, signature },
  };
}

/** Best-effort removal of a file we stored earlier. Never throws. */
export async function deleteStoredFile(url: string | null | undefined) {
  if (!url) return;
  try {
    if (url.startsWith("/uploads/")) {
      const target = path.resolve(LOCAL_UPLOAD_DIR, "." + url.slice("/uploads".length));
      if (target.startsWith(LOCAL_UPLOAD_DIR + path.sep)) await unlink(target);
      return;
    }
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const m = cloud && url.match(new RegExp(`res\\.cloudinary\\.com/${cloud}/(image|video)/upload/(?:v\\d+/)?(.+)\\.[a-z0-9]+$`, "i"));
    if (m && isCloudinaryEnabled()) {
      configureCloudinary();
      await cloudinary.uploader.destroy(m[2], { resource_type: m[1] });
    }
  } catch (e) {
    console.warn("[storage] could not delete", url, (e as Error).message);
  }
}
