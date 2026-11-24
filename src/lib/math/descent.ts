import { gcd, isSquare, isqrt } from './rational';
import { divisors } from './nagellLutz';

/**
 * 2-descent via a 2-isogeny for E: y² = x³ + a·x² + b·x (Silverman–Tate §3.4–3.6).
 *
 * The map α sends a point with x ≠ 0 to x modulo squares, O to 1, and (0,0) to b.
 * A class b1 (with b1·b2 = b) lies in the image exactly when
 *     N² = b1·M⁴ + a·M²·e² + b2·e⁴
 * has an integer solution with M ≠ 0, e ≥ 1, gcd(M, e) = 1.
 */

export type ClassStatus = 'found' | 'obstructed' | 'undecided';

export interface ClassReport {
  /** Squarefree representative of the class in the group of nonzero rationals modulo squares. */
  cls: bigint;
  status: ClassStatus;
  /** For 'found': a point (x, y) = (b1·M²/e², b1·M·N/e³), or the reason it is automatic. */
  witness?: { b1: bigint; M: bigint; e: bigint; N: bigint } | 'identity' | 'image of (0,0)' | 'product of found classes';
  /** For 'obstructed': why no solution exists. */
  reason?: string;
}

export interface AlphaImage {
  a: bigint;
  b: bigint;
  classes: ClassReport[];
  found: bigint[];
  undecided: bigint[];
}

export interface DescentResult {
  E: AlphaImage;
  Ebar: AlphaImage;
  /** Rank, or null if some class could not be decided. */
  rank: number | null;
  /** Bounds that always hold: lower from found classes, upper counting undecided as found. */
  rankLower: number;
  rankUpper: number;
}

export function squarefreePart(n: bigint): bigint {
  if (n === 0n) throw new RangeError('squarefreePart(0)');
  const sign = n < 0n ? -1n : 1n;
  let m = n < 0n ? -n : n;
  let out = 1n;
  for (let p = 2n; p * p <= m; p++) {
    let k = 0;
    while (m % p === 0n) {
      m /= p;
      k++;
    }
    if (k % 2 === 1) out *= p;
  }
  return sign * out * m;
}

function primeFactors(n: bigint): bigint[] {
  let m = n < 0n ? -n : n;
  const out: bigint[] = [];
  for (let p = 2n; p * p <= m; p++) {
    if (m % p === 0n) {
      out.push(p);
      while (m % p === 0n) m /= p;
    }
  }
  if (m > 1n) out.push(m);
  return out;
}

/** Is b1·t² + a·t + b2 ≥ 0 for some real t > 0? (t plays the role of M²/e².) */
function realSolvable(b1: bigint, a: bigint, b2: bigint): boolean {
  if (b1 > 0n || b2 > 0n) return true;
  // b1 < 0 and b2 < 0: need the vertex t* = −a/(2·b1) > 0 with value ≥ 0, i.e. a > 0 and a² ≥ 4·b1·b2.
  return a > 0n && a * a >= 4n * b1 * b2;
}

/** Is there a solution mod m = p^k with (M, e) not both divisible by p? */
function solvableMod(b1: bigint, a: bigint, b2: bigint, p: number, m: number): boolean {
  const A = Number(((a % BigInt(m)) + BigInt(m)) % BigInt(m));
  const B1 = Number(((b1 % BigInt(m)) + BigInt(m)) % BigInt(m));
  const B2 = Number(((b2 % BigInt(m)) + BigInt(m)) % BigInt(m));
  const squares = new Uint8Array(m);
  for (let n = 0; n < m; n++) squares[(n * n) % m] = 1;
  for (let M = 0; M < m; M++) {
    const M2 = (M * M) % m;
    const M4 = (M2 * M2) % m;
    for (let e = 0; e < m; e++) {
      if (M % p === 0 && e % p === 0) continue;
      const e2 = (e * e) % m;
      const e4 = (e2 * e2) % m;
      const v = (((B1 * M4) % m) + ((((A * M2) % m) * e2) % m) + ((B2 * e4) % m)) % m;
      if (squares[v]) return true;
    }
  }
  return false;
}

function obstruction(b1: bigint, a: bigint, b2: bigint): string | null {
  if (!realSolvable(b1, a, b2)) return 'the right-hand side is negative for all real M, e';
  const disc = a * a - 4n * b1 * b2;
  const primes = new Set<number>([2, 3, 5, 7, 11, 13]);
  for (const p of primeFactors(2n * b1 * b2 * (disc === 0n ? 1n : disc))) if (p < 200n) primes.add(Number(p));
  for (const p of primes) {
    const m = p === 2 ? 32 : p === 3 ? 27 : p <= 13 ? p * p : p;
    if (!solvableMod(b1, a, b2, p, m)) return `no solution modulo ${m}`;
  }
  return null;
}

