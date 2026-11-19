import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { PhotoGrid } from "@/components/site/photo-grid";
import { getAlbumBySlug } from "@/lib/queries";
import { safeDecode, shareImage } from "@/lib/utils";

export const revalidate = 300;

// Pages are generated on first visit and then cached (on-demand ISR); admin changes refresh them.
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const album = await getAlbumBySlug(safeDecode((await params).slug));
  if (!album) return { title: "Album not found" };
  return {
    title: `${album.title} – Gallery`,
    description: album.description || `Photos: ${album.title}`,
    alternates: { canonical: `/gallery/${album.slug}` },
    openGraph: { images: [shareImage(album.coverImageUrl)] },
  };
}

export default async function AlbumPage({ params }: Props) {
  const album = await getAlbumBySlug(safeDecode((await params).slug));
  if (!album) notFound();
  return (
    <>
      <PageHeader title={album.title} subtitle={album.description} crumbs={[{ href: "/gallery", label: "Gallery" }, { label: album.title }]} />
      <section className="section">
        <div className="container">
          <Link href="/gallery" className="mb-8 inline-flex items-center gap-2 text-sm text-forest-700 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> All albums</Link>
          {album.images.length ? <PhotoGrid photos={album.images} /> : <p className="text-muted-foreground">No photos in this album yet.</p>}
        </div>
      </section>
    </>
  );
}
