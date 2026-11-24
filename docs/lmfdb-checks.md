# LMFDB checks

Every rank or torsion group stated on the site is checked against the LMFDB (https://www.lmfdb.org) and
logged here. This is an acceptance criterion for Phase 1 and every later phase. "auto" means the curve page
was fetched and read by script; "manual" means it was read in a browser.

| Date | Where on the site | Curve | LMFDB label | Site's claim | LMFDB says | How | Result |
|---|---|---|---|---|---|---|---|
| 2026-11-24 | Lesson 10, widget W12, note on the fourth preset | y² = x³ − x | [32.a3](https://www.lmfdb.org/EllipticCurve/Q/32/a/3) | Rational points are (0,0), (±1,0) and O only: torsion Z/2 × Z/2, rank 0 | Rank 0; torsion Z/2Z ⊕ Z/2Z | auto | agrees |

## Not yet checked (values used in engine tests, not stated as rank/torsion on the site)

These must be logged above before any lesson states them.

- y² = x³ − 43x + 166: torsion Z/7.
- y² = x³ + 1: torsion Z/6.
- y² = x³ + 17: rank 2 (from the research report; asserted nowhere in code).
- y² = x³ − 25x: rank 1. y² = x³ + x: rank 0. y² = x³ − 5x: rank 1 (2-descent tests).
- y² = x³ − 7x + 10 and y² = x³ − 2: no rank or torsion claim is made yet.

Note: the LMFDB JSON API path tried on 2026-11-24 (`/api/ec_curvedata/`) returned 404; curve pages by label work.
