# Phase 0 design — Rational Points study companion

Approved by Aditya on 2026-11-24. The binding source for everything beyond Phase 0 is
`docs/research-report.md` (curriculum, crosswalk, widget catalogue W01–W68).

## Intent
A self-contained, story-led, interactive companion to Silverman–Tate, *Rational Points on
Elliptic Curves* (2nd ed.), read alongside Ash–Gross, *Elliptic Tales*. The learner is an
engineer with calculus and coordinate geometry but no ring/field theory, number theory,
projective geometry or Galois theory. Phase 0 delivers the foundation plus one finished
lesson as a style prototype.

## Goals (Phase 0)
- Astro + MDX + Preact + KaTeX scaffold; design system (Okabe–Ito, dark/light, mobile-first).
- Exact-arithmetic maths engine with every test named in the master prompt passing.
- Deploy pipeline to `https://nkaditya1729.github.io/rational-points/` (public repo).
- Sample Lesson 10 (chord-and-tangent) with widget W12 — a **style prototype**, not yet the template.
- Report with mobile (390px) and desktop screenshots and a list of changes to make before Phase 1.

## Non-goals
Lessons other than 10, widgets other than W12, the exercise companion, Pagefind, the
dependency-graph page, Three.js. These belong to later phases.

## Anti-goals
- Copying any text, proof, figure or exercise statement from either book.
- Committing either PDF. `docs/private/` is git-ignored before the first commit.
- Displaying a number that did not come from the tested engine.

## Constraints agreed with Aditya
1. `.gitignore` covers `docs/private/` before the first commit; `git check-ignore` and
   `git status` output is shown in the report before any push.
2. Page mapping: front matter is roman-numbered and mapped separately from the main text.
   Measured from the PDFs (see `docs/page-map.md`): the Silverman–Tate offset is **not**
   constant — it drifts from +23 to +17 across chapters.
3. Lesson 10 is a prototype; the report lists what to change before it becomes the template.

## Approaches considered
- **Astro islands (chosen):** static pages, JS only for widgets; fast on phones; official
  GitHub Pages action. Named in the master prompt.
- VitePress/Docusaurus: good docs chrome, clumsier for many bespoke widgets.
- Quarto: strong for notebooks, weak for custom touch interaction.

## Builder's calls (mine, not Aditya's)
- Widgets render to SVG (crisp labels, easy touch hit-targets); Canvas only for dense plots later.
- Engine modules in Phase 0: rational, modint, curveQ, curveFp, height, nagellLutz, descent,
  pointCount, ecm, modular (11a q-expansion). divpoly and weierstrassP wait for the phases that use them.
- Lesson frontmatter schema as in the master prompt, enforced by an Astro content collection.
