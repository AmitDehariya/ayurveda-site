import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { PhotoManager } from "./photo-manager";

export default async function AdminAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const album = await prisma.galleryAlbum.findUnique({
    where: { id: id.slice(0, 40) },
    include: { images: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] } },
  });
  if (!album) notFound();
  return (
    <>
      <Link href="/admin/gallery" className="mb-3 inline-flex items-center gap-1 text-sm text-forest-700 hover:underline"><ArrowLeft className="h-4 w-4" /> All albums</Link>
      <AdminPageHeader
        title={album.title}
        description="Add photos by dragging them into the box below (you can select many at once). Click a caption to edit it."
        actions={<Button asChild variant="outline" size="sm"><a href={`/gallery/${album.slug}`} target="_blank" rel="noopener"><ExternalLink /> View on website</a></Button>}
      />
      <PhotoManager albumId={album.id} coverImageUrl={album.coverImageUrl} images={album.images} />
    </>
  );
}
