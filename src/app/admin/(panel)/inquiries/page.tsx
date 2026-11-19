import { AdminPageHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { inquiryWhere } from "@/lib/inquiries";
import { InquiriesManager } from "./inquiries-manager";

const PER_PAGE = 25;

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const params = new URLSearchParams(Object.entries(sp).filter((e): e is [string, string] => typeof e[1] === "string"));
  const page = Math.max(1, Number(params.get("page")) || 1);
  const where = inquiryWhere(params);
  const [items, total, counts] = await Promise.all([
    prisma.inquiry.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE }),
    prisma.inquiry.count({ where }),
    prisma.inquiry.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  return (
    <>
      <AdminPageHeader title="Inquiries" description="Messages sent from the Contact form. Click a message to read it." />
      <InquiriesManager
        items={items}
        total={total}
        page={page}
        pages={Math.max(1, Math.ceil(total / PER_PAGE))}
        status={params.get("status") ?? ""}
        q={params.get("q") ?? ""}
        counts={Object.fromEntries(counts.map((c) => [c.status, c._count._all]))}
      />
    </>
  );
}
