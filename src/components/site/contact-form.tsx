"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { contactSchema, PREFERRED_TIMES } from "@/lib/validators";
import { Honeypot } from "./honeypot";
import { useRecaptcha } from "./use-recaptcha";

type Values = z.input<typeof contactSchema>;

export function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const getToken = useRecaptcha();
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(contactSchema, undefined, { raw: true }),
    defaultValues: { name: "", phone: "", email: "", subject: defaultSubject, preferredTime: PREFERRED_TIMES[0], message: "", website: "" },
  });

  const onSubmit = async (values: Values) => {
    setServerError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, recaptchaToken: await getToken("contact") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Object.entries((data.fields ?? {}) as Record<string, string>).forEach(([k, m]) => setError(k as keyof Values, { message: m }));
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }
      reset();
      setDone(true);
    } catch {
      setServerError("Network error – please check your internet connection and try again.");
    }
  };

  if (done) {
    return (
      <div role="status" className="mt-6 rounded-2xl border border-forest-200 bg-forest-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-forest-600" aria-hidden="true" />
        <h3 className="mt-4 font-serif text-2xl">Thank you! Your message has been sent.</h3>
        <p className="mt-2 text-muted-foreground">We will get back to you as soon as possible.</p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>Send another message</Button>
      </div>
    );
  }

  const err = (k: keyof Values) => errors[k]?.message as string | undefined;
  const field = (k: keyof Values) => ({ id: `c-${k}`, "aria-invalid": !!err(k), "aria-describedby": err(k) ? `c-${k}-err` : undefined });
  const Err = ({ k }: { k: keyof Values }) => (err(k) ? <p id={`c-${k}-err`} className="text-xs text-destructive">{err(k)}</p> : null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative mt-6 grid gap-5 sm:grid-cols-2" noValidate>
      <Honeypot registration={register("website")} />
      {serverError ? <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 sm:col-span-2">{serverError}</p> : null}

      <div className="space-y-2">
        <Label htmlFor="c-name">Full name *</Label>
        <Input {...field("name")} autoComplete="name" {...register("name")} />
        <Err k="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-phone">Phone *</Label>
        <Input {...field("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="+91" {...register("phone")} />
        <Err k="phone" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-email">Email</Label>
        <Input {...field("email")} type="email" autoComplete="email" {...register("email")} />
        <Err k="email" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="c-preferredTime">Preferred contact time</Label>
        <Select {...field("preferredTime")} {...register("preferredTime")}>
          {PREFERRED_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="c-subject">Subject</Label>
        <Input {...field("subject")} placeholder="e.g. Consultation, Panchakarma, Diet advice" {...register("subject")} />
        <Err k="subject" />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="c-message">Message *</Label>
        <Textarea {...field("message")} rows={5} placeholder="Briefly describe your query…" {...register("message")} />
        <Err k="message" />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">Your details are used only to reply to your inquiry.</p>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} Send inquiry
        </Button>
      </div>
    </form>
  );
}
