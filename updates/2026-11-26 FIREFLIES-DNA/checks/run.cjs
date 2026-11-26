const pw = require('playwright-core');
const path = require('path');
const fs = require('fs');
// Run from the repo root: node "updates/2026-11-26 FIREFLIES-DNA/checks/run.cjs" [chrome|webkit]
// Needs playwright-core (npm install --no-save playwright-core). Screenshots go to .tmp-test/shots (git-ignored).
const ROOT = path.resolve(__dirname, '../../..');
const PAGE = 'file://' + path.join(ROOT, 'playground/fireflies-dna.html');
const SHOTS = path.join(ROOT, '.tmp-test/shots');
fs.mkdirSync(SHOTS, { recursive: true });
const which = process.argv[2] || 'chrome';
const out = [];
const ok = (c, msg) => out.push((c ? 'ok   ' : 'FAIL ') + msg);

// 1. Merlin's block is pasted unchanged.
(() => {
  const html = fs.readFileSync(path.join(ROOT, 'playground/fireflies-dna.html'), 'utf8');
  const doc = fs.readFileSync(path.join(__dirname, '../02-merlin-magic.md'), 'utf8');
  const inPage = html.split('<script id="dna-magic">')[1].split('</script>')[0].trim();
  const blocks = [...doc.matchAll(/```(?:js|javascript)\n([\s\S]*?)```/g)].map(m => m[1].trim());
  ok(blocks.some(b => b === inPage), "dna-magic block matches Merlin's doc block exactly");
})();

