import { gcd } from './rational';

export function mod(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r < 0n ? r + m : r;
}

export function modPow(base: bigint, exp: bigint, m: bigint): bigint {
  let result = 1n % m;
  let b = mod(base, m);
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return result;
}

/** Inverse of a mod m, or null when gcd(a, m) ≠ 1 (the case ECM is hunting for). */
export function modInverse(a: bigint, m: bigint): bigint | null {
  let [r0, r1] = [mod(a, m), m];
  let [s0, s1] = [1n, 0n];
  while (r1 !== 0n) {
    const q = r0 / r1;
    [r0, r1] = [r1, r0 - q * r1];
    [s0, s1] = [s1, s0 - q * s1];
  }
  return r0 === 1n ? mod(s0, m) : null;
}

export function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

export function primesBelow(n: number): number[] {
  const out: number[] = [];
  for (let i = 2; i < n; i++) if (isPrime(i)) out.push(i);
  return out;
}

/** Legendre symbol (a/p) for an odd prime p: 1, -1 or 0. */
export function legendre(a: bigint, p: bigint): -1 | 0 | 1 {
  const r = modPow(a, (p - 1n) / 2n, p);
  return r === 0n ? 0 : r === 1n ? 1 : -1;
}

export { gcd };
