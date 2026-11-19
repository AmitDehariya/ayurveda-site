"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FieldRenderer, type FieldDef } from "./fields";
import { api, ApiError } from "@/lib/client-api";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  schema: ZodType;
  fields: FieldDef[];
  initial: Record<string, any>;
  method: "POST" | "PUT";
  url: string;
  wide?: boolean;
  onSaved: (item: any) => void;
};

/** Add / edit dialog: React Hook Form + the shared Zod schema, saved through the REST API. */
export function ResourceForm({ open, onOpenChange, title, description, schema, fields, initial, method, url, wide, onSaved }: Props) {
  const form = useForm<Record<string, any>>({ resolver: zodResolver(schema as any, undefined, { raw: true }), defaultValues: initial });
  const { register, control, handleSubmit, setError, watch, formState } = form;
  const values = watch();

  const onSubmit = async (data: Record<string, any>) => {
    try {
      const res = await api<{ item: any }>(method, url, data);
      toast.success("Saved");
      onSaved(res.item);
      onOpenChange(false);
    } catch (e) {
      const err = e as ApiError;
      Object.entries(err.fields ?? {}).forEach(([k, m]) => setError(k, { message: m }));
      toast.error(err.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !formState.isSubmitting && onOpenChange(o)}>
      <DialogContent wide={wide} onInteractOutside={(e) => formState.isDirty && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : <DialogDescription className="sr-only">Fill in the form and press Save.</DialogDescription>}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit, () => toast.error("Please correct the highlighted fields"))} className="flex min-h-0 flex-1 flex-col" noValidate>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FieldRenderer fields={fields} control={control} register={register} errors={formState.errors} values={values} />
          </div>
          <div className="flex justify-end gap-2 border-t bg-cream-50 px-5 py-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={formState.isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
