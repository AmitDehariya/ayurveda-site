"use client";

import type { Stat } from "@prisma/client";
import { ResourceManager } from "@/components/admin/resource-manager";
import type { FieldDef } from "@/components/admin/fields";
import { statSchema } from "@/lib/validators";

const fields: FieldDef[] = [
  { name: "value", label: "Number *", type: "number", half: true, placeholder: "15" },
  { name: "suffix", label: "After the number", type: "text", half: true, placeholder: "+", help: "e.g. + or % (optional)" },
  { name: "label", label: "Label *", type: "text", placeholder: "Years of experience" },
  { name: "icon", label: "Icon", type: "icon" },
];

export function StatsManager({ items }: { items: Stat[] }) {
  return (
    <ResourceManager
      resource="stats"
      singular="number"
      items={items}
      schema={statSchema}
      fields={fields}
      defaults={{ value: 0, suffix: "+", label: "", icon: "award" }}
      ordered
      previewHref={() => "/"}
      row={(s) => ({ title: `${s.value.toLocaleString("en-IN")}${s.suffix}`, subtitle: s.label })}
    />
  );
}
