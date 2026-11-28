// Browser check for the Left Side: the mess gathering into the likeness, the Sketcher handle and panel.
// Usage: node checks/left-side-check.cjs http://localhost:3505 --home <scratch home>
// Needs playwright-core (npm install --no-save playwright-core).
//
// It CREATES an agent and marks its files used, so point it at the real server with only the CLI
// faked (step 9 talks to the real chat route), started with a scratch home:
//   AGENT_CREATOR_HOME=<scratch folder> PORT=3505 node checks/mock-engine-server.mjs
// and pass the same folder as --home (used only to mark files used: there is no endpoint for that yet).
const pw = require('playwright-core');
const path = require('path');
const base = process.argv[2] || 'http://localhost:3505';
const hi = process.argv.indexOf('--home');
const home = hi > 0 ? path.resolve(process.argv[hi + 1]) : null;
let fails = 0;
const ok = (cond, label, extra = '') => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + label + (extra ? '  ' + extra : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const until = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await fn()) return Date.now() - t0; } catch {} await sleep(80); } return -1; };
const linfo = page => page.evaluate(() => window.leftSide.info());
const dropFiles = (page, n, x, y) => page.evaluate(({ n, x, y }) => {
  const dt = new DataTransfer();
  for (let k = 0; k < n; k++) dt.items.add(new File(['x'.repeat(1 + (k % 50))], `n${k}.md`, { type: 'text/markdown' }));
  const at = { bubbles: true, cancelable: true, clientX: x, clientY: y, dataTransfer: dt };
  document.body.dispatchEvent(new DragEvent('dragenter', at));
  document.body.dispatchEvent(new DragEvent('dragover', at));
  document.body.dispatchEvent(new DragEvent('drop', at));
}, { n, x, y });
// How much of the likeness is lit on screen: bright pixels on #mark, times its on-screen scale²
// (the mark grows as it fills by a CSS scale, which the canvas's own pixels don't see).
const lit = page => page.evaluate(() => {
  const c = document.querySelector('#mark'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const m = new DOMMatrix(getComputedStyle(c).transform === 'none' ? undefined : getComputedStyle(c).transform), s = Math.hypot(m.a, m.b);
  let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 60 && d[i] + d[i + 1] + d[i + 2] > 300) n++;
  return n * s * s;
});
const litOver = async (page, ms = 3000, every = 100) => {
  let sum = 0, n = 0;
  for (const t0 = Date.now(); Date.now() - t0 < ms; n++) { sum += await lit(page); await sleep(every); }
  return Math.round(sum / Math.max(1, n));
};
const markPixels =page => page.evaluate(() => { const c = document.querySelector('#mark'); return Array.from(c.getContext('2d').getImageData(0, 0, c.width, c.height).data.filter((_, i) => i % 97 === 0)).join(','); });
const focused = page => page.evaluate(() => document.activeElement && document.activeElement.id);

(async () => {
  if (!home) { console.log('FAIL needs --home <scratch home> (the same folder the server uses)'); process.exit(1); }
  const { createAgentStore, createAgents } = await import(path.join(__dirname, '..', 'src', 'creator', 'index.mjs'));
  const store = createAgentStore({ home });
  const agents = createAgents({ store, engine: {} });
  agents.seedChat = (id, chat) => store.saveDraft(id, { chat });   // no endpoint writes a chat without the AI
  if (process.env.ARROW_ONLY) {   // ARROW_ONLY=<agent id>: just step 10, for a quick look at the arrow
    for (const kind of ['chromium', 'webkit']) for (const [w, h] of [[1200, 820], [390, 700]]) await arrowLine(kind, w, h, process.env.ARROW_ONLY);
    console.log(fails ? `${fails} FAILED` : 'ALL PASS'); process.exit(fails ? 1 : 0);
  }
  if (process.env.GLASS_ONLY) {   // GLASS_ONLY=<agent id with a chat>: just step 11
    for (const kind of ['chromium', 'webkit']) for (const [w, h] of [[1200, 820], [390, 700]]) await glassCheck(kind, w, h, process.env.GLASS_ONLY);
    console.log(fails ? `${fails} FAILED` : 'ALL PASS'); process.exit(fails ? 1 : 0);
  }
  for (let attempt = 1; ; attempt++) {
    fails = 0; let lost = false;
    try { await run(agents, () => lost, v => { lost = v; }); return; }
    catch (e) {
      await sleep(300);
      if (/has been closed/.test(String(e && e.message))) lost = true;
      if (!lost || attempt >= 4) { console.error(e); process.exit(1); }
      console.log(`!! Chrome was closed from outside the check (attempt ${attempt}); starting over`);
    }
  }
})();

