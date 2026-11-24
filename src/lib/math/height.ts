import type { PointQ } from './curveQ';

function abs(n: bigint): bigint {
  return n < 0n ? -n : n;
}

/** Natural log of a positive BigInt of any size. */
export function lnBig(n: bigint): number {
  const s = n.toString();
  if (s.length <= 15) return Math.log(Number(n));
  return Math.log(Number(s.slice(0, 15))) + (s.length - 15) * Math.LN10;
}

/** H(P) = max(|m|, |n|) where x(P) = m/n in lowest terms; H(O) = 1. */
export function bigHeight(P: PointQ): bigint {
  if (P === null) return 1n;
  const m = abs(P.x.n);
  return m > P.x.d ? m : P.x.d;
}

/** h(P) = log H(P). */
export function height(P: PointQ): number {
  return lnBig(bigHeight(P));
}
