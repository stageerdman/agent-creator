// Eye probe for the three chat glitches: no dark box behind the messages, no shine behind Create,
// and the send dot lands in the new 'you' message (not the field) and is gone after.
// Usage: AGENT_CREATOR_HOME=<scratch> PORT=3506 node checks/mock-engine-server.mjs, then
//        node checks/chat-glitch-probe.cjs http://localhost:3506 <out dir>
const pw = require('playwright-core');
const path = require('path');
const fs = require('fs');
const base = process.argv[2] || 'http://localhost:3506';
const out = path.resolve(process.argv[3] || '.tmp-test/chat-glitch');
fs.mkdirSync(out, { recursive: true });
let fails = 0;
const ok = (c, l, x = '') => { if (!c) fails++; console.log((c ? 'PASS ' : 'FAIL ') + l + (x ? '  ' + x : '')); };
const wait = ms => new Promise(r => setTimeout(r, ms));

async function run(kind, reduced) {
  const tag = `${kind}${reduced ? ' reduced' : ''}`;
  const browser = await pw[kind].launch(kind === 'chromium' ? { channel: 'chrome' } : {});
  const page = await browser.newPage({ viewport: { width: 1200, height: 820 }, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const { id } = await fetch(base + '/api/agents', { method: 'POST' }).then(r => r.json());
  await page.goto(`${base}/new?agent=${id}`);
  await page.waitForSelector('#handle.in');
  await page.click('#handle'); await wait(500);

  // 1. no fill on the log or any wrapper between the panel and the messages
  const fills = await page.evaluate(() => {
    const p = document.querySelector('#sketcher'), seen = [];
    for (let el = document.querySelector('#sketcher-log'); el && el !== p; el = el.parentElement) {
      const s = getComputedStyle(el); if (s.backgroundColor !== 'rgba(0, 0, 0, 0)' || s.backgroundImage !== 'none') seen.push(el.id || el.tagName);
    }
    return seen;
  });
  ok(fills.length === 0, `1. ${tag}: no dark fill behind the messages`, JSON.stringify(fills));

  // 3. send: record the dot every frame, then compare where it ended with the new bubble's centre
  await page.fill('#sketcher-box', '{"name":"Probe"}');
  await page.evaluate(() => {
    window.__path = []; window.__bubble = null;
    new MutationObserver(() => { const d = document.querySelector('.send-fly'); if (!d || window.__last) return;
      const a = d.getAnimations().find(a => a.effect.getKeyframes().some(k => k.transform));
      if (a) { const k = a.effect.getKeyframes().pop().transform.match(/-?[\d.]+/g).map(Number); window.__last = { x: k[0], y: k[1] }; } }).observe(document.body, { childList: true });
    const tick = () => { const d = document.querySelector('.send-fly');
      if (d) { const r = d.getBoundingClientRect(); window.__path.push({ x: r.left + r.width / 2, y: r.top + r.height / 2 }); }
      const you = [...document.querySelectorAll('#sketcher-log > .you')].pop();
      if (you && !window.__bubble) { const r = you.getBoundingClientRect(); if (r.width) window.__bubble = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
      if (performance.now() < window.__t0 + 1500) requestAnimationFrame(tick); };
    window.__t0 = performance.now(); requestAnimationFrame(tick);
  });
  await page.keyboard.press('Enter');
  await wait(120); await page.screenshot({ path: path.join(out, `${tag.replace(' ', '-')}-in-flight.png`) });
  await wait(1600);
  const f = await page.evaluate(() => ({ path: window.__path, bubble: window.__bubble, last: window.__last, left: document.querySelectorAll('.send-fly').length,
    sky: (() => { const s = document.querySelector('#sky') || document.querySelector('#mark'); if (!s) return null; const r = s.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })() }));
  ok(f.left === 0, `3. ${tag}: the dot is gone after it lands`, `left=${f.left}`);
  if (reduced) ok(f.path.length === 0, `3. ${tag}: under Reduce Motion nothing flies`, `frames=${f.path.length}`);
  else {
    // the dot's last keyframe is where it lands (frame sampling stalls during screenshots); it is a 6px dot at -3px
    const end = f.last, d = end && f.bubble ? Math.hypot(end.x - f.bubble.x, end.y - f.bubble.y) : 999;
    ok(f.path.length > 0 && d < 24, `3. ${tag}: the dot ends in the new message's centre`, JSON.stringify({ frames: f.path.length, end, bubble: f.bubble, d: Math.round(d) }));
    ok(end && end.x < 460, `3. ${tag}: it never heads for the field`, JSON.stringify({ end, field: f.sky }));
  }

  // 2. Create: no glow on the form or the button, and nothing glowing where it was
  await page.fill('#sketcher-box', '{"name":"Probe","ready":true}'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.querySelector('#sketcher-create').hidden, null, { timeout: 8000 }).catch(() => {});
  await wait(600);
  const glow = await page.evaluate(() => {
    const cs = s => { const e = document.querySelector(s); return e ? getComputedStyle(e).boxShadow : 'missing'; };
    const pseudo = s => { const e = document.querySelector(s); return e ? ['::before', '::after'].map(p => getComputedStyle(e, p).content).filter(c => c !== 'none' && c !== 'normal') : []; };
    return { form: cs('#sketcher-form'), create: cs('#sketcher-create'), createShown: !document.querySelector('#sketcher-create').hidden,
      pseudos: [...pseudo('#sketcher-form'), ...pseudo('#sketcher-create')] };
  });
  ok(glow.form === 'none', `2. ${tag}: the form has no glow of its own`, glow.form);
  ok(!/rgba\(2(16|55), 2(42|55)/.test(glow.create), `2. ${tag}: Create casts no light`, glow.create);
  ok(glow.pseudos.length === 0, `2. ${tag}: no glow pseudo-elements on form or Create`, JSON.stringify(glow.pseudos));
  const P = await page.evaluate(() => { const r = document.querySelector('#sketcher').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
  await page.screenshot({ path: path.join(out, `${tag.replace(' ', '-')}-panel-with-create.png`), clip: P });
  await browser.close();
}

(async () => {
  await run('chromium', false);
  await run('chromium', true);
  await run('webkit', false);
  console.log(fails ? `${fails} FAILED` : 'ALL PASS', '| shots in', out);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e.stack); process.exit(1); });
