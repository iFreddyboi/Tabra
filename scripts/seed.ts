#!/usr/bin/env npx tsx
/**
 * Seed script — realistic fake data, no real people.
 * Run: npm run db:seed
 */
import { db } from "../src/db";
import { users, groups, groupMembers, expenses, expenseSplits } from "../src/db/schema";
import { computeSplits } from "../src/lib/splits";

async function main() {
  console.log("Seeding database…");

  // ── Users ─────────────────────────────────────────────────────────────────
  const [alice, bob, carol] = await db
    .insert(users)
    .values([
      { name: "Alice Ferreira", email: "alice@example.com", plan: "annual" },
      { name: "Bob Nakamura", email: "bob@example.com", plan: "free" },
      { name: "Carol Jensen", email: "carol@example.com", plan: "free" },
    ])
    .returning();

  // ── Group ─────────────────────────────────────────────────────────────────
  const [group] = await db
    .insert(groups)
    .values({
      name: "Lisbon Trip",
      currency: "EUR",
      inviteToken: "seed-lisbon-invite-token-001",
      createdBy: alice.id,
    })
    .returning();

  const [mAlice, mBob, mCarol] = await db
    .insert(groupMembers)
    .values([
      { groupId: group.id, userId: alice.id, name: "Alice Ferreira" },
      { groupId: group.id, userId: bob.id, name: "Bob Nakamura" },
      { groupId: group.id, userId: carol.id, name: "Carol Jensen" },
    ])
    .returning();

  // ── Expenses ──────────────────────────────────────────────────────────────
  const expenseDefs = [
    { description: "Airbnb", amount: 450, paidBy: mAlice.id, date: "2024-09-01" },
    { description: "Groceries", amount: 87.5, paidBy: mBob.id, date: "2024-09-02" },
    { description: "Dinner at Cervejaria Ramiro", amount: 132, paidBy: mCarol.id, date: "2024-09-03" },
    { description: "Day trip to Sintra (trains)", amount: 36, paidBy: mAlice.id, date: "2024-09-04" },
  ];

  const memberIds = [mAlice.id, mBob.id, mCarol.id];

  for (const def of expenseDefs) {
    const [expense] = await db
      .insert(expenses)
      .values({
        groupId: group.id,
        paidBy: def.paidBy,
        description: def.description,
        amount: String(def.amount),
        currency: "EUR",
        date: def.date,
      })
      .returning();

    const splitAmounts = computeSplits({
      mode: "equal",
      total: def.amount,
      memberIds,
    });

    await db.insert(expenseSplits).values(
      Object.entries(splitAmounts).map(([memberId, amt]) => ({
        expenseId: expense.id,
        memberId,
        amount: String(amt),
      }))
    );
  }

  console.log(`Seeded group "${group.name}" with ${expenseDefs.length} expenses.`);
  console.log("Users: alice@example.com, bob@example.com, carol@example.com");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
