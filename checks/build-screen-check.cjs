// Eraser's sign-off check for the + build screen (/new), run against the app itself.
// Usage: node checks/build-screen-check.cjs http://localhost:3505 [chrome|webkit] [--read-only]
// Needs playwright-core (npm install --no-save playwright-core).
//
// It CREATES agents (a pick, a drop), so point it at a server started with a scratch home:
//   AGENT_CREATOR_HOME=<scratch folder> PORT=3505 npm start
// --read-only (for the installed app's own server, which holds real data): every agent-making call is
// answered by the browser (page.route), so nothing reaches the server; it checks the screen, the motion,
// the pick and drop paths up to first light, cancel, bad drops and Esc.
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
    await page.route(/\/api\/agents\/fake[^/]+(\/files)?$/, (r, q) => {
      const id = q.url().match(/fake[^/]+/)[0], a = fake.find(x => x.id === id);
      if (q.method() === 'DELETE') { fake = fake.filter(x => x.id !== id); return r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); }
      if (q.method() === 'POST') { const files = JSON.parse(q.postData()).files; a.dna = files.map((f, i) => ({ id: f.path, name: f.path, sizeBytes: f.size, addedAt: new Date(Date.now() + i).toISOString(), topic: f.path.split('/')[0] })); a.posted = files; }
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id, name: '', draft: {}, dna: a ? a.dna : [] }) });
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

  /* ---------- 1. One way to do each thing ---------- */
  let page = await open(browser, false);
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
    return { controls, tabbable, words, dropTargets, fileInputs, canvases: document.querySelectorAll('canvas').length,
      sizeControls: document.querySelectorAll('input[type=range], select, [name*=size i], [id*=size i]').length,
      label: pick.getAttribute('aria-label'), spanColor: getComputedStyle(span).color, imgs: document.querySelectorAll('img, svg').length };
  });
  ok(look.controls.length === 1 && look.controls[0] === 'pick', '1. exactly one control on screen: the middle', JSON.stringify(look.controls));
  ok(look.tabbable.length === 1 && look.tabbable[0] === 'pick', '1. one Tab stop', JSON.stringify(look.tabbable));
  ok(look.fileInputs.length === 1 && look.fileInputs[0].dir && look.fileInputs[0].hidden, '1. one folder picker (webkitdirectory), never shown', JSON.stringify(look.fileInputs));
  ok(look.dropTargets === 0, '1. no second drop target (drop works anywhere on the page)');
  ok(look.sizeControls === 0, '1. no size controls');
  ok(look.imgs === 0 && look.canvases === 2, '1. nothing drawn but the field and the logo canvas', look.canvases + ' canvases, ' + look.imgs + ' img/svg');
  ok(look.words.length === 1 && look.words[0].text === 'Select Folder' && look.words[0].op === 0, '1. no words at rest (the one word is invisible until hover)', JSON.stringify(look.words));
  ok(look.label === 'Select Folder', '1. the middle is named "Select Folder" for VoiceOver');

  /* ---------- 2. Rest ---------- */
  let s = await watch(page, 1200);
  let last = s[s.length - 1];
  ok(last.state === 'rest' && last.rs.length === 30, '2. rest: a ring of 30 fireflies', last.state + ', ' + last.rs.length);
  ok(radiiOk(s).ok, '2. rest: radii 2.5..6.0', radiiOk(s).range);
  ok(s.every(x => x.text === 0), '2. rest: no word');
  ok(s[0].xs.join() !== last.xs.join() && s.every(x => x.m === 1), '2. rest: the ring turns slowly at speed 1');

  /* ---------- 3. Hover: the faint word, in the firefly colour ---------- */
  await page.mouse.move(500, 400); await page.waitForTimeout(700);
  s = await watch(page, 600);
  const peakText = Math.max(...s.map(x => x.text));
  ok(s[s.length - 1].state === 'lean', '3. hover on the middle: lean', s[s.length - 1].state);
  ok(peakText > .3 && peakText <= .36, '3. hover word peaks at ' + peakText + ' (<= .36: very faint)');
  ok(look.spanColor === 'rgb(216, 242, 106)', '3. the word is the firefly colour', look.spanColor);
  const spanOp = await page.evaluate(() => +getComputedStyle(document.querySelector('#pick span')).opacity);
  ok(spanOp <= .36, '3. the word as drawn has opacity ' + spanOp);
  ok(radiiOk(s).ok, '3. lean: radii 2.5..6.0', radiiOk(s).range);
  await page.mouse.move(40, 40); await page.waitForTimeout(800);
  ok((await info(page)).textOpacity === 0, '3. leaving the middle fades the word away');

  /* ---------- 4. Drag stir: no word, a little faster, back to rest ---------- */
  await page.mouse.move(500, 400); await page.waitForTimeout(500);
  const stirWatch = watch(page, 1100);
  await stirFor(page, 1000);
  s = await stirWatch;
  const stirred = s.filter(x => x.state === 'stir');
  ok(stirred.length > 10, '4. a drag stirs the ring', stirred.length + ' frames in stir');
  // Hovering when the drag comes in: the word takes its normal 600 ms out-fade, then stays gone.
  const t0s = stirred.length ? stirred[0].t : 0;
  ok(stirred.every((x, k) => k === 0 || x.text <= stirred[k - 1].text) && stirred.filter(x => x.t - t0s > 650).every(x => x.text === 0), '4. no word while a drag is over the window (it fades at once, gone by 650 ms)', JSON.stringify(stirred.filter((x, k) => k % 8 === 0).map(x => [x.t - t0s, x.text])));
  const mMax = Math.max(...s.map(x => x.m));
  ok(mMax > 1 && mMax <= 1.6, '4. stir speeds up a little: m up to ' + mMax);
  ok(radiiOk(s).ok, '4. stir: radii 2.5..6.0', radiiOk(s).range);
  const back = await until(page, i => i.state !== 'stir', 1000);
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
  ok(held.state === 'lean' && held.textOpacity > .3, '6. while Finder is open the lean holds (pointer away)', held.state + ' text ' + held.textOpacity);
  await page.evaluate(() => document.querySelector('#folder').dispatchEvent(new Event('cancel')));
  s = await watch(page, 1300);
  const fadeMs = (s.find(x => x.text === 0) || { t: -1 }).t;
  ok(fadeMs >= 600 && s[s.length - 1].state === 'rest', '6. cancel: the word fades slowly (' + fadeMs + ' ms) and the ring rests');
  ok(s.every(x => x.m === 1), '6. cancel: no speed change');
  ok(await countAgents() === n0, '6. cancel makes no agent');
  ok(page.errors.length === 0, '1-6. no page errors', JSON.stringify(page.errors));
  await page.close();

  /* ---------- 7. Pick a folder: answer, then first light ---------- */
  async function chosen(reduce, how) {
    const p = await open(browser, reduce);
    await p.goto(base + '/new'); await p.waitForTimeout(900);
    const before = await countAgents();
    const w = watch(p, 2600);
    if (how === 'pick') {
      const ch = p.waitForEvent('filechooser');
      await p.click('#pick');
      await (await ch).setFiles(folder);
    } else await drop(p, 'files');
    const sm = await w;
    const firstAnswer = sm.find(x => x.state === 'answer'), fl = sm.find(x => x.state === 'first-light');
    const out = {
      p, sm, ms: fl && firstAnswer ? fl.t - firstAnswer.t : -1, reached: !!fl,
      mMax: Math.max(...sm.map(x => x.m)), radii: radiiOk(sm.filter(x => x.rs.length)),
      status: await p.textContent('#status'), logo: await p.evaluate(() => getComputedStyle(document.querySelector('#logo')).opacity),
      logoLit: await p.evaluate(() => { const cv = document.querySelector('#logo'); if (!cv.width) return 0; const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let x = 0; for (let k = 3; k < d.length; k += 4) x += d[k]; return x; }),
      made: (await countAgents()) - before,
      moved: sm.filter(x => x.state === 'answer' && x.xs.length).map(x => x.xs.join()),
    };
    if (out.made === 1) {
      if (readOnly) out.files = fake[fake.length - 1].posted.map(f => f.path).sort();
      else { const all = await (await fetch(base + '/api/agents')).json(); const a = all.sort((x, y) => Date.parse(y.createdAt) - Date.parse(x.createdAt))[0]; out.files = (a.dna || []).map(f => f.id).sort(); out.id = a.id; }
    }
    return out;
  }
  for (const how of ['pick', 'drop']) {
    const r = await chosen(false, how);
    ok(r.reached, `7. ${how}: answer, then first light`, r.ms + ' ms from answer to first light');
    ok(r.ms > 0 && r.ms <= 2000, `7. ${how}: first light in about 1.5 s`, r.ms + ' ms');
    ok(r.mMax > 5.5 && r.mMax <= 6, `7. ${how}: the burst (speed up to ${r.mMax})`);
    ok(r.radii.ok, `7. ${how}: radii 2.5..6.0 through the burst`, r.radii.range);
    ok(r.logo === '1' && r.logoLit > 0, `7. ${how}: the placeholder (the new agent's DNA logo) is shown`, 'opacity ' + r.logo + ', lit ' + r.logoLit);
    ok(r.status === 'New agent', `7. ${how}: VoiceOver hears "New agent"`, JSON.stringify(r.status));
    ok(r.made === 1, `7. ${how}: exactly one agent made`, String(r.made));
    if (how === 'pick') ok(JSON.stringify(r.files) === JSON.stringify(['Recipes/bread.txt', 'Recipes/soup.md']), '7. pick: the folder\'s files, hidden file left out', JSON.stringify(r.files));
    else ok(r.files && r.files.length === 2, '7. drop: the dropped files', JSON.stringify(r.files));
    // a second drop during first light does nothing
    if (how === 'drop') { const n = await countAgents(); await drop(r.p, 'files'); await r.p.waitForTimeout(600); ok(await countAgents() === n, '7. a second drop after the answer is ignored'); }
    ok(r.p.errors.length === 0, `7. ${how}: no page errors`, JSON.stringify(r.p.errors));
    // Esc from first light goes home, and the new agent is there
    await r.p.keyboard.press('Escape'); await r.p.waitForURL(u => new URL(u).pathname === '/', { timeout: 4000 }).catch(() => {});
    ok(new URL(r.p.url()).pathname === '/', `7. ${how}: Esc from first light goes home`, r.p.url());
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
  ok(settled >= 0, '8. a failed save settles back to rest', settled + ' ms');
  await page.waitForTimeout(1000); i = await info(page);
  ok(i.m === 1, '8. after a failed save the ring is back to speed 1 (not left stirred)', 'm=' + i.m + ', alpha ' + Math.max(...i.flies.map(f => f.a)));
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
  ok(st === 'answer' && new URL(page.url()).pathname === '/', '9. Esc during the answer goes home', st);
  await page.close();
  await sleep(1800);   // let the held save fail and clean itself up

  /* ---------- 10. Reduce Motion: nothing moves, no speed-up ---------- */
  page = await open(browser, true);
  await page.goto(base + '/new'); await page.waitForTimeout(800);
  const h1 = await canvasHash(page), i1 = await info(page); await page.waitForTimeout(1000);
  const h2 = await canvasHash(page), i2 = await info(page);
  ok(h1 === h2, '10. RM: two frames 1 s apart are identical', h1 + ' / ' + h2 + ' / ' + await canvasHash(page));
  ok(JSON.stringify(i1.flies) === JSON.stringify(i2.flies) && i2.m === 1, '10. RM: no orbit movement, speed 1');
  await page.mouse.move(500, 400); await page.waitForTimeout(700);
  const i3 = await info(page);
  ok(i3.state === 'lean' && i3.textOpacity <= .36 && i3.textOpacity > .3, '10. RM: hover still shows the faint word', String(i3.textOpacity));
  ok(i3.flies.every((f, k) => f.x === i1.flies[k].x && f.y === i1.flies[k].y && f.r === i1.flies[k].r), '10. RM: hover changes brightness only (no lean, no growth)');
  await page.mouse.move(40, 40); await page.waitForTimeout(700);
  s = await (async () => { const w = watch(page, 900); await stirFor(page, 700); return w; })();
  ok(s.every(x => x.m === 1 && x.xs.join() === s[0].xs.join()), '10. RM: a drag stirs brightness only, nothing moves');
  await page.close();
  for (const how of ['pick', 'drop']) {
    const r = await chosen(true, how);
    ok(r.reached && r.ms > 0 && r.ms <= 2000, `10. RM ${how}: first light`, r.ms + ' ms');
    ok(r.mMax === 1, `10. RM ${how}: no speed-up`, 'm max ' + r.mMax);
    ok(new Set(r.moved).size <= 1, `10. RM ${how}: the ring fades in place, never gathers`, new Set(r.moved).size + ' positions');
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
