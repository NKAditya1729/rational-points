/**
 * The chord-and-tangent construction for points that may be exact (rational) or free
 * (floating point, for drawing only). `null` always means the point at infinity.
 */
import { CurveQ, type PointQ } from '../../lib/math/curveQ';

export type Exact = Exclude<PointQ, null>;

/** A finite point on the picture. `exact` is set when it sits on a known rational point. */
export interface Pin {
  x: number;
  y: number;
  exact: Exact | null;
}
export type Loc = Pin | null;

export const pinOf = (R: Exact): Pin => ({ x: R.x.toNumber(), y: R.y.toNumber(), exact: R });
const mirror = (A: Pin): Pin => (A.exact ? pinOf({ x: A.exact.x, y: A.exact.y.neg() }) : { x: A.x, y: -A.y, exact: null });
const isExact = (A: Loc) => A === null || A.exact !== null;

const EPS = 1e-9;
export function samePlace(A: Loc, B: Loc): boolean {
  if (A === null || B === null) return A === B;
  if (A.exact && B.exact) return A.exact.x.eq(B.exact.x) && A.exact.y.eq(B.exact.y);
  return Math.abs(A.x - B.x) < EPS && Math.abs(A.y - B.y) < EPS;
}

export type Line =
  | { kind: 'sloped'; lam: number; through: Pin; tangent: boolean }
  | { kind: 'vertical'; x: number; tangent: boolean }
  | { kind: 'infinity' };

/** The line through A and B on y² = x³ + a·x + b (the tangent when they coincide). */
export function lineThrough(a: number, A: Loc, B: Loc): Line {
  if (A === null && B === null) return { kind: 'infinity' };
  if (A === null) return { kind: 'vertical', x: B!.x, tangent: false };
  if (B === null) return { kind: 'vertical', x: A.x, tangent: false };
  const tangent = samePlace(A, B);
  if (tangent) {
    if (Math.abs(A.y) < EPS) return { kind: 'vertical', x: A.x, tangent: true };
    return { kind: 'sloped', lam: (3 * A.x * A.x + a) / (2 * A.y), through: A, tangent: true };
  }
  if (Math.abs(A.x - B.x) < EPS) return { kind: 'vertical', x: A.x, tangent: false };
  return { kind: 'sloped', lam: (B.y - A.y) / (B.x - A.x), through: A, tangent: false };
}

/** A∗B: the third point where the line through A and B meets the curve. */
export function star(E: CurveQ, a: number, A: Loc, B: Loc): Loc {
  if (isExact(A) && isExact(B)) {
    const T = E.third(A ? A.exact : null, B ? B.exact : null);
    return T ? pinOf(T) : null;
  }
  if (A === null) return mirror(B!);
  if (B === null) return mirror(A);
  const line = lineThrough(a, A, B);
  if (line.kind !== 'sloped') return null;
  const x3 = line.lam * line.lam - A.x - B.x;
  return { x: x3, y: A.y + line.lam * (x3 - A.x), exact: null };
}

/** P + Q with identity O:  O ∗ (P ∗ Q). With O = null this is the usual "reflect" rule. */
export function addWithIdentity(E: CurveQ, a: number, O: Loc, P: Loc, Q: Loc): { third: Loc; sum: Loc } {
  const third = star(E, a, P, Q);
  return { third, sum: star(E, a, O, third) };
}
