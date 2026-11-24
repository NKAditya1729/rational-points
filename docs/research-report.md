# Rational Points on Elliptic Curves: A Study-Companion Blueprint for Aditya (Research Report + Claude Code Build Prompt)

The best plan is a storytelling, widget-driven companion built with Astro on GitHub Pages. Its spine should be Silverman–Tate's own chapter order, with Appendix A.1–A.3 read *inside* Chapter 1 rather than after it. Elliptic Tales should be used as the gentle "first telling" of each idea. Prerequisite detours (groups, congruences, p-adic valuation, finite fields, field/Galois theory) should be inserted exactly where the book first needs them. The book's reputation is earned: the MAA's review of the 2nd edition calls it "probably still the best place to start learning about elliptic curves."\[1\] Its difficulty for a self-taught engineer comes almost entirely from silent prerequisites, which this design makes explicit.

## TL;DR
- **Read order:** Introduction → Ch. 1 interleaved with App. A.1–A.3 (and Elliptic Tales Part I) → Ch. 2 → Ch. 3 → Ch. 4 → then Ch. 5 and Ch. 6 in either order. App. A.4–A.5 and App. B are optional deepenings. Elliptic Tales Part III (L-functions, BSD) slots in after Ch. 4, because it is about counting points mod p. Plan about 56 lessons, including about 15 prerequisite detours, over about 9–12 months part-time for the first pass.
- **The site:** Astro + MDX "islands", with KaTeX rendered at build time and a from-scratch TypeScript maths engine (BigInt rationals, curves over Q and F_p, heights, Nagell–Lutz, 2-descent, ECM) that is unit-tested against LMFDB/known values. There are about 60 Canvas/SVG widgets (Three.js only for the torus and projective sphere), deployed by GitHub Actions to nkaditya1729.github.io.
- **Honesty constraints:** exercise statements must be read from the learner's PDF at build time and paraphrased, never copied. The official 2nd-edition errata (updated 13 June 2024) could not be retrieved here, so Claude Code must read it before writing Chapters 3–4. Rank records have been changing fast in 2024–2026, so the site must date-stamp them.

## Key Findings
1. **Origin and pedigree.** Tate gave six lectures at Haverford, April 20–May 5, 1961. They covered the group law, Nagell–Lutz, Mordell–Weil, and curves over finite fields. Silverman retyped them while teaching abstract algebra at Brown in 1989–90 and added Lenstra factoring, Diophantine approximation and complex multiplication. Tate added Appendix A. The 2nd edition (2015) added cryptography (4.5), the FLT overview (6.6) and Appendix B. Serre praised the book, but also expressed "horror" at the informality of the Chapter 1 associativity "proof".\[2\] This is exactly why the companion should pair Ch. 1 with App. A.
2. **The book's own home page** lists a 2nd-edition errata (updated 13 June 2024) and Rich Schwartz's supplementary notes. Those notes give a complex-analysis primer and a proof that ℘ gives an isomorphism C/Λ → E.\[3\] That primer is the ideal detour for Section 2.2.
3. **The 1st-edition errata** (Version 1.3, 1994) and MIT OCW 18.704 (Fall 2004) solutions document real mathematical slips. These include a wrong torsion table in the exercise on y² = x³ + dx (the Z/4Z case needs d = 4e⁴, not e⁴), a gap in the Nagell–Lutz filtration figure/proof, and a mis-computed ECM worked example.\[4\]\[5\] Whether each survived into the 2nd edition must be checked against the 2nd-edition errata.
4. **Elliptic Tales** (Princeton UP, 2012; paperback 2014) has three parts with verified chapter page starts. Danny Yee's 2017 review says Ash and Gross "assume only high school algebra and a bit of calculus, explaining what complex numbers are, giving a basic introduction to group theory". The MAA reviewer called it "a fabulous book" that shows how things fit together rather than proving everything. That makes it the right *preview* text, never a substitute.
5. **Status of the field (Nov 2026).** Bhargava–Shankar (arXiv:1312.7859) proved that the average rank is "less than .885", and Bhargava–Skinner–Zhang (arXiv:1407.1826) showed that more than 66% of curves, ordered by height, satisfy the BSD rank conjecture. The rank record moved from Elkies' ≥28 (2006) to Elkies–Klagsbrun ≥29 (August 2024; exactly 29 under GRH, per the Simons Collaboration). A rank-30 curve was uploaded to ICARM's leaderboard on 20 Aug 2026; MathWorld says it was later attributed to Claude working with Alpöge and Howell, and that its rank is exactly 30 only under GRH + BSD. MathWorld gives 31 as the largest known lower bound as of 29 Aug 2026, and an Oct 2026 arXiv paper cites a curve of rank ≥32 (exact ranks conditional on GRH/BSD). Per MathWorld, the largest *unconditionally* known exact rank is 20 (Elkies–Klagsbrun 2020).

---

# PART A — RESEARCH REPORT

## 1. The Subject and Its Story

**The question.** Given a polynomial equation with rational coefficients, find all solutions in rational numbers. For lines this is trivial, and for conics it is completely solved. For cubics it becomes one of the deepest subjects in mathematics. That staircase is the plot of the whole companion.

**Act I — Diophantus to Fermat (c. 250–1660).** Diophantus' *Arithmetica* found rational solutions by clever substitutions. These are secretly the "draw a line through a known point" trick. Bachet's 1621 Latin edition was the copy in which Fermat wrote his marginal notes. Fermat invented *infinite descent*: if a solution existed, it would produce a strictly smaller one forever, which is impossible. He used it to show that no right triangle with rational sides has square area (so 1 is not a *congruent number*). Descent is the direct ancestor of the proof of Mordell's theorem in Chapter 3. Newton classified cubic curves and understood the chord/tangent construction geometrically.

**Act II — Why "elliptic"? (1700s–1880s).** Computing the arc length of an ellipse leads to integrals of 1/√(cubic or quartic), called *elliptic integrals*. Abel and Jacobi had the key insight of *inverting* these integrals, which produces doubly periodic functions. Weierstrass's ℘-function packages this: z ↦ (℘(z), ℘′(z)) maps the torus C/Λ onto the cubic y² = 4x³ − g₂x − g₃. Adding points on the torus becomes chord-and-tangent on the curve. So the curves inherit the name "elliptic" from ellipse arc length, even though they are not ellipses.\[6\] Section 2.2 is where this story is told.

**Act III — Structure (1901–1937).** In 1901 Poincaré asked about the structure of the set of rational points on such curves. In 1922 Mordell proved that the group E(Q) is finitely generated: finitely many points generate all others by chords and tangents. Weil generalised this in 1928 to abelian varieties over number fields.\[7\]\[8\] Nagell (1935) and Lutz (1937) independently showed that rational points of finite order have *integer* coordinates, with y = 0 or y² dividing the discriminant.\[9\]\[10\] That turns "find all torsion" into a finite search.

**Act IV — Counting mod p, integer points, and the great conjecture (1909–1977).** Gauss had already counted solutions of x³ + y³ = 1 mod p; this is Section 4.2. Hasse (1930s) proved |#E(F_p) − (p+1)| ≤ 2√p in general. Thue (1909) proved that good rational approximations to algebraic numbers are rare. Siegel (1929) used this to prove that an elliptic curve has only finitely many *integer* points (Chapter 5 proves a special case). In the 1960s Birch and Swinnerton-Dyer, computing on Cambridge's EDSAC, saw that curves with many points mod p tend to have high rank. That observation became the BSD conjecture, now a Clay Millennium Prize problem. Mazur (1977) proved there are exactly 15 possible torsion groups over Q: Z/n for n = 1,…,10, 12, and Z/2 × Z/2m for m = 1,…,4.\[11\]

