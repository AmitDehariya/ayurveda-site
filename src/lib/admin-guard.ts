import "server-only";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

/**
 * Second line of defence after middleware: verifies the session AND that the
 * token version still matches the database (a password change signs out all
 * other sessions).
 */
export async function getAdmin() {
  const session = await getServerSession(authOptions);
  const su = session?.user as { id?: string; tv?: number } | undefined;
  if (!su?.id) return null;
  const user = await prisma.adminUser.findUnique({
    where: { id: su.id },
    select: { id: true, email: true, name: true, tokenVersion: true },
  });
  if (!user || (su.tv ?? 0) !== user.tokenVersion) return null;
  return user;
}

/** For admin pages – redirects to the login page when not signed in. */
export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
