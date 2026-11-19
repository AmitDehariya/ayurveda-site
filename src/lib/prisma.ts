import { PrismaClient } from "@prisma/client";

// Reuse one client across hot reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const isPostgres = (process.env.DATABASE_URL ?? "").startsWith("postgres");

/**
 * Case-insensitive "contains" filter that works on both databases:
 * SQLite's LIKE is already case-insensitive (ASCII) and rejects `mode`,
 * PostgreSQL needs `mode: "insensitive"`.
 */
export function textContains(q: string) {
  return isPostgres ? { contains: q, mode: "insensitive" as const } : { contains: q };
}
