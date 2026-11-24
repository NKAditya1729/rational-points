/**
 * Coefficients c[1..N] of the weight-2 newform of level 11,
 *     f(q) = q · ∏_{n≥1} (1 − qⁿ)² (1 − q¹¹ⁿ)²  =  Σ c[n] qⁿ.
 * Modularity for the curve 11a says c[p] = a_p(E) for every prime p ≠ 11.
 * Returned array is indexed by n, with c[0] = 0.
 */
export function eta11Coefficients(N: number): number[] {
  // series[k] = coefficient of q^k in the product (before the leading factor q)
  const series = new Array<number>(N).fill(0);
  series[0] = 1;
  const mulOneMinus = (step: number) => {
    // multiply by (1 − q^step): in place, high to low
    for (let k = N - 1; k >= step; k--) series[k] -= series[k - step];
  };
  for (let n = 1; n < N; n++) {
    mulOneMinus(n);
    mulOneMinus(n);
    if (11 * n < N) {
      mulOneMinus(11 * n);
      mulOneMinus(11 * n);
    }
  }
  return [0, ...series];
}

/** The curve 11a (LMFDB 11.a3 / Cremona 11a3): y² + y = x³ − x². */
export const CURVE_11A: [number, number, number, number, number] = [0, -1, 1, 0, 0];
