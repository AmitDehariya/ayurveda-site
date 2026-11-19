import { AdminPageHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { FEEDBACK_STATUSES } from "@/lib/validators";
import { FeedbackManager } from "./feedback-manager";

export default async function AdminFeedbackPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = (FEEDBACK_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status! : sp.status === "ALL" ? "ALL" : "PENDING";
  const [items, counts] = await Promise.all([
    prisma.feedback.findMany({ where: status === "ALL" ? {} : { status }, orderBy: { createdAt: "desc" }, take: 300 }),
    prisma.feedback.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  return (
    <>
      <AdminPageHeader title="Feedback" description="New feedback is hidden until you approve it. Featured feedback is shown first on the home page slider." />
      <FeedbackManager items={items} status={status} counts={countMap} />
    </>
  );
}
