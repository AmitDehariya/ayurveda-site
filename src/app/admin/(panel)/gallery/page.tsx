import { AdminPageHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { AlbumsManager } from "./albums-manager";

export default async function AdminGalleryPage() {
  const albums = await prisma.galleryAlbum.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { images: true } }, images: { orderBy: { order: "asc" }, take: 1, select: { url: true } } },
  });
  return (
    <>
      <AdminPageHeader title="Gallery" description="Create albums (e.g. Lectures, Health camps), then open an album to add photos." />
      <AlbumsManager albums={albums} />
    </>
  );
}
