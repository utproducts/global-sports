// Standings + tie-breaker engine for Global Sports.
// Head-To-Head implements the QuickScores logical-deduction algorithm
// (Tim Quilici, 2015): pairwise reduction, transitive deduction,
// circular-contradiction collapse, and the partial-resolution / ambiguity rule.

export type Game = {
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status?: string | null;
};

export type Tiebreaker =
  | "head_to_head"
  | "head_to_head_diff"
  | "run_differential"
  | "runs_allowed"
  | "runs_scored"
  | "win_pct"
  | "coin_flip";

export type Stat = {
  team_id: string;
  w: number; l: number; t: number;
  rf: number; ra: number;          // runs for / against (raw)
  diff: number;                    // capped run differential (sum, per-game capped)
  gp: number;
  pct: number;                     // (w + 0.5t) / gp
};

export type StandingRow = Stat & { rank: number; tiedFrom?: boolean };

const DEFAULT_TB: Tiebreaker[] = ["head_to_head", "run_differential", "runs_scored", "runs_allowed", "coin_flip"];

function isPlayed(g: Game) {
  return g.home_score != null && g.away_score != null && (g.status == null || g.status === "completed" || g.status === "final");
}

// ---- base statistics ----
export function computeStats(teamIds: string[], games: Game[], maxDiff = 10): Record<string, Stat> {
  const s: Record<string, Stat> = {};
  for (const id of teamIds) s[id] = { team_id: id, w: 0, l: 0, t: 0, rf: 0, ra: 0, diff: 0, gp: 0, pct: 0 };
  for (const g of games) {
    if (!isPlayed(g)) continue;
    const h = s[g.home_team_id], a = s[g.away_team_id];
    if (!h || !a) continue;
    const hs = g.home_score as number, as = g.away_score as number;
    h.gp++; a.gp++; h.rf += hs; h.ra += as; a.rf += as; a.ra += hs;
    const cap = (n: number) => Math.max(-maxDiff, Math.min(maxDiff, n));
    h.diff += cap(hs - as); a.diff += cap(as - hs);
    if (hs > as) { h.w++; a.l++; }
    else if (as > hs) { a.w++; h.l++; }
    else { h.t++; a.t++; }
  }
  for (const id of teamIds) { const x = s[id]; x.pct = x.gp ? (x.w + 0.5 * x.t) / x.gp : 0; }
  return s;
}

// ---- Head-To-Head (QuickScores logical deduction) ----
// Returns ordered tiers of team ids (best tier first). Teams sharing a tier are
// unresolved by HTH and pass to the next criterion. A single returned tier means
// "no conclusion".
export function headToHeadTiers(group: string[], games: Game[]): string[][] {
  if (group.length <= 1) return [group];
  const inGroup = new Set(group);

  // pairwise win tallies among the group only
  const wins: Record<string, Record<string, number>> = {};
  const ties: Record<string, Record<string, number>> = {};
  for (const a of group) { wins[a] = {}; ties[a] = {}; for (const b of group) { wins[a][b] = 0; ties[a][b] = 0; } }
  for (const g of games) {
    if (!isPlayed(g) || !inGroup.has(g.home_team_id) || !inGroup.has(g.away_team_id)) continue;
    const h = g.home_team_id, a = g.away_team_id, hs = g.home_score as number, as = g.away_score as number;
    if (hs > as) wins[h][a]++; else if (as > hs) wins[a][h]++; else { ties[h][a]++; ties[a][h]++; }
  }
  // pairwise relation: '>', '<', '=', '?'
  const rel = (x: string, y: string): ">" | "<" | "=" | "?" => {
    const xw = wins[x][y], yw = wins[y][x], tt = ties[x][y];
    if (xw === 0 && yw === 0 && tt === 0) return "?";        // never played
    if (xw > yw) return ">"; if (yw > xw) return "<"; return "="; // split/drew => equal
  };

  // blocks = partition of teams; start as singletons, merge equals first
  let blocks: string[][] = group.map((g) => [g]);
  const findBlock = (id: string) => blocks.findIndex((b) => b.includes(id));
  // merge equals
  let mergedEqual = true;
  while (mergedEqual) {
    mergedEqual = false;
    outer:
    for (let i = 0; i < blocks.length; i++) for (let j = i + 1; j < blocks.length; j++) {
      for (const x of blocks[i]) for (const y of blocks[j]) if (rel(x, y) === "=") {
        blocks[i] = blocks[i].concat(blocks[j]); blocks.splice(j, 1); mergedEqual = true; break outer;
      }
    }
  }

  // dominance between blocks: i -> j if some member of i beats some member of j
  const buildAdj = () => {
    const n = blocks.length;
    const adj: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) {
      for (const x of blocks[i]) for (const y of blocks[j]) if (rel(x, y) === ">") adj[i][j] = true;
    }
    return adj;
  };
  const closure = (adj: boolean[][]) => {
    const n = adj.length; const r = adj.map((row) => row.slice());
    for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++)
      if (r[i][k] && r[k][j]) r[i][j] = true;
    return r;
  };
  const mergeBlocks = (idxs: number[]) => {
    const uniq = Array.from(new Set(idxs)).sort((a, b) => b - a);
    let merged: string[] = [];
    for (const i of uniq) { merged = merged.concat(blocks[i]); blocks.splice(i, 1); }
    blocks.push(merged);
  };

  // iterate: collapse cycles (contradictions), then fix weak-order violations
  let changed = true;
  while (changed) {
    changed = false;
    let reach = closure(buildAdj());
    // collapse a cycle (i reaches j and j reaches i)
    let n = blocks.length;
    for (let i = 0; i < n && !changed; i++) for (let j = i + 1; j < n; j++) {
      if (reach[i][j] && reach[j][i]) { mergeBlocks([i, j]); changed = true; break; }
    }
    if (changed) continue;
    // weak-order fix: find i~j, j~k, but i,k comparable -> merge i,j,k
    reach = closure(buildAdj());
    n = blocks.length;
    const comp = (i: number, j: number) => reach[i][j] || reach[j][i];
    for (let i = 0; i < n && !changed; i++) for (let j = 0; j < n && !changed; j++) for (let k = 0; k < n; k++) {
      if (i === j || j === k || i === k) continue;
      if (!comp(i, j) && !comp(j, k) && comp(i, k)) { mergeBlocks([i, j, k]); changed = true; break; }
    }
  }

  // assign tier = 1 + (# blocks that dominate it); order ascending
  const reach = closure(buildAdj());
  const n = blocks.length;
  const tier = blocks.map((_, i) => 1 + reach.reduce((acc, _row, k) => acc + (k !== i && reach[k][i] ? 1 : 0), 0));
  const order = blocks.map((b, i) => ({ b, t: tier[i] })).sort((a, z) => a.t - z.t);
  // group by tier value
  const out: string[][] = [];
  let cur = -1;
  for (const o of order) { if (o.t !== cur) { out.push([]); cur = o.t; } out[out.length - 1] = out[out.length - 1].concat(o.b); }
  // single tier => no conclusion (return whole group as one tier)
  void n;
  return out.length === 1 ? [group] : out;
}

