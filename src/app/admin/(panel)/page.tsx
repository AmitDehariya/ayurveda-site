import Link from "next/link";
import { ArrowRight, FileText, Images, Inbox, MessageSquareHeart, Plus, Settings, Video } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const [newInquiries, pendingFeedback, published, drafts, images, videos, activity, latestInquiries] = await Promise.all([
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.feedback.count({ where: { status: "PENDING" } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.blogPost.count({ where: { status: "DRAFT" } }),
    prisma.galleryImage.count(),
    prisma.video.count(),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const cards = [
    { label: "New inquiries", value: newInquiries, href: "/admin/inquiries", Icon: Inbox, highlight: newInquiries > 0 },
    { label: "Feedback waiting for approval", value: pendingFeedback, href: "/admin/feedback", Icon: MessageSquareHeart, highlight: pendingFeedback > 0 },
    { label: `Articles (${drafts} draft${drafts === 1 ? "" : "s"})`, value: published, href: "/admin/blog", Icon: FileText },
    { label: `Media (${videos} video${videos === 1 ? "" : "s"})`, value: images + videos, href: "/admin/gallery", Icon: Images },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="A quick overview of your website." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, href, Icon, highlight }) => (
          <Link key={href} href={href} className={`group rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${highlight ? "border-gold-400 bg-gold-100/60" : "bg-white"}`}>
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-forest-100 text-forest-800"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1" aria-hidden="true" />
            </div>
            <p className="mt-4 font-serif text-4xl text-forest-900">{value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild size="sm"><Link href="/admin/blog?new=1"><Plus /> Write an article</Link></Button>
        <Button asChild size="sm" variant="outline"><Link href="/admin/gallery"><Images /> Add photos</Link></Button>
        <Button asChild size="sm" variant="outline"><Link href="/admin/videos?new=1"><Video /> Add a video</Link></Button>
        <Button asChild size="sm" variant="outline"><Link href="/admin/settings"><Settings /> Edit contact details</Link></Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl">Latest inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-forest-700 hover:underline">View all</Link>
          </div>
          {latestInquiries.length ? (
            <ul className="divide-y">
              {latestInquiries.map((q) => (
                <li key={q.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-forest-900">{q.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{q.subject || q.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant={q.status === "NEW" ? "gold" : q.status === "REPLIED" ? "success" : "muted"}>{q.status.toLowerCase()}</Badge>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDate(q.createdAt, { day: "numeric", month: "short" })}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No inquiries yet.</p>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-serif text-xl">Recent activity</h2>
          {activity.length ? (
            <ol className="space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                  <div>
                    <p className="text-forest-900">{a.summary}</p>
                    <p className="text-xs text-muted-foreground">{a.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Nothing yet.</p>
          )}
        </section>
      </div>
    </>
  );
}
