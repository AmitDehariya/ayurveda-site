import { prisma } from "@/lib/prisma";
import { ok, readJson, withAdmin } from "@/lib/api";
import { settingsSchema } from "@/lib/validators";
import { logActivity } from "@/lib/activity";
import { refreshSite } from "@/lib/revalidate";

export const GET = withAdmin(async () => ok({ item: await prisma.siteSetting.findUnique({ where: { id: 1 } }) }));

export const PUT = withAdmin(async (req) => {
  const data = settingsSchema.parse(await readJson(req));
  const item = await prisma.siteSetting.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  await logActivity("update", "settings", "Updated site settings");
  refreshSite();
  return ok({ item });
});
