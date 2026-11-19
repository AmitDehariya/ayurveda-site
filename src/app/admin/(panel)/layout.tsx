import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
// Admin pages always show live data.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  const [inquiries, feedback] = await Promise.all([
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.feedback.count({ where: { status: "PENDING" } }),
  ]);
  return (
    <AdminShell counts={{ inquiries, feedback }} adminName={admin.name}>
      {children}
    </AdminShell>
  );
}
