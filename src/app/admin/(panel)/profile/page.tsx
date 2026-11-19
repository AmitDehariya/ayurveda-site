import { AdminPageHeader } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { defaultProfile } from "@/lib/settings";
import { ProfileEditor } from "./profile-editor";

const byOrder = [{ order: "asc" as const }, { createdAt: "asc" as const }];

export default async function AdminProfilePage() {
  const [profile, qualifications, timeline, achievements, publications] = await Promise.all([
    prisma.profile.findUnique({ where: { id: 1 } }),
    prisma.qualification.findMany({ orderBy: byOrder }),
    prisma.timelineItem.findMany({ orderBy: byOrder }),
    prisma.achievement.findMany({ orderBy: byOrder }),
    prisma.publication.findMany({ orderBy: byOrder }),
  ]);
  const { id: _id, updatedAt: _u, ...initial } = profile ?? defaultProfile;
  return (
    <>
      <AdminPageHeader title="Profile & About page" description="Your biography, photo, qualifications, experience, awards and publications." />
      <ProfileEditor profile={initial} qualifications={qualifications} timeline={timeline} achievements={achievements} publications={publications} />
    </>
  );
}
