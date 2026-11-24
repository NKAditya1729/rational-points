# Rational Points — study companion

Interactive companion to Silverman–Tate, *Rational Points on Elliptic Curves* (2nd ed.), read with Ash–Gross, *Elliptic Tales*.

## Read first
- `docs/research-report.md` — binding curriculum (56 lessons), crosswalk, widget catalogue W01–W68, master prompt.
- `docs/page-map.md` — printed page → PDF page. The offset is **not** constant.
- `docs/phase-0-report.md` — current state, including the template changes made after review.
- `docs/lmfdb-checks.md` — log of rank/torsion claims checked against LMFDB.

## Hard rules
- Never copy text, proofs, figures or exercise statements from either book. Original wording; cite printed pages.
- `docs/private/` holds the learner's PDFs and is git-ignored. Never stage a PDF. Before any push run
  `git check-ignore -v docs/private/RPEC.pdf` and `git status`.
- Every number shown on the site comes from `src/lib/math` and is covered by a test. If a lesson quotes a
  computed value, add it to the "numbers quoted in Lesson N" tests.
- Work one phase at a time. Before declaring a phase done: `npm test`, `npm run e2e`, look at the screenshots.
- Lesson pages keep the template: hook → goals → exposition → widget + full explanation → statement →
  self-check → reading card → where this leads.
- Learner messages starting `FEEDBACK:` are appended to `docs/feedback-log.md` before acting on them.
- **Phase 1 acceptance (and every later phase):** every rank or torsion group stated anywhere on the site
  is checked against LMFDB and logged in `docs/lmfdb-checks.md` (curve, LMFDB label, claim, what LMFDB says,
  date, URL). LMFDB curve pages can be fetched by label (`https://www.lmfdb.org/EllipticCurve/Q/32/a/3`);
  if automated access is blocked, check by hand in a browser and log it as "manual".
- Every lesson uses the template pieces: `Recap`, `Term` (glossary), `Predict`, `Figure`, `ReadingCard`
  (placed **before** the self-check), `HintLadder` + `Hint` + `Answer` + `AnswerCheck`.
- Never break an existing URL. The site lives under the `/rational-points/` base path; build links with `url()`.

## Commands
- `npm run dev` — local site at http://localhost:4321/rational-points/
- `npm test` — maths engine (Vitest)
- `npm run e2e` — browser tests at 390×844 and 1440×900; rewrites `docs/screenshots/`
- `npm run build` — static site into `dist/`

## Gotchas
- `katex` must stay on the same version that `rehype-katex` depends on (0.16.x), or superscripts render full-size.
- Astro 7: `astro preview` runs as a background daemon, so browser tests serve `dist/` with `tests/serve.mjs`.
- In Preact SVG, write `tabindex`, not `tabIndex`.
- Named slots (`slot="…"`) do not pass from MDX into Astro components here; hints once rendered inline
  because of it. Use separate components (`Hint`, `Answer`) and keep the e2e test that checks they are folded.
- A requestAnimationFrame tick can land after a state reset; guard animation ticks with a token (see W12).
- Do not write `*/` inside a block comment (e.g. the group Q*/Q*²).
