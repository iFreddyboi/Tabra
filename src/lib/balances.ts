// Debt simplification — computes minimum transfers to settle a group.
// Input: net balance per member (positive = owed money, negative = owes money).
// Returns: list of { from, to, amount } transfers.

export type MemberBalance = {
  memberId: string;
  name: string;
  net: number; // positive: is owed, negative: owes
};

export type Transfer = {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
};

export function simplifyDebts(balances: MemberBalance[]): Transfer[] {
  const creditors = balances
    .filter((b) => b.net > 0.005)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);

  const debtors = balances
    .filter((b) => b.net < -0.005)
    .map((b) => ({ ...b, net: -b.net })) // flip sign for debtors
    .sort((a, b) => b.net - a.net);

  const transfers: Transfer[] = [];

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const c = creditors[ci];
    const d = debtors[di];
    const amount = Math.min(c.net, d.net);
    const rounded = Math.round(amount * 100) / 100;

    if (rounded > 0) {
      transfers.push({
        from: d.memberId,
        fromName: d.name,
        to: c.memberId,
        toName: c.name,
        amount: rounded,
      });
    }

    c.net -= amount;
    d.net -= amount;

    if (c.net < 0.005) ci++;
    if (d.net < 0.005) di++;
  }

  return transfers;
}

// Compute net balances from raw expense and settlement rows.
export function computeBalances(
  members: Array<{ id: string; name: string }>,
  expenses: Array<{ paidBy: string; splits: Array<{ memberId: string; amount: string }> }>,
  settlements: Array<{ fromMember: string; toMember: string; amount: string }>,
): MemberBalance[] {
  const net: Record<string, number> = {};
  for (const m of members) net[m.id] = 0;

  for (const e of expenses) {
    for (const s of e.splits) {
      net[s.memberId] = (net[s.memberId] ?? 0) - parseFloat(s.amount);
    }
    net[e.paidBy] = (net[e.paidBy] ?? 0) +
      expenses
        .find((ex) => ex.paidBy === e.paidBy)!
        .splits.reduce((sum, s) => sum + parseFloat(s.amount), 0);
  }

  // Re-derive: for each expense, the payer is owed the full amount,
  // each split member owes their share. Recompute cleanly.
  for (const id in net) net[id] = 0;

  for (const e of expenses) {
    const total = e.splits.reduce((s, sp) => s + parseFloat(sp.amount), 0);
    net[e.paidBy] = (net[e.paidBy] ?? 0) + total;
    for (const sp of e.splits) {
      net[sp.memberId] = (net[sp.memberId] ?? 0) - parseFloat(sp.amount);
    }
  }

  for (const s of settlements) {
    net[s.fromMember] = (net[s.fromMember] ?? 0) + parseFloat(s.amount);
    net[s.toMember] = (net[s.toMember] ?? 0) - parseFloat(s.amount);
  }

  return members.map((m) => ({
    memberId: m.id,
    name: m.name,
    net: Math.round((net[m.id] ?? 0) * 100) / 100,
  }));
}
