import { AdminPageHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { StatsManager } from "./stats-manager";

export default async function AdminStatsPage() {
  const items = await prisma.stat.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <AdminPageHeader title="Home page numbers" description="The highlight numbers on the home page, e.g. “15+ Years of experience”. Four looks best." />
      <StatsManager items={items} />
    </>
  );
}
