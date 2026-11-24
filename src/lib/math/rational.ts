/** Exact rational numbers on BigInt. Always stored in lowest terms with d > 0. */
export function gcd(a: bigint, b: bigint): bigint {
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

export function isqrt(n: bigint): bigint {
  if (n < 0n) throw new RangeError('isqrt of a negative number');
  if (n < 2n) return n;
  let x = BigInt(Math.floor(Math.sqrt(Number(n))));
  // Newton correction; the float seed can be off for large n.
  for (;;) {
    const y = (x + n / x) >> 1n;
    if (y === x || y === x + 1n || y === x - 1n) {
      x = y;
      break;
    }
    x = y;
  }
  while (x * x > n) x -= 1n;
  while ((x + 1n) * (x + 1n) <= n) x += 1n;
  return x;
}

export function isSquare(n: bigint): boolean {
  if (n < 0n) return false;
  const r = isqrt(n);
  return r * r === n;
}

export type RationalLike = Rational | bigint | number | string;

export class Rational {
  readonly n: bigint;
  readonly d: bigint;

  constructor(n: bigint, d: bigint = 1n) {
    if (d === 0n) throw new RangeError('Rational with zero denominator');
    if (d < 0n) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    this.n = g === 0n ? 0n : n / g;
    this.d = g === 0n ? 1n : d / g;
  }

  static of(v: RationalLike, d?: bigint | number): Rational {
    if (d !== undefined) return new Rational(BigInt(v as bigint | number), BigInt(d));
    if (v instanceof Rational) return v;
    if (typeof v === 'bigint') return new Rational(v);
    if (typeof v === 'number') {
      if (!Number.isInteger(v)) throw new RangeError(`Rational.of needs an integer, got ${v}`);
      return new Rational(BigInt(v));
    }
    return Rational.parse(v);
  }

  /** Accepts "3", "-7/4", " 129 / 100 ". Returns null-free: throws on bad input. */
  static parse(s: string): Rational {
    const m = /^\s*([+-]?\d+)\s*(?:\/\s*([+-]?\d+)\s*)?$/.exec(s);
    if (!m) throw new SyntaxError(`Not a rational number: "${s}"`);
    return new Rational(BigInt(m[1]), m[2] ? BigInt(m[2]) : 1n);
  }

  static readonly ZERO = new Rational(0n);
  static readonly ONE = new Rational(1n);

  add(o: RationalLike): Rational {
    const b = Rational.of(o);
    return new Rational(this.n * b.d + b.n * this.d, this.d * b.d);
  }
  sub(o: RationalLike): Rational {
    const b = Rational.of(o);
    return new Rational(this.n * b.d - b.n * this.d, this.d * b.d);
  }
  mul(o: RationalLike): Rational {
    const b = Rational.of(o);
    return new Rational(this.n * b.n, this.d * b.d);
  }
  div(o: RationalLike): Rational {
    const b = Rational.of(o);
    if (b.n === 0n) throw new RangeError('Division by zero');
    return new Rational(this.n * b.d, this.d * b.n);
  }
  neg(): Rational {
    return new Rational(-this.n, this.d);
  }
  eq(o: RationalLike): boolean {
    const b = Rational.of(o);
    return this.n === b.n && this.d === b.d;
  }
  isZero(): boolean {
    return this.n === 0n;
  }
  isInteger(): boolean {
    return this.d === 1n;
  }
  sign(): -1 | 0 | 1 {
    return this.n === 0n ? 0 : this.n > 0n ? 1 : -1;
  }
  toString(): string {
    return this.d === 1n ? `${this.n}` : `${this.n}/${this.d}`;
  }
  /** Float approximation, for drawing only. Safe for huge numerators. */
  toNumber(): number {
    const neg = this.n < 0n;
    const a = neg ? -this.n : this.n;
    const scale = 10n ** 17n;
    const q = (a * scale) / this.d;
    const v = Number(q) / 1e17;
    return neg ? -v : v;
  }
}
