// Schedule + bracket generation (pure functions, framework-agnostic).

export type Pairing = { home: string; away: string };

// Round-robin via the circle method. Returns an array of rounds; each round is a
// list of pairings. Odd team counts get a bye each round.
export function roundRobin(ids: string[]): Pairing[][] {
  const teams = [...ids];
  if (teams.length < 2) return [];
  if (teams.length % 2) teams.push("__BYE__");
  const n = teams.length;
  const arr = [...teams];
  const rounds: Pairing[][] = [];
  for (let r = 0; r < n - 1; r++) {
    const pairs: Pairing[] = [];
    for (let i = 0; i < n / 2; i++) {
      const h = arr[i], a = arr[n - 1 - i];
      if (h !== "__BYE__" && a !== "__BYE__") {
        // alternate home/away by round for fairness
        pairs.push(r % 2 ? { home: a, away: h } : { home: h, away: a });
      }
    }
    rounds.push(pairs);
    arr.splice(1, 0, arr.pop() as string); // rotate, keep first fixed
  }
  return rounds;
}

// Standard single-elimination seed order for a bracket of `size` (power of 2).
// e.g. size 8 -> [1,8,4,5,2,7,3,6]
export function bracketSeedOrder(size: number): number[] {
  let seeds = [1, 2];
  while (seeds.length < size) {
    const sum = seeds.length * 2 + 1;
    const next: number[] = [];
    for (const s of seeds) { next.push(s); next.push(sum - s); }
    seeds = next;
  }
  return seeds;
}

export type BracketMatch = { slot: number; homeSeed: number; awaySeed: number };

// First-round matchups for `numTeams` seeded entrants. Bracket size is the next
// power of two; seeds beyond numTeams are byes (null opponent => top seed advances).
export function firstRoundMatches(numTeams: number): { size: number; matches: BracketMatch[] } {
  let size = 1;
  while (size < numTeams) size *= 2;
  size = Math.max(2, size);
  const order = bracketSeedOrder(size);
  const matches: BracketMatch[] = [];
  for (let i = 0; i < order.length; i += 2) {
    matches.push({ slot: i / 2, homeSeed: order[i], awaySeed: order[i + 1] });
  }
  return { size, matches };
}

// Map the number of teams entering a bracket round to the DB game_round enum.
export function roundEnumForSize(size: number): string {
  switch (size) {
    case 2: return "championship";
    case 4: return "semifinal";
    case 8: return "quarterfinal";
    default: return "bracket_round1";
  }
}

export const roundLabel: Record<string, string> = {
  pool_play: "Pool play",
  bracket_round1: "Round 1",
  quarterfinal: "Quarterfinals",
  semifinal: "Semifinals",
  third_place: "3rd place",
  championship: "Final",
};
