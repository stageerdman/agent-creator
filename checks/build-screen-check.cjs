// Eraser's sign-off check for the + build screen (/new), run against the app itself.
// Usage: node checks/build-screen-check.cjs http://localhost:3505 [chrome|webkit] [--read-only]
// Needs playwright-core (npm install --no-save playwright-core).
//
// It CREATES agents (a pick, a drop), so point it at a server started with a scratch home:
//   AGENT_CREATOR_HOME=<scratch folder> PORT=3505 npm start
// --read-only (for the installed app's own server, which holds real data): every agent-making call is
// answered by the browser (page.route), so nothing reaches the server; it checks the screen, the motion,
// the + from home into the orbit, the pick and drop hand-over to the field, cancel, bad drops and Esc.
const pw = require('playwright-core');
const fs = require('fs'), os = require('os'), path = require('path');
const base = process.argv[2] || 'http://localhost:3505';
const which = process.argv[3] || 'chrome';
const readOnly = process.argv.includes('--read-only');
let fails = 0;
const ok = (cond, label, extra = '') => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + label + (extra ? '  ' + extra : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// A scratch folder to pick: two real files and one hidden one.
fs.mkdirSync(path.join(__dirname, '..', '.scratch'), { recursive: true });
const dir = fs.mkdtempSync(path.join(__dirname, '..', '.scratch', 'eraser-pick-'));
const folder = path.join(dir, 'Recipes');
fs.mkdirSync(folder);
fs.writeFileSync(path.join(folder, 'soup.md'), '# Soup\n'.repeat(50));
fs.writeFileSync(path.join(folder, 'bread.txt'), 'flour water salt\n'.repeat(400));
fs.writeFileSync(path.join(folder, '.DS_Store'), 'x');

const countAgents = async () => readOnly ? fake.length : (await (await fetch(base + '/api/agents')).json()).length;
let fake = [];   // read-only mode: agents the browser pretends to make

async function open(browser, reduce, opts = {}) {
  const page = await browser.newPage({ reducedMotion: reduce ? 'reduce' : 'no-preference', viewport: { width: 1000, height: 800 } });
  page.errors = [];
  page.on('pageerror', e => page.errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico') && !opts.allowFail) page.errors.push(r.status() + ' ' + r.url()); });
  if (readOnly) {
    await page.route('**/api/agents', (r, q) => {
      if (q.method() !== 'POST') return r.continue();
      const id = 'fake' + Date.now().toString(36); fake.push({ id, dna: [] });
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id }) });
    });
    // The creation screen opens in the same flow and reads its menu: a fake agent's menu is empty.
    await page.route(/\/api\/agents\/fake[^/]+\/(sections|skills|system-prompt|knowledge)/, r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ files: [], skills: [], text: '' }) }));
    await page.route(/\/api\/agents\/fake[^/]+(\/files)?$/, (r, q) => {
      const id = q.url().match(/fake[^/]+/)[0], a = fake.find(x => x.id === id);
      if (q.method() === 'DELETE') { fake = fake.filter(x => x.id !== id); return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); }
      if (q.method() === 'POST') { const files = JSON.parse(q.postData()).files; a.dna = files.map((f, i) => ({ id: f.path, name: f.path, sizeBytes: f.size, addedAt: new Date(Date.now() + i).toISOString(), topic: f.path.split('/')[0] })); a.posted = files; }
      const added = q.method() === 'POST' ? a.dna.map(f => f.id) : undefined;   // the files POST answers with what it added
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id, name: '', draft: {}, dna: a ? a.dna : [], added }) });
    });
  }
  return page;
}
const info = page => page.evaluate(() => window.orbit.info());
// Sample orbit.info() every frame for ms; returns the list.
const watch = (page, ms) => page.evaluate(ms => new Promise(done => {
  const out = [], t0 = performance.now();
  const f = t => { const i = window.orbit.info(); out.push({ t: Math.round(t - t0), state: i.state, m: i.m, rs: i.flies.map(d => d.r), xs: i.flies.map(d => d.x + ',' + d.y), text: i.textOpacity }); if (t - t0 < ms) requestAnimationFrame(f); else done(out); };
  requestAnimationFrame(f);
}), ms);
const radiiOk = samples => { const all = samples.flatMap(s => s.rs); return { ok: all.length > 0 && all.every(r => r >= 2.5 && r <= 6), range: Math.min(...all) + '..' + Math.max(...all) }; };
const canvasHash = page => page.evaluate(() => { const cv = document.querySelector('#field'); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let h = 0; for (let k = 0; k < d.length; k += 7) h = (h * 31 + d[k]) | 0; return h + ':' + cv.width; });
// A synthetic drop in the page: files (name, size) or text only.
const drop = (page, kind) => page.evaluate(kind => {
  const dt = new DataTransfer();
  if (kind === 'files') { dt.items.add(new File(['# Soup\n'.repeat(50)], 'soup.md', { type: 'text/markdown' })); dt.items.add(new File(['flour\n'.repeat(400)], 'bread.txt', { type: 'text/plain' })); }
  else dt.setData('text/plain', 'https://example.com');
  const at = { bubbles: true, cancelable: true, clientX: 200, clientY: 200, dataTransfer: dt };
  document.body.dispatchEvent(new DragEvent('dragenter', at));
  document.body.dispatchEvent(new DragEvent('dragover', at));
  document.body.dispatchEvent(new DragEvent('drop', at));
}, kind);
const stirFor = (page, ms) => page.evaluate(ms => new Promise(done => {
  const dt = new DataTransfer(), at = { bubbles: true, cancelable: true, clientX: 200, clientY: 200, dataTransfer: dt };
  document.body.dispatchEvent(new DragEvent('dragenter', at));
  const iv = setInterval(() => document.body.dispatchEvent(new DragEvent('dragover', at)), 50);
  setTimeout(() => { clearInterval(iv); done(); }, ms);
}), ms);
const until = async (page, test, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const i = await info(page); if (test(i)) return Date.now() - t0; await sleep(40); } return -1; };

