import { Rational, type RationalLike, isSquare, isqrt } from './rational';

/** A point with rational coordinates, or null for the point at infinity O. */
export type PointQ = { x: Rational; y: Rational } | null;

export const O: PointQ = null;

export function pt(x: RationalLike, y: RationalLike): PointQ {
  return { x: Rational.of(x), y: Rational.of(y) };
}

export function pointEq(P: PointQ, Q: PointQ): boolean {
  if (P === null || Q === null) return P === Q;
  return P.x.eq(Q.x) && P.y.eq(Q.y);
}

export function pointToString(P: PointQ): string {
  return P === null ? 'O' : `(${P.x}, ${P.y})`;
}

export class SingularCurveError extends Error {
  constructor() {
    super('The curve is singular (discriminant 0): chord-and-tangent is not a group law on all of it.');
    this.name = 'SingularCurveError';
  }
}

/** y² = x³ + a2·x² + a4·x + a6 over Q. */
export class CurveQ {
  readonly a2: Rational;
  readonly a4: Rational;
  readonly a6: Rational;

  constructor(a2: RationalLike, a4: RationalLike, a6: RationalLike) {
    this.a2 = Rational.of(a2);
    this.a4 = Rational.of(a4);
    this.a6 = Rational.of(a6);
  }

  /** Short form y² = x³ + a·x + b. */
  static short(a: RationalLike, b: RationalLike): CurveQ {
    return new CurveQ(0n, a, b);
  }

  /** Discriminant of the cubic x³+ax²+bx+c: −4a³c + a²b² + 18abc − 4b³ − 27c². */
  disc(): Rational {
    const { a2: a, a4: b, a6: c } = this;
    return a.mul(a).mul(a).mul(c).mul(-4n)
      .add(a.mul(a).mul(b).mul(b))
      .add(a.mul(b).mul(c).mul(18n))
      .sub(b.mul(b).mul(b).mul(4n))
      .sub(c.mul(c).mul(27n));
  }

  isSingular(): boolean {
    return this.disc().isZero();
  }

  /** x³ + a2·x² + a4·x + a6. */
  f(x: Rational): Rational {
    return x.add(this.a2).mul(x).add(this.a4).mul(x).add(this.a6);
  }

  has(P: PointQ): boolean {
    return P === null || P.y.mul(P.y).eq(this.f(P.x));
  }

  neg(P: PointQ): PointQ {
    return P === null ? null : { x: P.x, y: P.y.neg() };
  }

  private check(...pts: PointQ[]): void {
    if (this.isSingular()) throw new SingularCurveError();
    for (const P of pts) if (!this.has(P)) throw new RangeError(`${pointToString(P)} is not on the curve`);
  }

  /** Slope of the chord through P and Q, or of the tangent when P = Q. null means a vertical line. */
  slope(P: Exclude<PointQ, null>, Q: Exclude<PointQ, null>): Rational | null {
    if (!P.x.eq(Q.x)) return Q.y.sub(P.y).div(Q.x.sub(P.x));
    if (!P.y.eq(Q.y) || P.y.isZero()) return null;
    const num = P.x.mul(P.x).mul(3n).add(this.a2.mul(P.x).mul(2n)).add(this.a4);
    return num.div(P.y.mul(2n));
  }

  /** The third intersection P∗Q of the line through P and Q with the curve. */
  third(P: PointQ, Q: PointQ): PointQ {
    return this.neg(this.add(P, Q));
  }

  add(P: PointQ, Q: PointQ): PointQ {
    this.check(P, Q);
    if (P === null) return Q;
    if (Q === null) return P;
    const lam = this.slope(P, Q);
    if (lam === null) return null;
    const x3 = lam.mul(lam).sub(this.a2).sub(P.x).sub(Q.x);
    const y3 = lam.mul(P.x.sub(x3)).sub(P.y);
    return { x: x3, y: y3 };
  }

  double(P: PointQ): PointQ {
    return this.add(P, P);
  }

  mul(n: number | bigint, P: PointQ): PointQ {
    let k = BigInt(n);
    let base = P;
    if (k < 0n) {
      k = -k;
      base = this.neg(P);
    }
    this.check(base);
    let acc: PointQ = null;
    while (k > 0n) {
      if (k & 1n) acc = this.add(acc, base);
      base = this.add(base, base);
      k >>= 1n;
    }
    return acc;
  }

  /**
   * Order of P if it is at most `max`, else null. By Mazur's theorem a rational
   * torsion point has order ≤ 12, so null with max = 12 means infinite order.
   */
  order(P: PointQ, max = 12): number | null {
    let acc: PointQ = null;
    for (let k = 1; k <= max; k++) {
      acc = this.add(acc, P);
      if (acc === null) return k;
    }
    return null;
  }

  /** Integer points with xmin ≤ x ≤ xmax (integer coefficients assumed). */
  integerPoints(xmin: bigint, xmax: bigint): Exclude<PointQ, null>[] {
    const out: Exclude<PointQ, null>[] = [];
    for (let x = xmin; x <= xmax; x++) {
      const v = this.f(new Rational(x));
      if (!v.isInteger() || !isSquare(v.n)) continue;
      const y = isqrt(v.n);
      out.push({ x: new Rational(x), y: new Rational(y) });
      if (y !== 0n) out.push({ x: new Rational(x), y: new Rational(-y) });
    }
    return out;
  }
}
