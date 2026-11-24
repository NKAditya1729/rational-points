import { expect, test } from '@playwright/test';

const LESSON = 'lessons/10-chord-and-tangent/';

/** Scroll to the widget and wait until its island has hydrated (Astro drops the `ssr` attribute). */
async function ready(page: import('@playwright/test').Page) {
  const w = page.locator('.w12');
  await w.scrollIntoViewIfNeeded();
  await page.locator('#w12 astro-island:not([ssr])').waitFor({ state: 'attached' });
  return w;
}

test('home lists the curriculum and links into the lesson under the base path', async ({ page }) => {
  await page.goto('');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Rational Points');
  await expect(page.locator('.lessons li')).toHaveCount(57);
  await page.goto('glossary/');
  await expect(page.locator('dl > div')).toHaveCount(14);
  await page.goto('');
  await page.getByRole('link', { name: /Open the sample lesson/ }).click();
  await expect(page).toHaveURL(/\/rational-points\/lessons\/10-chord-and-tangent\/$/);
});

test('lesson renders maths, has no sideways scroll, and no failed requests', async ({ page }, info) => {
  const failed: string[] = [];
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(LESSON);
  await expect(page.locator('.katex').first()).toBeVisible();
  await page.screenshot({ path: `docs/screenshots/lesson10-${info.project.name}-top.png` });
  await page.locator('#w12').scrollIntoViewIfNeeded();
  await expect(page.locator('.w12 svg')).toBeVisible();
  await page.locator('#w12 astro-island:not([ssr])').waitFor({ state: 'attached' });
  await page.waitForTimeout(700); // let the fade-in finish before the picture is taken
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  expect(failed).toEqual([]);
  expect(errors).toEqual([]);
  await page.locator('#w12').screenshot({ path: `docs/screenshots/lesson10-${info.project.name}-widget.png` });
  await page.screenshot({ path: `docs/screenshots/lesson10-${info.project.name}-full.png`, fullPage: true });
});

test('W12 shows (1,2) + (3,4) = (−3, 2) exactly, then handles tangent, O and singular cases', async ({ page }) => {
  await page.goto(LESSON);
  const w = await ready(page);
  const result = w.locator('.result-strip .val');
  await expect(result).toHaveText('(−3, 2)');
  await expect(w.locator('.readout .result dd')).toHaveText('(−3, 2)');

  // stepping back and forward (the forward step animates, then settles)
  await w.getByRole('button', { name: '← Back' }).click();
  await expect(w.locator('.caption')).toContainText('Step 2');
  await w.getByRole('button', { name: 'Next step →' }).click();
  await expect(w.locator('.caption')).toContainText('Step 3');
  await expect(w.locator('.pt.sum')).toBeVisible();

  // replay runs through all steps by itself and ends on step 3
  await w.getByRole('button', { name: /Replay/ }).click();
  await expect(w.locator('.caption')).toContainText('Two points');
  await expect(w.locator('.caption')).toContainText('Step 3', { timeout: 8000 });

  // tangent: 2(1,2) = (−1, −4)
  await w.getByRole('button', { name: 'Set Q = P' }).click();
  await expect(result).toHaveText('(−1, −4)');

  // doubling (3,5) on y² = x³ − 2
  await w.getByRole('button', { name: 'y² = x³ − 2' }).click();
  await expect(result).toContainText('129');
  await expect(result).toContainText('1000');
  // repeated adding keeps the layout intact with huge numbers
  for (let i = 0; i < 6; i++) await w.getByRole('button', { name: /^Move P to/ }).click();
  await expect(w.locator('.note', { hasText: 'too long to show' })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);

  // vertical tangent: 2·(−1,0) on y² = x³ − x is O
  await w.getByRole('button', { name: 'y² = x³ − x' }).click();
  await expect(result).toHaveText('(0, 0)');
  await w.getByRole('button', { name: 'Set Q = P' }).click();
  await expect(result).toContainText('O, the point at infinity');

  // singular curve a = −3, b = 2
  await w.getByRole('button', { name: 'Custom' }).click();
  const sliders = w.locator('input[type=range]');
  await sliders.nth(0).fill('-3');
  await sliders.nth(1).fill('2');
  await expect(w.locator('.warn')).toContainText('Singular curve');
});

test('choose your own O: exact value, and O is the identity', async ({ page }) => {
  await page.goto(LESSON);
  const w = await ready(page);
  const result = w.locator('.result-strip .val');
  await w.getByRole('button', { name: 'Choose your own O' }).click();
  await expect(w.locator('.handle.o')).toBeVisible();
  // (1,2) + (3,4) with O = (2,2) is (41/25, 214/125)
  await expect(result).toContainText('41');
  await expect(result).toContainText('214');
  await expect(result).toContainText('125');
  await expect(w.locator('.caption')).toContainText('line through O');

  // drag Q onto O = (2, 2): the answer must be P = (1, 2)
  const box = (await w.locator('svg').boundingBox())!;
  const vb = await w.locator('svg').evaluate((el) => {
    const g = el.querySelector('.handle.o .pt')!.getBoundingClientRect();
    return { x: g.x + g.width / 2, y: g.y + g.height / 2 };
  });
  const q = (await w.locator('.handle.q .pt').boundingBox())!;
  await page.mouse.move(q.x + q.width / 2, q.y + q.height / 2);
  await page.mouse.down();
  await page.mouse.move(vb.x, vb.y, { steps: 8 });
  await page.mouse.up();
  expect(box.width).toBeGreaterThan(0);
  await expect(result).toHaveText('(1, 2)');

  // back to O at infinity restores the mirror rule
  await w.getByRole('button', { name: 'O at infinity' }).click();
  await expect(w.locator('.handle.o')).toHaveCount(0);
});

