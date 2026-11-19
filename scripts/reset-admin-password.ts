/**
 * Create or reset an admin user's password.
 *
 *   npm run admin:reset-password -- --email you@example.com --password "NewStrongPass1"
 *
 * Without arguments it uses ADMIN_EMAIL / ADMIN_PASSWORD from .env.
 * All existing login sessions for that user are signed out.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}

async function main() {
  const prisma = new PrismaClient();
  const email = (arg("email") || process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = arg("password") || process.env.ADMIN_PASSWORD || "";
  if (!email) throw new Error("Provide --email or set ADMIN_EMAIL");
  if (password.length < 8) throw new Error("Password must be at least 8 characters");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, tokenVersion: { increment: 1 } },
    create: { email, passwordHash, name: process.env.ADMIN_NAME || "Admin" },
  });
  console.log(`✓ Password set for ${user.email}. Existing sessions were signed out.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
