/** Drawing helpers shared by curve widgets. Floats only: nothing here is ever displayed as a number. */

export interface View {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
}

export interface Frame {
  w: number;
  h: number;
  sx: (x: number) => number;
  sy: (y: number) => number;
  ix: (px: number) => number;
  iy: (py: number) => number;
}

export function frame(view: View, w: number, h: number): Frame {
  const kx = w / (view.xmax - view.xmin);
  const ky = h / (view.ymax - view.ymin);
  return {
    w,
    h,
    sx: (x) => (x - view.xmin) * kx,
    sy: (y) => h - (y - view.ymin) * ky,
    ix: (px) => view.xmin + px / kx,
    iy: (py) => view.ymin + (h - py) / ky,
  };
}

export function zoomView(v: View, factor: number): View {
  const cx = (v.xmin + v.xmax) / 2;
  const cy = (v.ymin + v.ymax) / 2;
  const hw = ((v.xmax - v.xmin) / 2) * factor;
  const hh = ((v.ymax - v.ymin) / 2) * factor;
  return { xmin: cx - hw, xmax: cx + hw, ymin: cy - hh, ymax: cy + hh };
}

/** "Nice" tick positions (1, 2, 5 × 10^k) with at most `max` ticks. */
export function ticks(lo: number, hi: number, max = 10): number[] {
  const span = hi - lo;
  let step = 10 ** Math.floor(Math.log10(span / max));
  for (const m of [1, 2, 5, 10]) {
    if (span / (step * m) <= max) {
      step *= m;
      break;
    }
  }
  const out: number[] = [];
  for (let t = Math.ceil(lo / step) * step; t <= hi + 1e-9; t += step) out.push(Math.round(t / step) * step);
  return out;
}

export interface Sample {
  x: number;
  y: number;
}

/**
 * Sample the real points of y² = f(x) inside [xmin, xmax].
 * Returns one polyline per connected piece (an "egg" is closed; an unbounded branch is open),
 * with samples packed densely near the places where the curve crosses the x-axis.
 */
export function sampleCubic(f: (x: number) => number, xmin: number, xmax: number, n = 220): { pts: Sample[]; closed: boolean }[] {
  const N = 1200;
  const xs: number[] = [];
  for (let i = 0; i <= N; i++) xs.push(xmin + ((xmax - xmin) * i) / N);
  const root = (a: number, b: number) => {
    // f changes sign on [a, b]; bisect
    let fa = f(a);
    for (let i = 0; i < 60; i++) {
      const m = (a + b) / 2;
      const fm = f(m);
      if (fa <= 0 === fm <= 0) {
        a = m;
        fa = fm;
      } else b = m;
    }
    return (a + b) / 2;
  };
  // intervals where f ≥ 0
  const runs: { a: number; b: number; rootA: boolean; rootB: boolean }[] = [];
  let start: number | null = null;
  let startIsRoot = false;
  for (let i = 0; i <= N; i++) {
    const pos = f(xs[i]) >= 0;
    if (pos && start === null) {
      if (i === 0) {
        start = xs[0];
        startIsRoot = false;
      } else {
        start = root(xs[i - 1], xs[i]);
        startIsRoot = true;
      }
    } else if (!pos && start !== null) {
      runs.push({ a: start, b: root(xs[i - 1], xs[i]), rootA: startIsRoot, rootB: true });
      start = null;
    }
  }
  if (start !== null) runs.push({ a: start, b: xmax, rootA: startIsRoot, rootB: false });

  return runs.flatMap(({ a, b, rootA, rootB }) => {
    const upper: Sample[] = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      // ease so samples cluster at ends that are roots (where the tangent is vertical)
      const u = rootA && rootB ? (1 - Math.cos(Math.PI * t)) / 2 : rootA ? t * t : rootB ? 1 - (1 - t) * (1 - t) : t;
      const x = a + (b - a) * u;
      upper.push({ x, y: Math.sqrt(Math.max(0, f(x))) });
    }
    const lowerBack = upper.map((p) => ({ x: p.x, y: -p.y })).reverse(); // runs from b back to a
    if (rootA) return [{ pts: [...lowerBack, ...upper.slice(1)], closed: rootB }];
    if (rootB) return [{ pts: [...upper, ...lowerBack.slice(1)], closed: false }];
    // no root in view: the upper and lower halves are separate pieces
    return [{ pts: upper, closed: false }, { pts: lowerBack, closed: false }];
  });
}

export function pathOf(pts: Sample[], fr: Frame, closed: boolean): string {
  let d = '';
  pts.forEach((p, i) => {
    d += `${i === 0 ? 'M' : 'L'}${fr.sx(p.x).toFixed(1)} ${fr.sy(p.y).toFixed(1)}`;
  });
  return closed ? d + 'Z' : d;
}
