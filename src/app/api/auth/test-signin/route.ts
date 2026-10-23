import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encode } from "next-auth/jwt";

// Only mounted in test environment — Playwright uses this to inject a session
// without going through the real magic-link email flow.
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "test") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const token = await encode({
    token: { sub: user.id, email: user.email, name: user.name },
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 60 * 60, // 1 hour
  });

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set("next-auth.session-token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  return response;
}
