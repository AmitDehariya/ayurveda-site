"use client";

import type { BlogPost, Category } from "@prisma/client";
import { ResourceManager } from "@/components/admin/resource-manager";
import { Tabs } from "@/components/admin/tabs";
import type { FieldDef } from "@/components/admin/fields";
import { categorySchema, postSchema } from "@/lib/validators";
import { formatDate } from "@/lib/utils";

type Post = BlogPost & { category: Category | null };

export function BlogManager({ posts, categories }: { posts: Post[]; categories: Category[] }) {
  const postFields: FieldDef[] = [
    { name: "title", label: "Title *", type: "text" },
    { name: "excerpt", label: "Short summary", type: "textarea", rows: 2, help: "Shown on article cards and in Google results." },
    { name: "coverImageUrl", label: "Cover photo", type: "image" },
    { name: "contentHtml", label: "Article", type: "richtext", placeholder: "Write your article here…" },
    {
      name: "status", label: "Status", type: "select", half: true,
      options: [{ value: "DRAFT", label: "Draft (not visible)" }, { value: "PUBLISHED", label: "Published (visible)" }],
    },
    {
      name: "categoryId", label: "Category", type: "select", half: true,
      options: [{ value: "", label: "— No category —" }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    },
    { name: "tags", label: "Tags", type: "text", half: true, placeholder: "diet, digestion, monsoon", help: "Separate with commas." },
    { name: "slug", label: "Web address (optional)", type: "text", half: true, help: "Leave empty to create it from the title." },
    { name: "metaTitle", label: "Google title (optional)", type: "text", half: true },
    { name: "metaDescription", label: "Google description (optional)", type: "text", half: true },
  ];

  const categoryFields: FieldDef[] = [
    { name: "name", label: "Category name *", type: "text" },
    { name: "slug", label: "Web address (optional)", type: "text", help: "Leave empty to create it from the name." },
  ];

  return (
    <Tabs
      tabs={[
        {
          id: "posts",
          label: `Articles (${posts.length})`,
          content: (
            <ResourceManager
              resource="posts"
              singular="article"
              items={posts}
              schema={postSchema}
              fields={postFields}
              defaults={{ title: "", excerpt: "", coverImageUrl: "", contentHtml: "", status: "DRAFT", categoryId: "", tags: "", slug: "", metaTitle: "", metaDescription: "" }}
              toForm={(p) => ({ ...p, categoryId: p.categoryId ?? "" })}
              wide
              previewHref={(p) => (p.status === "PUBLISHED" ? `/blog/${p.slug}` : null)}
              row={(p) => ({
                title: p.title,
                subtitle: [p.category?.name, p.publishedAt ? `Published ${formatDate(p.publishedAt)}` : `Last edited ${formatDate(p.updatedAt)}`].filter(Boolean).join(" · "),
                image: p.coverImageUrl,
                badges: [p.status === "PUBLISHED" ? { label: "Published", variant: "success" } : { label: "Draft", variant: "warning" }],
              })}
            />
          ),
        },
        {
          id: "categories",
          label: `Categories (${categories.length})`,
          content: (
            <ResourceManager
              resource="categories"
              singular="category"
              items={categories}
              schema={categorySchema}
              fields={categoryFields}
              defaults={{ name: "", slug: "" }}
              fixedValues={{ type: "BLOG" }}
              ordered
              row={(c) => ({ title: c.name, subtitle: `/blog?category=${c.slug}` })}
            />
          ),
        },
      ]}
    />
  );
}
