import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { loginSchema } from "./validators";
import { getClientIp, isRateLimited, rateLimit, resetRateLimit } from "./rate-limit";

// A real bcrypt hash used when the email doesn't exist, so the response time
// is the same and attackers can't discover which emails are registered.
const DUMMY_HASH = "$2b$12$le.sH6ePr3WQCAoNeoI17eGISx42pJUKP94v3qz6hbFjZOW/84mYm";

export const LOGIN_LIMIT = { attempts: 5, windowMs: 15 * 60 * 1000 };

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 3 * 24 * 60 * 60 },
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();

        // Rate-limit FAILED attempts per IP and per account to slow down password guessing.
        const ip = getClientIp((req?.headers ?? {}) as Record<string, string>);
        const ipKey = `login:ip:${ip}`;
        const userKey = `login:user:${email}`;
        const { attempts, windowMs } = LOGIN_LIMIT;
        if (isRateLimited(ipKey, attempts * 2, windowMs) || isRateLimited(userKey, attempts, windowMs)) {
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        const user = await prisma.adminUser.findUnique({ where: { email } });
        const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) {
          rateLimit(ipKey, attempts * 2, windowMs);
          rateLimit(userKey, attempts, windowMs);
          return null;
        }

        resetRateLimit(userKey);
        await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        return { id: user.id, email: user.email, name: user.name, tokenVersion: user.tokenVersion };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.tv = (user as { tokenVersion?: number }).tokenVersion ?? 0;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as { id?: string; tv?: number };
        u.id = token.uid as string;
        u.tv = (token.tv as number) ?? 0;
      }
      return session;
    },
  },
};
