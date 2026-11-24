import { CurveQ, type PointQ } from './curveQ';
import { Rational, isqrt } from './rational';

function abs(n: bigint): bigint {
  return n < 0n ? -n : n;
}

export function divisors(n: bigint): bigint[] {
  n = abs(n);
  if (n === 0n) throw new RangeError('divisors(0) is not finite');
  const small: bigint[] = [];
  const large: bigint[] = [];
  for (let d = 1n; d * d <= n; d++) {
    if (n % d === 0n) {
      small.push(d);
      if (d * d !== n) large.push(n / d);
    }
  }
  return small.concat(large.reverse());
}

/** Integer roots of x³ + a·x² + b·x + c (integer coefficients). */
export function integerRootsCubic(a: bigint, b: bigint, c: bigint): bigint[] {
  const f = (x: bigint) => ((x + a) * x + b) * x + c;
  const roots = new Set<bigint>();
  if (c === 0n) {
    roots.add(0n);
    // remaining roots solve x² + a·x + b = 0
    if (b === 0n) roots.add(-a);
    else for (const d of divisors(b)) for (const x of [d, -d]) if (x * x + a * x + b === 0n) roots.add(x);
  } else {
    for (const d of divisors(c)) for (const x of [d, -d]) if (f(x) === 0n) roots.add(x);
  }
  return [...roots].sort((p, q) => (p < q ? -1 : p > q ? 1 : 0));
}

export interface NagellLutzResult {
  disc: bigint;
  /** Integer points passing the Nagell–Lutz test (y = 0 or y² | D). Necessary, not sufficient. */
  candidates: Exclude<PointQ, null>[];
  /** Candidates that really have finite order, with that order. O (order 1) is not listed. */
  torsion: { P: Exclude<PointQ, null>; order: number }[];
}

/** Torsion of y² = x³ + a2·x² + a4·x + a6 with integer coefficients, by Nagell–Lutz. */
export function nagellLutz(E: CurveQ): NagellLutzResult {
  if (!E.a2.isInteger() || !E.a4.isInteger() || !E.a6.isInteger()) {
    throw new RangeError('Nagell–Lutz needs integer coefficients');
  }
  const D = E.disc().n;
  if (D === 0n) throw new RangeError('Singular curve');
  const ys: bigint[] = [0n];
  const bound = isqrt(abs(D));
  for (let y = 1n; y <= bound; y++) if (D % (y * y) === 0n) ys.push(y);

  const candidates: Exclude<PointQ, null>[] = [];
  for (const y of ys) {
    for (const x of integerRootsCubic(E.a2.n, E.a4.n, E.a6.n - y * y)) {
      candidates.push({ x: new Rational(x), y: new Rational(y) });
      if (y !== 0n) candidates.push({ x: new Rational(x), y: new Rational(-y) });
    }
  }
  const torsion: NagellLutzResult['torsion'] = [];
  for (const P of candidates) {
    const order = E.order(P, 12);
    if (order !== null) torsion.push({ P, order });
  }
  return { disc: D, candidates, torsion };
}

/** Number of rational torsion points, including O. */
export function torsionOrder(E: CurveQ): number {
  return nagellLutz(E).torsion.length + 1;
}