**Act V — Elliptic curves go to work (1985–).** Lenstra's elliptic curve factorisation method (ECM) improves Pollard's p−1 method by replacing the fixed group (Z/pZ)* with many random groups E(F_p). Koblitz and Miller independently proposed elliptic-curve cryptography (1985). Its security rests on the elliptic curve discrete logarithm problem.\[12\]

**Act VI — Fermat's Last Theorem (1984–2001).** Frey suggested attaching the curve y² = x(x − aᵖ)(x + bᵖ) to a hypothetical solution aᵖ + bᵖ = cᵖ. Serre formulated precise conjectures and Ribet (1986) proved that such a curve could not be modular. Wiles, with Taylor (1994–95), proved that semistable curves are modular, which kills the Frey curve. By 2001 (Breuil–Conrad–Diamond–Taylor), all elliptic curves over Q were known to be modular.\[13\]

**Act VII — Today.** Bhargava–Shankar bounded the average rank ("less than .885", arXiv:1312.7859), and Bhargava–Skinner–Zhang (arXiv:1407.1826) showed that more than 66% of curves satisfy the BSD rank conjecture. Conjecturally half of curves have rank 0 and half rank 1. Whether ranks are unbounded is open.\[14\]\[15\] For the record status in 2024–2026, see Key Finding 5. Faltings' proof of Mordell's *conjecture* (genus ≥ 2 curves have finitely many rational points) was honoured with the 2026 Abel Prize, which gives a perfect epilogue hook.\[8\] The LMFDB catalogues curves by conductor (the curve 11a, conductor 11, is the "hydrogen atom" of modularity).

**Headline theorems — plain statement / why care / key idea / still open**
| Theorem | Plain statement | Key proof idea | Open |
|---|---|---|---|
| Nagell–Lutz (Ch. 2) | Torsion points have integer coordinates, with y = 0 or y² ∣ D | Points near O "p-adically" form a nested chain of subgroups that has no torsion | Effective, done; Mazur classifies possible groups |
| Mordell (Ch. 3) | E(Q) ≅ Z^r ⊕ finite | Height grows like 4× under doubling, plus E(Q)/2E(Q) is finite; then descend | Computing r algorithmically is not proven always possible; is r unbounded? |
| Hasse/Gauss (Ch. 4) | #E(F_p) = p + 1 − a_p, \|a_p\| ≤ 2√p | Gauss: cubic characters/Jacobi sums for x³+y³=1 | Distribution of a_p (Sato–Tate, now proven for non-CM curves over totally real fields) |
| Siegel/Thue (Ch. 5) | Finitely many integer points | Auxiliary polynomial vanishing to high order + Diophantine approximation | Effective bounds come via Baker; Lang's conjecture |
| CM & modularity (Ch. 6) | Torsion points generate abelian extensions for CM curves; all E/Q modular | Galois acts on torsion via 2×2 matrices | BSD in general |

**Positioning.** Silverman–Tate is the gateway book.\[3\] Silverman's *Arithmetic of Elliptic Curves* is the graduate sequel and needs algebraic geometry.\[16\] Washington is computational and cryptographic. Knapp and Husemöller are broader graduate surveys. Cassels' LMS student text is terse and classical. Koblitz's *Introduction to Elliptic Curves and Modular Forms* is organised around congruent numbers and modular forms. Sutherland's MIT 18.783 notes (Fall 2025 on OCW) are computational and assume a year of algebra including Galois theory.\[17\] Ash–Gross is the popular-level route to stating BSD.\[18\] The "book that makes mathematicians" reputation comes from one thing: in about 260 pages it visits geometry, algebra, analysis, number theory, cryptography and FLT using only undergraduate tools, and shows the reader that these are one subject.

## 2. Section-by-Section Analysis of Silverman–Tate (2nd ed.)

Columns: printed pages / what it does / silent prerequisites / where Aditya will stick → the fix.

