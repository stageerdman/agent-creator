// Browser check for the Left Side: the mess gathering into the likeness, the Sketcher handle and panel.
// Usage: node checks/left-side-check.cjs http://localhost:3505 --home <scratch home>
// Needs playwright-core (npm install --no-save playwright-core).
//
// It CREATES an agent and marks its files used, so point it at a server started with a scratch home:
//   AGENT_CREATOR_HOME=<scratch folder> PORT=3505 npm start
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

  /* ---------- 3. Keyboard and the close button ---------- */
  await page.focus('#handle'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  ok((await linfo(page)).panel.open, '3. Enter on the focused handle opens it');
  await page.click('#sketcher-close'); await page.waitForTimeout(500);
  ok(!(await linfo(page)).panel.open, '3. the ‹ close button closes it');
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
  ok((await linfo(sp)).panel.open && Math.round(pw2) === 390, '6. small screen: a tap opens the panel across the whole width', String(pw2));
  await sp.click('#sketcher-close'); await sp.waitForTimeout(600);
  ok(!(await linfo(sp)).panel.open, '6. small screen: ‹ closes it');

  ok(errors.length === 0, 'no page errors or failed requests', errors.slice(0, 5).join(' | '));
  if (isLost()) throw new Error('browser lost');
  await browser.close();
  await webkitChat(agents, id);
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
  }
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
