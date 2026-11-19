import { z } from "zod";
import { fail, ok, readJson, withAdmin } from "@/lib/api";
import { isCloudinaryEnabled, signUpload } from "@/lib/storage";
import { checkUpload } from "@/lib/upload-rules";

const bodySchema = z.object({
  kind: z.enum(["image", "video"]),
  type: z.string().max(100),
  size: z.number().int().nonnegative(),
});

/**
 * Step 1 of an admin upload. Validates type/size and tells the browser where to
 * send the file: directly to Cloudinary (signed) or to /api/admin/upload.
 */
export const POST = withAdmin(async (req) => {
  const { kind, type, size } = bodySchema.parse(await readJson(req));
  const problem = checkUpload(kind, type, size);
  if (problem) return fail(problem, 415);
  if (!isCloudinaryEnabled()) return ok({ mode: "server" as const });
  return ok({ mode: "cloudinary" as const, ...signUpload(kind) });
});
