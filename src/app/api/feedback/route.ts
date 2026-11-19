import { prisma } from "@/lib/prisma";
import { feedbackPublicSchema } from "@/lib/validators";
import { fail, handleError, ok } from "@/lib/api";
import { guardPublicForm } from "@/lib/public-form";
import { saveUpload, UploadError } from "@/lib/storage";
import { notifyAdmin } from "@/lib/mail";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";

/**
 * Public feedback form (multipart, because of the optional photo).
 * New feedback is saved as PENDING and only shown after admin approval.
 */
export async function POST(req: Request) {
  try {
    const len = Number(req.headers.get("content-length") || 0);
    if (len > 6 * 1024 * 1024) return fail("The photo is too large (max 5 MB).", 413);

    const form = await req.formData().catch(() => null);
    if (!form) return fail("Invalid request", 400);
    const field = (k: string) => {
      const v = form.get(k);
      return typeof v === "string" ? v : undefined;
    };

    const { response, ipHash } = await guardPublicForm(req, {
      key: "feedback",
      limit: 3,
      windowMs: 60 * 60 * 1000,
      honeypot: field("website"),
      recaptchaToken: field("recaptchaToken"),
      action: "feedback",
    });
    if (response) return response;

    const data = feedbackPublicSchema.parse({ name: field("name"), city: field("city"), rating: field("rating"), message: field("message") });

    let photoUrl = "";
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) {
      try {
        photoUrl = await saveUpload(photo, "image");
      } catch (e) {
        if (e instanceof UploadError) return fail(e.message, 415, { fields: { photo: e.message } });
        throw e;
      }
    }

    await prisma.feedback.create({ data: { ...data, photoUrl, status: "PENDING", ipHash } });
    await Promise.all([
      notifyAdmin({
        subject: `New feedback from ${data.name} (${data.rating}★) – waiting for approval`,
        rows: [["Name", data.name], ["City", data.city || "—"], ["Rating", `${data.rating} / 5`], ["Message", data.message], ["Photo", photoUrl ? "Yes" : "No"]],
      }),
      logActivity("create", "feedback", `New feedback from ${data.name} waiting for approval`),
    ]);
    return ok({ ok: true }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
