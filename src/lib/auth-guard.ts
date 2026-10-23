import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Use in API routes: const session = await requireAuth(); if (!session) return unauthorized();
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Check if the current user is a member of the given group.
// Returns the groupMember row or null.
import { db } from "@/db";
import { groupMembers } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function requireGroupMember(groupId: string, userId: string) {
  const [member] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
    .limit(1);
  return member ?? null;
}
