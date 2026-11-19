import "server-only";
import { z, type ZodType } from "zod";
import { prisma } from "./prisma";
import { sanitizeRichText } from "./sanitize";
import { deleteStoredFile } from "./storage";
import { slugify } from "./utils";
import {
  achievementSchema, albumSchema, categorySchema, FEEDBACK_STATUSES, feedbackAdminSchema, galleryImageSchema,
  INQUIRY_STATUSES, inquiryAdminSchema, optionalMediaUrl, postSchema, publicationSchema, qualificationSchema, serviceSchema,
  statSchema, timelineSchema, videoSchema,
} from "./validators";

/*
 * Registry that powers the generic admin REST API:
 *   GET    /api/admin/:resource            list
 *   POST   /api/admin/:resource            create
 *   GET    /api/admin/:resource/:id        read
 *   PUT    /api/admin/:resource/:id        full update (same schema as create)
 *   PATCH  /api/admin/:resource/:id        partial update (toggles: visible, featured, status…)
 *   DELETE /api/admin/:resource/:id        delete
 *   POST   /api/admin/:resource/reorder    { ids: [...] } → order = index
 */

type Row = Record<string, any>;

export type ResourceConfig = {
  model: string; // Prisma delegate name
  label: string; // for activity log
  titleField: string;
  schema?: ZodType; // create + PUT (omit to disable create)
  updateSchema?: ZodType; // PUT override
  patchSchema: ZodType; // PATCH
  html?: string[]; // rich-text fields to sanitise
  slug?: { from: string; scope?: (data: Row) => Row }; // auto slug + uniqueness scope
  ordered?: boolean;
  immutable?: string[]; // fields that can be set on create but never changed afterwards
  filters?: string[]; // query params allowed as equality filters on GET
  orderBy: any;
  beforeWrite?: (data: Row, existing: Row | null) => Promise<Row> | Row;
  beforeDelete?: (row: Row) => Promise<void>;
};

const visibilityPatch = z.object({ isVisible: z.boolean().optional(), order: z.number().int().min(0).optional() }).strict();
const orderPatch = z.object({ order: z.number().int().min(0).optional() }).strict();
const byOrder = [{ order: "asc" }, { createdAt: "asc" }];

export const RESOURCES: Record<string, ResourceConfig> = {
  services: {
    model: "service", label: "service", titleField: "title", schema: serviceSchema, patchSchema: visibilityPatch,
    html: ["contentHtml"], slug: { from: "title" }, ordered: true, orderBy: byOrder,
  },
  posts: {
    model: "blogPost", label: "article", titleField: "title", schema: postSchema,
    patchSchema: z.object({ status: z.enum(["DRAFT", "PUBLISHED"]).optional() }).strict(),
    html: ["contentHtml"], slug: { from: "title" }, filters: ["status", "categoryId"], orderBy: [{ updatedAt: "desc" }],
    // First time an article is published, stamp the publish date.
    beforeWrite: (data, existing) =>
      data.status === "PUBLISHED" && !existing?.publishedAt ? { ...data, publishedAt: new Date() } : data,
  },
  categories: {
    model: "category", label: "category", titleField: "name", schema: categorySchema, patchSchema: orderPatch,
    slug: { from: "name", scope: (d) => ({ type: d.type }) }, ordered: true, immutable: ["type"], filters: ["type"], orderBy: byOrder,
  },
  albums: {
    model: "galleryAlbum", label: "album", titleField: "title", schema: albumSchema,
    patchSchema: visibilityPatch.extend({ coverImageUrl: optionalMediaUrl }),
    slug: { from: "title" }, ordered: true, orderBy: byOrder,
    beforeDelete: async (row) => {
      const images = await prisma.galleryImage.findMany({ where: { albumId: row.id }, select: { url: true } });
      await Promise.all(images.map((i) => deleteStoredFile(i.url)));
    },
  },
  images: {
    model: "galleryImage", label: "photo", titleField: "caption", schema: galleryImageSchema,
    patchSchema: z.object({ caption: z.string().trim().max(300).optional(), alt: z.string().trim().max(300).optional(), order: z.number().int().min(0).optional() }).strict(),
    ordered: true, immutable: ["albumId"], filters: ["albumId"], orderBy: byOrder,
    beforeDelete: async (row) => deleteStoredFile(row.url),
  },
  videos: {
    model: "video", label: "video", titleField: "title", schema: videoSchema,
    patchSchema: z.object({ isVisible: z.boolean().optional(), isFeatured: z.boolean().optional(), order: z.number().int().min(0).optional() }).strict(),
    ordered: true, filters: ["categoryId"], orderBy: [{ isFeatured: "desc" }, ...byOrder],
    beforeDelete: async (row) => {
      if (row.source === "UPLOAD") await deleteStoredFile(row.url);
    },
  },
  qualifications: { model: "qualification", label: "qualification", titleField: "degree", schema: qualificationSchema, patchSchema: orderPatch, ordered: true, orderBy: byOrder },
  timeline: { model: "timelineItem", label: "timeline item", titleField: "title", schema: timelineSchema, patchSchema: orderPatch, ordered: true, orderBy: byOrder },
  achievements: { model: "achievement", label: "achievement", titleField: "title", schema: achievementSchema, patchSchema: orderPatch, ordered: true, filters: ["kind"], orderBy: byOrder },
  publications: { model: "publication", label: "publication", titleField: "title", schema: publicationSchema, patchSchema: orderPatch, ordered: true, orderBy: byOrder },
  stats: { model: "stat", label: "home number", titleField: "label", schema: statSchema, patchSchema: orderPatch, ordered: true, orderBy: byOrder },
  feedback: {
    model: "feedback", label: "feedback", titleField: "name", updateSchema: feedbackAdminSchema, patchSchema: feedbackAdminSchema,
    filters: ["status"], orderBy: [{ createdAt: "desc" }],
    beforeDelete: async (row) => deleteStoredFile(row.photoUrl),
  },
  inquiries: {
    model: "inquiry", label: "inquiry", titleField: "name", updateSchema: inquiryAdminSchema, patchSchema: inquiryAdminSchema,
    filters: ["status"], orderBy: [{ createdAt: "desc" }],
  },
};

