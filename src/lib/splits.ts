// Split calculation helpers. All amounts in minor units internally, returned as strings.

export type SplitMode = "equal" | "exact" | "percentage" | "shares";

export type SplitInput = {
  mode: SplitMode;
  total: number; // total expense amount in dollars
  memberIds: string[];
  // For exact and percentage modes: per-member value
  perMember?: Record<string, number>;
};

export type SplitResult = Record<string, number>; // memberId → amount in dollars

export function computeSplits(input: SplitInput): SplitResult {
  const { mode, total, memberIds, perMember } = input;
  const n = memberIds.length;

  if (n === 0) throw new Error("No members to split between");

  if (mode === "equal") {
    const base = Math.floor((total * 100) / n);
    const remainder = Math.round(total * 100) - base * n;
    const result: SplitResult = {};
    memberIds.forEach((id, i) => {
      result[id] = (base + (i < remainder ? 1 : 0)) / 100;
    });
    return result;
  }

  if (mode === "exact") {
    if (!perMember) throw new Error("exact mode requires perMember values");
    const sum = Object.values(perMember).reduce((a, b) => a + b, 0);
    const rounded = Math.round(sum * 100) / 100;
    const roundedTotal = Math.round(total * 100) / 100;
    if (Math.abs(rounded - roundedTotal) > 0.02) {
      throw new Error(`Split amounts (${rounded}) don't add up to total (${roundedTotal})`);
    }
    return Object.fromEntries(
      memberIds.map((id) => [id, Math.round((perMember[id] ?? 0) * 100) / 100])
    );
  }

  if (mode === "percentage") {
    if (!perMember) throw new Error("percentage mode requires perMember values");
    const sumPct = Object.values(perMember).reduce((a, b) => a + b, 0);
    if (Math.abs(sumPct - 100) > 0.01) {
      throw new Error(`Percentages must sum to 100 (got ${sumPct})`);
    }
    return Object.fromEntries(
      memberIds.map((id) => [
        id,
        Math.round(total * ((perMember[id] ?? 0) / 100) * 100) / 100,
      ])
    );
  }

  if (mode === "shares") {
    if (!perMember) throw new Error("shares mode requires perMember values");
    const totalShares = Object.values(perMember).reduce((a, b) => a + b, 0);
    if (totalShares === 0) throw new Error("Total shares must be > 0");
    const result: SplitResult = {};
    let allocated = 0;
    memberIds.forEach((id, i) => {
      const share = perMember[id] ?? 0;
      if (i === memberIds.length - 1) {
        result[id] = Math.round((total - allocated) * 100) / 100;
      } else {
        const amount = Math.round(total * (share / totalShares) * 100) / 100;
        result[id] = amount;
        allocated += amount;
      }
    });
    return result;
  }

  throw new Error(`Unknown split mode: ${mode}`);
}
