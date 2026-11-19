import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Leaf } from "lucide-react";
import { getAdmin } from "@/lib/admin-guard";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin login", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  if (await getAdmin()) redirect("/admin");
  const { callbackUrl } = await searchParams;
  // Only allow redirecting back inside the admin area (prevents open redirects).
  const safeCallback = callbackUrl && callbackUrl.startsWith("/admin") && !callbackUrl.startsWith("//") ? callbackUrl : "/admin";

  return (
    <main className="bg-leaf-pattern grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest-800 text-gold-300 shadow-soft"><Leaf className="h-7 w-7" aria-hidden="true" /></span>
          <h1 className="mt-4 font-serif text-3xl">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your website content</p>
        </div>
        <div className="rounded-3xl border bg-white p-6 shadow-soft sm:p-8">
          <LoginForm callbackUrl={safeCallback} />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Forgot your password? See “Reset admin password” in the README, or ask your website developer.
        </p>
      </div>
    </main>
  );
}