// Extra guards for status filters on GET.
const FILTER_VALUES: Record<string, readonly string[]> = { status: [...FEEDBACK_STATUSES, ...INQUIRY_STATUSES, "DRAFT", "PUBLISHED"] };

export function getResource(name: string) {
  return Object.prototype.hasOwnProperty.call(RESOURCES, name) ? RESOURCES[name] : null;
}

/** Prisma delegate for a resource (typed loosely on purpose – the registry is generic). */
export function delegate(cfg: ResourceConfig): any {
  return (prisma as any)[cfg.model];
}

export function buildWhere(cfg: ResourceConfig, params: URLSearchParams) {
  const where: Row = {};
  for (const f of cfg.filters ?? []) {
    const v = params.get(f);
    if (v === null || v === "") continue;
    if (FILTER_VALUES[f] && !FILTER_VALUES[f].includes(v)) continue;
    where[f] = v.slice(0, 60);
  }
  return where;
}

/** Make a slug unique by appending -2, -3… (within an optional scope, e.g. category type). */
async function uniqueSlug(cfg: ResourceConfig, base: string, scope: Row, excludeId?: string) {
  const root = base || `item-${Date.now().toString(36)}`;
  for (let i = 1; i < 200; i++) {
    const candidate = i === 1 ? root : `${root}-${i}`;
    const clash = await delegate(cfg).findFirst({ where: { slug: candidate, ...scope, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } });
    if (!clash) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}

/** Sanitise HTML, generate slugs and run resource hooks before a create/update. */
export async function prepareData(cfg: ResourceConfig, data: Row, existing: Row | null) {
  const out: Row = { ...data };
  if (existing) for (const f of cfg.immutable ?? []) delete out[f];
  for (const f of cfg.html ?? []) if (typeof out[f] === "string") out[f] = sanitizeRichText(out[f]);
  if (cfg.slug && ("slug" in out || !existing)) {
    const base = slugify(out.slug || out[cfg.slug.from] || existing?.[cfg.slug.from] || "");
    const scope = cfg.slug.scope ? cfg.slug.scope({ ...existing, ...out }) : {};
    out.slug = await uniqueSlug(cfg, base, scope, existing?.id);
  }
  return cfg.beforeWrite ? cfg.beforeWrite(out, existing) : out;
}

/** New items go to the end of ordered lists. */
export async function nextOrder(cfg: ResourceConfig, data: Row) {
  if (!cfg.ordered) return {};
  const scope = cfg.model === "galleryImage" ? { albumId: data.albumId } : cfg.model === "category" ? { type: data.type } : {};
  const last = await delegate(cfg).findFirst({ where: scope, orderBy: { order: "desc" }, select: { order: true } });
  return { order: (last?.order ?? -1) + 1 };
}
