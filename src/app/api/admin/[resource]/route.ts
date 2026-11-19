import { fail, ok, readJson, withAdmin } from "@/lib/api";
import { buildWhere, delegate, getResource, nextOrder, prepareData } from "@/lib/resources";
import { logActivity } from "@/lib/activity";
import { refreshSite } from "@/lib/revalidate";

type P = { resource: string };

export const GET = withAdmin<P>(async (req, { params }) => {
  const cfg = getResource(params.resource);
  if (!cfg) return fail("Not found", 404);
  const url = new URL(req.url);
  const take = Math.min(500, Math.max(1, Number(url.searchParams.get("limit")) || 200));
  const items = await delegate(cfg).findMany({ where: buildWhere(cfg, url.searchParams), orderBy: cfg.orderBy, take });
  return ok({ items });
});

export const POST = withAdmin<P>(async (req, { params }) => {
  const cfg = getResource(params.resource);
  if (!cfg) return fail("Not found", 404);
  if (!cfg.schema) return fail("Items of this type can't be created here", 405);

  const parsed = cfg.schema.parse(await readJson(req)) as Record<string, any>;
  const data = await prepareData(cfg, parsed, null);
  const item = await delegate(cfg).create({ data: { ...data, ...(await nextOrder(cfg, data)) } });

  await logActivity("create", cfg.model, `Added ${cfg.label} “${item[cfg.titleField] || "untitled"}”`);
  refreshSite();
  return ok({ item }, { status: 201 });
});
