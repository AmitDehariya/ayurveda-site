import Link from "next/link";
import type { BlogPost, Category, Service } from "@prisma/client";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { SmartImage } from "./smart-image";
import { DynamicIcon } from "./icons";
import { formatDate, readingTime } from "@/lib/utils";

export function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        <SmartImage
          src={service.imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute bottom-0 left-5 grid h-12 w-12 translate-y-1/2 place-items-center rounded-full bg-gold-400 text-forest-950 shadow-glow">
          <DynamicIcon name={service.icon} className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 pt-9">
        <h3 className="font-serif text-xl text-forest-900">{service.title}</h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{service.shortDescription}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-forest-700">
          Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function PostCard({ post }: { post: BlogPost & { category: Category | null } }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-video overflow-hidden" tabIndex={-1} aria-hidden="true">
        <SmartImage src={post.coverImageUrl} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
        {post.category ? (
          <span className="absolute left-4 top-4 rounded-full bg-cream-50/95 px-3 py-1 text-xs font-medium text-forest-800">{post.category.name}</span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{formatDate(post.publishedAt)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{readingTime(post.contentHtml)} min read</span>
        </div>
        <h3 className="mt-3 font-serif text-xl leading-snug text-forest-900">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 focus-visible:underline group-hover:text-forest-700">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted-foreground">{post.excerpt}</p>
      </div>
    </article>
  );
}
