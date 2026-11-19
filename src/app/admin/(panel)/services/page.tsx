import { AdminPageHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { ServicesManager } from "./services-manager";

export default async function AdminServicesPage() {
  const items = await prisma.service.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <AdminPageHeader title="Services" description="Consultations and therapies shown on the Services page and the home page. Use the arrows to change the order." />
      <ServicesManager items={items} />
    </>
  );
}
