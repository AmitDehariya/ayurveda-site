"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import type { z } from "zod";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordChangeSchema } from "@/lib/validators";
import { api, ApiError } from "@/lib/client-api";

type Values = z.infer<typeof passwordChangeSchema>;

const FIELDS: { name: keyof Values; label: string; auto: string; hint?: string }[] = [
  { name: "currentPassword", label: "Current password", auto: "current-password" },
  { name: "newPassword", label: "New password", auto: "new-password", hint: "At least 10 characters, with letters and numbers." },
  { name: "confirmPassword", label: "Type the new password again", auto: "new-password" },
];

export function PasswordForm() {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(passwordChangeSchema) });

  const onSubmit = async (values: Values) => {
    try {
      await api("POST", "/api/admin/password", values);
      toast.success("Password changed. Please sign in again.");
      setTimeout(() => signOut({ callbackUrl: "/admin/login" }), 1200);
    } catch (e) {
      const err = e as ApiError;
      Object.entries(err.fields ?? {}).forEach(([k, m]) => setError(k as keyof Values, { message: m }));
      toast.error(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {FIELDS.map((f) => (
        <div key={f.name} className="space-y-2">
          <Label htmlFor={f.name}>{f.label}</Label>
          <Input id={f.name} type="password" autoComplete={f.auto} aria-invalid={!!errors[f.name]} {...register(f.name)} />
          {errors[f.name] ? <p className="text-xs text-destructive">{errors[f.name]?.message}</p> : f.hint ? <p className="text-xs text-muted-foreground">{f.hint}</p> : null}
        </div>
      ))}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin" /> : <KeyRound />} Change password</Button>
    </form>
  );
}
