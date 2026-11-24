import { mod, modInverse, legendre } from './modint';

/** A point over F_p, or null for the point at infinity O. */
export type PointFp = { x: bigint; y: bigint } | null;

/** y² = x³ + a2·x² + a4·x + a6 over F_p, p an odd prime. */
export class CurveFp {
  readonly p: bigint;
  readonly a2: bigint;
  readonly a4: bigint;
  readonly a6: bigint;

  constructor(a2: bigint | number, a4: bigint | number, a6: bigint | number, p: bigint | number) {
    this.p = BigInt(p);
    if (this.p < 3n) throw new RangeError('CurveFp needs an odd prime');
    this.a2 = mod(BigInt(a2), this.p);
    this.a4 = mod(BigInt(a4), this.p);
    this.a6 = mod(BigInt(a6), this.p);
  }

  disc(): bigint {
    const { a2: a, a4: b, a6: c, p } = this;
    return mod(-4n * a * a * a * c + a * a * b * b + 18n * a * b * c - 4n * b * b * b - 27n * c * c, p);
  }

  isSingular(): boolean {
    return this.disc() === 0n;
  }

  f(x: bigint): bigint {
    return mod(((x + this.a2) * x + this.a4) * x + this.a6, this.p);
  }

  has(P: PointFp): boolean {
    return P === null || mod(P.y * P.y, this.p) === this.f(P.x);
  }

  neg(P: PointFp): PointFp {
    return P === null ? null : { x: P.x, y: mod(-P.y, this.p) };
  }

  add(P: PointFp, Q: PointFp): PointFp {
    if (P === null) return Q;
    if (Q === null) return P;
    const p = this.p;
    let lam: bigint;
    if (P.x !== Q.x) {
      lam = mod((Q.y - P.y) * modInverse(Q.x - P.x, p)!, p);
    } else {
      if (mod(P.y + Q.y, p) === 0n) return null;
      lam = mod((3n * P.x * P.x + 2n * this.a2 * P.x + this.a4) * modInverse(2n * P.y, p)!, p);
    }
    const x3 = mod(lam * lam - this.a2 - P.x - Q.x, p);
    const y3 = mod(lam * (P.x - x3) - P.y, p);
    return { x: x3, y: y3 };
  }

  mul(n: bigint | number, P: PointFp): PointFp {
    let k = BigInt(n);
    let base = k < 0n ? this.neg(P) : P;
    if (k < 0n) k = -k;
    let acc: PointFp = null;
    while (k > 0n) {
      if (k & 1n) acc = this.add(acc, base);
      base = this.add(base, base);
      k >>= 1n;
    }
    return acc;
  }

  /** All affine points (for small p: used by the grid widgets). */
  points(): Exclude<PointFp, null>[] {
    const out: Exclude<PointFp, null>[] = [];
    const p = this.p;
    const roots = new Map<bigint, bigint[]>();
    for (let y = 0n; y < p; y++) {
      const s = (y * y) % p;
      (roots.get(s) ?? roots.set(s, []).get(s)!).push(y);
    }
    for (let x = 0n; x < p; x++) for (const y of roots.get(this.f(x)) ?? []) out.push({ x, y });
    return out;
  }

  /** #E(F_p) including O, via the Legendre symbol: Σ (1 + (f(x)/p)) + 1. */
  count(): number {
    let n = 1;
    for (let x = 0n; x < this.p; x++) n += 1 + legendre(this.f(x), this.p);
    return n;
  }
}