test('keyboard moves a point; dragging snaps; tapping a hollow dot moves the active point', async ({ page }) => {
  await page.goto(LESSON);
  const w = await ready(page);
  const result = w.locator('.result-strip .val');
  const q = w.locator('.handle.q');
  await q.focus();
  await page.keyboard.press('ArrowRight');
  await expect(w.locator('.readout')).toContainText('≈');

  // drag Q onto the hollow dot at (−3, 2); its screen position is read from the page
  const dotAt = async (title: string) => {
    const b = (await w.locator('.pool', { has: page.locator(`title:text-is("${title}")`) }).locator('.dot').boundingBox())!;
    return [b.x + b.width / 2, b.y + b.height / 2] as const;
  };
  const from = (await q.locator('.pt').boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  const [tx, ty] = await dotAt('Rational point (−3, 2). Tap to move Q here.');
  await page.mouse.move(tx, ty, { steps: 8 });
  await page.mouse.up();
  await expect(result).toHaveText('(2, −2)'); // (1,2) + (−3,2)

  // tap the dot at (3, 4): Q is still the active point, so we are back to (−3, 2)
  const [ux, uy] = await dotAt('Rational point (3, 4). Tap to move Q here.');
  await page.mouse.click(ux, uy);
  await expect(result).toHaveText('(−3, 2)');
});

test('answer checker diagnoses the common mistakes', async ({ page }) => {
  await page.goto(LESSON);
  const form = page.locator('form.answer').first();
  await form.scrollIntoViewIfNeeded();
  await page.locator('astro-island[component-url*="AnswerCheck"]:not([ssr])').first().waitFor({ state: 'attached' });
  const x = form.getByLabel('x-coordinate of your answer');
  const y = form.getByLabel('y-coordinate of your answer');
  const verdict = form.locator('.verdict');
  const tryAnswer = async (a: string, b: string) => { await x.fill(a); await y.fill(b); await form.getByRole('button', { name: 'Check' }).click(); };

  await tryAnswer('2', '2');
  await expect(verdict).toContainText('reflect it');
  await tryAnswer('2', '3');
  await expect(verdict).toContainText('not on the curve');
  await tryAnswer('1', '2');
  await expect(verdict).toContainText('not the sum');
  await tryAnswer('two', '2');
  await expect(verdict).toContainText('whole number or a fraction');
  await tryAnswer('2', '−2');
  await expect(verdict).toHaveText('Correct.');
});

test('glossary card, predict prompt, pass selector and progress', async ({ page }) => {
  await page.goto(LESSON);
  // glossary term opens a definition card
  await page.getByRole('button', { name: 'rational point', exact: true }).first().click();
  await expect(page.locator('.term-card:popover-open')).toContainText('both rational numbers');
  await page.keyboard.press('Escape');

  // hint ladders: 4 questions, hints and answers folded until opened
  await expect(page.locator('.ladder')).toHaveCount(4);
  await expect(page.locator('.ladder details.hint')).toHaveCount(15);
  const firstQ = page.locator('.ladder').first();
  await expect(firstQ.getByText('The third root is')).toBeHidden();
  await firstQ.getByText('Hint 3').click();
  await expect(firstQ.getByText('The third root is')).toBeVisible();
  await expect(firstQ.locator('details.hint .katex').first()).toBeAttached();

  // predict: explanation hidden until a choice is made
  const predict = page.locator('fieldset.predict').first();
  await expect(predict.locator('.why')).toBeHidden();
  await predict.getByText('It becomes the tangent line at P').click();
  await expect(predict.locator('.verdict')).toHaveText('Yes.');
  await expect(predict.locator('.why')).toBeVisible();

  // pass 1 (default): reading card folded; pass 2: open; pass 4: hints hidden
  const card = page.locator('details.reading-wrap');
  await expect(card).not.toHaveAttribute('open', '');
  await page.locator('#pass-select').selectOption('2');
  await expect(card).toHaveAttribute('open', '');
  await expect(card).toContainText('pp. 8–13');
  await page.locator('#pass-select').selectOption('4');
  await expect(page.locator('.ladder details.hint').first()).toBeHidden();
  await page.reload();
  await expect(page.locator('#pass-select')).toHaveValue('4');
  await page.locator('#pass-select').selectOption('1');

  // the reading card comes before the self-check
  const order = await page.evaluate(() => {
    const card = document.querySelector('details.reading-wrap')!;
    const check = [...document.querySelectorAll('h2')].find((h) => h.textContent?.includes('Check yourself'))!;
    return !!(card.compareDocumentPosition(check) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
  await expect(page.getByText('Style prototype')).toHaveCount(0);

  // prerequisite chips are links; progress persists
  await expect(page.locator('a.chip').first()).toHaveAttribute('href', /#lesson-8$/);
  const btn = page.locator('#mark-read');
  await btn.click();
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  await page.goto('');
  await expect(page.locator('[data-lesson="10"] .done')).toBeVisible();
});
