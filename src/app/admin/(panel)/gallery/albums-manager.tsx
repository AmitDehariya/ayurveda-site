"use client";

import Link from "next/link";
import type { GalleryAlbum } from "@prisma/client";
import { Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResourceManager } from "@/components/admin/resource-manager";
import type { FieldDef } from "@/components/admin/fields";
import { albumSchema } from "@/lib/validators";

type Album = GalleryAlbum & { _count: { images: number }; images: { url: string }[] };

const fields: FieldDef[] = [
  { name: "title", label: "Album name *", type: "text", placeholder: "e.g. Health Camp 2025" },
  { name: "description", label: "Description", type: "textarea", rows: 2 },
  { name: "coverImageUrl", label: "Cover photo (optional)", type: "image", help: "If empty, the first photo of the album is used." },
  { name: "isVisible", label: "Show on website", type: "switch", half: true },
  { name: "slug", label: "Web address (optional)", type: "text", half: true },
];

export function AlbumsManager({ albums }: { albums: Album[] }) {
  return (
    <ResourceManager
      resource="albums"
      singular="album"
      items={albums}
      schema={albumSchema}
      fields={fields}
      defaults={{ title: "", description: "", coverImageUrl: "", isVisible: true, slug: "" }}
      ordered
      toggle={{ field: "isVisible", label: "Visible" }}
      previewHref={(a) => `/gallery/${a.slug}`}
      extraAction={(a) => (
        <Button asChild size="sm"><Link href={`/admin/gallery/${a.id}`}><Images /> Photos ({a._count.images})</Link></Button>
      )}
      row={(a) => ({
        title: a.title,
        subtitle: `${a._count.images} photo${a._count.images === 1 ? "" : "s"}${a.description ? ` · ${a.description}` : ""}`,
        image: a.coverImageUrl || a.images[0]?.url || "",
        badges: a.isVisible ? [] : [{ label: "Hidden", variant: "muted" }],
      })}
    />
  );
}
