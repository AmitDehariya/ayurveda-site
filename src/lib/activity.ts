import "server-only";
import { prisma } from "./prisma";

/** Record an admin action for the dashboard "Recent activity" list. Never throws. */
export async function logActivity(action: string, entity: string, summary: string) {
  try {
    await prisma.activityLog.create({ data: { action, entity, summary: summary.slice(0, 300) } });
  } catch (e) {
    console.warn("[activity] failed to log", e);
  }
}
