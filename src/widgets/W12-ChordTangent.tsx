import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CurveQ, type PointQ } from '../lib/math/curveQ';
import { Rational } from '../lib/math/rational';
import { frame, pathOf, sampleCubic, ticks, zoomView, type Sample, type View } from './lib/plot';
import { addWithIdentity, lineThrough, pinOf, samePlace, type Exact, type Line, type Loc, type Pin } from './lib/construct';
import './widgets.css';

type Who = 'P' | 'Q' | 'O';

interface Preset {
  key: string;
  label: string;
  a: number;
  b: number;
  view: View;
  P: [number, number];
  Q: [number, number];
  /** Starting position of the identity in "choose your own O" mode. */
  O: [number, number];
  note: string;
}

const PRESETS: Preset[] = [
  { key: 'A', label: 'y² = x³ − 7x + 10', a: -7, b: 10, view: { xmin: -5, xmax: 6, ymin: -8, ymax: 8 }, P: [1, 2], Q: [3, 4], O: [2, 2], note: 'Two pieces: an oval and an open branch. Start here.' },
  { key: 'B', label: 'y² = x³ − 2', a: 0, b: -2, view: { xmin: -1.5, xmax: 6.5, ymin: -9, ymax: 9 }, P: [3, 5], Q: [3, 5], O: [3, -5], note: 'One rational point is visible, (3, 5). Doubling it is the only move.' },
  { key: 'C', label: 'y² = x³ + 17', a: 0, b: 17, view: { xmin: -4, xmax: 10, ymin: -26, ymax: 26 }, P: [-2, 3], Q: [-1, 4], O: [2, 5], note: 'Many integer points. Adding two of them usually leaves the integers.' },
  { key: 'D', label: 'y² = x³ − x', a: -1, b: 0, view: { xmin: -2.4, xmax: 3.2, ymin: -3.6, ymax: 3.6 }, P: [-1, 0], Q: [1, 0], O: [0, 0], note: 'Its only rational points are three points on the x-axis (and O at infinity).' },
];
const CUSTOM_VIEW: View = { xmin: -6, xmax: 7, ymin: -12, ymax: 12 };

const W = 600;
const H = 500;
const DURATION = 950;

function digits(n: bigint): number {
  return (n < 0n ? -n : n).toString().length;
}
function clip(n: bigint): string {
  const s = n.toString().replace('-', '−'); // a real minus sign, not a hyphen
  return s.length <= 14 ? s : `${s.slice(0, 6)}…${s.slice(-4)}`;
}
function Frac({ r }: { r: Rational }) {
  if (r.d === 1n) return <span class="num">{clip(r.n)}</span>;
  return (
    <span class="frac">
      <span class="num">{clip(r.n)}</span>
      <span class="bar" aria-hidden="true" />
      <span class="visually-hidden"> over </span>
      <span class="num">{clip(r.d)}</span>
    </span>
  );
}
function Coord({ pin, atInfinity }: { pin: Loc; atInfinity: string }) {
  if (pin === null) return <span class="coord">{atInfinity}</span>;
  if (pin.exact) {
    return (
      <span class="coord">
        (<Frac r={pin.exact.x} />, <Frac r={pin.exact.y} />)
      </span>
    );
  }
  return <span class="coord approx">≈ ({pin.x.toFixed(3)}, {pin.y.toFixed(3)})</span>;
}