| § | pp. | Content (original summary) | Silent prerequisites | Sticking point → companion fix |
|---|---|---|---|---|
| Intro | xv–xxii | Tour: lines → conics → cubics; previews group law, Mordell, Nagell–Lutz | Rationals vs integers, degree | None serious → use as the story trailer |
| 1.1 | 1–8 | Rational points on conics: project from one point to get a rational parametrisation; some conics have none (mod-p / Legendre obstruction) | gcd, lowest terms, congruences mod 3, 4, 8 | Why mod-3 proves non-existence → "local obstruction" widget; worked x²+y²=3 |
| 1.2 | 8–16 | Cubics: chord-tangent, the point O, group law, associativity via 9-point argument | Group axioms; Bezout; projective point at infinity | Associativity "proof" is informal (Serre) → read A.1–A.3 alongside; Cayley–Bacharach widget |
| 1.3 | 16–23 | Any cubic with a rational point → Weierstrass form; projective change of coordinates | Homogeneous coordinates, flexes | Coordinates moving lines to infinity → chart widget; App. B as worked example |
| 1.4 | 23–28 | Explicit addition/doubling formulas; λ, ν | Implicit differentiation, Vieta (sum of roots) | Why x₃ = λ² − a − x₁ − x₂ → "sum of roots of the cubic" animation |
| 2.1 | 35–38 | Order 2 ⇔ y = 0; order 3 ⇔ flex | Order of an element; second derivative/flex | Flex ⇔ 3P = O → tangent-meets-thrice widget |
| 2.2 | 38–45 | Real points (1 or 2 components); complex points form a torus; n-torsion ≅ Z/n × Z/n | Complex numbers, lattices, doubly periodic functions | Heavy, uncalibrated analysis → Schwartz notes + torus widgets; "first pass: accept" marker |
| 2.3 | 45–47 | Discriminant D = −4a³ − 27b² (for x³+ax+b; general form for x³+ax²+bx+c); nonsingular ⇔ D ≠ 0 | Repeated roots ⇔ shared root with derivative | Where the formula comes from → root-collision animation |
| 2.4 | 47–56 | Torsion ⇒ integer coordinates: the subgroups C(p^ν) of points whose x has denominator divisible by p^{2ν} | ord_p (p-adic valuation), subgroups, homomorphism to Q | Hardest proof of Part II; 1st-ed figure/proof gap → "p-adic zoom" widget; explicit t = x/y coordinate algebra |
| 2.5 | 56–58 | Strong form y² ∣ D; using it; Mazur's theorem | Divisors | Remember: Nagell–Lutz is necessary, not sufficient → finder widget tests nP |
| 3.1 | 65–71 | Heights; finitely many points of bounded height; the 4-step descent lemma | Finitely generated abelian groups, cosets | "Why does descent terminate?" → descent animation |
| 3.2 | 71–75 | h(P + P₀) ≤ 2h(P) + κ₀ | Inequalities, triangle inequality | Bookkeeping fog → colour-coded inequality stepper |
| 3.3 | 75–80 | h(2P) ≥ 4h(P) − κ | Resultants/"two polynomials without a common root" | Hardest inequality; uses that two quartic forms have no common zero |
| 3.4 | 80–88 | Curves with a 2-torsion point (0,0): y² = x³+ax²+bx; companion curve with ā = −2a, b̄ = a² − 4b; isogenies φ, ψ; α: Γ → Q*/Q*² | Homomorphism, kernel, image, Q*/Q*² | Most abstract part → isogeny widget showing ψ∘φ = doubling |
| 3.5 | 88–95 | Mordell for these curves; rank formula 2^r = #α(Γ)·#ᾱ(Γ̄)/4 | Index of subgroups, quotient groups | Why index finite ⇒ descent works → step-through with y² = x³ − x |
| 3.6 | 95–106 | Examples: computing rank by testing N² = b₁M⁴ + aM²e² + b₂e⁴; further developments (Selmer, Sha) | Squares mod p, local solvability | Undecidable-looking cases → rank calculator labels "no local obstruction found, undecided" |
| 3.7 | 106–111 | Singular cubics: node → multiplicative group, cusp → additive group | Q*, Q⁺ as groups | 1st-ed errata note a missing isolated-point (non-split) case → check 2nd ed |
| 4.1 | 117–121 | Points over F_p; Hasse bound | Z/pZ, field | Picture of a "curve" as scattered dots → grid widget |
| 4.2 | 121–133 | Gauss: count on x³+y³=1 via 4p = A² + 27B² | Cubic residues, characters, Jacobi sums, Eisenstein integers | The longest elementary proof → detour lesson; numeric check p = 7 |
| 4.3 | 133–139 | Reduction mod p is injective on torsion (p ∤ 2D) | Nagell–Lutz; homomorphism | Uses 2.4 → torsion-injection widget |
| 4.4 | 139–152 | Pollard p−1; Lenstra ECM | Fermat's little theorem, gcd, smooth numbers | Why a failed inverse is a success → "inversion fails = factor found" stepper |
| 4.5 | 152–157 | ECC, Diffie–Hellman, ElGamal, ECDLP | Group exponentiation | Easy → double-and-add widget |
| 5.1 | 167–170 | Integer vs rational points; Siegel | — | Why integrality is subtle (depends on model) |
| 5.2 | 170–176 | x³ + y³ = m, taxicabs, 1729 | Factorisation x³+y³ = (x+y)(x²−xy+y²) | Fun; use as motivation |
| 5.3 | 176–182 | Thue's theorem ⇒ finiteness; Diophantine approximation | Absolute values, irrationality | Exponent bookkeeping → approximation-exponent plot |
| 5.4 | 182–190 | Build auxiliary polynomial (Siegel's lemma: pigeonhole) | Linear algebra, pigeonhole | Counting dimensions → pigeonhole widget |
| 5.5 | 190–193 | Auxiliary polynomial is small at the approximation | Taylor expansion, derivatives of polynomials | Many constants → "only exponents matter" dashboard |
| 5.6 | 193–197 | It doesn't vanish to high order (Wronskian-style lemma) | Derivatives, Gauss's lemma | — |
| 5.7–5.8 | 197–202 | Assemble contradiction; Roth, Baker | — | Show the full flow chart |
| 6.1 | 207–213 | Abelian extensions of Q, cyclotomic fields, Kronecker–Weber | Fields, degree, Galois group | Needs a full detour (2–3 lessons) |
| 6.2 | 213–221 | Algebraic points, E[n], division polynomials | Polynomials over fields | — |
| 6.3 | 221–230 | Galois representation ρ_n: Gal → GL₂(Z/n) | Linear algebra mod n, group actions | Abstract → matrix-action widget |
| 6.4 | 230–235 | CM: extra endomorphisms, e.g. (x,y) ↦ (−x, iy) on y² = x³ + x | Gaussian integers, lattices | Square-lattice widget |
| 6.5 | 235–245 | Abelian extensions of Q(i) generated by torsion of y²=x³+x (Jugendtraum flavour) | Ideals in Z[i] | "Read for the story" marker |
| 6.6 | 245–256 | Frey → Ribet → Wiles → FLT; modular forms, a_p | Concept only | Conceptual map widget |
| A.1–A.3 | 265–290 | Projective plane, curves, intersections, Bezout statement | Linear algebra basics | **Read with Ch. 1** |
| A.4 | 290–302 | Intersection multiplicity, proof of Bezout | Resultants | Optional on pass 1 |
| A.5 | 302–305 | Reduction mod p rigorously | — | Read with 4.3 |
| App. B | 311–315 | Worked transformation of a cubic to Weierstrass form | Projective changes of variable | Use with 1.3 |

**Verified worked examples for the site.**
- y² = x³ − x has torsion {O, (0,0), (±1,0)} ≅ Z/2 × Z/2 and rank 0. 2-descent: companion y² = x³ + 4x. α(Γ) = {1, −1}. ᾱ(Γ̄) = {1, 2}, since (2,4) is on y² = x³ + 4x and b₁ = −1, −2 give negative right sides. So 2^r = 2·2/4 = 1 and r = 0. This means 1 is not congruent, which is Fermat's theorem.
- y² = x³ − 43x + 166: (3, ±8), (−5, ±16), (11, ±32) and O form Z/7. 4a³ + 27b² = 425984 = 2¹⁵·13.
- y² = x³ + 1: (−1,0), (0,±1), (2,±3), O form Z/6.
- y² = x³ − 2: P = (3,5), 2P = (129/100, −383/1000). Heights explode: 3 → 129/100 → …
- y² = x³ + 17: integer points x = −2, −1, 2, 4, 8, 43, 52, 5234 (e.g. 5234³ + 17 = 378661²), 16 points in all. Rank 2 (verify in LMFDB at build).\[19\]\[20\]
- Congruent numbers: y² = x³ − 25x ∋ (−4, 6), so 5 is congruent.\[21\] y² = x³ − 36x ∋ (−3, 9), giving the 3-4-5 triangle.
- Gauss check p = 7: x³ + y³ = 1 has 6 affine and 9 projective solutions over F₇. 4·7 = 1² + 27·1², A = 1. Affine count = p − 2 + A. The site must match the sign convention in the learner's PDF.

**Dependency graph (for the nav view).** Intro → 1.1 → {A.1–A.3} → 1.2 → 1.3 (+App. B) → 1.4 → 2.1 → 2.3 → 2.4 → 2.5 → 3.1–3.7. Section 2.2 is a side branch (complex analysis), needed later only in 6.2–6.4. Ch. 4: 4.1 → 4.2; 2.5 + A.5 → 4.3; 4.1 → 4.4 → 4.5. Ch. 5 needs only Ch. 1. Ch. 6 needs 2.2 + Galois detours. A.4 is optional.

## 3. Prerequisite Map (lateral-exploration modules)

| Module | Minimum viable content | First needed in | Go deeper |
|---|---|---|---|
| M1 Rationals & Diophantine eqs | Lowest terms, gcd, Euclid's algorithm, rational vs integer solutions | 1.1 | Silverman, *A Friendly Introduction to Number Theory* (has elliptic-curve chapters) |
| M2 Congruences | Z/nZ, inverses mod n, Fermat's little theorem, CRT | 1.1, 4.x | Same; Ireland–Rosen for depth |
| M3 Quadratic & cubic residues | Legendre symbol, reciprocity statement; cubic characters, Jacobi sums, Z[ω] | 1.1, 3.6, 4.2 | Ireland–Rosen Ch. 5–9 |
| M4 Groups I | Axioms, abelian, order, cyclic, subgroups | 1.2 | Pinter, *A Book of Abstract Algebra* |
| M5 Groups II | Homomorphism, kernel, image, cosets, index, quotients, direct sums | 3.4 | Pinter; Keith Conrad's expository notes |
| M6 Finitely generated abelian groups | Z^r ⊕ finite; rank; torsion | 3.1 | Elliptic Tales Ch. 7 |
| M7 Projective geometry | Homogeneous coordinates, charts, points at infinity, singular points, Bezout | 1.2 | S–T App. A; Elliptic Tales Ch. 3–5 |
| M8 Calculus on curves | Implicit differentiation, tangent lines, flexes, Taylor expansion of polynomials | 1.4, 5.5 | Any calculus text |
| M9 p-adic valuation | ord_p of rationals, ord_p(ab) = ord_p a + ord_p b, ord_p(a+b) ≥ min | 2.4 | Gouvêa *p-adic Numbers* (deeper than needed) |
| M10 Complex analysis lite | Lattices, doubly periodic functions, ℘, torus | 2.2 | Schwartz's RPEC supplementary notes |
| M11 Finite fields | F_p, F_p* is cyclic, counting | 4.1 | Friendly Intro; Sutherland 18.783 notes |
| M12 Diophantine approximation | Dirichlet, Liouville, Thue, Roth; pigeonhole/Siegel's lemma | 5.3 | Stillwell, *Numbers and Geometry* (general) |
| M13 Fields & Galois | Extensions, degree, splitting fields, automorphisms, Gal, cyclotomic fields, Kronecker–Weber | 6.1 | Stewart, *Galois Theory*; Ash–Gross *Fearless Symmetry* (conceptual) |
| M14 Modular forms & L-functions (concept) | q-expansions, a_p, L(E,s), modularity | 6.6 | Elliptic Tales Part III; Ash–Gross *Summing It Up*; Sutherland Lecture 24–25 |

Video and lecture series (3Blue1Brown, Numberphile, Borcherds' YouTube lectures) and Lozano-Robledo's AMS book are widely used, but were not individually re-verified in this research. The site should link them only after the builder checks the URLs.

## 4. Elliptic Tales and the Crosswalk

**Structure (verified chapter starting pages, Princeton UP; confirm against the learner's printing).** Prologue 1. **Part I Degree:** 1 Degree of a Curve 13; 2 Algebraic Closures 26 (complex arithmetic, rings and fields, congruences, arithmetic mod p); 3 The Projective Plane 42 (points at infinity, homogenization, coordinate patches); 4 Multiplicities and Degree 67 ("Calculus for Dummies"); 5 Bézout's Theorem 82. **Part II Elliptic Curves and Algebra:** 6 Transition to Elliptic Curves 95; 7 Abelian Groups 100; 8 Nonsingular Cubic Equations 116 (group law, discriminant, topology); 9 Singular Cubics 135 (additive, split/non-split multiplicative reduction); 10 Elliptic Curves over Q 152 (torsion, infinite order). **Part III Elliptic Curves and Analysis:** 11 Building Functions 161; 12 Analytic Continuation 181; 13 L-functions 199; 14 Surprising Properties of L-functions 215; 15 The Conjecture of Birch and Swinnerton-Dyer 225 (includes the congruent number problem); Epilogue 245.\[22\]\[23\]\[24\]

**How they differ.** Ash–Gross: intuition, examples, almost no proofs, aims at *stating* BSD. Silverman–Tate: proofs, exercises, aims at *proving* the foundational theorems. Rule: **read the Elliptic Tales chapter first as a preview, then Silverman–Tate.** The exception is Part III, which is read on its own after Chapter 4.

| Silverman–Tate | Elliptic Tales | Order & why |
|---|---|---|
| Intro, 1.1 | Prologue, Ch. 1 | ET first: motivation and degree |
| A.1–A.2 | Ch. 2–3 | ET first: gentler homogenization |
| A.3 (A.4) | Ch. 4–5 | ET first: multiplicity intuition |
| 1.2 | Ch. 6, 7, 8 §1 | ET Ch. 7 *is* the group detour |
| 1.3, App. B | Ch. 8 §2 | S–T is more complete |
| 1.4 | Ch. 8 §4–5 | Either order |
| 2.1–2.3 | Ch. 8 §3, §6 (topology) | ET for the torus picture |
| 2.4–2.5 | Ch. 10 §2 | ET states results; S–T proves them |
| 3.1–3.6 | Ch. 10 §1, §3–4 | ET first |
| 3.7 | Ch. 9 | ET has more on reduction types |
| 4.1–4.3 | Ch. 2 §5–6, Ch. 9 §6 | Then the Part III interlude |
| (after Ch. 4) | Ch. 11–15 | BSD unit: what S–T omits (L-functions, analytic rank) |
| 6.6 | Ch. 13–14 + *Fearless Symmetry* | Modularity background |

## 5. The Curriculum (56 lessons)

Each lesson page has a fixed template: **Hook → Goals → Prerequisite detour links → Exposition (intuition → formal) → Widgets → Reading card (S–T pages, ET chapter, 2–4-sentence preview, what to watch for) → Self-check → Exercises → "It's OK not to fully get this" flag → Where this leads.** Time estimates assume 6–8 h/week. "D" marks a detour lesson.

| # | Lesson (hook) | Read S–T | Read ET | Widgets |
|---|---|---|---|---|
| **Part 0 — Orientation (1 wk)** |||||
| 0 | Why rational points? The staircase line → conic → cubic | Preface, Intro xv–xxii | Prologue | W01, W60 |
| 1 | How to use this companion; the four passes | — | — | progress map |
| 2D | Rationals, gcd, lowest terms, Euclid | — | — | W02 |
| **Part I — Geometry & the group law (8–10 wks)** |||||
| 3 | Diophantus' trick: all Pythagorean triples from one line | 1–5 | Ch. 1 | W03, W04 |
| 4D | Congruences and Z/nZ | — | Ch. 2 §5–6 | W05 |
| 5 | Conics with no rational points; local obstructions | 5–8 | — | W06 |
| 6 | The projective plane: where parallel lines meet | 265–271 | Ch. 3 | W07, W08 |
| 7 | Curves in P²; homogenising; singular points | 271–280 | Ch. 3 §4–6 | W09 |
| 8 | Bezout: counting intersections honestly | 280–290 (skim 290–302) | Ch. 4–5 | W10 |
| 9D | Groups: what "adding points" must satisfy | — | Ch. 7 | W11 |
| 10 | Chord-and-tangent: the group law is born | 8–13 | Ch. 6, 8 §1 | W12, W13 |
| 11 | Why is it associative? Nine points on a cubic | 13–16 | — | W14 |
| 12 | Weierstrass normal form | 16–23, 311–315 | Ch. 8 §2 | W15, W16 |
| 13 | Explicit formulas; first big computations | 23–28 | Ch. 8 §4–5 | W17, W18 |
| 14 | Checkpoint I + Ch. 1 problem set | 28–34 | — | — |
| **Part II — Torsion (6–8 wks)** |||||
| 15D | Order of an element; cyclic groups | — | Ch. 7 | W19 |
| 16 | Points of order 2 and 3 (flexes) | 35–38 | — | W20 |
| 17 | Real points: one or two components; discriminant | 38–40, 45–47 | Ch. 8 §3 | W21, W22 |
| 18D | Complex numbers, lattices, periodic functions | Schwartz notes | Ch. 2 §1–4 | W23 |
| 19 | The complex torus and ℘ (first pass: accept) | 40–45 | Ch. 8 §6 | W24–W27 |
| 20D | p-adic valuation ord_p | — | — | W28 |
| 21 | Nagell–Lutz I: the subgroups C(p^ν) | 47–52 | — | W29 |
| 22 | Nagell–Lutz II: no torsion near O | 52–56 | — | W29 |
| 23 | Finding torsion in practice; Mazur's 15 groups | 56–58 | Ch. 10 §2 | W30, W31 |
| 24 | Checkpoint II + problems | 58–63 | — | — |
| **Part III — Mordell (8–10 wks)** |||||
| 25D | Homomorphisms, kernels, cosets, index, quotients | — | — | W32 |
| 26D | Finitely generated abelian groups; rank | — | Ch. 7, 10 §1 | W33 |
| 27 | Heights and the descent strategy | 65–71 | — | W34, W35 |
| 28 | Height of P + P₀ | 71–75 | — | W36 |
| 29 | Height of 2P | 75–80 | — | W36, W37 |
| 30 | The companion curve and the map α | 80–88 | — | W38, W39 |
| 31 | Mordell's theorem; the rank formula | 88–95 | Ch. 10 §3 | W40 |
| 32 | Computing ranks; congruent numbers | 95–106 | Ch. 10 §4, 15 §6 | W40, W41 |
| 33 | Singular cubics: the degenerate groups | 106–111 | Ch. 9 | W42 |
| 34 | Checkpoint III + problems | 111–115 | — | — |
| **Part IV — Finite fields (7–9 wks)** |||||
| 35D | F_p, primitive roots, quadratic residues | — | Ch. 2 §6 | W43 |
| 36 | Curves over F_p; Hasse's bound | 117–121 | — | W44–W46 |
| 37D | Cubic residues, Jacobi sums, Eisenstein integers | — | — | W47 |
| 38 | Gauss's theorem on x³ + y³ = 1 | 121–133 | — | W48 |
| 39 | Reduction mod p; torsion injects | 133–139, 302–305 | Ch. 9 §6 | W49 |
| 40 | Factoring: Pollard p−1 → Lenstra ECM | 139–152 | — | W50, W51 |
| 41 | Elliptic curve cryptography | 152–157 | — | W52, W53 |
| 42 | Interlude: L-functions and BSD | — | Ch. 11–15 | W54, W55 |
| 43 | Checkpoint IV + problems | 157–166 | — | — |
| **Part V — Integer points (5–7 wks)** |||||
| 44 | How many integer points? Siegel | 167–170 | — | W56 |
| 45 | Taxicabs and sums of two cubes | 170–176 | — | W57 |
| 46 | Diophantine approximation: Dirichlet → Roth | 176–182 | — | W58 |
| 47 | Auxiliary polynomial: construction (pigeonhole) | 182–190 | — | W59, W61 |
| 48 | Small, non-vanishing, contradiction | 190–202 | — | W61 |
| 49 | Checkpoint V + problems | 202–205 | — | — |
| **Part VI — CM, Galois, FLT (8–10 wks)** |||||
| 50D | Field extensions, degree, splitting fields | — | — | W62 |
| 51 | Galois groups; cyclotomic fields; Kronecker–Weber | 207–213 | — | W63 |
| 52 | Algebraic and torsion points; division polynomials | 213–221 | — | W64 |
| 53 | The Galois representation on E[n] | 221–230 | — | W65 |
| 54 | Complex multiplication; abelian extensions of Q(i) | 230–245 | — | W66 |
| 55 | Elliptic curves and Fermat's Last Theorem | 245–256 | Ch. 13–14; *Fearless Symmetry* | W67, W68 |
| 56 | Epilogue: what next (AEC, 18.783, LMFDB, Faltings) | 256–264 | Epilogue | W60 |

**"It's fine not to fully get this on pass 1":** lessons 11 (rigorous associativity), 19, 22, 29, 38, 47–48, 53–54. **Self-check pattern:** 3–5 questions per lesson, each with an instant-check widget (e.g. "is (2,3) on y² = x³ + 1? compute 2P"). **Pass mapping:** Pass 1 reads lesson pages only. Pass 2 adds the reading cards. Pass 3 unlocks the exercise companion. Pass 4 hides site solutions behind a "self-only mode".

## 6. Interactive Widget Catalogue (≈68)

Shared engine rules apply to all widgets: exact `Rational` (BigInt) arithmetic for every displayed coordinate; floating point only for drawing; the point at infinity O is drawn as a marker at the top edge plus a "∞" badge; vertical lines give O; tangents use implicit derivatives; singular curves (D = 0) show a warning, and group-law tools switch to the 3.7 model. Interaction works with touch, mouse and keyboard (arrow keys nudge, Enter steps), and every animation has a step-mode equivalent for reduced motion.

| ID | Lesson | What it shows / interaction / mathematics |
|---|---|---|
| W01 | 0 | Staircase: line, conic, cubic; tap a degree, see the solution "shape" |
| W02 | 2 | Euclid's algorithm as rectangle-tiling, with gcd readout |
| W03 | 3 | Line through (−1,0) with rational slope t = m/n sweeps the unit circle; shows (1−t²)/(1+t²), 2t/(1+t²) and the triple (n²−m², 2mn, n²+m²) |
| W04 | 3 | Same for any conic and any chosen rational base point |
| W05 | 4 | Clock arithmetic: multiplication tables mod n; inverses highlighted |
| W06 | 5 | Local obstruction: enter ax²+by²=cz²; tests mod p (and 8) for solutions; x²+y²=3 fails mod 3, with an explanation |
| W07 | 6 | Lines through the origin in R³ ↔ points of P²; the plane z=1 as a "window" |
| W08 | 6 | Sphere/horizon model: parallel lines meet at the horizon; drag a line's slope |
| W09 | 7 | Homogenise: type f(x,y), get F(X,Y,Z); switch chart z=1 / y=1 / x=1; points at infinity listed |
| W10 | 8 | Bezout: move a line/conic over a cubic; count real, complex and infinite intersections with multiplicity |
| W11 | 9 | Group axiom checker on small tables (Z/n, symmetries) |
| W12 | 10 | Chord-tangent on y² = x³+ax+b: drag P, Q; P∗Q, then reflect to P+Q; exact rational readout |
| W13 | 10 | Inverse and identity: vertical line to O; P + (−P) |
| W14 | 11 | Associativity: (P+Q)+R vs P+(Q+R) built live; nine-point Cayley–Bacharach overlay |
| W15 | 12 | Cubic → Weierstrass: step through the projective substitutions (App. B example) |
| W16 | 12 | Flex as base point: tangent with triple contact highlighted |
| W17 | 13 | Formula panel: λ, ν, x₃ = λ² − a − x₁ − x₂ with Vieta animation |
| W18 | 13 | Multiples nP: points marching; numerator/denominator digit counts; log h(nP) vs n² fit |
| W19 | 15 | Cyclic group clock: order of g in Z/n |
| W20 | 16 | Points of order 2 (y=0) and 3 (flexes, via the 3-division polynomial roots) |
| W21 | 17 | Morph y² = x³+ax+b with a, b sliders: egg + branch ↔ one branch; node/cusp when D = 0; (a,b)-plane showing the curve 4a³+27b² = 0 |
| W22 | 17 | Root collision: roots of x³+ax+b on the x-axis merge as D → 0 |
| W23 | 18 | Lattice Λ = Zω₁ + Zω₂; drag ω₂; fundamental parallelogram; tiling |
| W24 | 19 | Torus: glue parallelogram edges (Three.js), with z on the torus ↔ point on E |
| W25 | 19 | ℘-map: grid lines in C/Λ mapped to (℘, ℘′); addition z₁+z₂ vs chord-tangent side by side |
| W26 | 19 | n-torsion as n×n grid on the torus; E[n] ≅ (Z/n)² |
| W27 | 19 | Real points = 1 or 2 circles on the torus (rectangular vs rhombic lattice) |
| W28 | 20 | ord_p explorer: factor a rational, show ord_p; p-adic "closeness" bar |
| W29 | 21–22 | C(p^ν) filtration: points ordered by p-power in x-denominator; t = x/y; shows t(P₁+P₂) ≡ t(P₁)+t(P₂) mod higher powers |
| W30 | 23 | Nagell–Lutz finder: enter a, b (or x³+ax²+bx+c); lists y with y=0 or y² ∣ D, solves for integer x, then tests nP until O or non-integral |
| W31 | 23 | Mazur gallery: 15 groups with an example curve each (from LMFDB), Cayley-graph view |
| W32 | 25 | Cosets/quotients: Z → Z/4; kernel and image painted |
| W33 | 26 | Z^r ⊕ T lattice picture; generators vs relations |
| W34 | 27 | Height h(x = m/n) = log max(\|m\|,\|n\|); finitely many points below a height bound shown |
| W35 | 27 | Descent animation: P → (P − Qᵢ)/2 repeatedly; heights shrink to a finite box |
| W36 | 28–29 | Inequality stepper: h(P+P₀) ≤ 2h(P)+κ₀, h(2P) ≥ 4h(P)−κ, with measured constants |
| W37 | 29 | Canonical height: 4⁻ⁿ h(2ⁿP) converging |
| W38 | 30 | 2-isogeny φ: E → Ē, ψ: Ē → E; ψ∘φ = [2] verified on points |
| W39 | 30 | α: Γ → Q*/Q*², x ↦ x mod squares (b at (0,0)); table of images |
| W40 | 31–32 | Rank calculator (2-descent, 3.5–3.6): divisors b₁ of b; search N² = b₁M⁴+aM²e²+b₂e⁴; outputs found/obstructed/undecided; 2^r = #α·#ᾱ/4 |
| W41 | 32 | Congruent number: n ↔ y² = x³ − n²x; point ↔ triangle |
| W42 | 33 | Singular cubics: node y² = x²(x+1) with t = y/x ↦ multiplicative; cusp y² = x³ ↦ additive x/y |
| W43 | 35 | F_p* as a cycle (primitive root); squares highlighted |
| W44 | 36 | E(F_p) on a p×p grid (torus wrap); counts; Hasse interval [p+1−2√p, p+1+2√p] |
| W45 | 36 | Group law mod p: line drawn with wrap-around |
| W46 | 36 | a_p histogram over primes, normalised a_p/2√p vs semicircle (Sato–Tate), CM curve contrast |
| W47 | 37 | Cubic characters / Jacobi sum as vector sum of roots of unity |
| W48 | 38 | Gauss: count x³+y³=1 mod p, compute A, B with 4p = A²+27B² |
| W49 | 39 | Reduction: torsion of E(Q) mapped into E(F_p); injectivity for good p |
| W50 | 40 | Pollard p−1 stepper |
| W51 | 40 | ECM stepper: random curve mod n; inversion failure → gcd → factor (1715761513 = 26927 × 63719 demo) |
| W52 | 41 | ECDH toy: Alice/Bob keys on a small curve |
| W53 | 41 | Double-and-add vs naive; discrete log brute force timing |
| W54 | 42 | Partial Euler product ∏ N_p/p vs log scale (BSD heuristic), rank 0/1/2 curves |
| W55 | 42 | Modularity: a_p of 11a vs coefficients of q∏(1−qⁿ)²(1−q¹¹ⁿ)² |
| W56 | 44 | Integer vs rational points; changing the model changes "integer" |
| W57 | 45 | x³+y³ = N explorer; 1729 = 1³+12³ = 9³+10³ |
| W58 | 46 | Approximations p/q to ∛2: q^μ·\|∛2 − p/q\| for μ = 2, 2.5, 3 |
| W59 | 47 | Pigeonhole/Siegel's lemma: more unknowns than equations ⇒ small solution |
| W60 | 0, 56 | History timeline (Diophantus → 2026 records) |
| W61 | 47–48 | Thue proof flowchart: construct → small → non-vanishing → contradiction, with "exponent budget" |
| W62 | 50 | Tower Q ⊂ Q(√2) ⊂ Q(√2, i) with degrees |
| W63 | 51 | Roots of unity on the circle; Gal(Q(ζₙ)/Q) ≅ (Z/n)* permuting them |
| W64 | 52 | Division polynomial roots = x-coordinates of E[n] |
| W65 | 53 | Galois action on E[n] grid as 2×2 matrices mod n |
| W66 | 54 | CM: y² = x³+x, [i](x,y) = (−x, iy) as 90° rotation of the square lattice |
| W67 | 55 | FLT map: Frey curve → Ribet → Wiles → contradiction |
| W68 | 55 | a_p vs modular-form coefficients for conductor 11 |

**Prior art to learn from (not copy):** Corbellini's ECC series and HTML5 tools (addition over R and F_p, scalar multiplication). Its check-example is P = (1,2) + Q = (3,4) = (−3,2) on y² = x³ − 7x + 10, which is useful as an engine unit test.\[25\] Also: the ECvisual teaching tool (Michigan Tech), CrypTool's ECC Tutorial (29 interactive figures), animated-curves (GitHub), and LMFDB curve pages.\[26\]\[27\]\[28\] No existing interactive companion to Silverman–Tate was found, so this site would fill a real gap.

**Problem-specific visualisations:** circle-projection exercises (W03/W04); local-obstruction exercises (W06); torsion exercises (W30); rank exercises (W40); ECM exercises (W51); Cayley–Bacharach exercise in App. A (W14).

## 7. Exercises

**What is verified.** MIT OCW 18.704 (Fall 2004) posted problem sets and solutions keyed to the 1st edition.\[4\]\[29\] A student write-up on Academia.edu works several (1.11, 2.6, 2.7, 2.11, 3.5, 3.7, 3.9, A.5 in 1st-edition numbering).\[30\] The 1st-edition errata correct exercises on y² = x³ + dx torsion, a height exercise, ECM numerics, division polynomials, the ℘-map scaling and a Cayley–Bacharach exercise.\[5\] **2nd-edition numbering was not verified** (the 2nd edition "added some new exercises").\[2\] So every exercise card is generated at build time from the learner's PDF: paraphrase, ★ status, lesson, idea, three-rung hint ladder, solution (marked "complete" or "outline"), widget link.

**Model solutions (topics certainly present in Ch. 1–4):**
- *Rational points on x² + y² = 2 from (1,1).* Line y − 1 = t(x − 1). Substitute and divide by (x − 1): x = (t² − 2t − 1)/(t² + 1), y = (−t² − 2t + 1)/(t² + 1). Hint ladder: (1) one root of the quadratic is known; (2) use the sum of roots; (3) as above.
- *Conic with no rational point (x² + y² = 3).* Clear denominators to X² + Y² = 3Z² with gcd 1. Squares mod 3 are 0, 1, so 3 ∣ X and 3 ∣ Y, hence 3 ∣ Z, which is a contradiction.
- *Torsion of y² = x³ + dx.* 2-torsion is (0,0), plus two more points when −d is a square. Check y² ∣ 4d³. The Z/4Z case occurs for d = 4e⁴, e.g. y² = x³ + 4x has (2, ±4) of order 4, since 2(2,4) = (0,0). Verify the book's table in the 2nd edition.\[4\]
- *ECM by hand.* Pick a curve and point mod n, compute kP; a failed inversion gives gcd > 1.

**Recommended core set (pass 3):** for each chapter, the numerical exercises (computing sums, torsion, ranks, point counts) plus one proof exercise per section. **Extended set (pass 4):** all (∗) exercises. (∗∗) exercises are labelled "research-level/open — read, don't grind".\[31\]

## 8. Website Design and Technical Stack

**Recommendation: Astro + MDX + TypeScript islands.**
- *Why Astro:* it ships zero JS by default and hydrates only widgets, which keeps phones fast. It has an official GitHub Pages action (`withastro/action` + `actions/deploy-pages`; set `site` and `base`).\[32\]\[33\]\[34\] Content collections give typed lesson frontmatter.
- *Alternatives considered:* VitePress/Docusaurus (good docs, heavier widget story); Quarto (great for notebooks, weaker for custom interactivity).
- *Maths typesetting:* KaTeX at build time (`remark-math` + `rehype-katex`). KaTeX renders synchronously and supports server-side rendering, so there is no client typesetting cost. MathJax has broader TeX and accessibility coverage but is heavier; KaTeX emits MathML alongside HTML.\[35\]\[36\]
- *Graphics:* Canvas2D for curves and dense point plots; SVG for diagrams that need crisp labels; Three.js only for W07/W08/W24; D3 scales/axes; JSXGraph optional for construction-style geometry.
- *Pre-rendered clips:* Manim clips are optional "trailer" videos, but every concept must also be a live widget.
- *Maths engine (from scratch, `src/lib/math`):* `Rational` on BigInt with normalisation and gcd; `ModInt`; `CurveQ` and `CurveFp` (add, double, neg, mul with double-and-add, O handling); height; discriminant; `nagellLutz()`; `twoDescent()`; `countPoints(p)`; `ecm()`; `pollardPm1()`; division polynomials; ℘ via lattice sums for drawing. Tests use Vitest with known values (the curves above, Corbellini example, Mazur gallery curves, a_p of 11a, 1715761513 factorisation); Playwright handles screenshots and mobile viewports.
- *Try-it-yourself:* SageCell/Pyodide embeds are optional later. The native engine covers the book's computations.
- *UX:* mobile-first layout; 44-px touch targets; `prefers-reduced-motion` support; Okabe–Ito colour-blind-safe palette; dark/light themes; keyboard control; localStorage progress (lessons read, exercises attempted, pass number); a dependency-graph navigation page; reading cards; collapsible hint ladders (`<details>`); a glossary with hover cards; Pagefind search; print stylesheet; optional PWA.
- *Design principles:* Bret Victor's 2011 "Explorable Explanations" says an active reader "uses the author's argument as a springboard for critical thought". Each widget therefore guides attention to one phenomenon (Victor's distinction from isolated widgets).\[37\]\[38\] Follow Distill, Nicky Case, Ciechanowski and Red Blob Games: text and widget side by side on laptops, stacked on phones; "predict, then play" prompts.

## 9. Accuracy Safeguards

- **Verified in this report:** all worked examples in §2 (arithmetic checked by hand); Mazur's 15 groups; Hasse bound; the Gauss p = 7 check; the 1729 identity; Corbellini's example; 1715761513 = 26927 × 63719; Tate's 1961 lecture dates and content; Elliptic Tales chapter pages; Bhargava–Shankar 0.885.
- **To verify at build:** rank and torsion of every gallery curve via LMFDB; the sign convention in Gauss's theorem; a_p of 11a beyond p = 7.
- **Rank records — date-stamp and label conditional vs unconditional:**
  - ≥28 (Elkies 2006);\[39\]
  - ≥29 (Elkies–Klagsbrun, August 2024; per the Simons Collaboration, exactly 29 under GRH);
  - a rank-30 curve uploaded to ICARM's leaderboard by "ranksunbounded" (20 Aug 2026), which MathWorld says was later attributed to Claude working with Alpöge and Howell and is exactly 30 only under GRH + BSD;
  - 31 is the largest known lower bound as of 29 Aug 2026 per MathWorld, and ≥32 is cited in arXiv 2610.31925 (exact values conditional);
  - the largest unconditionally known exact rank is 20 (MathWorld: Elkies–Klagsbrun 2020).
- **Errata:** the official 2nd-edition errata (13 June 2024) **was not retrievable in this research**, and Claude Code must download and apply it.\[3\] Known 1st-edition issues to check:
  - the y² = x³ + dx torsion table (Z/4Z needs d = 4e⁴);\[5\]
  - the Nagell–Lutz figure and proof gap around the C(p^ν) argument;\[5\]
  - a missing non-split singular case in 3.7;\[5\]
  - an ECM worked-example table (correct factor 26927);\[5\]
  - smallest taxicab-type number with two representations as a difference of cubes (3367);\[5\]
  - division-polynomial formulas in a Ch. 6 exercise.\[5\]
- **Mark as conjecture:** BSD, Lang's conjecture, unbounded rank.

---

# PART B — CLAUDE CODE BUILD PROMPT

~~~markdown
# MASTER PROMPT — "Rational Points" Study Companion

## Purpose
Build a storytelling, animation-rich, interactive study companion to Silverman & Tate,
*Rational Points on Elliptic Curves* (2nd ed., Springer UTM 2015), read alongside
Ash & Gross, *Elliptic Tales* (Princeton 2012). Learner: Aditya, an engineer (calculus,
some real/complex analysis, a little group theory, good coordinate geometry; NO ring/field
theory, systematic number theory, projective geometry, Galois theory). Assume nothing else.
He studies in passes: (1) site alone, (2) site + reading cards, (3) + exercises,
(4) book + exercises alone. The site must be self-contained for pass 1.

## Source of truth
Save the research report as docs/research-report.md. Its curriculum table (56 lessons),
crosswalk, widget catalogue (W01–W68), exercise method and accuracy list are binding.
The learner's PDF is at docs/private/RPEC.pdf (git-ignored; never commit it).
Printed page N = PDF page N+23.

## Copyright rule (non-negotiable)
Never copy text, proofs, figures or exercise statements from either book. Write original
explanations; cite by section/page ("now read pp. 47–52"). Exercises: number + one-line
paraphrase + original hints/solutions. Read the PDF only to get page ranges and exact
exercise wording to paraphrase.

## Stack
Astro (latest) + MDX + TypeScript; Preact islands for widgets; KaTeX via remark-math/
rehype-katex at build time; Canvas2D/SVG; Three.js only for projective sphere and torus;
Vitest (engine), Playwright (mobile 390×844 and desktop 1440×900 screenshots);
Pagefind search; deploy with withastro/action + actions/deploy-pages to\[32\]\[40\]
https://nkaditya1729.github.io/<repo>/ (set `site` and `base`).

## Repository layout
src/content/lessons/NN-slug.mdx (frontmatter: id, part, title, hook, prereqs[], detour:boolean,
  readST:{pages, sections, preview}, readET:{chapters, preview}, widgets[], exercises[],
  firstPassOK:boolean, estHours)
src/content/exercises/ch{1..6,A}/E{n}.mdx (paraphrase, stars, lesson, idea, hints[3],
  solution, status: complete|outline|unverified, widget?)
src/content/glossary/*.md ; src/components/{ReadingCard,HintLadder,Callout,Glossary}.astro
src/widgets/Wxx-Name.tsx ; src/lib/math/{rational,modint,curveQ,curveFp,height,
  nagellLutz,descent,pointCount,ecm,divpoly,weierstrassP}.ts + tests
docs/{research-report.md, errata-2nd-ed.md, feedback-log.md, widget-spec/Wxx.md}

## Maths engine requirements
Exact BigInt rationals everywhere a number is displayed. Group law handles O, vertical
lines, doubling, 2-torsion, singular-curve rejection. Tests must include:
y²=x³−x (Z/2×Z/2, rank 0 via descent); y²=x³−43x+166 (Z/7 from (3,8));
y²=x³+1 (Z/6); 2(3,5)=(129/100,−383/1000) on y²=x³−2; integer points of y²=x³+17;
(1,2)+(3,4)=(−3,2) on y²=x³−7x+10; #E(F_p) within Hasse bound for all p<1000;
x³+y³=1 over F_7 has 6 affine points; ECM finds 26927 | 1715761513; a_p(11a) for
p≤50 equals q∏(1−qⁿ)²(1−q¹¹ⁿ)² coefficients. Cross-check curve data against LMFDB.

## Writing quality bar
Story hook → intuition → formal statement → proof idea → worked numbers. Every widget has
a full written explanation: what is drawn, what to try, what to notice, the exact maths,
edge cases. No undefined term: link a glossary entry or a detour lesson. Mark
"fine-not-to-get-yet" sections. Rigour: real mathematics, not hand-waving.

## UX
Mobile-first; touch + keyboard; prefers-reduced-motion → step mode; Okabe–Ito palette;
dark/light; localStorage progress + pass selector; dependency-graph page; print CSS.

## Phases (finish, test, screenshot, then stop and report before the next)
0. Scaffold, design system, deploy pipeline, maths engine + all tests green.
1. Lessons 0–14 + App. A content + widgets W01–W18 (complete, polished).
2. Lessons 15–24, W19–W31.   3. Lessons 25–34, W32–W42.
4. Lessons 35–43, W43–W55.   5. Lessons 44–49, W56–W61.   6. Lessons 50–56, W62–W68.
7. Exercise companion for all chapters (read statements from the PDF; paraphrase).
Acceptance per phase: tests pass; Lighthouse mobile perf ≥90, a11y ≥95; every widget
works by touch at 390px; every lesson has a reading card with verified page ranges;
no copied text (spot-check by diffing against the PDF text).

## Before Phase 3
Download the 2nd-ed errata (math.brown.edu/johsilve/RPEC/, "updated 13 June 2024"),
summarise in docs/errata-2nd-ed.md, and add "errata" callouts to affected lessons.

## Feedback loop
When I write "FEEDBACK: …", append to docs/feedback-log.md, then: new lesson → new MDX from
template + curriculum update; new widget → spec file + component + tests; new solution →
exercise MDX. Never break existing URLs.
~~~

**Recommended CLAUDE.md (repo root):** "Read docs/research-report.md first. Never copy book text. All displayed numbers come from src/lib/math with tests. Work one phase at a time; run `npm test` and the Playwright screenshots before declaring done. Keep the lesson template. Log every learner feedback item."

**Follow-up phase prompts:** "Continue with Phase N per CLAUDE.md; list widgets built, tests added, open questions." Use "FEEDBACK: …" messages for extensions.

## Caveats
- Exercise numbering and statements for the 2nd edition, and the 2nd-edition errata, could not be verified online; the build must source them from the PDF and Silverman's site.
- Elliptic Tales page numbers come from the publisher/library listings; paperback and hardcover printings may differ slightly.
- Several recommended resources (Lozano-Robledo, Pinter, Stillwell, Stewart, video series) are standard but were not re-verified here.
- Rank records are moving month to month; treat any number as dated.

## Sources

1. [Rational Points on Elliptic Curves](https://www.maa.org/press/maa-reviews/rational-points-on-elliptic-curves)
2. <https://www.ams.org/journals/bull/2017-54-04/S0273-0979-2017-01542-X/S0273-0979-2017-01542-X.pdf>
3. [Rational Points on Elliptic Curves](https://www.math.brown.edu/johsilve/RPECHome.html)
4. [7f9a2f70223d71735749788aa2cedf6f hw4 sols](https://ocw.mit.edu/courses/18-704-seminar-in-algebra-and-number-theory-rational-points-on-elliptic-curves-fall-2004/7f9a2f70223d71735749788aa2cedf6f_hw4_sols.pdf)
5. <https://www.mat.univie.ac.at/~baxa/RPECErrata.pdf>
6. [Link removed on 2026-11-24: the source was a site hosting a copy of the book.]
7. [15.3 Torsion group](https://web.math.pmf.unizg.hr/~duje/pdf/section15-3.pdf)
8. [Gerd Faltings Abel Prize Laureate 2026 Rational solutions](https://abelprize.no/sites/default/files/2026-03/Rational%20solutions.pdf)
9. [Classiﬁcation of Torsion Subgroups for Mordell Curves By Zachary Porat](https://www.math.union.edu/~hatleyj/student_theses/porat.pdf)
10. [The Conjecture of Birch and Swinnerton-Dyer (Overheads for a talk at Ohio](https://people.math.osu.edu/sinnott.1/BSwDtalk.pdf)
11. [Linear Algebra and Algebraic Geometry: A Matrix Construction for Classifying Families of Algebraic Curves with No Solutions in Z^+](https://arxiv.org/pdf/2609.27049)
12. [Elliptic-curve cryptography](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography)
13. [18.783 Elliptic Curves Lecture 1 Andrew Sutherland February 3, 2015](https://math.mit.edu/classes/18.783/2015/Lecture1.pdf)
14. [New record breaking elliptic curve reported — ICARM](https://icarm.io/news/new-record-breaking-elliptic-curve-reported/)
15. [The BSD conjecture is true for most elliptic curves](https://mattbaker.blog/2014/03/10/the-bsd-conjecture-is-true-for-most-elliptic-curves/)
16. [MATH 5020 - The Arithmetic of Elliptic Curves](https://alozano.clas.uconn.edu/math5020-elliptic-curves/)
17. [18.783 - Elliptic Curves](https://math.mit.edu/classes/18.783/2025/)
18. [Elliptic Tales: Curves, Counting, and Number Theory by Avner Ash](https://www.goodreads.com/book/show/13608772-elliptic-tales)
19. [(PDF) Computing integral points on Mordell's elliptic curves](https://www.researchgate.net/publication/28050687_Computing_integral_points_on_Mordell's_elliptic_curves)
20. [Link removed on 2026-11-24: the source was a site hosting a copy of the book.]
21. [3\. Elliptic curves Chapter 3 Elliptic curves](https://aghitza.github.io/teaching/2026ntc-elliptic.pdf)
22. [Elliptic Tales: Curves, Counting, and Number Theory by Avner Ash, Robert Gross, Paperback](https://www.barnesandnoble.com/w/elliptic-tales-avner-ash/1110918256)
23. [Elliptic Tales - Curves, Counting, and Number Theory](https://www.degruyterbrill.com/document/doi/10.1515/9781400841714/html?lang=en)
24. [Elliptic Tales : Curves, Counting, and Number Theory in SearchWorks catalog](https://searchworks.stanford.edu/view/13076117)
25. [Elliptic Curve Cryptography: a gentle introduction - Andrea Corbellini](https://andrea.corbellini.name/2015/05/17/elliptic-curve-cryptography-a-gentle-introduction/)
26. [ECC Tutorial and ECC Toolkit](https://www.cryptool.org/en/ctbook/ecc-tutorial/)
27. [(PDF) ECvisual: A visualization tool for elliptic curve based ciphers](https://www.researchgate.net/publication/254007467_ECvisual_A_visualization_tool_for_elliptic_curve_based_ciphers)
28. [GitHub - syncsynchalt/animated-curves: An animated visualization of elliptic curve cryptography · GitHub](https://github.com/syncsynchalt/animated-curves)
29. [hw2\_sols.pdf](https://ocw.mit.edu/courses/18-704-seminar-in-algebra-and-number-theory-rational-points-on-elliptic-curves-fall-2004/resources/hw2_sols/)
30. [(PDF) Rational Points on Elliptic Curves](https://www.academia.edu/8292969/Rational_Points_on_Elliptic_Curves)
31. [Link removed on 2026-11-24: the source was a site hosting a copy of the book.]
32. [Deploy your Astro Site to GitHub Pages](https://v5.docs.astro.build/en/guides/deploy/github/)
33. [A Practical Guide to Astro on GitHub Pages](https://varunjain.info/founders-guide/practical-astro-github-pages-guide/)
34. [Deploy your Astro Site to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/)
35. [How to Render LaTeX Equations for the Web — Methods Compared](https://formatex.io/educational/latex-equation-renderers-compared)
36. [KaTeX vs MathJax: Rendering Math in the Browser](https://reluchat.yunusemrevurgun.com/blog/katex-vs-mathjax-math-rendering/)
37. [Explorable explanation](https://en.wikipedia.org/wiki/Explorable_explanation)
38. [Lessons from Bret Victor](https://www.antoinebuteau.com/lessons-from-bret-victor/)
39. [Elliptic Curve Rank -- from Wolfram MathWorld](https://mathworld.wolfram.com/EllipticCurveRank.html)
40. [Deploy Astro Apps on GitHub Pages with Ease and Speed](https://www.go2share.net/article/astro-github-pages)
