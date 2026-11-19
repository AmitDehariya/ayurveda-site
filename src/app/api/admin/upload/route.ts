import { fail, ok, withAdmin } from "@/lib/api";
import { saveUpload, UploadError } from "@/lib/storage";
import type { UploadKind } from "@/lib/upload-rules";

// Admin file upload that goes through the server (local storage mode, or small
// files when Cloudinary direct upload isn't used).
export const runtime = "nodejs";

export const POST = withAdmin(async (req) => {
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const kind = String(form?.get("kind") ?? "image") as UploadKind;
  if (!(file instanceof File)) return fail("No file received");
  if (kind !== "image" && kind !== "video") return fail("Unknown upload type");
  try {
    const url = await saveUpload(file, kind);
    return ok({ url });
  } catch (e) {
    if (e instanceof UploadError) return fail(e.message, 415);
    throw e;
  }
});
