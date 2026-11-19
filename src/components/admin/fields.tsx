"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ICON_NAMES, DynamicIcon } from "@/components/site/icons";
import { MediaField } from "./media-field";
import { RichTextEditor } from "./rich-text-editor";
import { cn } from "@/lib/utils";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "richtext" | "image" | "video" | "select" | "switch" | "icon" | "url" | "email" | "tel";
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  /** Takes half the width on larger screens. */
  half?: boolean;
  /** Only show the field when this returns true (gets current form values). */
  showIf?: (values: Record<string, any>) => boolean;
};

type Props = {
  fields: FieldDef[];
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  values: Record<string, any>;
};

/** Renders a list of field definitions as accessible form controls. */
export function FieldRenderer({ fields, control, register, errors, values }: Props) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) => {
        if (f.showIf && !f.showIf(values)) return null;
        const id = `f-${f.name}`;
        const err = errors[f.name]?.message as string | undefined;
        const describedBy = err ? `${id}-err` : f.help ? `${id}-help` : undefined;
        const common = { id, "aria-invalid": !!err, "aria-describedby": describedBy };
        const full = !f.half || ["richtext", "image", "video", "textarea"].includes(f.type);

        let control_: React.ReactNode;
        switch (f.type) {
          case "textarea":
            control_ = <Textarea {...common} rows={f.rows ?? 4} placeholder={f.placeholder} {...register(f.name)} />;
            break;
          case "number":
            control_ = <Input {...common} type="number" inputMode="numeric" placeholder={f.placeholder} {...register(f.name)} />;
            break;
          case "select":
            control_ = (
              <Select {...common} {...register(f.name)}>
                {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </Select>
            );
            break;
          case "icon":
            control_ = (
              <Controller
                control={control}
                name={f.name}
                render={({ field }) => (
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-labelledby={`${id}-label`}>
                    {ICON_NAMES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={field.value === n}
                        aria-label={n}
                        title={n}
                        onClick={() => field.onChange(n)}
                        className={cn("grid h-10 w-10 place-items-center rounded-lg border bg-white transition hover:bg-forest-50", field.value === n && "border-forest-700 bg-forest-700 text-white hover:bg-forest-700")}
                      >
                        <DynamicIcon name={n} className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                )}
              />
            );
            break;
          case "switch":
            control_ = (
              <Controller
                control={control}
                name={f.name}
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <Switch id={id} checked={!!field.value} onCheckedChange={field.onChange} aria-describedby={describedBy} />
                    <span className="text-sm text-muted-foreground">{field.value ? "Yes" : "No"}</span>
                  </div>
                )}
              />
            );
            break;
          case "image":
          case "video":
            control_ = (
              <Controller
                control={control}
                name={f.name}
                render={({ field }) => <MediaField id={id} kind={f.type === "video" ? "video" : "image"} value={field.value ?? ""} onChange={field.onChange} invalid={!!err} />}
              />
            );
            break;
          case "richtext":
            control_ = (
              <Controller
                control={control}
                name={f.name}
                render={({ field }) => <RichTextEditor id={id} value={field.value ?? ""} onChange={field.onChange} placeholder={f.placeholder} />}
              />
            );
            break;
          default:
            control_ = <Input {...common} type={f.type === "text" ? "text" : f.type} placeholder={f.placeholder} {...register(f.name)} />;
        }

        return (
          <div key={`${f.name}-${f.type}`} className={cn("space-y-2", full && "sm:col-span-2")}>
            <Label htmlFor={id} id={`${id}-label`}>{f.label}</Label>
            {control_}
            {err ? (
              <p id={`${id}-err`} className="text-xs text-destructive">{err}</p>
            ) : f.help ? (
              <p id={`${id}-help`} className="text-xs text-muted-foreground">{f.help}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