// ---- numeric tier helper (best-first), returns ordered tiers ----
function numericTiers(group: string[], value: (id: string) => number, higherBetter: boolean): string[][] {
  const sorted = [...group].sort((a, b) => higherBetter ? value(b) - value(a) : value(a) - value(b));
  const out: string[][] = []; let prev: number | null = null;
  for (const id of sorted) {
    const v = value(id);
    if (prev === null || v !== prev) { out.push([id]); prev = v; } else out[out.length - 1].push(id);
  }
  return out;
}

function headToHeadDiffTiers(group: string[], games: Game[], maxDiff = 10): string[][] {
  const inGroup = new Set(group);
  const diff: Record<string, number> = {}; group.forEach((g) => (diff[g] = 0));
  const cap = (n: number) => Math.max(-maxDiff, Math.min(maxDiff, n));
  for (const g of games) {
    if (!isPlayed(g) || !inGroup.has(g.home_team_id) || !inGroup.has(g.away_team_id)) continue;
    const hs = g.home_score as number, as = g.away_score as number;
    diff[g.home_team_id] += cap(hs - as); diff[g.away_team_id] += cap(as - hs);
  }
  return numericTiers(group, (id) => diff[id], true);
}

// Apply one tiebreaker to a tied group -> ordered tiers.
function applyTiebreaker(tb: Tiebreaker, group: string[], games: Game[], stats: Record<string, Stat>): string[][] {
  switch (tb) {
    case "head_to_head": return headToHeadTiers(group, games);
    case "head_to_head_diff": return headToHeadDiffTiers(group, games);
    case "run_differential": return numericTiers(group, (id) => stats[id].diff, true);
    case "runs_scored": return numericTiers(group, (id) => stats[id].rf, true);
    case "runs_allowed": return numericTiers(group, (id) => stats[id].ra, false);
    case "win_pct": return numericTiers(group, (id) => stats[id].pct, true);
    case "coin_flip": return numericTiers(group, (id) => 0, true); // unresolved -> single tier
    default: return [group];
  }
}

// Recursively resolve a tied group through the tiebreaker chain.
function resolveGroup(group: string[], games: Game[], stats: Record<string, Stat>, chain: Tiebreaker[]): string[][] {
  if (group.length <= 1) return [group];
  if (chain.length === 0) return [group]; // exhausted -> still tied
  const [tb, ...rest] = chain;
  const tiers = applyTiebreaker(tb, group, games, stats);
  if (tiers.length === 1) return resolveGroup(group, games, stats, rest); // no progress, next criterion
  const out: string[][] = [];
  for (const tier of tiers) {
    if (tier.length === 1) out.push(tier);
    else for (const sub of resolveGroup(tier, games, stats, rest)) out.push(sub);
  }
  return out;
}

export type StandingsOptions = { tiebreakers?: Tiebreaker[]; maxDiff?: number };

export function computeStandings(teamIds: string[], games: Game[], opts: StandingsOptions = {}): StandingRow[] {
  const chain = opts.tiebreakers && opts.tiebreakers.length ? opts.tiebreakers : DEFAULT_TB;
  const maxDiff = opts.maxDiff ?? 10;
  const stats = computeStats(teamIds, games, maxDiff);

  // primary: win pct, descending; group equal pct
  const byPct = [...teamIds].sort((a, b) => stats[b].pct - stats[a].pct);
  const groups: string[][] = []; let prev: number | null = null;
  for (const id of byPct) {
    const p = stats[id].pct;
    if (prev === null || p !== prev) { groups.push([id]); prev = p; } else groups[groups.length - 1].push(id);
  }

  const rows: StandingRow[] = [];
  let rank = 1;
  for (const grp of groups) {
    const resolved = resolveGroup(grp, games, stats, chain);
    for (const tier of resolved) {
      const tied = tier.length > 1;
      for (const id of tier) rows.push({ ...stats[id], rank, tiedFrom: tied });
      rank += tier.length;
    }
  }
  return rows;
}