(async () => {
  const browser = which === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch({ channel: 'chrome' });
  console.log('== ' + which + ' against ' + base + (readOnly ? ' (read-only: agent calls answered in the browser)' : ''));

  /* ---------- 0. The + calls the fireflies into the orbit, not into the button ---------- */
  let page = await open(browser, false);
  await page.goto(base + '/'); await page.waitForTimeout(800);
  const plusBox = await page.evaluate(() => { const b = document.querySelector('#plus').getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
  await page.click('#plus');
  await page.waitForTimeout(900);   // just before the call ends: where are the fireflies?
  const ring = await page.evaluate(({ x, y }) => {
    const cv = [...document.querySelectorAll('canvas')].pop(); if (!cv) return null;
    const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, sx = cv.width / innerWidth, cx = innerWidth / 2, cy = innerHeight / 2;
    let nearPlus = 0, nearMiddle = 0;
    for (let py = 0; py < cv.height; py += 2) for (let px = 0; px < cv.width; px += 2) {
      if (d[(py * cv.width + px) * 4 + 3] < 40) continue;
      const X = px / sx, Y = py / sx;
      if (Math.hypot(X - x, Y - y) < 40) nearPlus++;
      const rr = Math.hypot(X - cx, Y - cy); if (rr > 30 && rr < Math.min(innerWidth, innerHeight) * .4) nearMiddle++;
    }
    return { nearPlus, nearMiddle };
  }, plusBox);
  ok(ring && ring.nearMiddle > 20 * Math.max(1, ring.nearPlus), '0. the + sends the fireflies to the ring round the middle, not into the button', JSON.stringify(ring));
  await page.waitForURL(u => new URL(u).pathname === '/new', { timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(50);
  const cont = await info(page);
  ok(new URL(page.url()).pathname === '/new' && cont.epoch != null && cont.state === 'rest' && cont.flies.length === 30, '0. /new goes on from the home\'s ring (same clock, 30 flies, no fade-in)', JSON.stringify({ url: page.url(), epoch: cont.epoch, state: cont.state }));
  ok(cont.flies.every(f => f.a > 0), '0. the ring is lit from its first frame', String(Math.min(...cont.flies.map(f => f.a))));
  await page.close();

  /* ---------- 1. One way to do each thing ---------- */
  page = await open(browser, false);
  await page.goto(base + '/new'); await page.waitForTimeout(1200);
  const look = await page.evaluate(() => {
    const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect(); return !e.hidden && s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; };
    const controls = [...document.querySelectorAll('a, button, input, select, textarea, [role=button], [tabindex]:not([tabindex="-1"]), [contenteditable]')].filter(vis).map(e => e.id || e.outerHTML.slice(0, 50));
    const tabbable = [...document.querySelectorAll('a[href], button, input, select, textarea, [tabindex]')].filter(e => e.tabIndex >= 0 && vis(e)).map(e => e.id);
    // Visible words: any text node whose element is shown at opacity > 0 (screen-reader-only .vh excluded).
    const words = [...document.querySelectorAll('body *')].filter(e => e.childNodes.length && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && vis(e) && !e.classList.contains('vh') && e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE')
      .map(e => ({ text: e.textContent.trim(), op: +getComputedStyle(e).opacity }));
    const dropTargets = [...document.querySelectorAll('[ondrop], [ondragover], .drop, .dropzone, [class*=drop i], [id*=drop i]')].length;
    const pick = document.querySelector('#pick'), span = pick.querySelector('span');
    const fileInputs = [...document.querySelectorAll('input[type=file]')].map(i => ({ dir: i.webkitdirectory, hidden: i.hidden }));
    return { controls, tabbable, words, dropTargets, fileInputs, canvases: document.querySelectorAll('canvas').length, logo: !!document.querySelector('#logo'),
      sizeControls: document.querySelectorAll('input[type=range], select, [name*=size i], [id*=size i]').length,
      label: pick.getAttribute('aria-label'), spanColor: getComputedStyle(span).color, imgs: [...document.querySelectorAll('img, svg')].filter(e => !e.closest('#menu')).length };   // the menu's icons are hidden until the split
  });
  ok(look.controls.length === 1 && look.controls[0] === 'pick', '1. exactly one control on screen: the middle', JSON.stringify(look.controls));
  ok(look.tabbable.length === 1 && look.tabbable[0] === 'pick', '1. one Tab stop', JSON.stringify(look.tabbable));
  ok(look.fileInputs.length === 1 && look.fileInputs[0].dir && look.fileInputs[0].hidden, '1. one folder picker (webkitdirectory), never shown', JSON.stringify(look.fileInputs));
  ok(look.dropTargets === 0, '1. no second drop target (drop works anywhere on the page)');
  ok(look.sizeControls === 0, '1. no size controls');
  ok(look.imgs === 0 && look.canvases === 2 && !look.logo, '1. nothing drawn but the ring and the field (no logo, no icon)', look.canvases + ' canvases, ' + look.imgs + ' img/svg');
  ok(look.words.length === 1 && look.words[0].text === 'Select Folder' && look.words[0].op <= .24, '1. one faint word at rest: Select Folder at .24', JSON.stringify(look.words));
  ok(look.label === 'Select Folder', '1. the middle is named "Select Folder" for VoiceOver');

  /* ---------- 2. Rest ---------- */
  let s = await watch(page, 1200);
  let last = s[s.length - 1];
  ok(last.state === 'rest' && last.rs.length === 30, '2. rest: a ring of 30 fireflies', last.state + ', ' + last.rs.length);
  ok(radiiOk(s).ok, '2. rest: radii 2.5..6.0', radiiOk(s).range);
  ok(s.every(x => Math.abs(x.text - .24) < .01), '2. rest: the word holds at .24', String(last.text));
  ok(s[0].xs.join() !== last.xs.join() && s.every(x => x.m === 1), '2. rest: the ring turns slowly at speed 1');

  /* ---------- 3. Hover: the faint word, in the firefly colour ---------- */
  await page.mouse.move(500, 400); await page.waitForTimeout(700);
  s = await watch(page, 600);
  const peakText = Math.max(...s.map(x => x.text));
  ok(s[s.length - 1].state === 'rest' && s[s.length - 1].text > .3, '3. hover on the middle: the lean (word up)', s[s.length - 1].state + ' ' + s[s.length - 1].text);
  ok(peakText > .3 && peakText <= .36, '3. hover word peaks at ' + peakText + ' (<= .36: very faint)');
  ok(look.spanColor === 'rgb(216, 242, 106)', '3. the word is the firefly colour', look.spanColor);
  const spanOp = await page.evaluate(() => +getComputedStyle(document.querySelector('#pick span')).opacity);
  ok(spanOp <= .36, '3. the word as drawn has opacity ' + spanOp);
  ok(radiiOk(s).ok, '3. lean: radii 2.5..6.0', radiiOk(s).range);
  await page.mouse.move(40, 40); await page.waitForTimeout(800);
  ok(Math.abs((await info(page)).textOpacity - .24) < .01, '3. leaving the middle puts the word back to .24');

  /* ---------- 4. Drag stir: no word, a little faster, back to rest ---------- */
  await page.mouse.move(500, 400); await page.waitForTimeout(500);
  const stirWatch = watch(page, 1100);
  await stirFor(page, 1000);
  s = await stirWatch;
  const stirred = s.filter(x => x.m > 1);
  ok(stirred.length > 10, '4. a drag stirs the ring', stirred.length + ' frames in stir');
  // Hovering when the drag comes in: the word takes its normal 600 ms out-fade, then stays gone.
  const t0s = stirred.length ? stirred[0].t : 0;
  ok(stirred.every((x, k) => k === 0 || x.text <= stirred[k - 1].text) && stirred.filter(x => x.t - t0s > 650).every(x => x.text === 0), '4. no word while a drag is over the window (it fades at once, gone by 650 ms)', JSON.stringify(stirred.filter((x, k) => k % 8 === 0).map(x => [x.t - t0s, x.text])));
  const mMax = Math.max(...s.map(x => x.m));
  ok(mMax > 1 && mMax <= 1.6, '4. stir speeds up a little: m up to ' + mMax);
  ok(radiiOk(s).ok, '4. stir: radii 2.5..6.0', radiiOk(s).range);
  const back = await until(page, i => i.m === 1, 1500);
  ok(back >= 0, '4. the stir ends on its own after the drag leaves', back + ' ms');
  await page.mouse.move(40, 40); await page.waitForTimeout(700);

  /* ---------- 5. A drop with no file settles back, nothing made ---------- */
  let n0 = await countAgents();
  await drop(page, 'text');
  await page.waitForTimeout(1300);
  let i = await info(page);
  ok(i.state === 'rest' && i.m === 1, '5. a text/link drop settles back to rest', i.state + ' m=' + i.m);
  ok(await countAgents() === n0, '5. a text/link drop makes no agent');

  /* ---------- 6. Cancel the Finder panel: settles back quietly ---------- */
  const chooser = page.waitForEvent('filechooser');
  await page.click('#pick');
  await chooser;
  await page.mouse.move(40, 40);
  await page.waitForTimeout(500);
  const held = await info(page);
  ok(held.state === 'rest' && held.textOpacity > .3, '6. while Finder is open the lean holds (pointer away)', held.state + ' text ' + held.textOpacity);
  await page.evaluate(() => document.querySelector('#folder').dispatchEvent(new Event('cancel')));
  s = await watch(page, 1300);
  const fadeMs = (s.find(x => Math.abs(x.text - .24) < .005) || { t: -1 }).t;
  ok(fadeMs >= 600 && s[s.length - 1].state === 'rest', '6. cancel: the word settles slowly to .24 (' + fadeMs + ' ms) and the ring rests');
  ok(s.every(x => x.m === 1), '6. cancel: no speed change');
  ok(await countAgents() === n0, '6. cancel makes no agent');
  ok(page.errors.length === 0, '1-6. no page errors', JSON.stringify(page.errors));
  await page.close();

  /* ---------- 7. Pick or drop: the same 30 fireflies leave the ring for the field, one screen ---------- */
  // Every frame: the orbit's state and the field's flyers. The hand-over is one frame: the ring's last
  // frame has 30 flies, the next frame the field has the same 30 as flyers. No logo, no icon, no gap.
  const handWatch = (p, ms) => p.evaluate(ms => new Promise(done => {
    const out = [], t0 = performance.now();
    const f = t => { const o = window.orbit.info(), c = window.creation.info(); out.push({ t: Math.round(t - t0), state: o.state, m: o.m, rs: o.flies.map(d => d.r), xs: o.flies.map(d => d.x + ',' + d.y), ring: o.flies.length, flyers: c.field.flyers, flying: c.field.flying, total: c.field.total, split: document.body.classList.contains('split'), logo: !!document.querySelector('#logo') }); if (t - t0 < ms) requestAnimationFrame(f); else done(out); };
    requestAnimationFrame(f);
  }), ms);
  async function chosen(reduce, how) {
    const p = await open(browser, reduce);
    await p.goto(base + '/new'); await p.waitForTimeout(900);
    const before = await countAgents();
    const w = handWatch(p, 2600);
    await p.waitForTimeout(150);   // a few ring frames on record before the files come
    if (how === 'pick') {
      const ch = p.waitForEvent('filechooser');
      await p.click('#pick');
      await (await ch).setFiles(folder);
    } else await drop(p, 'files');
    const sm = await w;
    const k = sm.findIndex(x => x.state === 'released'), rel = sm[k], prev = sm[k - 1];
    const splitAt = sm.find(x => x.split);
    const out = {
      p, sm, released: !!rel, ms: rel && splitAt ? splitAt.t - rel.t : -1,
      handOver: !!(rel && prev && prev.ring === 30 && rel.flyers === 30),
      flew: sm.some(x => x.flying > 0), gap: sm.slice(Math.max(0, k)).some(x => x.ring === 0 && x.flyers === 0 && x.total === 0),
      mMax: Math.max(...sm.map(x => x.m)), radii: radiiOk(sm.filter(x => x.rs.length)), logo: sm.some(x => x.logo),
      status: await p.textContent('#status'),
      made: (await countAgents()) - before,
      moved: sm.filter(x => x.state === 'rest' && x.xs.length).map(x => x.xs.join()),
    };
    if (out.made === 1) {
      if (readOnly) out.files = fake[fake.length - 1].posted.map(f => f.path).sort();
      else { const all = await (await fetch(base + '/api/agents')).json(); const a = all.sort((x, y) => Date.parse(y.createdAt) - Date.parse(x.createdAt))[0]; out.files = (a.dna || []).map(f => f.id).sort(); out.id = a.id; }
    }
    return out;
  }
  for (const how of ['pick', 'drop']) {
    const r = await chosen(false, how);
    ok(r.released, `7. ${how}: the ring lets go at the first file`);
    ok(r.handOver, `7. ${how}: the same 30 fireflies pass from the ring to the field in one frame`);
    ok(r.flew && !r.gap, `7. ${how}: they fly out, never a frame with no fireflies`);
    ok(r.ms >= 250 && r.ms <= 1000, `7. ${how}: the menu comes in beside the field at ~300 ms`, r.ms + ' ms after the signal');
    ok(r.mMax === 1, `7. ${how}: no spin-up (speed stays 1)`, 'm max ' + r.mMax);
    ok(r.radii.ok, `7. ${how}: radii 2.5..6.0`, r.radii.range);
    ok(!r.logo, `7. ${how}: no logo or icon in between`);
    ok(r.status === 'New agent', `7. ${how}: VoiceOver hears "New agent"`, JSON.stringify(r.status));
    ok(r.made === 1, `7. ${how}: exactly one agent made`, String(r.made));
    if (how === 'pick') ok(JSON.stringify(r.files) === JSON.stringify(['Recipes/bread.txt', 'Recipes/soup.md']), '7. pick: the folder\'s files, hidden file left out', JSON.stringify(r.files));
    else ok(r.files && r.files.length === 2, '7. drop: the dropped files', JSON.stringify(r.files));
    // a second drop on the field lands in the agent (the menu's zones own it), never a second agent
    if (how === 'drop') { const n = await countAgents(); await drop(r.p, 'files'); await r.p.waitForTimeout(600); ok(await countAgents() === n, '7. a second drop makes no second agent'); }
    ok(r.p.errors.length === 0, `7. ${how}: no page errors`, JSON.stringify(r.p.errors));
    // Esc from the creation screen goes home, and the new agent is there
    await r.p.keyboard.press('Escape'); await r.p.waitForURL(u => new URL(u).pathname === '/', { timeout: 4000 }).catch(() => {});
    ok(new URL(r.p.url()).pathname === '/', `7. ${how}: Esc goes home`, r.p.url());
    if (!readOnly && r.id) { await r.p.waitForTimeout(800); const top = await r.p.evaluate(() => document.querySelector('#rows a.row')?.getAttribute('href')); ok(top === '/agents/' + r.id, `7. ${how}: the new agent is at the top of home`, String(top)); }
    await r.p.close();
  }

  /* ---------- 8. A failed save settles back, leaves no agent ---------- */
  page = await open(browser, false, { allowFail: true });
  await page.route(/\/api\/agents\/[^/]+\/files$/, r => r.fulfill({ status: 500, body: 'boom' }));
  await page.goto(base + '/new'); await page.waitForTimeout(900);
  n0 = await countAgents();
  await drop(page, 'files');
  const settled = await until(page, i => i.state === 'rest', 3000);
  i = await info(page);
  ok(settled >= 0, '8. a failed save brings the ring back at rest', settled + ' ms');
  await page.waitForTimeout(1000); i = await info(page);
  ok(i.m === 1 && i.flies.length === 30, '8. after a failed save the ring is back: 30 flies, speed 1', 'm=' + i.m + ', ' + i.flies.length + ' flies');
  const cf = await page.evaluate(() => ({ c: window.creation.info(), split: document.body.classList.contains('split'), answered: document.body.classList.contains('answered') }));
  ok(cf.c.field.total === 0 && !cf.split && !cf.answered, '8. the field\'s lights faded, the menu went, the middle takes a click again', JSON.stringify({ total: cf.c.field.total, split: cf.split, answered: cf.answered }));
  await page.waitForTimeout(500);
  ok(await countAgents() === n0, '8. a failed save leaves no agent');
  ok((await page.textContent('#status')) === '', '8. a failed save shows no words');
  await page.close();

  /* ---------- 9. Esc goes home from rest and during the answer ---------- */
  page = await open(browser, false);
  await page.goto(base + '/new'); await page.waitForTimeout(600);
  await page.keyboard.press('Escape'); await page.waitForURL(u => new URL(u).pathname === '/', { timeout: 4000 }).catch(() => {});
  ok(new URL(page.url()).pathname === '/', '9. Esc at rest goes home');
  await page.route(/\/api\/agents\/[^/]+\/files$/, async r => { await sleep(1500); r.fulfill({ status: 500, body: 'held' }).catch(() => {}); });
  await page.goto(base + '/new'); await page.waitForTimeout(600);
  await drop(page, 'files'); await page.waitForTimeout(300);
  const st = (await info(page)).state;
  await page.keyboard.press('Escape'); await page.waitForURL(u => new URL(u).pathname === '/', { timeout: 4000 }).catch(() => {});
  ok(st === 'released' && new URL(page.url()).pathname === '/', '9. Esc while the files are saved goes home', st);
  await page.close();
  await sleep(1800);   // let the held save fail and clean itself up

  /* ---------- 10. Reduce Motion: nothing moves, no speed-up ---------- */
  page = await open(browser, true);
  // Count repaints of the field. (A raw pixel hash is not enough: Chrome moves a canvas off the GPU after the
  // first getImageData and the readback can differ by 1 in a few bytes with no repaint at all.)
  await page.addInitScript(() => { window._fieldPaints = 0; const o = CanvasRenderingContext2D.prototype.clearRect; CanvasRenderingContext2D.prototype.clearRect = function (...a) { if (this.canvas.id === 'field') window._fieldPaints++; return o.apply(this, a); }; });
  await page.goto(base + '/new'); await page.waitForTimeout(800);
  const snap = () => page.evaluate(() => { const cv = document.querySelector('#field'); const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let maxd = 0; const p = window._snap; if (p) for (let k = 0; k < d.length; k++) maxd = Math.max(maxd, Math.abs(d[k] - p[k])); window._snap = d; return { paints: window._fieldPaints, maxd }; });
  const p1 = await snap(), i1 = await info(page); await page.waitForTimeout(1000);
  const p2 = await snap(), i2 = await info(page);
  ok(p2.paints === p1.paints && p2.maxd <= 1, '10. RM: no repaint and the same picture 1 s apart', 'paints ' + p1.paints + ' -> ' + p2.paints + ', max pixel delta ' + p2.maxd);
  ok(JSON.stringify(i1.flies) === JSON.stringify(i2.flies) && i2.m === 1, '10. RM: no orbit movement, speed 1');
  await page.mouse.move(500, 400); await page.waitForTimeout(700);
  const i3 = await info(page);
  ok(i3.state === 'rest' && i3.textOpacity <= .36 && i3.textOpacity > .3, '10. RM: hover still shows the faint word', String(i3.textOpacity));
  ok(i3.flies.every((f, k) => f.x === i1.flies[k].x && f.y === i1.flies[k].y && f.r === i1.flies[k].r), '10. RM: hover changes brightness only (no lean, no growth)');
  await page.mouse.move(40, 40); await page.waitForTimeout(700);
  s = await (async () => { const w = watch(page, 900); await stirFor(page, 700); return w; })();
  ok(s.every(x => x.m === 1 && x.xs.join() === s[0].xs.join()), '10. RM: a drag stirs brightness only, nothing moves');
  await page.close();
  for (const how of ['pick', 'drop']) {
    const r = await chosen(true, how);
    ok(r.released && r.handOver && r.ms >= 0 && r.ms <= 1000, `10. RM ${how}: the ring hands over and the menu comes`, r.ms + ' ms');
    ok(r.mMax === 1, `10. RM ${how}: no speed-up`, 'm max ' + r.mMax);
    ok(new Set(r.moved).size <= 1, `10. RM ${how}: the ring stays still until it hands over`, new Set(r.moved).size + ' positions');
    ok(r.radii.ok, `10. RM ${how}: radii 2.5..6.0`, r.radii.range);
    ok(r.made === 1 && r.status === 'New agent', `10. RM ${how}: one agent made, "New agent"`);
    ok(r.p.errors.length === 0, `10. RM ${how}: no page errors`, JSON.stringify(r.p.errors));
    await r.p.close();
  }

  await browser.close();
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
