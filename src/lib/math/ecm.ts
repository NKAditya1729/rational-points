import { gcd } from './rational';
import { mod, modInverse, modPow } from './modint';

/** Pollard's p−1: returns a nontrivial factor of n, or null. Computes a^(B!) step by step. */
export function pollardPm1(n: bigint, B = 1000, base = 2n): bigint | null {
  let a = base;
  for (let k = 2; k <= B; k++) {
    a = modPow(a, BigInt(k), n);
    const g = gcd(a - 1n, n);
    if (g > 1n && g < n) return g;
    if (g === n) return null;
  }
  return null;
}

type Pt = { x: bigint; y: bigint } | null;

/** Thrown inside the group law when a denominator is not invertible mod n. */
class NotInvertible {
  constructor(readonly g: bigint) {}
}

function addModN(P: Pt, Q: Pt, a: bigint, n: bigint): Pt {
  if (P === null) return Q;
  if (Q === null) return P;
  let num: bigint;
  let den: bigint;
  if (P.x !== Q.x) {
    num = Q.y - P.y;
    den = Q.x - P.x;
  } else {
    if (mod(P.y + Q.y, n) === 0n) return null;
    num = 3n * P.x * P.x + a;
    den = 2n * P.y;
  }
  const inv = modInverse(den, n);
  if (inv === null) throw new NotInvertible(gcd(mod(den, n), n));
  const lam = mod(num * inv, n);
  const x3 = mod(lam * lam - P.x - Q.x, n);
  return { x: x3, y: mod(lam * (P.x - x3) - P.y, n) };
}

function mulModN(k: bigint, P: Pt, a: bigint, n: bigint): Pt {
  let acc: Pt = null;
  let base = P;
  while (k > 0n) {
    if (k & 1n) acc = addModN(acc, base, a, n);
    base = addModN(base, base, a, n);
    k >>= 1n;
  }
  return acc;
}

export interface EcmResult {
  factor: bigint;
  /** Which curve y² = x³ + a·x + b (mod n) and starting point succeeded. */
  a: bigint;
  b: bigint;
  start: { x: bigint; y: bigint };
  /** The multiplier k at which computing (k!)·P first hit a non-invertible denominator. */
  failedAt: number;
  curvesTried: number;
}

/**
 * Lenstra's elliptic curve method. For each curve, compute 2!·P, 3!·P, … up to B!·P
 * "pretending n is prime". If a slope's denominator is not invertible mod n, its gcd with
 * n is a factor: the failure is the success.
 */
export function ecm(n: bigint, opts: { curves?: number; B?: number } = {}): EcmResult | null {
  const { curves = 200, B = 400 } = opts;
  if (n % 2n === 0n) return { factor: 2n, a: 0n, b: 0n, start: { x: 0n, y: 0n }, failedAt: 0, curvesTried: 0 };
  for (let c = 1; c <= curves; c++) {
    const a = BigInt(c);
    const start = { x: 1n, y: BigInt(c + 1) };
    const b = mod(start.y * start.y - start.x ** 3n - a * start.x, n);
    const g0 = gcd(mod(4n * a ** 3n + 27n * b * b, n), n);
    if (g0 > 1n && g0 < n) return { factor: g0, a, b, start, failedAt: 0, curvesTried: c };
    if (g0 === n) continue;
    let P: Pt = start;
    try {
      for (let k = 2; k <= B && P !== null; k++) P = mulModN(BigInt(k), P, a, n);
    } catch (err) {
      if (!(err instanceof NotInvertible)) throw err;
      if (err.g > 1n && err.g < n) {
        // Recover the step index by replaying (cheap, and keeps the hot loop simple).
        let Q: Pt = start;
        let failedAt = 0;
        try {
          for (let k = 2; k <= B && Q !== null; k++) {
            failedAt = k;
            Q = mulModN(BigInt(k), Q, a, n);
          }
        } catch {
          /* failedAt now holds the step */
        }
        return { factor: err.g, a, b, start, failedAt, curvesTried: c };
      }
    }
  }
  return null;
}