async function run(agents, isLost, setLost) {
  {
  console.log('== chrome against ' + base);
  const errors = [];
  const watch = page => { page.on('pageerror', e => errors.push(e.message)); page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(r.status() + ' ' + r.url()); }); };
  // Chrome here gets quit from outside ~25 s after it starts, so each long part opens a fresh one.
  let browser = null, page = null;
  const launch = async () => {
    if (browser) { browser.removeAllListeners('disconnected'); await Promise.race([browser.close().catch(() => {}), sleep(3000)]); }
    browser = await pw.chromium.launch({ channel: 'chrome' });
    if (process.env.TRACE) console.log('.. fresh chrome');
    setLost(false); browser.on('disconnected', () => setLost(true));
    page = await browser.newPage({ viewport: { width: 1200, height: 820 } });
    watch(page);
  };
  await launch();

  /* ---------- 1. From Start: a drop makes the agent, the handle slides in ---------- */
  await page.goto(base + '/'); await page.waitForTimeout(700);
  if (!(await page.evaluate(() => !!window.leftSide))) { await page.goto(base + '/new'); await page.waitForTimeout(700); }
  ok(await page.evaluate(() => !!window.leftSide), '1. the Left Side is on the page reached from Start', page.url());
  await dropFiles(page, 40, 300, 300);
  ok(await until(async () => (await linfo(page)).handle.shown, 8000) >= 0, '1. after a drop the handle slides in');
  let L = await linfo(page);
  const id = L.agent;
  ok(!!id && L.applied === 0, '1. nothing used yet: the likeness is still empty', JSON.stringify({ id, applied: L.applied }));
  ok(!L.panel.open && L.panel.hidden, '1. the panel starts closed');

  /* ---------- 2. Click opens, Esc closes and stays on the screen ---------- */
  const url = page.url();
  await page.click('#handle'); await page.waitForTimeout(500);
  L = await linfo(page);
  ok(L.panel.open && (await focused(page)) === 'sketcher-box', '2. click on the handle opens Sketcher, the box has focus', await focused(page));
  ok(await page.evaluate(() => document.querySelector('#handle').getAttribute('aria-expanded') === 'true'), '2. handle says aria-expanded=true');
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  L = await linfo(page);
  ok(!L.panel.open && L.panel.hidden && page.url() === url, '2. Esc closes it and stays on the screen', page.url());
  ok((await focused(page)) === 'handle', '2. focus goes back to the handle', await focused(page));

  /* ---------- 3. Keyboard, and one arrow that slides out with the panel and closes it ---------- */
  const arrow = () => page.evaluate(() => {
    const h = document.querySelector('#handle'), c = h.querySelector('.chev'), p = document.querySelector('#sketcher').getBoundingClientRect(), r = h.getBoundingClientRect();
    return { top: Math.round(r.top), left: Math.round(r.left), panelRight: Math.round(p.right), flip: getComputedStyle(c).transform, label: h.getAttribute('aria-label') };
  });
  const shut = await arrow();
  await page.focus('#handle'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  ok((await linfo(page)).panel.open, '3. Enter on the focused handle opens it');
  const out = await arrow();
  ok(out.top === shut.top, '3. open: the arrow is at the very same height as when closed', JSON.stringify({ shut, out }));
  ok(Math.abs(out.left - out.panelRight) <= 1 && out.left > shut.left, '3. open: the arrow rode out to the panel edge', JSON.stringify(out));
  ok(/^matrix\(-1/.test(out.flip) && out.label === 'Close Sketcher', '3. open: the arrow points back (‹) and is named Close Sketcher', JSON.stringify(out));
  ok(await page.evaluate(() => !document.querySelector('#sketcher-close')), '3. there is no second close arrow in the panel');
  await page.mouse.click(out.left + 20, out.top + 24); await page.waitForTimeout(500);
  const back = await arrow();
  ok(!(await linfo(page)).panel.open && back.top === shut.top && back.left === shut.left && !/^matrix\(-1/.test(back.flip), '3. a click on the same spot closes it; the arrow is back where it was, pointing ›', JSON.stringify(back));
  await page.focus('#handle');
  await page.keyboard.press('Space'); await page.waitForTimeout(500);
  ok((await linfo(page)).panel.open, '3. Space on the handle opens it');
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);

  /* ---------- 4. Files used: the mess gathers into the likeness ---------- */
  const a = await (await fetch(`${base}/api/agents/${id}`)).json();
  const paths = a.dna.map(f => f.id);
  await agents.assign(id, 'knowledge', a.dna.map(f => ({ path: f.id, name: f.name, size: f.sizeBytes })));
  const steps = [];
  const visit = async () => { await launch(); await page.goto(`${base}/new?agent=${id}`); await until(async () => (await linfo(page)).handle.shown, 6000); await page.waitForTimeout(800); };
  // What the eye sees: lit pixels, averaged over 3 s (two or more beats), so one frame's blinks can't decide it.
  // Watched live as the files are used; if Chrome is quit from outside mid-step, that step is read again on a fresh visit.
  const measure = async (want, live) => {
    for (let k = 0; k < 3; k++) {
      try {
        if (live && k === 0) {
          await until(async () => (await page.evaluate(() => window.creation.info())).field && (await linfo(page)).flown >= want, 6000);
          await page.waitForTimeout(1800);   // the flights land and the mark has grown (600 ms)
        } else if (k > 0 || !page) await visit();
        const now = await litOver(page);
        return { now, info: await linfo(page), fresh: k > 0 };
      } catch (e) { if (!/has been closed/.test(String(e && e.message))) throw e; console.log('.. chrome quit from outside: reading this step on a fresh visit'); }
    }
    throw new Error('has been closed (three times in one step)');
  };
  await visit();
  let before = (await measure(0, false)).now;
  for (const share of [.25, .5, 1]) {
    await agents.markProcessed(id, 'knowledge', paths.slice(0, Math.round(paths.length * share)));
    const want = Math.round(paths.length * share);
    const { now, info } = await measure(want, true);
    steps.push({ share, litPixels: now, placed: info.mark.placed, applied: info.applied, flown: info.flown });
    ok(now > before && info.flown >= want, `4. at ${share * 100}% used the likeness is brighter on screen than before`, JSON.stringify(steps[steps.length - 1]) + ' before=' + before);
    before = now;
  }
  L = await linfo(page);
  ok(L.shown === L.live && L.live > 0, '4. all used: the whole likeness is shown', JSON.stringify({ shown: L.shown, live: L.live }));

  /* ---------- 5. Reduced motion: still mark, panel without sliding ---------- */
  await launch();
  const rp = page;
  await rp.emulateMedia({ reducedMotion: 'reduce' });
  await rp.goto(`${base}/new?agent=${id}`);
  await until(async () => (await linfo(rp)).handle.shown, 6000);
  // Under Reduce Motion dots still turn on one by one, then the mark rests: wait for the rest, then it must hold for a second.
  let last = await markPixels(rp);
  await until(async () => { await sleep(400); const p = await markPixels(rp), same = p === last; last = p; return same; }, 8000);
  const p1 = await markPixels(rp); await rp.waitForTimeout(1000); const p2 = await markPixels(rp);
  ok(p1 === p2, '5. reduced motion: the likeness stands still', p1 === p2 ? '' : JSON.stringify({ a: p1.length, b: p2.length, diff: p1.split(',').filter((v, i) => v !== p2.split(',')[i]).length }));
  await rp.click('#handle');
  const tf = await rp.evaluate(() => { const s = getComputedStyle(document.querySelector('#sketcher')); return { t: s.transform, d: s.transitionDuration }; });
  ok((tf.t === 'none' || tf.t === 'matrix(1, 0, 0, 1, 0, 0)'), '5. reduced motion: the panel is there at once, no slide', JSON.stringify(tf));
  await rp.emulateMedia({ reducedMotion: null });

  /* ---------- 6. Small screen ---------- */
  const sp = page;
  await sp.setViewportSize({ width: 390, height: 700 });
  await sp.goto(`${base}/new?agent=${id}`);
  await until(async () => (await linfo(sp)).handle.shown, 6000);
  await sp.waitForTimeout(500);
  const hr = await sp.evaluate(() => { const r = document.querySelector('#handle').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  ok(hr.x >= 0 && hr.y >= 0 && hr.x + hr.w <= 390 && hr.y + hr.h <= 700 && hr.w >= 24 && hr.h >= 44, '6. small screen: the handle is on screen and big enough to tap', JSON.stringify(hr));
  await sp.click('#handle'); await sp.waitForTimeout(600);
  const pw2 = await sp.evaluate(() => document.querySelector('#sketcher').getBoundingClientRect().width);
  ok((await linfo(sp)).panel.open && Math.round(pw2) === 390 - 2 * 8, '6. small screen: a tap opens the panel across the whole width less an 8px gap each side', String(pw2));
  const hr2 = await sp.evaluate(() => { const r = document.querySelector('#handle').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width }; });
  ok(Math.round(hr2.y) === Math.round(hr.y) && hr2.x + hr2.w <= 390, '6. small screen: the open arrow stays on screen at the same height', JSON.stringify(hr2));
  const lr = await sp.evaluate(() => Math.round(document.querySelector('#sketcher-log').getBoundingClientRect().right));
  ok(lr <= Math.floor(hr2.x), '6. small screen: the chat ends before the arrow, no words hide under it', JSON.stringify({ logRight: lr, arrowLeft: hr2.x }));
  await sp.click('#handle'); await sp.waitForTimeout(600);
  ok(!(await linfo(sp)).panel.open, '6. small screen: the same arrow (‹) closes it');

  /* ---------- 8. "move outstanding files to knowledge": each file glows on its own allocate and flies to Knowledge ---------- */
  // The chat route stands in for the AI only: it really moves the files (agents.assign, as the server's
  // routeFiles would), then answers with the server's own events, one allocate per file.
  await launch();
  await page.goto(base + '/new'); await page.waitForTimeout(700);
  await dropFiles(page, 6, 300, 300);
  await until(async () => (await linfo(page)).handle.shown, 8000);
  const id2 = (await linfo(page)).agent;
  const b = await (await fetch(`${base}/api/agents/${id2}`)).json();
  const sent = [];
  await page.route('**/api/agents/*/chat', async route => {
    const body = JSON.parse(route.request().postData() || '{}'); sent.push(body.message);
    await agents.assign(id2, 'knowledge', b.dna.map(f => ({ path: f.id, name: f.name, size: f.sizeBytes })));
    const ev = (e, d) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`;
    await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body:
      ev('delta', { text: 'Moving them to Knowledge.' }) + ev('files', {}) +
      b.dna.map(f => ev('allocate', { file: f.id, section: 'knowledge' })).join('') + ev('done', { say: 'Moving them to Knowledge.' }) });
  });
  await page.click('#handle'); await page.waitForTimeout(500);
  await page.fill('#sketcher-box', 'move outstanding files to knowledge');
  await page.keyboard.press('Enter');
  let sawFlying = 0, sawGlow = 0;
  const sortedIn = await until(async () => {
    const s = await linfo(page); sawFlying = Math.max(sawFlying, s.sorting); sawGlow = Math.max(sawGlow, s.glowing);
    return s.sorted.count === b.dna.length && s.sorting === 0 && s.took >= b.dna.length;
  }, 8000);
  const s8 = await linfo(page), c8 = await page.evaluate(() => window.creation.info());
  ok(sent.length === 1 && sent[0] === 'move outstanding files to knowledge', '8. the real sentence went to the chat', JSON.stringify(sent));
  ok(sortedIn >= 0 && s8.sorted.count === b.dna.length, `8. each of the ${b.dna.length} files got its own allocate`, JSON.stringify(s8.sorted.count));
  ok(sawGlow > 0 && sawFlying > 0, '8. the files glowed and flew (seen in the air)', JSON.stringify({ sawGlow, sawFlying }));
  ok(s8.took >= b.dna.length, '8. Knowledge took each one with a soft light', String(s8.took));
  ok((c8.sections.knowledge || []).length === b.dna.length, '8. the Knowledge section now lists them', JSON.stringify(Object.keys(c8.sections)));
  await page.unroute('**/api/agents/*/chat');

  /* ---------- 9. F10: Create shows only on the server's ready flag (real chat route, fake CLI), then creates ---------- */
  // Needs the server from checks/mock-engine-server.mjs: the fake creator's <draft> block is what we type.
  // Create lives only in the chat, as a card under the ready message; only the newest card keeps its button.
  const createShown = () => page.evaluate(() => !!document.querySelector('#sketcher-log .card button'));
  ok(!(await page.evaluate(() => document.querySelector('#sketcher-create'))), '9. there is no standalone Create button');
  const turn = async text => { const n = await page.$$eval('#sketcher-log > div', d => d.length); await page.fill('#sketcher-box', text); await page.keyboard.press('Enter');
    return until(async () => page.evaluate(n => { const d = document.querySelectorAll('#sketcher-log > div'); return d.length >= n + 2 && !d[d.length - 1].classList.contains('wait'); }, n), 8000); };
  ok(await turn('{"name":"Tax Helper"}') >= 0 && !(await createShown()), '9. a turn without the ready flag: no Create');
  ok(await turn('{"name":"Tax Buddy","ready":true}') >= 0 && await until(createShown, 4000) >= 0, '9. the creator flags ready: Create shows');
  // The ready turn also renamed the agent: the card must name it as this turn left it, not as before.
  const cardText = await page.evaluate(() => document.querySelector('#sketcher-log .card').textContent);
  ok(cardText.includes('Ready to create Tax Buddy?'), '9. the card names the agent as the ready turn left it', JSON.stringify(cardText));
  await page.click('#sketcher-log .card button');
  const pressed = await page.evaluate(() => { const b = document.querySelector('#sketcher-log .card button'); return b ? { disabled: b.disabled, text: b.textContent } : 'gone'; });
  ok(pressed === 'gone' || (pressed.disabled && pressed.text === 'Creating…'), '9. the pressed card button reads Creating… and can\'t be pressed twice', JSON.stringify(pressed));
  const lastLine = () => page.evaluate(() => [...document.querySelectorAll('#sketcher-log > div')].pop().textContent);
  const made = await until(async () => !(await createShown()) && (await lastLine()) === 'Created. You can keep changing it.', 6000);
  const status = (await (await fetch(`${base}/api/agents/${id2}`)).json()).draft.status;
  ok(made >= 0 && status === 'saved', '9. pressing Create keeps the agent and Create goes away', JSON.stringify({ made, status }));
  ok((await lastLine()) === 'Created. You can keep changing it.', '9. Sketcher says Created');
  ok(await turn('{"ready":true}') >= 0 && !(await createShown()), '9. once created, no Create again');

  ok(errors.length === 0, 'no page errors or failed requests', errors.slice(0, 5).join(' | '));
  if (isLost()) throw new Error('browser lost');
  await browser.close();
  await webkitChat(agents, id);
  for (const kind of ['chromium', 'webkit']) for (const [w, h] of [[1200, 820], [390, 700]]) await arrowLine(kind, w, h, id);
  for (const kind of ['chromium', 'webkit']) for (const [w, h] of [[1200, 820], [390, 700]]) await glassCheck(kind, w, h, id);
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
  }
}

/* ---------- 11. Glass only on the floating chat: the field stays solid, the panel floats, blurs and stays readable ---------- */
// Needs the chat seeded by step 7 (there must be messages to read). A bright lime sheet is slid in under the
// panel (z 3; the panel is z 4) to stand for a fully lit likeness: the panel must show it through, blurred,
// and every message's own text must keep WCAG AA (4.5:1) against the brightest pixel behind it.
async function glassCheck(kind, w, h, id) {
  for (let k = 1; ; k++) {
    const before = fails;
    try { return await glassCheckOnce(kind, w, h, id); }
    catch (e) { if (!/has been closed/.test(String(e && e.message)) || k >= 4) throw e; fails = before; console.log('.. browser quit from outside: this glass run starts again'); }
  }
}
const rgba = s => { const m = String(s).match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
const lum = ({ r, g, b }) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) });
const glassDir = path.join(__dirname, '..', '.tmp-test', 'floating-glass');
async function glassCheckOnce(kind, w, h, id) {
  const tag = `${kind === 'chromium' ? 'chrome' : 'webkit'} ${w < 640 ? 'narrow' : 'desktop'}`;
  console.log(`== glass: ${tag} ${w}x${h}`);
  const browser = await pw[kind].launch(kind === 'chromium' ? { channel: 'chrome' } : {});
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto(`${base}/new?agent=${id}`);
  await until(async () => (await linfo(page)).handle.shown, 8000);
  // The Mac app adds html.glass: on /new it must change nothing, html and body stay solid.
  const solid = await page.evaluate(() => {
    document.documentElement.classList.add('glass');
    const cs = el => getComputedStyle(el), bodyBg = cs(document.body).backgroundImage;
    return { html: cs(document.documentElement).backgroundColor, body: cs(document.body).backgroundColor, bodyImage: bodyBg.slice(0, 40),
      filters: [...document.querySelectorAll('body *')].filter(el => el.id !== 'sketcher' && ((cs(el).backdropFilter || 'none') !== 'none' || (cs(el).webkitBackdropFilter || 'none') !== 'none')).map(el => el.id || el.tagName) };
  });
  const hb = rgba(solid.html);
  ok(hb && hb.a === 1, `11. ${tag}: with html.glass the page behind the field stays solid`, JSON.stringify(solid));
  ok(/gradient/.test(solid.bodyImage) && !/rgba\([^)]*,\s*0?\.\d+\)/.test(solid.bodyImage), `11. ${tag}: the field keeps its solid gradient`, solid.bodyImage);
  ok(solid.filters.length === 0, `11. ${tag}: nothing but the floating chat blurs what is behind it`, JSON.stringify(solid.filters));
  await page.click('#handle'); await page.mouse.move(w - 5, h - 5); await page.waitForTimeout(800);
  const g = await page.evaluate(() => {
    const p = document.querySelector('#sketcher'), s = getComputedStyle(p), r = p.getBoundingClientRect();
    return { blur: s.backdropFilter || s.webkitBackdropFilter || 'none', bg: s.backgroundColor, shadow: s.boxShadow,
      left: r.left, top: r.top, bottom: innerHeight - r.bottom, radii: ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(k => parseFloat(s[`border${k}Radius`])) };
  });
  const pb = rgba(g.bg);
  ok(/blur\(/.test(g.blur), `11. ${tag}: the floating chat blurs what is behind it`, g.blur);
  ok(pb && pb.a < 0.6, `11. ${tag}: its background is see-through (alpha under .6)`, g.bg);
  ok(g.left >= 7.5 && g.top >= 7.5 && g.bottom >= 7.5, `11. ${tag}: it floats a gap from the left, top and bottom`, JSON.stringify({ left: g.left, top: g.top, bottom: g.bottom }));
  ok(g.radii.every(v => v >= 12), `11. ${tag}: all four corners are round`, JSON.stringify(g.radii));
  ok(g.shadow && g.shadow !== 'none', `11. ${tag}: it casts a soft shadow`, g.shadow);
  // Pixels: a row through the panel's top padding (no text there), half of it over a hard-edged lime sheet.
  const P = await page.evaluate(() => { const r = document.querySelector('#sketcher').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const row = { x: Math.round(P.x + 20), y: Math.round(P.y + 6), width: Math.round(P.w - 40), height: 1 };
  const shot = async clip => { const png = await page.screenshot({ clip }); return page.evaluate(async b64 => {
    const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height;
    const x = c.getContext('2d'); x.drawImage(i, 0, 0); return { w: c.width, h: c.height, d: Array.from(x.getImageData(0, 0, c.width, c.height).data) }; }, png.toString('base64')); };
  const L = (d, k) => d[k] + d[k + 1] + d[k + 2];
  const plain = await shot(row);
  await page.evaluate(({ edge }) => { const s = document.createElement('div'); s.id = 'lime-sheet';
    Object.assign(s.style, { position: 'fixed', left: '0', top: '0', bottom: '0', width: edge + 'px', background: '#D8F26A', zIndex: 3, pointerEvents: 'none' }); document.body.appendChild(s); }, { edge: Math.round(P.x + P.w / 2) });
  await page.waitForTimeout(300);
  const lit = await shot(row);
  fs.mkdirSync(glassDir, { recursive: true });   // for a human look: the panel over the half-lime sheet
  await page.screenshot({ path: path.join(glassDir, `${tag.replace(' ', '-')}-half-lime.png`), clip: { x: P.x, y: P.y, width: P.w, height: Math.min(P.h, 400) } });
  const n = plain.w, at = i => L(lit.d, i * 4), mean = (img, a, b) => { let s = 0; for (let i = a; i < b; i++) s += L(img.d, i * 4); return s / (b - a); };
  const through = mean(lit, 0, Math.floor(n / 4)) - mean(plain, 0, Math.floor(n / 4));
  ok(through > 60, `11. ${tag}: a bright light behind it shows through the panel`, JSON.stringify({ brighter: Math.round(through) }));
  const hi = at(0), lo = at(n - 1), soft = [...Array(n).keys()].filter(i => { const v = at(i); return v < hi - (hi - lo) * 0.1 && v > lo + (hi - lo) * 0.1; }).length;
  // Playwright's headless WebKit draws backdrop-filter's see-through but not its blur (no GPU compositing);
  // Safari and the Mac app's WKWebView do blur. So the pixel blur is checked in Chrome; WebKit by its style above.
  if (kind === 'chromium') ok(hi - lo > 60 && soft >= 10, `11. ${tag}: and blurred: the sheet's hard edge turns soft over ${soft}px`, JSON.stringify({ hi, lo, soft }));
  else console.log(`INFO 11. ${tag}: headless WebKit does not paint the blur (soft over ${soft}px); its computed backdrop-filter is checked above`);
  // Contrast: full lime under the whole panel; hide the words, read the brightest pixel behind each message.
  await page.evaluate(() => { document.querySelector('#lime-sheet').style.width = '100vw';
    const st = document.createElement('style'); st.id = 'no-ink'; st.textContent = '#sketcher-log, #sketcher-log * { color: transparent !important; text-shadow: none !important; } #sketcher-log { scrollbar-width: none; } #sketcher-log > .wait::before { visibility: hidden !important; }';  /* the thinking dot is light, not the ground behind the words */ document.head.appendChild(st); });
  const msgs = await page.evaluate(() => {
    const st = document.querySelector('#no-ink'); st.disabled = true;
    const log = document.querySelector('#sketcher-log').getBoundingClientRect();
    const out = [...document.querySelectorAll('#sketcher-log > div')].map(d => { const r = d.getBoundingClientRect(); return { cls: d.className, color: getComputedStyle(d).color,
      x: Math.max(r.left, log.left), y: Math.max(r.top, log.top), r: Math.min(r.right, log.right - 12), b: Math.min(r.bottom, log.bottom) }; })
      .filter(m => m.r - m.x > 4 && m.b - m.y > 4);
    st.disabled = false; return out;
  });
  // The thinking line (.wait) must be readable too: add one at the bottom, as a turn in flight would.
  const wait = await page.evaluate(() => { const log = document.querySelector('#sketcher-log'), d = document.createElement('div'); d.className = 'wait'; d.textContent = 'Thinking…'; log.appendChild(d); log.scrollTop = log.scrollHeight;
    document.querySelector('#no-ink').disabled = true; const c = getComputedStyle(d).color; document.querySelector('#no-ink').disabled = false; const r = d.getBoundingClientRect(); return { cls: 'wait', color: c, x: r.left, y: r.top, r: r.right, b: r.bottom }; });
  await page.waitForTimeout(200);
  const vis = await page.evaluate(() => { const log = document.querySelector('#sketcher-log').getBoundingClientRect(); return [...document.querySelectorAll('#sketcher-log > div')].map(d => { const r = d.getBoundingClientRect(); return { cls: d.className, x: Math.max(r.left, log.left), y: Math.max(r.top, log.top), r: Math.min(r.right, log.right - 12), b: Math.min(r.bottom, log.bottom) }; }); });
  const colors = new Map(msgs.map(m => [m.cls, m.color])); colors.set('wait', wait.color);
  let worst = { ratio: 99 };
  for (const m of vis.filter(m => m.r - m.x > 4 && m.b - m.y > 4)) {
    // Each message carries its own dark glass with 12px round corners; the lit glass shows in those corners,
    // where no word sits (the words start 8px in). So read 4px inside the edge: past the corners, short of the words.
    const img = await shot({ x: Math.ceil(m.x) + 4, y: Math.ceil(m.y) + 4, width: Math.floor(m.r - m.x) - 9, height: Math.floor(m.b - m.y) - 9 });
    let best = null; for (let k = 0; k < img.d.length; k += 4) if (!best || L(img.d, k) > L(best, 0)) best = img.d.slice(k, k + 3);
    const bg = { r: best[0], g: best[1], b: best[2] }, fg = rgba(colors.get(m.cls) || 'rgb(0, 0, 0)');
    const ratio = contrast(over(fg, bg), bg);
    if (ratio < worst.ratio) worst = { ratio: +ratio.toFixed(2), cls: m.cls, bg, fg: colors.get(m.cls) };
  }
  ok(vis.length > 1 && worst.ratio >= 4.5, `11. ${tag}: over a fully lit likeness every message keeps AA contrast (4.5:1), the thinking line too`, JSON.stringify({ messages: vis.length, worst }));
  await browser.close();
}

/* ---------- 7. WebKit (the Mac app's engine): Sketcher's markdown shows formatted, never as raw ** ---------- */
const RELEASE_COACH = `I've sketched **Release Coach**: a calm helper that turns your merged changes into clear release notes.

**Files:**
1. \`note.md\` → instructions (it shapes how Release Coach writes)
2. \`changelog/\` → rag (it looks things up there when it answers)
3. \`screenshots/\` → not routed yet

Here's how it might sound:
> **Release Coach:** Three fixes and one new button this week. Lead with the button: that's what people will notice.

Should \`screenshots/\` go to rag too? I'd say *no*, since they're images. If that's Release Coach, press Keep.`;
const LONG_CODE = 'A long line:\n```\n' + 'const releaseNotes = changes.filter(c => c.merged).map(c => c.title).join(" · ") + " and a lot more text so it overflows";\n```\n<script>window.__pwned = 1</script> and **half';

async function webkitChat(agents, id) {
  console.log('== webkit against ' + base);
  await agents.seedChat(id, [
    { who: 'you', text: 'Make me a **release** helper' },
    { who: 'sketcher', text: RELEASE_COACH },
    { who: 'sketcher', text: LONG_CODE },
  ]);
  const browser = await pw.webkit.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 820 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`${base}/new?agent=${id}`);
  await until(async () => (await linfo(page)).handle.shown, 8000);
  await page.click('#handle'); await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const log = document.querySelector('#sketcher-log'), panel = document.querySelector('#sketcher');
    const md = [...log.querySelectorAll('.md')];
    const coach = md[0], edge = md[1], pre = edge && edge.querySelector('pre');
    const count = (el, s) => el ? el.querySelectorAll(s).length : 0;
    return {
      lines: log.children.length,
      coachText: coach ? coach.innerText : '',
      youText: log.firstElementChild ? log.firstElementChild.innerText : '',
      strong: count(coach, 'strong'), ol: count(coach, 'ol'), li: count(coach, 'li'), code: count(coach, 'code'), quote: count(coach, 'blockquote'), em: count(coach, 'em'),
      pre: pre ? { sw: pre.scrollWidth, cw: pre.clientWidth } : null,
      panelW: panel.getBoundingClientRect().width, logSW: log.scrollWidth, logCW: log.clientWidth,
      edgeText: edge ? edge.innerText : '', scripts: count(log, 'script'), pwned: !!window.__pwned,
    };
  });
  ok(r.coachText && !r.coachText.includes('**') && !r.coachText.includes('`') && !/^\s*>/m.test(r.coachText), '7. webkit: no raw **, backtick or line-start > on screen in the Release Coach reply', JSON.stringify(r.coachText.slice(0, 80)));
  ok(r.strong === 3 && r.ol === 1 && r.li === 3 && r.code === 4 && r.quote === 1 && r.em === 1, '7. webkit: bold, numbered list, code, quote and italics are formatted', JSON.stringify({ strong: r.strong, ol: r.ol, li: r.li, code: r.code, quote: r.quote, em: r.em }));
  ok(r.youText.includes('**release**'), '7. webkit: your own line stays plain text', JSON.stringify(r.youText));
  ok(!!r.pre && r.pre.sw > r.pre.cw && r.logSW <= r.logCW + 1, '7. webkit: a long code line scrolls inside its block, the chat does not widen', JSON.stringify({ pre: r.pre, logSW: r.logSW, logCW: r.logCW, panelW: r.panelW }));
  ok(r.scripts === 0 && !r.pwned && r.edgeText.includes('<script>') && r.edgeText.includes('**half'), '7. webkit: HTML shows as text, a half-streamed ** stays plain', JSON.stringify(r.edgeText.slice(-60)));
  ok(errors.length === 0, '7. webkit: no page errors', errors.slice(0, 3).join(' | '));
  await browser.close();
}

/* ---------- 10. One arrow on one line: closed, open, closed again — rects, ink and the slide, per engine and size ---------- */
// The rects can match while the eye still sees a jump (a font glyph's ink sits on its baseline), so the
// arrow's ink is read from the pixels too. Screenshots go to Reports/sliding-arrow/ for a human look.
const fs = require('fs');
const shotDir = path.join(__dirname, '..', 'Reports', 'sliding-arrow');
// Chrome here gets quit from outside now and then: a run cut short is done again from the start (its results dropped).
async function arrowLine(kind, w, h, id) {
  for (let k = 1; ; k++) {
    const before = fails;
    try { return await arrowLineOnce(kind, w, h, id); }
    catch (e) { if (!/has been closed/.test(String(e && e.message)) || k >= 4) throw e; fails = before; console.log('.. browser quit from outside: this arrow run starts again'); }
  }
}
async function arrowLineOnce(kind, w, h, id) {
  const tag = `${kind === 'chromium' ? 'chrome' : 'webkit'} ${w < 640 ? 'narrow' : 'desktop'}`, file = tag.replace(' ', '-');
  console.log(`== arrow line: ${tag} ${w}x${h}`);
  fs.mkdirSync(shotDir, { recursive: true });
  const browser = await pw[kind].launch(kind === 'chromium' ? { channel: 'chrome' } : {});
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
  await page.goto(`${base}/new?agent=${id}`);
  await until(async () => (await linfo(page)).handle.shown, 8000);
  await page.mouse.move(w - 5, 5); await page.waitForTimeout(900);
  const rects = () => page.evaluate(() => {
    const hd = document.querySelector('#handle'), c = hd.querySelector('.chev'), r = hd.getBoundingClientRect(), g = c.getBoundingClientRect(), p = document.querySelector('#sketcher');
    const f = (q) => ({ top: +q.top.toFixed(2), bottom: +q.bottom.toFixed(2), cy: +((q.top + q.bottom) / 2).toFixed(2) });
    return { handle: { ...f(r), left: +r.left.toFixed(2), width: +r.width.toFixed(2) }, glyph: f(g), expanded: hd.getAttribute('aria-expanded'),
      panelRight: p.hidden ? 0 : p.getBoundingClientRect().right, panelW: p.getBoundingClientRect().width, minW: parseFloat(getComputedStyle(hd).minWidth), vw: innerWidth };
  });
  // The arrow's ink inside the 48px tab, from a 3x screenshot of the tab inset 2px and short of its 12px
  // right corners (the keyboard focus ring curves in there; it shows after a JS click, with no pointer),
  // counting lime pixels only (grey text behind the see-through tab is not the arrow). Coordinates: tab-relative.
  const ink = async r => {
    const png = await page.screenshot({ clip: { x: r.handle.left + 2, y: r.handle.top + 2, width: r.handle.width - 16, height: r.handle.bottom - r.handle.top - 4 } });
    return page.evaluate(async b64 => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data; let t = 1e9, b = -1, l = 1e9, rr = -1;
      for (let y = 0; y < c.height; y++) for (let i = 0; i < c.width; i++) { const k = (y * c.width + i) * 4; if (d[k + 1] > 110 && d[k] > 90 && d[k + 2] < d[k + 1] * 0.75) { t = Math.min(t, y); b = Math.max(b, y); l = Math.min(l, i); rr = Math.max(rr, i); } }
      return { top: +(t / 3 + 2).toFixed(2), bottom: +((b + 1) / 3 + 2).toFixed(2), cy: +((t + b + 1) / 6 + 2).toFixed(2), cx: +((l + rr + 1) / 6 + 2).toFixed(2) };
    }, png.toString('base64'));
  };
  const state = async name => { const r = await rects(); r.ink = await ink(r); r.shot = await page.screenshot({ scale: 'css' }); console.log(`.. ${tag} ${name} ${JSON.stringify({ handle: r.handle, glyph: r.glyph, ink: r.ink, expanded: r.expanded })}`); return r; };
  // Open or close with a click, sampling the handle and the panel on every frame of the slide.
  const toggle = () => page.evaluate(() => new Promise(done => {
    const hd = document.querySelector('#handle'), p = document.querySelector('#sketcher'), frames = [];
    hd.click();
    const s = getComputedStyle(hd), ps = getComputedStyle(p), pick = st => { const i = st.transitionProperty.split(', ').findIndex(n => n === 'transform' || n === 'all'); return i < 0 ? null : st.transitionDuration.split(', ')[i] + ' ' + st.transitionTimingFunction.split(/,\s*(?![^()]*\))/)[i]; };
    const tr = { handle: pick(s), panel: pick(ps) }, gap = parseFloat(ps.left) || 0;
    const t0 = performance.now();
    const tick = () => { const r = hd.getBoundingClientRect(), q = p.getBoundingClientRect(); frames.push({ left: r.left, top: r.top, right: q.right, w: q.width, gap }); if (performance.now() - t0 < 800) requestAnimationFrame(tick); else done({ tr, frames }); };
    requestAnimationFrame(tick);
  }));
  // Same duration and easing from the same start: the arrow's X is the panel's right edge scaled to its own
  // travel (the panel floats a gap from the edge: closed its right edge is at 0, open at gap + width; the arrow
  // goes from 0 to that edge, and under 640px it stops one tab width short of the screen edge).
  const ride = (sl, label) => {
    const minW = closed.handle.width, live = sl.frames.filter(f => f.w > 0);
    // 4px: at the fastest point of the close ease-in the edge moves ~4px per ms, so the two rect reads of one frame may be 1 ms apart.
    const openRight = f => f.gap + f.w, edgeOf = f => Math.min(openRight(f), w - minW);
    const bad = live.filter(f => Math.abs(f.left - Math.max(0, f.right) * edgeOf(f) / openRight(f)) > 4);
    const edge = live.length ? edgeOf(live[0]) : null;
    const tops = sl.frames.map(f => f.top), moved = sl.frames.filter(f => f.left > 0.5 && f.left < Math.max(...sl.frames.map(g => g.left)) - 0.5).length;
    ok(!!sl.tr.handle && sl.tr.handle === sl.tr.panel, `10. ${tag}: ${label}: the arrow and the panel slide with the same duration and easing`, JSON.stringify(sl.tr));
    ok(live.length > 0 && bad.length === 0 && moved > 0, `10. ${tag}: ${label}: on every frame the arrow rides the panel's edge`, JSON.stringify({ frames: sl.frames.length, inBetween: moved, off: bad.slice(0, 2), edge }));
    ok(Math.max(...tops) - Math.min(...tops) <= 0.5, `10. ${tag}: ${label}: its top never moves during the slide`, JSON.stringify({ min: Math.min(...tops), max: Math.max(...tops) }));
  };
  const closed = await state('closed');
  ride(await toggle(), 'opening'); await page.mouse.move(w - 5, 5); await page.waitForTimeout(400);
  const open = await state('open');
  ride(await toggle(), 'closing'); await page.mouse.move(w - 5, 5); await page.waitForTimeout(400);
  const again = await state('closed again');
  const same = (k, f) => { const v = [closed, open, again].map(s => s[k][f]); return { ok: Math.max(...v) - Math.min(...v) <= 0.5, v }; };
  for (const k of ['handle', 'glyph', 'ink']) for (const f of ['top', 'bottom', 'cy']) {
    const s = same(k, f); ok(s.ok, `10. ${tag}: ${k} ${f} equal closed / open / closed again (±0.5px)`, JSON.stringify(s.v));
  }
  ok([closed, open, again].every(s => Math.abs(s.ink.cy - (s.handle.bottom - s.handle.top) / 2) <= 0.75), `10. ${tag}: the arrow's ink sits on the tab's middle line`, JSON.stringify([closed, open, again].map(s => s.ink.cy)));
  ok(Math.abs(open.ink.cx - closed.ink.cx) <= 0.75, `10. ${tag}: the flip turns the arrow in place (no sideways shift inside the tab)`, JSON.stringify({ closed: closed.ink.cx, open: open.ink.cx }));
  const edge = Math.min(open.panelRight, w - closed.handle.width);
  ok(open.handle.left + open.handle.width <= w + 0.5, `10. ${tag}: open, the whole arrow is on screen`, JSON.stringify({ right: open.handle.left + open.handle.width, screen: w }));
  ok(closed.handle.left === 0 && again.handle.left === 0 && Math.abs(open.handle.left - edge) <= 1, `10. ${tag}: only X changes: left 0 closed, the panel's edge open`, JSON.stringify({ closed: closed.handle.left, open: open.handle.left, edge, again: again.handle.left }));
  ok(closed.expanded === 'false' && open.expanded === 'true' && again.expanded === 'false', `10. ${tag}: aria-expanded false / true / false`);
  ok([closed, open, again].every(s => s.handle.width >= 44), `10. ${tag}: the arrow is at least 44px wide in every state`, JSON.stringify([closed, open, again].map(s => s.handle.width)));
  ok(await page.evaluate(() => document.querySelectorAll('#handle').length === 1 && !document.querySelector('#sketcher button[aria-label*="lose"], #sketcher-close')), `10. ${tag}: one arrow, no second close button`);
  await toggle(); await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  ok(!(await linfo(page)).panel.open && (await rects()).expanded === 'false', `10. ${tag}: Esc closes it`);
  if (w < 640) { const pr = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#sketcher')).paddingRight)); ok(pr === 56, `10. ${tag}: the panel keeps a 56px right gap for the arrow`, String(pr)); }
  // Closed and open side by side, a hairline through the handle's middle on both: the eye check.
  fs.writeFileSync(path.join(shotDir, `${file}-closed.png`), closed.shot);
  fs.writeFileSync(path.join(shotDir, `${file}-open.png`), open.shot);
  const both = await page.evaluate(async ({ a, b, cy }) => {
    const load = async s => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); return i; };
    const [A, B] = [await load(a), await load(b)], gap = 16, c = document.createElement('canvas');
    c.width = A.width + gap + B.width; c.height = Math.max(A.height, B.height); const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(A, 0, 0); x.drawImage(B, A.width + gap, 0);
    x.strokeStyle = 'rgba(255,60,60,.7)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, Math.round(cy) + .5); x.lineTo(c.width, Math.round(cy) + .5); x.stroke();
    return c.toDataURL('image/png').split(',')[1];
  }, { a: closed.shot.toString('base64'), b: open.shot.toString('base64'), cy: closed.handle.cy });
  fs.writeFileSync(path.join(shotDir, `${file}-side-by-side.png`), Buffer.from(both, 'base64'));
  await browser.close();
}
