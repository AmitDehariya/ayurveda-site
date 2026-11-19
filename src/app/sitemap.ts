import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/gallery"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/videos"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/feedback"), lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
  ];

  try {
    const [services, posts, albums] = await Promise.all([
      prisma.service.findMany({ where: { isVisible: true }, select: { slug: true, updatedAt: true } }),
      prisma.blogPost.findMany({ where: { status: "PUBLISHED", publishedAt: { lte: now } }, select: { slug: true, updatedAt: true } }),
      prisma.galleryAlbum.findMany({ where: { isVisible: true }, select: { slug: true, updatedAt: true } }),
    ]);
    return [
      ...staticPages,
      ...services.map((s) => ({ url: absoluteUrl(`/services/${s.slug}`), lastModified: s.updatedAt, priority: 0.8 })),
      ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.updatedAt, priority: 0.7 })),
      ...albums.map((a) => ({ url: absoluteUrl(`/gallery/${a.slug}`), lastModified: a.updatedAt, priority: 0.4 })),
    ];
  } catch {
    return staticPages;
  }
}
