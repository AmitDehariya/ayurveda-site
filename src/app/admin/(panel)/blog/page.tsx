import { AdminPageHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { BlogManager } from "./blog-manager";

export default async function AdminBlogPage() {
  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true } }),
    prisma.category.findMany({ where: { type: "BLOG" }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  ]);
  return (
    <>
      <AdminPageHeader title="Articles" description="Write health tips and articles. Save as Draft while writing, then choose Published to show it on the website." />
      <BlogManager posts={posts} categories={categories} />
    </>
  );
}
