import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Tag } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { RichContent } from "@/components/site/rich-content";
import { SmartImage } from "@/components/site/smart-image";
import { Disclaimer } from "@/components/site/disclaimer";
import { PostCard } from "@/components/site/cards";
import { JsonLd } from "@/components/site/json-ld";
import { getPostBySlug, getRelatedPosts } from "@/lib/queries";
import { getProfile, getSettings } from "@/lib/settings";
import { absoluteUrl, formatDate, readingTime, safeDecode, shareImage, splitTags } from "@/lib/utils";

export const revalidate = 300;

// Pages are generated on first visit and then cached (on-demand ISR); admin changes refresh them.
export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(safeDecode((await params).slug));
  if (!post) return { title: "Article not found" };
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    keywords: splitTags(post.tags),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: [shareImage(post.coverImageUrl)],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(safeDecode((await params).slug));
  if (!post) notFound();
  const [related, settings, profile] = await Promise.all([getRelatedPosts(post.id, post.categoryId), getSettings(), getProfile()]);
  const tags = splitTags(post.tags);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.coverImageUrl ? absoluteUrl(post.coverImageUrl) : undefined,
          datePublished: post.publishedAt?.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          author: { "@type": "Person", name: profile.fullName },
          publisher: { "@type": "Organization", name: settings.siteName },
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          keywords: tags.join(", "),
        }}
      />
      <PageHeader title={post.title} crumbs={[{ href: "/blog", label: "Articles" }, { label: post.title }]} />
      <section className="section pt-10">
        <article className="container max-w-3xl">
          <div className="mb-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" aria-hidden="true" /><time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt)}</time></span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" aria-hidden="true" />{readingTime(post.contentHtml)} min read</span>
            {post.category ? <Link href={`/blog?category=${post.category.slug}`} className="rounded-full bg-forest-100 px-3 py-0.5 text-forest-800 hover:bg-forest-200">{post.category.name}</Link> : null}
          </div>
          {post.coverImageUrl ? (
            <div className="relative mb-10 aspect-video overflow-hidden rounded-3xl shadow-soft">
              <SmartImage src={post.coverImageUrl} alt={post.title} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
            </div>
          ) : null}
          {post.excerpt ? <p className="mb-8 font-serif text-xl leading-relaxed text-forest-800">{post.excerpt}</p> : null}
          <RichContent html={post.contentHtml} />
          {tags.length > 0 && (
            <div className="mt-10 flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-gold-600" aria-hidden="true" />
              {tags.map((t) => (
                <Link key={t} href={`/blog?q=${encodeURIComponent(t)}`} className="rounded-full border bg-white px-3 py-1 text-xs text-forest-800 hover:bg-forest-50">#{t}</Link>
              ))}
            </div>
          )}
          <Disclaimer text={settings.disclaimer} className="mt-10" />
        </article>
      </section>

      {related.length > 0 && (
        <section className="section bg-cream-100">
          <div className="container">
            <h2 className="heading-lg mb-8 text-center">Related articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
