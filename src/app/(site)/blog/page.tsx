import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { PostCard } from "@/components/site/cards";
import { Pagination } from "@/components/site/pagination";
import { Disclaimer } from "@/components/site/disclaimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCategories, getPosts } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

type Props = { searchParams: Promise<{ q?: string; category?: string; page?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q, category, page } = await searchParams;
  return {
    title: "Ayurveda Articles & Health Tips",
    description: "Read Ayurveda health tips on daily routine, seasonal care, diet and wellbeing.",
    alternates: { canonical: "/blog" },
    // Avoid indexing endless search / filter combinations.
    robots: q || category || (page && page !== "1") ? { index: false, follow: true } : undefined,
  };
}

export default async function BlogPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 100).trim();
  const category = (sp.category ?? "").slice(0, 100);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const [{ posts, pages, total }, categories, settings] = await Promise.all([getPosts({ page, q, category }), getCategories("BLOG"), getSettings()]);

  const chip = (active: boolean) =>
    cn("rounded-full border px-4 py-1.5 text-sm transition", active ? "border-forest-700 bg-forest-700 text-cream-50" : "bg-white text-forest-800 hover:bg-forest-50");

  return (
    <>
      <PageHeader title="Articles & Health Tips" subtitle="Simple, practical Ayurveda knowledge for everyday wellbeing." crumbs={[{ label: "Articles" }]} />
      <section className="section">
        <div className="container">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <nav aria-label="Categories" className="flex flex-wrap gap-2">
              <Link href={q ? `/blog?q=${encodeURIComponent(q)}` : "/blog"} className={chip(!category)}>All</Link>
              {categories.map((c) => (
                <Link key={c.id} href={`/blog?category=${encodeURIComponent(c.slug)}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={chip(category === c.slug)} aria-current={category === c.slug ? "page" : undefined}>
                  {c.name}
                </Link>
              ))}
            </nav>
            <form role="search" action="/blog" className="flex w-full gap-2 lg:w-96">
              {category ? <input type="hidden" name="category" value={category} /> : null}
              <label htmlFor="blog-search" className="sr-only">Search articles</label>
              <Input id="blog-search" name="q" defaultValue={q} placeholder="Search articles…" className="rounded-full" maxLength={100} />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" aria-label="Search"><Search /></Button>
            </form>
          </div>

          {q ? <p className="mb-6 text-sm text-muted-foreground">{total} result{total === 1 ? "" : "s"} for “{q}”</p> : null}

          {posts.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          ) : (
            <div className="rounded-2xl border bg-white p-12 text-center text-muted-foreground">
              No articles found. <Link href="/blog" className="text-forest-700 underline">View all articles</Link>
            </div>
          )}

          <Pagination page={page} pages={pages} basePath="/blog" params={{ ...(q ? { q } : {}), ...(category ? { category } : {}) }} />
          <Disclaimer text={settings.disclaimer} className="mx-auto mt-12 max-w-3xl" />
        </div>
      </section>
    </>
  );
}
