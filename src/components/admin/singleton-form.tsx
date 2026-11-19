"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldRenderer, type FieldDef } from "./fields";
import { api, ApiError } from "@/lib/client-api";

export type Section = { title: string; description?: string; fields: FieldDef[] };

/** One long form split into titled sections (Site Settings, Profile). */
export function SingletonForm({ url, schema, sections, initial }: { url: string; schema: ZodType; sections: Section[]; initial: Record<string, any> }) {
  const router = useRouter();
  const { register, control, handleSubmit, setError, watch, reset, formState } = useForm<Record<string, any>>({
    resolver: zodResolver(schema as any, undefined, { raw: true }),
    defaultValues: initial,
  });
  const values = watch();

  const onSubmit = async (data: Record<string, any>) => {
    try {
      const res = await api<{ item: Record<string, any> }>("PUT", url, data);
      reset(Object.fromEntries(Object.keys(initial).map((k) => [k, res.item[k] ?? ""])));
      toast.success("Saved – your website is updated");
      router.refresh();
    } catch (e) {
      const err = e as ApiError;
      Object.entries(err.fields ?? {}).forEach(([k, m]) => setError(k, { message: m }));
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, () => toast.error("Please correct the highlighted fields"))} noValidate className="pb-24">
      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.title} className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-serif text-xl">{s.title}</h2>
            {s.description ? <p className="mb-5 mt-1 text-sm text-muted-foreground">{s.description}</p> : <div className="mb-5" />}
            <FieldRenderer fields={s.fields} control={control} register={register} errors={formState.errors} values={values} />
          </section>
        ))}
      </div>
      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/95 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3">
          {formState.isDirty ? <span className="text-sm text-gold-700">You have unsaved changes</span> : null}
          <Button type="submit" size="lg" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />} Save changes
          </Button>
        </div>
      </div>
    </form>
  );
}
