import { fail, ok, readJson, withAdmin } from "@/lib/api";
import { delegate, getResource, prepareData } from "@/lib/resources";
import { logActivity } from "@/lib/activity";
import { refreshSite } from "@/lib/revalidate";

type P = { resource: string; id: string };

function lookup(params: P) {
  const cfg = getResource(params.resource);
  const id = params.id.slice(0, 40);
  return { cfg, id };
}

export const GET = withAdmin<P>(async (_req, { params }) => {
  const { cfg, id } = lookup(params);
  if (!cfg) return fail("Not found", 404);
  const item = await delegate(cfg).findUnique({ where: { id } });
  return item ? ok({ item }) : fail("Item not found", 404);
});

async function update(req: Request, params: P, mode: "PUT" | "PATCH") {
  const { cfg, id } = lookup(params);
  if (!cfg) return fail("Not found", 404);
  const schema = mode === "PUT" ? cfg.updateSchema ?? cfg.schema : cfg.patchSchema;
  if (!schema) return fail("Not allowed", 405);

  const existing = await delegate(cfg).findUnique({ where: { id } });
  if (!existing) return fail("Item not found – it may have been deleted.", 404);

  const parsed = schema.parse(await readJson(req)) as Record<string, any>;
  const data = await prepareData(cfg, parsed, existing);
  const item = await delegate(cfg).update({ where: { id }, data });

  const what =
    "status" in parsed && Object.keys(parsed).length === 1 ? `marked ${cfg.label} “${item[cfg.titleField] || ""}” as ${String(parsed.status).toLowerCase()}` : `updated ${cfg.label} “${item[cfg.titleField] || "untitled"}”`;
  await logActivity("update", cfg.model, what.charAt(0).toUpperCase() + what.slice(1));
  refreshSite();
  return ok({ item });
}

export const PUT = withAdmin<P>(async (req, { params }) => update(req, params, "PUT"));
export const PATCH = withAdmin<P>(async (req, { params }) => update(req, params, "PATCH"));

export const DELETE = withAdmin<P>(async (_req, { params }) => {
  const { cfg, id } = lookup(params);
  if (!cfg) return fail("Not found", 404);
  const existing = await delegate(cfg).findUnique({ where: { id } });
  if (!existing) return fail("Item not found – it may have been deleted.", 404);

  await cfg.beforeDelete?.(existing);
  await delegate(cfg).delete({ where: { id } });

  await logActivity("delete", cfg.model, `Deleted ${cfg.label} “${existing[cfg.titleField] || "untitled"}”`);
  refreshSite();
  return ok({ ok: true });
});
