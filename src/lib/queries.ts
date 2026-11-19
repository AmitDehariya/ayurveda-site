import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma, textContains } from "./prisma";

// Public-facing data access. Only visible / published / approved records.

const byOrder = [{ order: "asc" as const }, { createdAt: "asc" as const }];

export const getVisibleServices = cache(() =>
  prisma.service.findMany({ where: { isVisible: true }, orderBy: byOrder }),
);

export const getServiceBySlug = cache((slug: string) =>
  prisma.service.findFirst({ where: { slug, isVisible: true } }),
);

export const getStats = cache(() => prisma.stat.findMany({ orderBy: byOrder }));

export const POSTS_PER_PAGE = 6;

const publishedWhere = (): Prisma.BlogPostWhereInput => ({ status: "PUBLISHED", publishedAt: { lte: new Date() } });

export async function getPosts({ page = 1, q = "", category = "" }: { page?: number; q?: string; category?: string }) {
  const where: Prisma.BlogPostWhereInput = { ...publishedWhere() };
  if (q) where.OR = [{ title: textContains(q) }, { excerpt: textContains(q) }, { tags: textContains(q) }, { contentHtml: textContains(q) }];
  if (category) where.category = { slug: category, type: "BLOG" };
  const [total, posts] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      include: { category: true },
      orderBy: { publishedAt: "desc" },
      skip: (Math.max(1, page) - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
    }),
  ]);
  return { posts, total, pages: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)) };
}

export const getLatestPosts = cache((take = 3) =>
  prisma.blogPost.findMany({ where: publishedWhere(), include: { category: true }, orderBy: { publishedAt: "desc" }, take }),
);

export const getPostBySlug = cache((slug: string) =>
  prisma.blogPost.findFirst({ where: { slug, ...publishedWhere() }, include: { category: true } }),
);

export async function getRelatedPosts(postId: string, categoryId: string | null) {
  return prisma.blogPost.findMany({
    where: { ...publishedWhere(), id: { not: postId }, ...(categoryId ? { categoryId } : {}) },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: { category: true },
  });
}

export const getCategories = cache((type: "BLOG" | "VIDEO") =>
  prisma.category.findMany({ where: { type }, orderBy: byOrder }),
);

export const getAlbums = cache(() =>
  prisma.galleryAlbum.findMany({
    where: { isVisible: true },
    orderBy: byOrder,
    include: { _count: { select: { images: true } }, images: { orderBy: byOrder, take: 1 } },
  }),
);

export const getAlbumBySlug = cache((slug: string) =>
  prisma.galleryAlbum.findFirst({ where: { slug, isVisible: true }, include: { images: { orderBy: byOrder } } }),
);

export async function getVideos(category = "") {
  return prisma.video.findMany({
    where: { isVisible: true, ...(category ? { category: { slug: category, type: "VIDEO" } } : {}) },
    orderBy: [{ isFeatured: "desc" }, ...byOrder],
    include: { category: true },
  });
}

export const getApprovedFeedback = cache((take?: number) =>
  prisma.feedback.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take,
  }),
);

export const getAboutData = cache(async () => {
  const [qualifications, timeline, achievements, publications] = await Promise.all([
    prisma.qualification.findMany({ orderBy: byOrder }),
    prisma.timelineItem.findMany({ orderBy: byOrder }),
    prisma.achievement.findMany({ orderBy: byOrder }),
    prisma.publication.findMany({ orderBy: byOrder }),
  ]);
  return { qualifications, timeline, achievements, publications };
});
