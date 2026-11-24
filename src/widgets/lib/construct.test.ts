import { describe, expect, it } from 'vitest';
import { CurveQ, pt } from '../../lib/math/curveQ';
import { addWithIdentity, lineThrough, pinOf, star, type Loc, type Pin } from './construct';

const E = CurveQ.short(-7, 10);
const ex = (x: number | string, y: number | string): Pin => pinOf(pt(x, y)!);
const free = (x: number, sign: 1 | -1): Pin => ({ x, y: sign * Math.sqrt(x ** 3 - 7 * x + 10), exact: null });
const str = (A: Loc) => (A === null ? 'INF' : A.exact ? `(${A.exact.x}, ${A.exact.y})` : `~(${A.x.toFixed(6)}, ${A.y.toFixed(6)})`);

describe('construction with O at infinity', () => {
  it('matches the engine for exact points', () => {
    const r = addWithIdentity(E, -7, null, ex(1, 2), ex(3, 4));
    expect(str(r.third)).toBe('(-3, -2)');
    expect(str(r.sum)).toBe('(-3, 2)');
  });
  it('tangent, vertical chord and vertical tangent', () => {
    expect(str(addWithIdentity(E, -7, null, ex(1, 2), ex(1, 2)).sum)).toBe('(-1, -4)');
    expect(addWithIdentity(E, -7, null, ex(1, 2), ex(1, -2)).sum).toBeNull();
    const F = CurveQ.short(-1, 0);
    expect(addWithIdentity(F, -1, null, ex(0, 0), ex(0, 0)).sum).toBeNull();
    expect(lineThrough(-1, ex(0, 0), ex(0, 0))).toEqual({ kind: 'vertical', x: 0, tangent: true });
  });
  it('free points agree with exact ones to floating-point accuracy', () => {
    const P: Pin = { x: 1, y: 2, exact: null };
    const Q: Pin = { x: 3, y: 4, exact: null };
    const r = addWithIdentity(E, -7, null, P, Q);
    expect(r.sum!.x).toBeCloseTo(-3, 9);
    expect(r.sum!.y).toBeCloseTo(2, 9);
    // the free result really lies on the curve
    const S = addWithIdentity(E, -7, null, free(2.5, 1), free(0.3, -1)).sum!;
    expect(S.y * S.y).toBeCloseTo(S.x ** 3 - 7 * S.x + 10, 6);
  });
});

describe('construction with a chosen O', () => {
  const O = ex(2, 2);
  it('worked value: (1,2) + (3,4) with O = (2,2) is (41/25, 214/125)', () => {
    const r = addWithIdentity(E, -7, O, ex(1, 2), ex(3, 4));
    expect(str(r.third)).toBe('(-3, -2)');
    expect(str(r.sum)).toBe('(41/25, 214/125)');
    expect(E.has(r.sum!.exact)).toBe(true);
  });
  it('O is the identity, and addition is commutative', () => {
    for (const P of [ex(1, 2), ex(3, 4), ex(-3, 2), ex(-1, -4)]) {
      expect(str(addWithIdentity(E, -7, O, P, O).sum)).toBe(str(P));
      expect(str(addWithIdentity(E, -7, O, O, P).sum)).toBe(str(P));
    }
    expect(str(addWithIdentity(E, -7, O, O, O).sum)).toBe(str(O));
    const a = addWithIdentity(E, -7, O, ex(1, 2), ex(-1, 4)).sum;
    const b = addWithIdentity(E, -7, O, ex(-1, 4), ex(1, 2)).sum;
    expect(str(a)).toBe(str(b));
  });
  it('is associative on sample points (the fact Lesson 11 proves)', () => {
    const add = (A: Loc, B: Loc) => addWithIdentity(E, -7, O, A, B).sum;
    const [P, Q, R] = [ex(1, 2), ex(3, 4), ex(-1, 4)];
    expect(str(add(add(P, Q), R))).toBe(str(add(P, add(Q, R))));
  });
  it('handles the point at infinity as an ordinary point', () => {
    // P∗Q at infinity: the line through O and infinity is the vertical through O
    const r = addWithIdentity(E, -7, O, ex(1, 2), ex(1, -2));
    expect(r.third).toBeNull();
    expect(str(r.sum)).toBe('(2, -2)');
    // the sum itself can be the point at infinity: need P∗Q = mirror of O
    const T = ex(2, -2);
    const Q = star(E, -7, ex(1, 2), T); // then (1,2) ∗ Q = T
    expect(addWithIdentity(E, -7, O, ex(1, 2), Q).sum).toBeNull();
    expect(lineThrough(-7, null, null)).toEqual({ kind: 'infinity' });
  });
  it('identity holds for free points too', () => {
    const Of = free(2.2, 1);
    const P = free(-2.4, -1);
    const S = addWithIdentity(E, -7, Of, P, Of).sum!;
    expect(S.x).toBeCloseTo(P.x, 6);
    expect(S.y).toBeCloseTo(P.y, 6);
  });
});