(async () => {
  const br = which === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch({ channel: 'chrome' });
  const run = async (opts, tag) => {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 800 }, ...opts });
    const pg = await ctx.newPage();
    pg.setDefaultTimeout(5000);
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
    await pg.goto(PAGE);
    await pg.waitForTimeout(800);
    await pg.screenshot({ path: `${SHOTS}/dna-${which}-${tag}-open.png` });
    ok(/24 events|12 events/.test(await pg.textContent('#foot')), `${tag} seeded history: ${await pg.textContent('#foot')}`);
    return { ctx, pg, errs };
  };
  const fps = pg => pg.evaluate(() => new Promise(res => {
    let n = 0, worst = 0, last = performance.now(); const t0 = last;
    const f = now => { worst = Math.max(worst, now - last); last = now; n++; if (now - t0 < 2000) requestAnimationFrame(f); else res({ fps: Math.round(n * 1000 / (now - t0)), worst: Math.round(worst) }); };
    requestAnimationFrame(f);
  }));

  // 2. Normal motion
  {
    const { ctx, pg, errs } = await run({}, 'normal');
    // hover a light
    const hit = await pg.evaluate(() => {
      const r = document.querySelector('#sky').getBoundingClientRect();
      return { x: r.left, y: r.top, w: r.width, h: r.height };
    });
    let found = false;
    for (let gy = 40; gy < hit.h - 40 && !found; gy += 12) for (let gx = 40; gx < hit.w - 40 && !found; gx += 12) {
      await pg.mouse.move(hit.x + gx, hit.y + gy);
      if (gx % 96 === 40) { await pg.waitForTimeout(20); found = await pg.evaluate(() => document.querySelector('#card').classList.contains('on')); }
    }
    ok(found, 'normal hover shows a card: ' + (found ? await pg.textContent('#card') : ''));
    if (found) await pg.screenshot({ path: `${SHOTS}/dna-${which}-hover.png` });
    await pg.mouse.move(2, 2);

    // add a file + events
    await pg.fill('#fname', 'travel/rail-trip-notes.md');
    await pg.click('#addFile');
    for (const k of ['edit', 'change', 'activity']) await pg.click(`[data-ev="${k}"]`);
    ok((await pg.textContent('#foot')).includes('13 files'), 'add file -> 13 files');
    ok(await pg.inputValue('#fname') !== 'travel/rail-trip-notes.md', 'name field gets a fresh suggestion');

    // build
    await pg.click('#build');
    await pg.waitForTimeout(2600);
    ok(await pg.isDisabled('#build') && (await pg.textContent('#build')) === 'Embeddings built', 'build -> disabled "Embeddings built"');
    await pg.screenshot({ path: `${SHOTS}/dna-${which}-built.png` });
    await pg.click('#addFile');
    ok((await pg.textContent('#build')) === 'Build embeddings (1 new)', 'add after build -> "(1 new)"');

    // replay / scrub
    await pg.click('#play');
    ok((await pg.textContent('#playTx')) === 'Pause', 'Replay -> Pause');
    await pg.waitForTimeout(4000);
    const mid = await pg.inputValue('#scrub');
    ok(+mid > 100 && +mid < 700, 'replay moves the cursor: ' + mid);
    await pg.screenshot({ path: `${SHOTS}/dna-${which}-replay.png` });
    await pg.click('#play');
    ok((await pg.textContent('#playTx')) === 'Play', 'Pause -> Play');
    const box = await pg.locator('#scrub').boundingBox();
    await pg.mouse.move(box.x + box.width * 0.3, box.y + box.height / 2);
    await pg.mouse.down();
    await pg.mouse.move(box.x + box.width * 0.6, box.y + box.height / 2, { steps: 8 });
    await pg.mouse.up();
    const w = await pg.textContent('#when');
    ok(w !== 'Now' && +(await pg.inputValue('#scrub')) > 450, 'scrub drag sets a time: ' + w);
    await pg.screenshot({ path: `${SHOTS}/dna-${which}-scrub.png` });
    await pg.click('[data-ev="edit"]');
    ok((await pg.textContent('#when')) === 'Now', 'adding while scrubbed jumps to Now');

    // sliders
    for (const [id, v] of [['minR', '2'], ['maxR', '7'], ['speed', '2'], ['rnd', '0.8'], ['chain', '1']]) {
      await pg.locator('#' + id).fill(v);
    }
    await pg.waitForTimeout(400);

    // stress: max size files
    await pg.locator('#fsize').fill('100');
    for (let i = 0; i < 30; i++) await pg.click('#addFile');
    await pg.click('#build');
    const foot = await pg.textContent('#foot');
    const lights = +foot.split(' ')[0];
    ok(lights >= 300, 'stress has 300+ lights: ' + foot);
    pg.on('crash', () => console.log('PAGE CRASHED\n' + out.join('\n')));
    await pg.waitForTimeout(1500);
    const f = await fps(pg).catch(e => { console.log(out.join('\n') + '\nerrs: ' + errs.join(' | ')); throw e; });
    ok(f.fps >= 50, `smooth at ${lights} lights: ${f.fps} fps, worst frame ${f.worst} ms`);
    await pg.screenshot({ path: `${SHOTS}/dna-${which}-stress.png` });

    // narrow
    await pg.setViewportSize({ width: 390, height: 844 });
    await pg.waitForTimeout(300);
    await pg.screenshot({ path: `${SHOTS}/dna-${which}-narrow.png`, fullPage: true });
    ok(await pg.evaluate(() => document.documentElement.scrollWidth <= 391), 'narrow: no sideways scroll');

    ok(!errs.length, 'normal: no console errors ' + errs.join(' | '));
    await ctx.close();
  }

  // 3. Reduced motion
  {
    const { ctx, pg, errs } = await run({ reducedMotion: 'reduce' }, 'reduce');
    const a = await pg.evaluate(() => document.querySelector('#sky').toDataURL());
    await pg.waitForTimeout(50);
    ok(await pg.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), 'reduce media query on');
    await pg.click('#addFile');
    await pg.waitForTimeout(1000);
    await pg.screenshot({ path: `${SHOTS}/dna-${which}-reduce.png` });
    ok(!errs.length && a.length > 1000, 'reduce: no console errors ' + errs.join(' | '));
    await ctx.close();
  }

  console.log(which + '\n' + out.join('\n'));
  await br.close();
  process.exit(out.some(l => l.startsWith('FAIL')) ? 1 : 0);
})();
