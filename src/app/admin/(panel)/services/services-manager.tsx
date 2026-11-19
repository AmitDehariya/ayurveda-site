"use client";

import type { Service } from "@prisma/client";
import { ResourceManager } from "@/components/admin/resource-manager";
import type { FieldDef } from "@/components/admin/fields";
import { serviceSchema } from "@/lib/validators";

const fields: FieldDef[] = [
  { name: "title", label: "Service name *", type: "text", placeholder: "e.g. Panchakarma Therapy" },
  { name: "shortDescription", label: "Short description", type: "textarea", rows: 2, help: "One or two sentences shown on the service card." },
  { name: "imageUrl", label: "Photo", type: "image" },
  { name: "icon", label: "Icon", type: "icon" },
  { name: "contentHtml", label: "Full description", type: "richtext", placeholder: "Describe the service, what it involves, who it is for…" },
  { name: "isVisible", label: "Show on website", type: "switch", half: true },
  { name: "slug", label: "Web address (optional)", type: "text", half: true, help: "Leave empty to create it from the name." },
  { name: "metaTitle", label: "Google title (optional)", type: "text", half: true },
  { name: "metaDescription", label: "Google description (optional)", type: "text", half: true },
];

const defaults = { title: "", shortDescription: "", imageUrl: "", icon: "leaf", contentHtml: "", isVisible: true, slug: "", metaTitle: "", metaDescription: "" };

export function ServicesManager({ items }: { items: Service[] }) {
  return (
    <ResourceManager
      resource="services"
      singular="service"
      items={items}
      schema={serviceSchema}
      fields={fields}
      defaults={defaults}
      ordered
      wide
      toggle={{ field: "isVisible", label: "Visible" }}
      previewHref={(s) => `/services/${s.slug}`}
      row={(s) => ({ title: s.title, subtitle: s.shortDescription, image: s.imageUrl, badges: s.isVisible ? [] : [{ label: "Hidden", variant: "muted" }] })}
    />
  );
}
