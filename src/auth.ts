import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { sendEmail, magicLinkTemplate } from "@/lib/email";
import { writeDevMagicLink } from "@/lib/dev-magic-link";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  providers: [
    Google,
    // Email magic link. Uses our shared sendEmail() wrapper so when RESEND_API_KEY
    // isn't set, the link is logged to the dev console (copy/paste to sign in).
    Resend({
      from: process.env.RESEND_FROM ?? "meetlocal <onboarding@resend.dev>",
      async sendVerificationRequest({ identifier, url }) {
        await sendEmail({
          to: identifier,
          ...magicLinkTemplate({ url }),
        });
        // Dev fallback: log the link AND write it to a temp file the
        // check-email page reads so we can render a one-click sign-in button.
        if (process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.log(`\n🔗 Magic link for ${identifier}:\n${url}\n`);
          writeDevMagicLink({ identifier, url });
        }
      },
    }),
  ],
  pages: { signIn: "/signin", verifyRequest: "/signin/check-email" },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user?.id) {
        session.user.id = user.id;
        session.user.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Auto-promote founder accounts on first sign-in.
      if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isAdmin: true },
        });
      }
    },
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