/** Small rational points to snap to: integer points, then a few rounds of adding them together. */
function rationalPool(E: CurveQ, view: View): Exact[] {
  if (E.isSingular()) return [];
  const seen = new Map<string, Exact>();
  const inView = (P: Exact) => {
    const x = P.x.toNumber();
    const y = P.y.toNumber();
    return x >= view.xmin && x <= view.xmax && y >= view.ymin && y <= view.ymax;
  };
  const small = (P: Exact) => digits(P.x.n) <= 2 && digits(P.x.d) <= 2 && digits(P.y.d) <= 3;
  const push = (P: PointQ) => {
    if (P && small(P) && inView(P)) seen.set(`${P.x},${P.y}`, P);
  };
  E.integerPoints(BigInt(Math.ceil(view.xmin)), BigInt(Math.floor(view.xmax))).forEach(push);
  for (let round = 0; round < 2 && seen.size < 40; round++) {
    const cur = [...seen.values()];
    for (const P of cur) for (const Q of cur) {
      if (seen.size >= 40) break;
      push(E.add(P, Q));
    }
  }
  // keep the simplest points first and drop any that would sit on top of one already kept
  const span = Math.max(view.xmax - view.xmin, view.ymax - view.ymin);
  const kept: Exact[] = [];
  for (const P of [...seen.values()].sort((p, q) => digits(p.x.d) - digits(q.x.d) || Number(p.x.d - q.x.d))) {
    const px = P.x.toNumber();
    const py = P.y.toNumber();
    if (kept.every((K) => Math.hypot(K.x.toNumber() - px, K.y.toNumber() - py) > span / 28)) kept.push(P);
    if (kept.length >= 18) break;
  }
  return kept;
}

/** Grow `base` just enough to contain the points, by at most `limit`× in each direction. */
function fitTo(base: View, pts: Pin[], limit = 3): { view: View; clamped: boolean } {
  const cx = (base.xmin + base.xmax) / 2;
  const cy = (base.ymin + base.ymax) / 2;
  const hw = (base.xmax - base.xmin) / 2;
  const hh = (base.ymax - base.ymin) / 2;
  let needX = 1;
  let needY = 1;
  for (const p of pts) {
    needX = Math.max(needX, (Math.abs(p.x - cx) / hw) * 1.1);
    needY = Math.max(needY, (Math.abs(p.y - cy) / hh) * 1.1);
  }
  const clamped = needX > limit || needY > limit;
  const kx = Math.min(needX, limit);
  const ky = Math.min(needY, limit);
  return { view: { xmin: cx - hw * kx, xmax: cx + hw * kx, ymin: cy - hh * ky, ymax: cy + hh * ky }, clamped };
}

const ease = (u: number) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2);

