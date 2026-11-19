import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { fail, ok, readJson, withAdmin } from "@/lib/api";
import { delegate, getResource } from "@/lib/resources";
import { refreshSite } from "@/lib/revalidate";

const bodySchema = z.object({ ids: z.array(z.string().max(40)).min(1).max(1000) });

/** Save a new display order: the position in `ids` becomes each item's `order`. */
export const POST = withAdmin<{ resource: string }>(async (req, { params }) => {
  const cfg = getResource(params.resource);
  if (!cfg || !cfg.ordered) return fail("This list can't be reordered", 404);
  const { ids } = bodySchema.parse(await readJson(req));
  await prisma.$transaction(ids.map((id, order) => delegate(cfg).update({ where: { id }, data: { order } })));
  refreshSite();
  return ok({ ok: true });
});
