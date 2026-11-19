import { prisma } from "@/lib/prisma";
import { ok, readJson, withAdmin } from "@/lib/api";
import { profileSchema } from "@/lib/validators";
import { sanitizeRichText } from "@/lib/sanitize";
import { logActivity } from "@/lib/activity";
import { refreshSite } from "@/lib/revalidate";

export const GET = withAdmin(async () => ok({ item: await prisma.profile.findUnique({ where: { id: 1 } }) }));

export const PUT = withAdmin(async (req) => {
  const parsed = profileSchema.parse(await readJson(req));
  const data = { ...parsed, bioHtml: sanitizeRichText(parsed.bioHtml), academicHtml: sanitizeRichText(parsed.academicHtml) };
  const item = await prisma.profile.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  await logActivity("update", "profile", "Updated profile / about page");
  refreshSite();
  return ok({ item });
});
