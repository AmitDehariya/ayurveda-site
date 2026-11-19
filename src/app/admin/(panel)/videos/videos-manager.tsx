"use client";

import type { Category, Video } from "@prisma/client";
import { ResourceManager } from "@/components/admin/resource-manager";
import { Tabs } from "@/components/admin/tabs";
import type { FieldDef } from "@/components/admin/fields";
import { categorySchema, videoSchema } from "@/lib/validators";
import { videoThumbnail } from "@/lib/video";

type V = Video & { category: Category | null };

const SOURCE_LABEL: Record<string, string> = { YOUTUBE: "YouTube", VIMEO: "Vimeo", UPLOAD: "Uploaded file" };

export function VideosManager({ videos, categories }: { videos: V[]; categories: Category[] }) {
  const isLink = (v: Record<string, any>) => v.source !== "UPLOAD";
  const fields: FieldDef[] = [
    { name: "title", label: "Title *", type: "text" },
    {
      name: "source", label: "Where is the video?", type: "select",
      options: [{ value: "YOUTUBE", label: "YouTube or Vimeo link" }, { value: "UPLOAD", label: "Upload a video file (MP4)" }],
    },
    { name: "url", label: "Video link *", type: "url", placeholder: "https://www.youtube.com/watch?v=…", help: "Copy the link from YouTube (Share → Copy link) and paste it here.", showIf: isLink },
    { name: "url", label: "Video file *", type: "video", showIf: (v) => !isLink(v) },
    { name: "description", label: "Description", type: "textarea", rows: 3 },
    { name: "thumbnailUrl", label: "Cover image (optional)", type: "image", help: "YouTube videos get a cover automatically." },
    {
      name: "categoryId", label: "Category", type: "select", half: true,
      options: [{ value: "", label: "— No category —" }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    },
    { name: "isVisible", label: "Show on website", type: "switch", half: true },
    { name: "isFeatured", label: "Feature first (home page)", type: "switch", half: true },
  ];

  return (
    <Tabs
      tabs={[
        {
          id: "videos",
          label: `Videos (${videos.length})`,
          content: (
            <ResourceManager
              resource="videos"
              singular="video"
              items={videos}
              schema={videoSchema}
              fields={fields}
              defaults={{ title: "", source: "YOUTUBE", url: "", description: "", thumbnailUrl: "", categoryId: "", isVisible: true, isFeatured: false }}
              // YouTube and Vimeo are both "link" in the form; the server detects which one it is.
              toForm={(v) => ({ ...v, source: v.source === "UPLOAD" ? "UPLOAD" : "YOUTUBE", categoryId: v.categoryId ?? "" })}
              ordered
              wide
              toggle={{ field: "isVisible", label: "Visible" }}
              previewHref={() => "/videos"}
              row={(v) => ({
                title: v.title,
                subtitle: [SOURCE_LABEL[v.source], v.category?.name].filter(Boolean).join(" · "),
                image: videoThumbnail(v.source, v.url, v.thumbnailUrl) ?? "",
                badges: [...(v.isFeatured ? [{ label: "Featured", variant: "gold" as const }] : []), ...(v.isVisible ? [] : [{ label: "Hidden", variant: "muted" as const }])],
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
              fields={[{ name: "name", label: "Category name *", type: "text" }, { name: "slug", label: "Web address (optional)", type: "text" }]}
              defaults={{ name: "", slug: "" }}
              fixedValues={{ type: "VIDEO" }}
              ordered
              row={(c) => ({ title: c.name, subtitle: `/videos?category=${c.slug}` })}
            />
          ),
        },
      ]}
    />
  );
}