function search(b1: bigint, a: bigint, b2: bigint, bound: number) {
  for (let s = 2; s <= 2 * bound; s++) {
    for (let Mi = 1; Mi < s; Mi++) {
      const ei = s - Mi;
      if (Mi > bound || ei > bound) continue;
      const M = BigInt(Mi);
      const e = BigInt(ei);
      if (gcd(M, e) !== 1n) continue;
      const v = b1 * M ** 4n + a * M * M * e * e + b2 * e ** 4n;
      if (isSquare(v)) return { b1, M, e, N: isqrt(v) };
    }
  }
  return null;
}

/** Close a set of squarefree classes under multiplication modulo squares. */
function closure(gens: bigint[]): bigint[] {
  const set = new Set<bigint>([1n]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const x of [...set]) for (const g of gens) {
      const y = squarefreePart(x * g);
      if (!set.has(y)) {
        set.add(y);
        grew = true;
      }
    }
  }
  return [...set];
}

export function alphaImage(a: bigint, b: bigint, bound = 40): AlphaImage {
  if (b === 0n || a * a - 4n * b === 0n) throw new RangeError('Singular curve: need b ≠ 0 and a² − 4b ≠ 0');
  const byClass = new Map<bigint, bigint[]>();
  for (const d of divisors(b)) for (const b1 of [d, -d]) {
    const c = squarefreePart(b1);
    (byClass.get(c) ?? byClass.set(c, []).get(c)!).push(b1);
  }
  const reports = new Map<bigint, ClassReport>();
  reports.set(1n, { cls: 1n, status: 'found', witness: 'identity' });
  const cb = squarefreePart(b);
  if (!reports.has(cb)) reports.set(cb, { cls: cb, status: 'found', witness: 'image of (0,0)' });

  for (const [cls, b1s] of byClass) {
    if (reports.has(cls)) continue;
    let report: ClassReport | null = null;
    const reasons: string[] = [];
    for (const b1 of b1s) {
      const b2 = b / b1;
      const why = obstruction(b1, a, b2);
      if (why !== null) {
        reasons.push(`b₁ = ${b1}: ${why}`);
        continue;
      }
      const w = search(b1, a, b2, bound);
      if (w) {
        report = { cls, status: 'found', witness: w };
        break;
      }
    }
    if (!report) {
      report = reasons.length === b1s.length
        ? { cls, status: 'obstructed', reason: reasons.join('; ') }
        : { cls, status: 'undecided' };
    }
    reports.set(cls, report);
  }

  // The image is a subgroup: products of found classes are found too.
  const found0 = [...reports.values()].filter((r) => r.status === 'found').map((r) => r.cls);
  for (const c of closure(found0)) {
    const r = reports.get(c);
    if (r && r.status !== 'found') reports.set(c, { cls: c, status: 'found', witness: 'product of found classes' });
  }
  const classes = [...reports.values()].sort((p, q) => (p.cls < q.cls ? -1 : 1));
  return {
    a,
    b,
    classes,
    found: classes.filter((r) => r.status === 'found').map((r) => r.cls),
    undecided: classes.filter((r) => r.status === 'undecided').map((r) => r.cls),
  };
}

const log2 = (n: number) => Math.round(Math.log2(n));

/** Rank of y² = x³ + a·x² + b·x from 2^r = #α(Γ)·#ᾱ(Γ̄)/4. */
export function twoDescent(a: bigint | number, b: bigint | number, bound = 40): DescentResult {
  const A = BigInt(a);
  const B = BigInt(b);
  const E = alphaImage(A, B, bound);
  const Ebar = alphaImage(-2n * A, A * A - 4n * B, bound);
  const rankLower = log2(E.found.length) + log2(Ebar.found.length) - 2;
  // Undecided classes can at most double the image once per independent class; a safe upper
  // bound counts every undecided class as present.
  const upE = closure([...E.found, ...E.undecided]).length;
  const upEbar = closure([...Ebar.found, ...Ebar.undecided]).length;
  const rankUpper = log2(upE) + log2(upEbar) - 2;
  const decided = E.undecided.length === 0 && Ebar.undecided.length === 0;
  return { E, Ebar, rank: decided ? rankLower : null, rankLower, rankUpper };
}
