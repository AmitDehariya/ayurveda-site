import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { fail, ok, readJson, withAdmin } from "@/lib/api";
import { passwordChangeSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { logActivity } from "@/lib/activity";

export const POST = withAdmin(async (req, { admin }) => {
  if (!rateLimit(`pw:${admin.id}`, 5, 15 * 60 * 1000).ok) return fail("Too many attempts. Please wait a few minutes.", 429);
  const data = passwordChangeSchema.parse(await readJson(req));
  const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await bcrypt.compare(data.currentPassword, user.passwordHash))) {
    return fail("Current password is incorrect", 422, { fields: { currentPassword: "Current password is incorrect" } });
  }
  await prisma.adminUser.update({
    where: { id: admin.id },
    // tokenVersion++ signs out every existing session, including this one.
    data: { passwordHash: await bcrypt.hash(data.newPassword, 12), tokenVersion: { increment: 1 } },
  });
  await logActivity("update", "password", "Admin password changed");
  return ok({ ok: true });
});
