import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";

const providers = [
  Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  // Only enable Resend when a real API key is present
  ...(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_placeholder")
    ? [Resend({ apiKey: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM! })]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers,
  session: { strategy: "jwt" },
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    session({ session, token }) {
      if (token?.sub) session.user.id = token.sub;
      return session;
    },
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
    error: "/login/error",
  },
});
