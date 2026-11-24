import { useState } from 'preact/hooks';
import { CurveQ, pt, pointEq, type PointQ } from '../lib/math/curveQ';
import { Rational } from '../lib/math/rational';
import './widgets.css';

interface Props {
  /** Curve y² = x³ + a·x + b. */
  a: number;
  b: number;
  /** The question is "P + Q" (give the same point twice for 2P). Coordinates as strings, e.g. "129/100". */
  P: [string, string];
  Q: [string, string];
  /** Shown in front of the inputs, e.g. "(1, 2) + (−3, 2) =". */
  label: string;
}

type Verdict = { kind: 'ok' | 'no' | 'bad'; text: string };

const nice = (r: Rational) => r.toString().replace('-', '−');

/** Checks a point answer against the engine and says which step went wrong. */
export default function AnswerCheck({ a, b, P, Q, label }: Props) {
  const [x, setX] = useState('');
  const [y, setY] = useState('');
  const [isO, setIsO] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  const check = (e: Event) => {
    e.preventDefault();
    const E = CurveQ.short(a, b);
    const expected = E.add(pt(P[0], P[1]), pt(Q[0], Q[1]));
    const third = E.neg(expected);
    let ans: PointQ;
    if (isO) ans = null;
    else {
      try {
        // accept a typed minus sign (−) as well as a hyphen
        ans = { x: Rational.parse(x.replace('−', '-')), y: Rational.parse(y.replace('−', '-')) };
      } catch {
        setVerdict({ kind: 'bad', text: 'Enter each coordinate as a whole number or a fraction such as −3 or 129/100.' });
        return;
      }
    }
    if (pointEq(ans, expected)) {
      setVerdict({ kind: 'ok', text: 'Correct.' });
      return;
    }
    if (ans === null) {
      setVerdict({ kind: 'no', text: 'Not O. The line through these two points is not vertical, so it meets the curve at a third ordinary point.' });
      return;
    }
    if (!E.has(ans)) {
      const lhs = ans.y.mul(ans.y);
      const rhs = E.f(ans.x);
      setVerdict({
        kind: 'no',
        text: `That point is not on the curve: y² = ${nice(lhs)}, but x³ ${a < 0 ? '−' : '+'} ${Math.abs(a)}x ${b < 0 ? '−' : '+'} ${Math.abs(b)} = ${nice(rhs)}. Recheck the third root, then the y-value on the line.`,
      });
      return;
    }
    if (expected === null) {
      setVerdict({ kind: 'no', text: 'That point is on the curve, but look at the line again: it is vertical.' });
      return;
    }
    if (pointEq(ans, third)) {
      setVerdict({ kind: 'no', text: 'You have found the third meeting point P∗Q. One step is left: reflect it in the x-axis.' });
      return;
    }
    if (ans.x.eq(expected.x)) {
      setVerdict({ kind: 'no', text: 'The x-coordinate is right. Check the sign of y.' });
      return;
    }
    setVerdict({ kind: 'no', text: 'That point is on the curve, but it is not the sum. Recheck the slope of the line, then the sum of the three roots.' });
  };

  return (
    <form class="answer" onSubmit={check}>
      <span class="q">{label}</span>
      <span class="fields">
        (
        <input type="text" inputMode="text" autocomplete="off" autocapitalize="off" spellcheck={false} aria-label="x-coordinate of your answer" placeholder="x" value={x} disabled={isO} onInput={(e) => setX((e.target as HTMLInputElement).value)} />
        ,
        <input type="text" inputMode="text" autocomplete="off" autocapitalize="off" spellcheck={false} aria-label="y-coordinate of your answer" placeholder="y" value={y} disabled={isO} onInput={(e) => setY((e.target as HTMLInputElement).value)} />
        )
      </span>
      <label class="o"><input type="checkbox" checked={isO} onChange={(e) => setIsO((e.target as HTMLInputElement).checked)} /> the answer is O</label>
      <button type="submit" class="btn sm">Check</button>
      <p class={`verdict ${verdict?.kind ?? ''}`} role="status">{verdict?.text}</p>
    </form>
  );
}
