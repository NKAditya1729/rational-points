import { CurveFp } from './curveFp';

/** Hasse: |#E(F_p) − (p+1)| ≤ 2√p, tested exactly as (N − p − 1)² ≤ 4p. */
export function withinHasse(count: number, p: number): boolean {
  const t = count - p - 1;
  return t * t <= 4 * p;
}

/** a_p = p + 1 − #E(F_p) for y² = x³ + a2x² + a4x + a6, p odd of good reduction. */
export function traceOfFrobenius(a2: number, a4: number, a6: number, p: number): number {
  return p + 1 - new CurveFp(a2, a4, a6, p).count();
}

/**
 * #E(F_p) including O for a general Weierstrass equation
 * y² + a1·xy + a3·y = x³ + a2·x² + a4·x + a6, by brute force (small p, any p including 2).
 */
export function countGeneralWeierstrass(
  [a1, a2, a3, a4, a6]: [number, number, number, number, number],
  p: number,
): number {
  const m = (v: number) => ((v % p) + p) % p;
  let n = 1;
  for (let x = 0; x < p; x++) {
    const rhs = m(m(m((x + a2) * x) + a4) * x + a6);
    for (let y = 0; y < p; y++) {
      if (m(m(y * y) + m(m(a1 * x) * y) + a3 * y) === rhs) n++;
    }
  }
  return n;
}

/** Affine solutions of x³ + y³ = 1 over F_p (the curve of Gauss's theorem, §4.2). */
export function countFermatCubicAffine(p: number): number {
  const cube = (v: number) => (((v * v) % p) * v) % p;
  const freq = new Array<number>(p).fill(0);
  for (let y = 0; y < p; y++) freq[cube(y)]++;
  let n = 0;
  for (let x = 0; x < p; x++) n += freq[(((1 - cube(x)) % p) + p) % p];
  return n;
}
