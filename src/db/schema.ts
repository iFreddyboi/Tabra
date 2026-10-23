import {
  pgTable, uuid, text, numeric, date, timestamp, integer, uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const ts = (col: string) => timestamp(col, { withTimezone: true, mode: "date" });

// ── users ──────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  name: text("name"),
  image: text("image"),
  emailVerified: ts("email_verified"),
  stripeCustomerId: text("stripe_customer_id"),
  // free | trip | annual
  plan: text("plan").notNull().default("free"),
  planExpiresAt: ts("plan_expires_at"),
  createdAt: ts("created_at").notNull().default(sql`now()`),
});

// ── NextAuth tables ────────────────────────────────────────────────────────

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
}, (t) => ({
  providerUniq: uniqueIndex("accounts_provider_uniq").on(t.provider, t.providerAccountId),
}));

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: text("session_token").unique().notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: ts("expires").notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: ts("expires").notNull(),
}, (t) => ({
  uniq: uniqueIndex("verification_tokens_uniq").on(t.identifier, t.token),
}));

// ── groups ─────────────────────────────────────────────────────────────────

export const groups = pgTable("groups", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  inviteToken: text("invite_token").unique().notNull(),
  currency: text("currency").notNull().default("USD"),
  archivedAt: ts("archived_at"),
  createdAt: ts("created_at").notNull().default(sql`now()`),
});

// ── group_members ──────────────────────────────────────────────────────────

export const groupMembers = pgTable("group_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  // NULL for guests who joined via link without creating an account
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email"),
  joinedAt: ts("joined_at").notNull().default(sql`now()`),
}, (t) => ({
  userGroupUniq: uniqueIndex("group_members_user_group_uniq").on(t.groupId, t.userId),
}));

// ── expenses ───────────────────────────────────────────────────────────────

export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  paidBy: uuid("paid_by").notNull().references(() => groupMembers.id),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  date: date("date").notNull().default(sql`CURRENT_DATE`),
  receiptUrl: text("receipt_url"),
  createdAt: ts("created_at").notNull().default(sql`now()`),
  updatedAt: ts("updated_at").notNull().default(sql`now()`),
});

// ── expense_splits ─────────────────────────────────────────────────────────

export const expenseSplits = pgTable("expense_splits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  expenseId: uuid("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  memberId: uuid("member_id").notNull().references(() => groupMembers.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
}, (t) => ({
  uniq: uniqueIndex("expense_splits_uniq").on(t.expenseId, t.memberId),
}));

// ── settlements ────────────────────────────────────────────────────────────

export const settlements = pgTable("settlements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  fromMember: uuid("from_member").notNull().references(() => groupMembers.id),
  toMember: uuid("to_member").notNull().references(() => groupMembers.id),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  settledAt: ts("settled_at").notNull().default(sql`now()`),
  note: text("note"),
});

// ── stripe_events (idempotency log) ───────────────────────────────────────

export const stripeEvents = pgTable("stripe_events", {
  id: text("id").primaryKey(), // Stripe event id — used for idempotency
  type: text("type").notNull(),
  processedAt: ts("processed_at").notNull().default(sql`now()`),
});
