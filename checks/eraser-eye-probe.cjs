// Eraser's eye-level probe for the 9 fixes: what creation-screen-check.cjs does not look at.
// Screenshots + pixel/geometry checks. Usage: node checks/eraser-eye-probe.cjs http://localhost:3505 <out dir>
const pw = require('playwright-core');
const path = require('path');
const fs = require('fs');
const base = process.argv[2] || 'http://localhost:3505';
const out = path.resolve(process.argv[3] || '.scratch-home/shots');
fs.mkdirSync(out, { recursive: true });
let fails = 0;
const ok = (c, l, x = '') => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + l + (x ? '  ' + x : '')); };
const drop = (page, n, x, y, prefix) => page.evaluate(({ n, x, y, prefix }) => {
  const dt = new DataTransfer();
  for (let k = 0; k < n; k++) dt.items.add(new File(['x'.repeat(1 + k)], `${prefix}${k}.md`));
  const at = { bubbles: true, cancelable: true, clientX: x, clientY: y, dataTransfer: dt };
  for (const t of ['dragenter', 'dragover', 'drop']) document.body.dispatchEvent(new DragEvent(t, at));
}, { n, x, y, prefix });
const centre = (page, sel) => page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await pw.chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1200, height: 820 } });
  await page.goto(base + '/new'); await wait(900);
  await drop(page, 40, 300, 300, 'field');
  for (let i = 0; i < 100 && !(await page.evaluate(() => window.creation.info().split)); i++) await wait(100);
  await wait(1500);
  const kn = await centre(page, '[data-section="knowledge"]');
  await drop(page, 7, kn.x, kn.y, 'notes-'); await wait(900);
  const sp = await centre(page, '[data-section="system-prompt"]');
  await drop(page, 5, sp.x, sp.y, 'voice-'); await wait(900);
  const sk = await centre(page, '[data-section="skills"]');
  await drop(page, 2, sk.x, sk.y, 'baking-'); await wait(1200);
  await page.screenshot({ path: path.join(out, '1-split.png') });

  // Fix 2: the field moves on its own (pixels), but gently; the menu dots drift.
  const field = async () => page.evaluate(() => { const c = document.querySelector('#flies'); return c.toDataURL(); });
  const menuPos = () => page.evaluate(() => [...document.querySelectorAll('[data-section="knowledge"] .flies i.d')].map(d => { const r = d.getBoundingClientRect(); return [r.left, r.top]; }));
  const f0 = await field(), m0 = await menuPos();
  await wait(3000);
  const f1 = await field(), m1 = await menuPos();
  ok(f0 !== f1, 'fix 2: the field canvas changes on its own over 3 s (fireflies move)');
  const moved = m0.map((p, i) => Math.hypot(p[0] - m1[i][0], p[1] - m1[i][1]));
  ok(moved.some(d => d > 0.3) && moved.every(d => d < 12), 'fix 2: menu dots drift a little, slowly', moved.map(d => d.toFixed(1)).join(','));
  // Shine: sample ::after opacity over 6 s; never above .4, never all at once.
  let peak = 0, allAtOnce = false;
  for (let i = 0; i < 30; i++) {
    const ops = await page.evaluate(() => [...document.querySelectorAll('#menu .flies i.d')].map(d => +getComputedStyle(d, '::after').opacity));
    peak = Math.max(peak, ...ops); if (ops.length > 1 && ops.every(o => o > .05)) allAtOnce = true;
    await wait(200);
  }
  ok(peak <= .4 && !allAtOnce, 'fix 2: shine stays dim and never all at once', 'peak ' + peak.toFixed(2));

  // Fix 9: nothing glowing beside the name.
  const nameBox = await page.evaluate(() => { const r = document.querySelector('#name').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const near = await page.evaluate(nb => [...document.querySelectorAll('#menu header *, #menu header')].filter(e => e.id !== 'name').map(e => e.tagName + '#' + e.id + '.' + e.className), nameBox);
  ok(near.length === 1 && near[0].startsWith('HEADER'), 'fix 9: the header holds the name only', JSON.stringify(near));
  await page.screenshot({ path: path.join(out, '2-name.png'), clip: { x: nameBox.x - 60, y: nameBox.y - 30, width: nameBox.w + 300, height: nameBox.h + 60 } });

  // Fix 3: no grab cursor anywhere dots are.
  const curs = await page.evaluate(() => [...document.querySelectorAll('#menu .flies i.d, #flies, #field')].map(e => getComputedStyle(e).cursor).filter(c => /grab|move/.test(c)));
  ok(curs.length === 0, 'fix 3: no grab or move cursor on any firefly', JSON.stringify(curs));

  // Fix 4: the skill name is visible without hover.
  const sk4 = await page.evaluate(() => [...document.querySelectorAll('#menu .sk-name')].map(n => { const s = getComputedStyle(n), r = n.getBoundingClientRect(); return [n.textContent, s.visibility, +s.opacity, r.width > 0]; }));
  ok(sk4.length >= 1 && sk4.every(s => s[0] && s[1] === 'visible' && s[2] > .9 && s[3]), 'fix 4: every skill name is readable without hover', JSON.stringify(sk4));

  // Fix 5: no row; Fix 6: staggered eased flight, names beside their own dot, no list panel.
  const K = '[data-section="knowledge"]';
  await page.click(K + ' .belt');
  await wait(120);
  await page.screenshot({ path: path.join(out, '3-midflight.png') });
  const delays = await page.evaluate(K => [...document.querySelectorAll(K + ' .flies i.d')].map(d => { const a = d.getAnimations().find(a => a.id === 'flight'); return a ? [a.effect.getTiming().delay, a.effect.getTiming().easing] : null; }), K);
  ok(delays.every(Boolean) && new Set(delays.map(d => d[0])).size > 1 && delays.every(d => d[1] !== 'linear'), 'fix 6: each dot flies, eased, staggered', JSON.stringify(delays));
  await wait(1200);
  await page.screenshot({ path: path.join(out, '4-open.png') });
  const pair = await page.evaluate(K => {
    const dots = [...document.querySelectorAll(K + ' .flies i.d')].map(d => d.getBoundingClientRect());
    const rows = [...document.querySelectorAll(K + ' .row')].map(r => r.querySelector('.fname').getBoundingClientRect());
    return rows.map((n, i) => { const d = dots[i]; return [Math.round(n.left - d.right), Math.round(Math.abs((n.top + n.height / 2) - (d.top + d.height / 2)))]; });
  }, K);
  ok(pair.length === 7 && pair.every(([dx, dy]) => dx >= 0 && dx < 30 && dy < 6), 'fix 6: each file name sits right beside its own firefly', JSON.stringify(pair));
  const panels = await page.evaluate(() => [...document.querySelectorAll('select, details, [role=listbox], [role=menu], ul, ol')].filter(e => e.getBoundingClientRect().height > 0).length);
  ok(panels === 0, 'fix 6: no list, drop-down or panel anywhere', String(panels));
  await page.click(K + ' .belt'); await wait(1200);
  await page.screenshot({ path: path.join(out, '5-closed.png') });

  // Fix 8: one way to rename the agent.
  const ways = await page.evaluate(() => [...document.querySelectorAll('button, a, input, [contenteditable]')].filter(e => /rename|name/i.test((e.getAttribute('aria-label') || '') + e.textContent + (e.title || '')) && !e.closest('dialog')).map(e => e.tagName + '#' + e.id + ' ' + (e.getAttribute('aria-label') || e.textContent).trim()));
  ok(ways.length === 1 && ways[0].startsWith('H1#name'), 'fix 8: the name itself is the only rename', JSON.stringify(ways));

  // Fix 1 + 7 on this fuller screen.
  const txt = await page.evaluate(() => document.body.innerText);
  ok(!/\d[\d,]* files?\b|waiting|\bused\b|out at next rebuild|processing|\bqueued\b|\d+\s*\/\s*\d+/i.test(txt), 'fix 1+7: no count or status words', (txt.match(/\d[\d,]* files?\b|waiting|\bused\b|out at next rebuild|processing|\bqueued\b|\d+\s*\/\s*\d+/i) || [''])[0]);

  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
