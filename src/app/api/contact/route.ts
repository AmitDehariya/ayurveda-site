import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { fail, handleError, ok, readJson } from "@/lib/api";
import { guardPublicForm } from "@/lib/public-form";
import { notifyAdmin } from "@/lib/mail";
import { logActivity } from "@/lib/activity";

/** Public contact / inquiry form. */
export async function POST(req: Request) {
  try {
    const body = (await readJson(req)) as Record<string, unknown>;
    const raw = typeof body === "object" && body ? body : {};
    const { response, ipHash } = await guardPublicForm(req, {
      key: "contact",
      limit: 5,
      windowMs: 10 * 60 * 1000,
      honeypot: typeof raw.website === "string" ? raw.website : "",
      recaptchaToken: typeof raw.recaptchaToken === "string" ? raw.recaptchaToken : undefined,
      action: "contact",
    });
    if (response) return response;

    const data = contactSchema.parse(raw);
    const inquiry = await prisma.inquiry.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email,
        subject: data.subject,
        preferredTime: data.preferredTime,
        message: data.message,
        ipHash,
      },
    });

    await Promise.all([
      notifyAdmin({
        subject: `New website inquiry from ${data.name}${data.subject ? ` – ${data.subject}` : ""}`,
        replyTo: data.email || undefined,
        rows: [
          ["Name", data.name],
          ["Phone", data.phone],
          ["Email", data.email || "—"],
          ["Subject", data.subject || "—"],
          ["Preferred time", data.preferredTime || "—"],
          ["Message", data.message],
          ["Received", inquiry.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })],
        ],
      }),
      logActivity("create", "inquiry", `New inquiry from ${data.name}`),
    ]);

    return ok({ ok: true }, { status: 201 });
  } catch (err) {
    if (err instanceof SyntaxError) return fail("Invalid request", 400);
    return handleError(err);
  }
}