export default function ChordTangent() {
  const [presetKey, setPresetKey] = useState('A');
  const [a, setA] = useState(-7);
  const [b, setB] = useState(10);
  const [zoom, setZoom] = useState(1);
  const [step, setStep] = useState(3);
  const [t, setT] = useState(1);
  const [active, setActive] = useState<Who>('P');
  const [playing, setPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [ownO, setOwnO] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef<Who | null>(null);
  const animateNext = useRef(false);
  /** Bumped whenever the step is set by hand, so a stale animation frame cannot overwrite t. */
  const animToken = useRef(0);

  const preset = PRESETS.find((p) => p.key === presetKey);
  const baseView = preset ? preset.view : CUSTOM_VIEW;
  const E = useMemo(() => CurveQ.short(a, b), [a, b]);
  const singular = E.isSingular();
  const f = (x: number) => x * x * x + a * x + b;

  const initial = (xy: [number, number]): Pin => pinOf({ x: Rational.of(xy[0]), y: Rational.of(xy[1]) });
  const [P, setP] = useState<Pin>(() => initial(PRESETS[0].P));
  const [Q, setQ] = useState<Pin>(() => initial(PRESETS[0].Q));
  const [Oc, setOc] = useState<Pin>(() => initial(PRESETS[0].O));
  const O: Loc = ownO ? Oc : null;
  const setter = (who: Who) => (who === 'P' ? setP : who === 'Q' ? setQ : setOc);
  const pinFor = (who: Who) => (who === 'P' ? P : who === 'Q' ? Q : Oc);

  const out = useMemo(() => (singular ? null : addWithIdentity(E, a, O, P, Q)), [E, a, O, P, Q, singular]);
  const T = out?.third ?? null;
  const S = out?.sum ?? null;
  const samePoint = samePlace(P, Q);
  const linePQ: Line | null = singular ? null : lineThrough(a, P, Q);
  const lineOT: Line | null = singular || !ownO ? null : lineThrough(a, O, T);
  const slopeExact = !singular && P.exact && Q.exact ? E.slope(P.exact, Q.exact) : null;

  // ---- view: fit the whole construction, but never while a finger is down ----
  const lastFit = useRef<{ view: View; clamped: boolean }>({ view: baseView, clamped: false });
  const fit = useMemo(() => {
    if (isDragging) return lastFit.current;
    const pts = [P, Q, T, S, O].filter((p): p is Pin => p !== null);
    lastFit.current = singular ? { view: baseView, clamped: false } : fitTo(baseView, pts);
    return lastFit.current;
  }, [P, Q, T, S, O, baseView, isDragging, singular]);
  const view = useMemo(() => zoomView(fit.view, zoom), [fit, zoom]);
  const fr = useMemo(() => frame(view, W, H), [view]);
  const pieces = useMemo(() => sampleCubic(f, view.xmin, view.xmax), [a, b, view]);
  const samples: Sample[] = useMemo(() => pieces.flatMap((p) => p.pts), [pieces]);
  const pool = useMemo(() => rationalPool(E, baseView), [E, baseView]);

  const settle = () => {
    setPlaying(false);
    animToken.current++;
    animateNext.current = false;
    setStep(3);
    setT(1);
  };

  const choosePreset = (key: string) => {
    const p = PRESETS.find((q) => q.key === key)!;
    setPresetKey(key);
    setA(p.a);
    setB(p.b);
    setZoom(1);
    setP(initial(p.P));
    setQ(initial(p.Q));
    setOc(initial(p.O));
    settle();
  };

  /** Put the points somewhere sensible on a custom curve. */
  const reseat = (na: number, nb: number) => {
    const g = (x: number) => x * x * x + na * x + nb;
    const cand = [2, 3, 1, 4, 0, 5, -1, 6].filter((x) => g(x) > 0.05);
    const at = (x: number, sign: number): Pin => ({ x, y: sign * Math.sqrt(Math.max(g(x), 0)), exact: null });
    setP(at(cand[0] ?? 6, 1));
    setQ(at(cand[1] ?? 6.5, -1));
    setOc(at(cand[2] ?? 6.8, 1));
  };
  const setCoeff = (na: number, nb: number) => {
    setPresetKey('custom');
    setA(na);
    setB(nb);
    setZoom(1);
    reseat(na, nb);
    settle();
  };

  // ---- moving points ------------------------------------------------------
  const nearest = (px: number, py: number, snapRadius = 14): Pin | null => {
    let best: Sample | null = null;
    let bd = Infinity;
    for (const s of samples) {
      const dx = fr.sx(s.x) - px;
      const dy = fr.sy(s.y) - py;
      const d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        best = s;
      }
    }
    if (!best) return null;
    let snap: Exact | null = null;
    let sd = snapRadius * snapRadius;
    for (const R of pool) {
      const dx = fr.sx(R.x.toNumber()) - fr.sx(best.x);
      const dy = fr.sy(R.y.toNumber()) - fr.sy(best.y);
      const d = dx * dx + dy * dy;
      if (d < sd) {
        sd = d;
        snap = R;
      }
    }
    return snap ? pinOf(snap) : { x: best.x, y: best.y, exact: null };
  };
  const toSvg = (e: PointerEvent): [number, number] => {
    const r = svgRef.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * W, ((e.clientY - r.top) / r.height) * H];
  };
  const onDown = (who: Who) => (e: PointerEvent) => {
    dragging.current = who;
    setIsDragging(true);
    setActive(who);
    settle();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    e.preventDefault();
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging.current) return;
    const [px, py] = toSvg(e);
    const pin = nearest(px, py);
    if (pin) setter(dragging.current)(pin);
  };
  const onUp = () => {
    dragging.current = null;
    setIsDragging(false);
  };
  const onKey = (who: Who) => (e: KeyboardEvent) => {
    const cur = pinFor(who);
    // 18 px per press, with a tighter snap, so a point resting on a hollow dot can always leave it
    const dx = ((view.xmax - view.xmin) * 18) / W;
    let target: [number, number] | null = null;
    if (e.key === 'ArrowRight') target = [fr.sx(cur.x + dx), fr.sy(cur.y)];
    else if (e.key === 'ArrowLeft') target = [fr.sx(cur.x - dx), fr.sy(cur.y)];
    else if (e.key === 'ArrowUp') target = [fr.sx(cur.x), fr.sy(cur.y) - 18];
    else if (e.key === 'ArrowDown') target = [fr.sx(cur.x), fr.sy(cur.y) + 18];
    if (!target) return;
    e.preventDefault();
    setActive(who);
    settle();
    const pin = nearest(target[0], target[1], 7);
    if (pin) setter(who)(pin);
  };
  const jumpTo = (R: Exact) => {
    settle();
    setter(active)(pinOf(R));
  };

  // ---- step animation -----------------------------------------------------
  const reducedMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const go = (to: number, animated: boolean) => {
    animToken.current++;
    animateNext.current = animated && !reducedMotion();
    setStep(to);
    if (!animateNext.current) setT(1);
  };
  useEffect(() => {
    if (!animateNext.current) return;
    animateNext.current = false;
    let raf = 0;
    const mine = animToken.current;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (mine !== animToken.current) return;
      const u = Math.min(1, (now - t0) / DURATION);
      setT(u);
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    setT(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);
  useEffect(() => {
    if (!playing || t < 1) return;
    if (step >= 3) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => go(step + 1, true), 550);
    return () => clearTimeout(id);
  }, [playing, step, t]);
  const replay = () => {
    go(0, false);
    setPlaying(!reducedMotion()); // with reduced motion the learner steps by hand
  };

  // ---- geometry for drawing -----------------------------------------------
  const X = fr.sx;
  const Y = fr.sy;
  const e = ease(t);
  /** progress of the element introduced at step k */
  const prog = (k: number) => (step > k ? 1 : step === k ? e : 0);
  const pop = (k: number) => (step > k ? 1 : step === k ? Math.max(0, (e - 0.8) / 0.2) : 0);

  /** Screen segment for a line, oriented so that `first` is passed before `second`. */
  const segment = (line: Line | null, first: Loc, second: Loc): [number, number, number, number] | null => {
    if (!line || line.kind === 'infinity') return null;
    if (line.kind === 'vertical') {
      const down = first !== null && second !== null ? first.y > second.y : second === null ? false : true;
      return down ? [X(line.x), 0, X(line.x), H] : [X(line.x), H, X(line.x), 0];
    }
    const yAt = (x: number) => line.through.y + line.lam * (x - line.through.x);
    const leftToRight = first !== null && second !== null ? first.x <= second.x : true;
    const [x0, x1] = leftToRight ? [view.xmin, view.xmax] : [view.xmax, view.xmin];
    return [X(x0), Y(yAt(x0)), X(x1), Y(yAt(x1))];
  };
  const partial = (s: [number, number, number, number], u: number) => ({ x1: s[0], y1: s[1], x2: s[0] + (s[2] - s[0]) * u, y2: s[1] + (s[3] - s[1]) * u });
  const segPQ = segment(linePQ, P, Q);
  const segOT = segment(lineOT, O, T);
  const xt = ticks(view.xmin, view.xmax, 9).filter((v) => X(v) > 14 && X(v) < W - 14);
  const yt = ticks(view.ymin, view.ymax, 9).filter((v) => Y(v) > 14 && Y(v) < H - 14);
  const eqn = `y² = x³ ${a === 0 ? '' : `${a < 0 ? '−' : '+'} ${Math.abs(a) === 1 ? '' : Math.abs(a)}x `}${b === 0 ? '' : `${b < 0 ? '−' : '+'} ${Math.abs(b)}`}`.trim();
  const sumName = samePoint ? '2P' : 'P + Q';
  const infinityName = ownO ? 'the point at infinity' : 'O, the point at infinity';

  const longest = Math.max(
    0,
    ...[P, Q, S].flatMap((R) => (R?.exact ? [digits(R.exact.x.n), digits(R.exact.x.d), digits(R.exact.y.n), digits(R.exact.y.d)] : [])),
  );

  let caption: string;
  if (singular) caption = 'This curve has a sharp point or a self-crossing, so the construction is switched off.';
  else if (step === 0) caption = ownO ? 'Three points on the curve: P, Q, and the point O you have chosen as the identity.' : 'Two points, P and Q, on the curve.';
  else if (step === 1) caption = samePoint ? 'Step 1. P and Q are the same point, so “the line through them” is the tangent line at P.' : 'Step 1. Draw the straight line through P and Q.';
  else if (step === 2) caption = T === null ? 'Step 2. The line is vertical. It never meets the curve again in the plane: its third meeting point is the point at infinity.' : 'Step 2. A line meets a cubic three times. Find the third meeting point, P∗Q.';
  else if (!ownO) caption = T === null ? 'Step 3. The third point is O itself, and joining O to O gives O. So P + Q = O.' : 'Step 3. Flip P∗Q across the x-axis. That mirror image is P + Q.';
  else if (T === null) caption = 'Step 3. P∗Q is at infinity, so the line joining it to O is the vertical line through O. Its third meeting point is P + Q.';
  else if (samePlace(T, O)) caption = 'Step 3. P∗Q has landed on O, so “the line through O and P∗Q” is the tangent at O. Its third meeting point is P + Q.';
  else caption = 'Step 3. Draw the line through O and P∗Q. Its third meeting point is P + Q.';

  const who: Who[] = ownO ? ['O', 'Q', 'P'] : ['Q', 'P'];

  return (
    <div class="w12">
      <div class="widget-controls row presets" role="group" aria-label="Choose a curve">
        {PRESETS.map((p) => (
          <button type="button" class="btn sm" aria-pressed={presetKey === p.key} onClick={() => choosePreset(p.key)}>
            {p.label}
          </button>
        ))}
        <button type="button" class="btn sm" aria-pressed={presetKey === 'custom'} onClick={() => setCoeff(a, b)}>
          Custom
        </button>
      </div>
      {preset && <p class="note">{preset.note}</p>}
      {presetKey === 'custom' && (
        <div class="widget-controls sliders">
          <label>
            <span>a = {a}</span>
            <input type="range" min={-10} max={10} step={1} value={a} onInput={(ev) => setCoeff(Number((ev.target as HTMLInputElement).value), b)} />
          </label>
          <label>
            <span>b = {b}</span>
            <input type="range" min={-10} max={20} step={1} value={b} onInput={(ev) => setCoeff(a, Number((ev.target as HTMLInputElement).value))} />
          </label>
          <span class="eqn">{eqn || 'y² = x³'}</span>
        </div>
      )}
      <div class="widget-controls row seg" role="group" aria-label="Where is the identity O?">
        <button type="button" class="btn sm" aria-pressed={!ownO} onClick={() => { setOwnO(false); if (active === 'O') setActive('P'); settle(); }}>O at infinity</button>
        <button type="button" class="btn sm" aria-pressed={ownO} onClick={() => { setOwnO(true); settle(); }}>Choose your own O</button>
      </div>

      <div class="stage">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Graph of ${eqn} with the chord-and-tangent construction`} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <defs>
            <clipPath id="w12-clip"><rect x="0" y="0" width={W} height={H} /></clipPath>
          </defs>
          <g class="grid">
            {xt.map((v) => <line x1={X(v)} y1={0} x2={X(v)} y2={H} />)}
            {yt.map((v) => <line x1={0} y1={Y(v)} x2={W} y2={Y(v)} />)}
          </g>
          <g class="axes">
            <line x1={0} y1={Y(0)} x2={W} y2={Y(0)} />
            <line x1={X(0)} y1={0} x2={X(0)} y2={H} />
            {xt.filter((v) => v !== 0).map((v) => <text x={X(v)} y={Math.min(H - 6, Math.max(14, Y(0) + 16))} text-anchor="middle">{v}</text>)}
            {yt.filter((v) => v !== 0).map((v) => <text x={Math.min(W - 6, Math.max(18, X(0) - 6))} y={Y(v) + 4} text-anchor="end">{v}</text>)}
          </g>

          <g clip-path="url(#w12-clip)">
            {pieces.map((pc) => <path class="curve" d={pathOf(pc.pts, fr, pc.closed)} />)}

            {segPQ && prog(1) > 0 && <line class={`chord ${samePoint ? 'tan' : ''}`} {...partial(segPQ, prog(1))} />}

            {/* step 2: a marker runs along the line from Q to the third point */}
            {T && step === 2 && e < 1 && <circle class="runner third" cx={X(Q.x + (T.x - Q.x) * e)} cy={Y(Q.y + (T.y - Q.y) * e)} r={5} />}

            {/* step 3, O at infinity: the third point is carried across the x-axis */}
            {!ownO && T && S && prog(3) > 0 && (
              <line class="reflect" x1={X(T.x)} y1={Y(T.y)} x2={X(T.x)} y2={Y(T.y + (S.y - T.y) * prog(3))} />
            )}
            {!ownO && T && S && step === 3 && e < 1 && <circle class="runner sum" cx={X(T.x)} cy={Y(T.y + (S.y - T.y) * e)} r={6} />}

            {/* step 3, chosen O: the line through O and the third point */}
            {ownO && segOT && prog(3) > 0 && <line class={`chord second ${lineOT?.kind !== 'infinity' && lineOT?.tangent ? 'tan' : ''}`} {...partial(segOT, prog(3))} />}

            {T && pop(2) > 0 && (
              <g style={{ opacity: pop(2) }}>
                <circle class="pt third" cx={X(T.x)} cy={Y(T.y)} r={7} />
                <text class="lbl third" x={X(T.x) + 11} y={Y(T.y) - 9}>P∗Q</text>
              </g>
            )}
            {S && pop(3) > 0 && (
              <g style={{ opacity: pop(3) }}>
                <circle class="pt sum" cx={X(S.x)} cy={Y(S.y)} r={8} />
                <text class="lbl sum" x={X(S.x) + 12} y={Y(S.y) + 18}>{samePoint ? '2P' : 'P+Q'}</text>
              </g>
            )}
          </g>

          {/* hollow dots: tap to send the active point there */}
          {!singular && pool.map((R) => {
            const cx = X(R.x.toNumber());
            const cy = Y(R.y.toNumber());
            if (cx < 0 || cx > W || cy < 0 || cy > H) return null;
            // do not cover a point of the construction with a hollow dot
            if ([P, Q, O, T, S].some((A) => A?.exact && A.exact.x.eq(R.x) && A.exact.y.eq(R.y))) return null;
            return (
              <g class="pool" onClick={() => jumpTo(R)}>
                <circle class="hit" cx={cx} cy={cy} r={15} />
                <circle class="dot" cx={cx} cy={cy} r={4.5} />
                <title>{`Rational point (${R.x}, ${R.y}). Tap to move ${active} here.`.replaceAll('-', '−')}</title>
              </g>
            );
          })}

          {!singular && T === null && linePQ?.kind === 'vertical' && pop(2) > 0 && (
            <g class="infinity" style={{ opacity: pop(2) }}>
              <path d={`M${X(linePQ.x)} 26 l-7 12 h14 z`} />
              <text x={Math.min(W - 150, X(linePQ.x) + 12)} y={24}>{ownO ? 'P∗Q is at infinity' : 'O (at infinity)'}</text>
            </g>
          )}
          {!singular && ownO && S === null && lineOT?.kind === 'vertical' && pop(3) > 0 && (
            <g class="infinity" style={{ opacity: pop(3) }}>
              <path d={`M${X(lineOT.x)} 26 l-7 12 h14 z`} />
              <text x={Math.min(W - 170, X(lineOT.x) + 12)} y={44}>{sumName} is at infinity</text>
            </g>
          )}

          {!singular && who.map((w) => {
            const pin = pinFor(w);
            const hidden = w === 'Q' && samePoint;
            const text = hidden ? '' : w === 'P' && samePoint ? 'P = Q' : w;
            return (
              <g
                class={`handle ${w.toLowerCase()} ${active === w ? 'active' : ''}`}
                tabindex={0}
                role="slider"
                aria-label={`Point ${w}. Arrow keys move it along the curve.`}
                aria-valuetext={(pin.exact ? `(${pin.exact.x}, ${pin.exact.y})` : `about (${pin.x.toFixed(2)}, ${pin.y.toFixed(2)})`).replaceAll('-', '−')}
                aria-valuenow={Math.round(pin.x * 100) / 100}
                onPointerDown={onDown(w)}
                onKeyDown={onKey(w)}
                onFocus={() => setActive(w)}
              >
                <circle class="hit" cx={X(pin.x)} cy={Y(pin.y)} r={26} />
                {!hidden && (w === 'O' ? <rect class="pt" x={X(pin.x) - 7.5} y={Y(pin.y) - 7.5} width={15} height={15} rx={2} /> : <circle class="pt" cx={X(pin.x)} cy={Y(pin.y)} r={8} />)}
                <text class="lbl" x={X(pin.x) + (w === 'P' ? -22 : 12)} y={Y(pin.y) - 11}>{text}</text>
              </g>
            );
          })}
        </svg>
        <div class="zoom widget-controls">
          <button type="button" class="btn sm icon" onClick={() => setZoom((z) => Math.min(8, z * 1.5))} aria-label="Zoom out">−</button>
          <button type="button" class="btn sm icon" onClick={() => setZoom((z) => Math.max(0.25, z / 1.5))} aria-label="Zoom in">+</button>
          <button type="button" class="btn sm" onClick={() => setZoom(1)} disabled={zoom === 1}>Fit</button>
        </div>
      </div>

      {!singular && (
        <p class="result-strip">
          <span class="k">{sumName} =</span> <span class="val"><Coord pin={S} atInfinity={infinityName} /></span>
        </p>
      )}
      <p class="caption" aria-live="polite">{caption}</p>

      <div class="widget-controls row">
        <button type="button" class="btn sm" onClick={() => { setPlaying(false); go(Math.max(0, step - 1), false); }} disabled={step === 0 || singular}>← Back</button>
        <button type="button" class="btn sm primary" onClick={() => { setPlaying(false); go(Math.min(3, step + 1), true); }} disabled={step === 3 || singular}>Next step →</button>
        <button type="button" class="btn sm" onClick={replay} disabled={singular}>↺ Replay</button>
      </div>
      <div class="widget-controls row">
        <button type="button" class="btn sm" onClick={() => { setQ(P); settle(); }} disabled={singular}>Set Q = P</button>
        <button type="button" class="btn sm" onClick={() => { if (S) { setP(S); settle(); } }} disabled={!S}>Move P to {sumName}</button>
      </div>
      {!singular && <p class="note">Tap a hollow dot to send <strong>{active}</strong> there. Touch another point first to choose a different one.</p>}

      {singular ? (
        <p class="warn" role="status">
          <strong>Singular curve.</strong> Here 4a³ + 27b² = 0, so the cubic x³ + ax + b has a repeated root and the curve has a
          cusp or a crossing. Chord-and-tangent does not give a group on all of it. Singular cubics get their own lesson (33).
        </p>
      ) : (
        <dl class="readout">
          <div><dt class="p">P</dt><dd><Coord pin={P} atInfinity="" /></dd></div>
          <div><dt class="q">Q</dt><dd><Coord pin={Q} atInfinity="" /></dd></div>
          {ownO && <div><dt class="o">O (yours)</dt><dd><Coord pin={Oc} atInfinity="" /></dd></div>}
          <div>
            <dt>{samePoint ? 'tangent slope' : 'slope of PQ'}</dt>
            <dd>{linePQ?.kind === 'vertical' ? <span class="coord">vertical line</span> : slopeExact ? <span class="coord"><Frac r={slopeExact} /></span> : <span class="coord approx">≈ {linePQ?.kind === 'sloped' ? linePQ.lam.toFixed(3) : ''}</span>}</dd>
          </div>
          <div><dt class="third">P∗Q</dt><dd><Coord pin={T} atInfinity={ownO ? 'the point at infinity' : 'O'} /></dd></div>
          <div class="result"><dt class="sum">{sumName}</dt><dd><Coord pin={S} atInfinity={infinityName} /></dd></div>
        </dl>
      )}
      {!singular && ownO && <p class="note">Check that your O really is the identity: drag Q onto O, and the answer lands on P.</p>}
      {!singular && longest > 14 && (
        <p class="note">Some of these whole numbers are too long to show in full (the longest has {longest} digits). The middle digits are hidden; nothing is rounded.</p>
      )}
      {!singular && !(P.exact && Q.exact && (!ownO || Oc.exact)) && (
        <p class="note">Values marked ≈ are decimal approximations. Put every point on a hollow dot to get exact fractions.</p>
      )}
      {fit.clamped && !singular && <p class="note">Part of the construction is too far away to fit in the picture. The numbers below are still exact.</p>}
    </div>
  );
}
