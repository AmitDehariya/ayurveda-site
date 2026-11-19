import type { Metadata } from "next";
import Link from "next/link";
import { Images } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { SmartImage } from "@/components/site/smart-image";
import { getAlbums } from "@/lib/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Photo Gallery",
  description: "Photos from lectures, seminars, health camps and events.",
  alternates: { canonical: "/gallery" },
};

export default async function GalleryPage() {
  const albums = await getAlbums();
  return (
    <>
      <PageHeader title="Photo Gallery" subtitle="Moments from lectures, seminars, health camps and events." crumbs={[{ label: "Gallery" }]} />
      <section className="section">
        <div className="container">
          {albums.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((a, i) => (
                <Reveal key={a.id} delay={(i % 3) * 0.08}>
                  <Link href={`/gallery/${a.slug}`} className="group block overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <SmartImage src={a.coverImageUrl || a.images[0]?.url} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-forest-950/70 px-3 py-1 text-xs text-white">
                        <Images className="h-3.5 w-3.5" aria-hidden="true" /> {a._count.images} photo{a._count.images === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="font-serif text-xl text-forest-900">{a.title}</h2>
                      {a.description ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.description}</p> : null}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Photos will be added soon.</p>
          )}
        </div>
      </section>
    </>
  );
}
