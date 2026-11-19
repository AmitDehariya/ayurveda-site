import { AdminPageHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { defaultSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const row = (await prisma.siteSetting.findUnique({ where: { id: 1 } })) ?? defaultSettings;
  const { id: _id, updatedAt: _u, ...initial } = row;
  return (
    <>
      <AdminPageHeader title="Site settings" description="Name, logo, home page text, contact details, social links and Google (SEO) settings." />
      <SettingsForm initial={initial} />
    </>
  );
}
