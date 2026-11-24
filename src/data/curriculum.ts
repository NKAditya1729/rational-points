/** The 56-lesson spine from docs/research-report.md §5. `slug` is set once a lesson is written. */
export interface LessonStub {
  id: number;
  title: string;
  detour?: boolean;
  slug?: string;
}
export interface Part {
  name: string;
  blurb: string;
  lessons: LessonStub[];
}

export const curriculum: Part[] = [
  {
    name: 'Part 0 · Orientation',
    blurb: 'What the question is, and how to use this companion.',
    lessons: [
      { id: 0, title: 'Why rational points? The staircase line → conic → cubic' },
      { id: 1, title: 'How to use this companion; the four passes' },
      { id: 2, title: 'Rationals, gcd, lowest terms, Euclid', detour: true },
    ],
  },
  {
    name: 'Part I · Geometry and the group law',
    blurb: 'Conics, the projective plane, and how points on a cubic learn to add.',
    lessons: [
      { id: 3, title: 'Diophantus’ trick: all Pythagorean triples from one line' },
      { id: 4, title: 'Congruences and Z/nZ', detour: true },
      { id: 5, title: 'Conics with no rational points; local obstructions' },
      { id: 6, title: 'The projective plane: where parallel lines meet' },
      { id: 7, title: 'Curves in the projective plane; homogenising; singular points' },
      { id: 8, title: 'Bezout: counting intersections honestly' },
      { id: 9, title: 'Groups: what “adding points” must satisfy', detour: true },
      { id: 10, title: 'Chord-and-tangent: the group law is born', slug: '10-chord-and-tangent' },
      { id: 11, title: 'Why is it associative? Nine points on a cubic' },
      { id: 12, title: 'Weierstrass normal form' },
      { id: 13, title: 'Explicit formulas; first big computations' },
      { id: 14, title: 'Checkpoint I and the Chapter 1 problem set' },
    ],
  },
  {
    name: 'Part II · Points of finite order',
    blurb: 'Torsion, the real and complex pictures, and the Nagell–Lutz theorem.',
    lessons: [
      { id: 15, title: 'Order of an element; cyclic groups', detour: true },
      { id: 16, title: 'Points of order 2 and 3 (flexes)' },
      { id: 17, title: 'Real points: one or two components; the discriminant' },
      { id: 18, title: 'Complex numbers, lattices, periodic functions', detour: true },
      { id: 19, title: 'The complex torus and ℘' },
      { id: 20, title: 'The p-adic valuation', detour: true },
      { id: 21, title: 'Nagell–Lutz I: a chain of subgroups' },
      { id: 22, title: 'Nagell–Lutz II: no torsion near O' },
      { id: 23, title: 'Finding torsion in practice; Mazur’s 15 groups' },
      { id: 24, title: 'Checkpoint II and problems' },
    ],
  },
  {
    name: 'Part III · Mordell’s theorem',
    blurb: 'Heights, descent, and why finitely many points generate all the rest.',
    lessons: [
      { id: 25, title: 'Homomorphisms, kernels, cosets, index, quotients', detour: true },
      { id: 26, title: 'Finitely generated abelian groups; rank', detour: true },
      { id: 27, title: 'Heights and the descent strategy' },
      { id: 28, title: 'The height of P + P₀' },
      { id: 29, title: 'The height of 2P' },
      { id: 30, title: 'The companion curve and the map α' },
      { id: 31, title: 'Mordell’s theorem; the rank formula' },
      { id: 32, title: 'Computing ranks; congruent numbers' },
      { id: 33, title: 'Singular cubics: the degenerate groups' },
      { id: 34, title: 'Checkpoint III and problems' },
    ],
  },
  {
    name: 'Part IV · Curves over finite fields',
    blurb: 'Counting points mod p, factoring integers, and cryptography.',
    lessons: [
      { id: 35, title: 'F_p, primitive roots, quadratic residues', detour: true },
      { id: 36, title: 'Curves over F_p; Hasse’s bound' },
      { id: 37, title: 'Cubic residues, Jacobi sums, Eisenstein integers', detour: true },
      { id: 38, title: 'Gauss’s theorem on x³ + y³ = 1' },
      { id: 39, title: 'Reduction mod p; torsion injects' },
      { id: 40, title: 'Factoring: Pollard p−1 → Lenstra’s ECM' },
      { id: 41, title: 'Elliptic curve cryptography' },
      { id: 42, title: 'Interlude: L-functions and the BSD conjecture' },
      { id: 43, title: 'Checkpoint IV and problems' },
    ],
  },
  {
    name: 'Part V · Integer points',
    blurb: 'Siegel and Thue: why integer solutions eventually run out.',
    lessons: [
      { id: 44, title: 'How many integer points? Siegel’s theorem' },
      { id: 45, title: 'Taxicabs and sums of two cubes' },
      { id: 46, title: 'Diophantine approximation: Dirichlet → Roth' },
      { id: 47, title: 'The auxiliary polynomial: construction' },
      { id: 48, title: 'Small, non-vanishing, contradiction' },
      { id: 49, title: 'Checkpoint V and problems' },
    ],
  },
  {
    name: 'Part VI · Complex multiplication, Galois, Fermat',
    blurb: 'Symmetries of torsion points, and the road to Fermat’s Last Theorem.',
    lessons: [
      { id: 50, title: 'Field extensions, degree, splitting fields', detour: true },
      { id: 51, title: 'Galois groups; cyclotomic fields; Kronecker–Weber' },
      { id: 52, title: 'Algebraic and torsion points; division polynomials' },
      { id: 53, title: 'The Galois representation on E[n]' },
      { id: 54, title: 'Complex multiplication; abelian extensions of Q(i)' },
      { id: 55, title: 'Elliptic curves and Fermat’s Last Theorem' },
      { id: 56, title: 'Epilogue: what next' },
    ],
  },
];
