import { AdminPageHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { VideosManager } from "./videos-manager";

export default async function AdminVideosPage() {
  const [videos, categories] = await Promise.all([
    prisma.video.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }], include: { category: true } }),
    prisma.category.findMany({ where: { type: "VIDEO" }, orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  ]);
  return (
    <>
      <AdminPageHeader title="Videos" description="Paste a YouTube / Vimeo link, or upload an MP4 file (up to 100 MB)." />
      <VideosManager videos={videos} categories={categories} />
    </>
  );
}
