import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/site/page-header";
import { VideoCard } from "@/components/site/video-card";
import { getCategories, getVideos } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Props = { searchParams: Promise<{ category?: string }> };

export const metadata: Metadata = {
  title: "Videos",
  description: "Ayurveda lectures, health talks and awareness videos.",
  alternates: { canonical: "/videos" },
};

export default async function VideosPage({ searchParams }: Props) {
  const category = ((await searchParams).category ?? "").slice(0, 100);
  const [videos, categories] = await Promise.all([getVideos(category), getCategories("VIDEO")]);
  const chip = (active: boolean) =>
    cn("rounded-full border px-4 py-1.5 text-sm transition", active ? "border-forest-700 bg-forest-700 text-cream-50" : "bg-white text-forest-800 hover:bg-forest-50");

  return (
    <>
      <PageHeader title="Videos" subtitle="Lectures, health talks and awareness sessions." crumbs={[{ label: "Videos" }]} />
      <section className="section">
        <div className="container">
          {categories.length > 0 && (
            <nav aria-label="Video categories" className="mb-10 flex flex-wrap justify-center gap-2">
              <Link href="/videos" className={chip(!category)}>All</Link>
              {categories.map((c) => (
                <Link key={c.id} href={`/videos?category=${encodeURIComponent(c.slug)}`} className={chip(category === c.slug)} aria-current={category === c.slug ? "page" : undefined}>{c.name}</Link>
              ))}
            </nav>
          )}
          {videos.length ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => <VideoCard key={v.id} video={v} />)}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No videos yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
