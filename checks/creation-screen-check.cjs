// Eraser's sign-off check for the split creation screen (/new after a folder lands).
// Usage: node checks/creation-screen-check.cjs http://localhost:3505 [chrome|webkit] [--home <scratch home>]
// Needs playwright-core (npm install --no-save playwright-core).
//
// It CREATES agents and marks files used, so point it at a server started with a scratch home:
//   AGENT_CREATOR_HOME=<scratch folder> PORT=3505 npm start
// and pass the same folder as --home (used only to mark files "used", which has no endpoint yet).
const pw = require('playwright-core');
const path = require('path');
const base = process.argv[2] || 'http://localhost:3505';
const which = process.argv[3] || 'chrome';
const hi = process.argv.indexOf('--home');
const home = hi > 0 ? path.resolve(process.argv[hi + 1]) : null;
let fails = 0;
const ok = (cond, label, extra = '') => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + label + (extra ? '  ' + extra : '')); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const api = async (method, url, body) => { const r = await fetch(base + url, { method, headers: body ? { 'content-type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined }); return r.json(); };

// Drop n synthetic files on the page at (x, y). Folder-like paths come from the name only, so the files sit in one "folder".
const dropFiles = (page, n, x, y, prefix = 'f') => page.evaluate(({ n, x, y, prefix }) => {
  const dt = new DataTransfer();
  for (let k = 0; k < n; k++) dt.items.add(new File(['x'.repeat(1 + (k % 50))], `${prefix}${k}.md`, { type: 'text/markdown' }));
  const at = { bubbles: true, cancelable: true, clientX: x, clientY: y, dataTransfer: dt };
  document.body.dispatchEvent(new DragEvent('dragenter', at));
  document.body.dispatchEvent(new DragEvent('dragover', at));
  document.body.dispatchEvent(new DragEvent('drop', at));
}, { n, x, y, prefix });
const cinfo = page => page.evaluate(() => window.creation.info());
const centre = (page, sel) => page.evaluate(sel => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
const until = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await fn()) return Date.now() - t0; await sleep(60); } return -1; };

(async () => {
  const browser = which === 'webkit' ? await pw.webkit.launch() : await pw.chromium.launch({ channel: 'chrome' });
  console.log('== ' + which + ' against ' + base);
  const page = await browser.newPage({ viewport: { width: 1200, height: 820 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('/favicon.ico')) errors.push(r.status() + ' ' + r.url()); });
  await page.goto(base + '/new'); await page.waitForTimeout(900);

  /* ---------- 1. The scan: 10,000 files, fast orbit until the last batch, no freeze ---------- */
  // Build the 10,000 File objects first (that is the test's own work, not the screen's), then time from the drop on.
  await page.evaluate(() => { const dt = new DataTransfer(); for (let k = 0; k < 10000; k++) dt.items.add(new File(['x'.repeat(1 + (k % 50))], `f${k}.md`)); window._big = dt; });
  await page.evaluate(() => {
    window._scan = { gaps: [], states: [], totals: [] };
    let last = performance.now();
    const f = t => {
      if (window._scan.started) window._scan.gaps.push(t - last); last = t;
      const o = window.orbit.info(), c = window.creation.info();
      window._scan.states.push({ t, state: o.state, m: o.m, total: c.field.total, split: c.split });
      if (!c.split) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
  const t0 = Date.now();
  await page.evaluate(() => {
    const at = { bubbles: true, cancelable: true, clientX: 300, clientY: 300, dataTransfer: window._big };
    document.body.dispatchEvent(new DragEvent('dragenter', at)); document.body.dispatchEvent(new DragEvent('dragover', at));
    window._scan.started = true; document.body.dispatchEvent(new DragEvent('drop', at));
  });
  const splitMs = await until(async () => (await cinfo(page)).split, 90000);
  ok(splitMs >= 0, '1. 10,000 files: the split comes', (Date.now() - t0) + ' ms');
  const scan = await page.evaluate(() => window._scan);
  const gaps = scan.gaps.slice(1), worst = Math.max(...gaps);
  const sorted = [...gaps].sort((a, b) => a - b), p95 = sorted[Math.floor(sorted.length * .95)];
  ok(worst < 250, '1. no freeze: longest frame ' + Math.round(worst) + ' ms (p95 ' + Math.round(p95) + ' ms, ' + gaps.length + ' frames)');
  const fullAt = scan.states.findIndex(s => s.total === 10000);
  const firstLight = scan.states.findIndex(s => s.state === 'first-light');
  const growing = new Set(scan.states.filter(s => s.state === 'answer').map(s => s.total)).size;
  ok(growing > 3, '1. fireflies land batch by batch during the scan', growing + ' different counts while circling');
  ok(fullAt >= 0 && (firstLight < 0 || firstLight >= fullAt), '1. the fast circling lasts until every file is in (first light only after 10,000)', 'full at frame ' + fullAt + ', first light at ' + firstLight);
  // After the burst's ramp-up (the first files land while it is still accelerating).
  const firstBatchT = (scan.states.find(s => s.total > 0) || { t: 0 }).t;
  const fast = scan.states.filter(s => s.state === 'answer' && s.total > 0 && s.total < 10000 && s.t - firstBatchT > 400);
  ok(fast.length > 0 && fast.every(s => s.m > 3), '1. while files are still coming the orbit runs fast', 'min m ' + Math.min(...fast.map(s => s.m)).toFixed(2));
  await page.waitForTimeout(800);
  let c = await cinfo(page);
  ok(c.field.total === 10000 && c.field.drawn === 3000, '1. field: 10,000 counted, 3,000 drawn', c.field.total + '/' + c.field.drawn);
  ok((await page.textContent('#count')) === '10,000 files · 3,000 shown', '1. the count line', await page.textContent('#count'));
  const id = new URL(page.url()).searchParams.get('agent');
  ok(!!id, '1. the URL holds the agent (a reload comes back to the split)', page.url());

  /* ---------- 2. One way per action: what the menu shows ---------- */
  const look = await page.evaluate(() => {
    const vis = e => { const s = getComputedStyle(e), b = e.getBoundingClientRect(); return !e.closest('[hidden]') && s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0; };
    const btns = [...document.querySelectorAll('#menu button, #menu a, #menu [role=button]')].filter(b => vis(b) && !b.disabled).map(b => b.getAttribute('aria-label') || b.className);
    const lines = [...document.querySelectorAll('#menu .line')].filter(vis).map(l => l.textContent);
    return { btns, lines, zones: [...document.querySelectorAll('#menu .zone')].map(z => z.textContent), zoneOp: [...document.querySelectorAll('#menu .zone')].map(z => getComputedStyle(z).opacity) };
  });
  ok(JSON.stringify(look.btns) === JSON.stringify(['Open system prompt', 'Open knowledge']), '2. menu at the split: one open icon per text section, nothing else to press (belts empty, no skills yet)', JSON.stringify(look.btns));
  ok(new Set(look.lines).size === 1, '2. every empty section says the same thing', JSON.stringify(look.lines));
  ok(look.zoneOp.every(o => o === '0'), '2. zones hidden when nothing is dragged');

  /* ---------- 3. Drop zones while dragging, and routing ---------- */
  const zoneAt = async sel => { const p = await centre(page, sel); return p; };
  const sp = await zoneAt('[data-section="system-prompt"]'), kn = await zoneAt('[data-section="knowledge"]'), sk = await zoneAt('[data-section="skills"]');
  await page.evaluate(p => { const dt = new DataTransfer(); dt.items.add(new File(['a'], 'a.md')); const at = { bubbles: true, cancelable: true, clientX: p.x, clientY: p.y, dataTransfer: dt }; document.body.dispatchEvent(new DragEvent('dragenter', at)); window._held = setInterval(() => document.body.dispatchEvent(new DragEvent('dragover', at)), 50); }, kn);
  await page.waitForTimeout(400);
  const during = await page.evaluate(() => ({ dragging: document.body.classList.contains('dragging'), labels: [...document.querySelectorAll('#menu .zone')].map(z => [z.textContent, getComputedStyle(z).opacity]), hot: [...document.querySelectorAll('#menu .hot')].map(s => s.dataset.section) }));
  ok(during.dragging && during.labels.every(([, o]) => o === '1'), '3. a Finder drag shows all three zones', JSON.stringify(during.labels));
  ok(JSON.stringify(during.labels.map(l => l[0])) === JSON.stringify(['Adjust DNA', 'Adjust Knowledge', 'Create new skill']), '3. zone words');
  ok(JSON.stringify(during.hot) === JSON.stringify(['knowledge']), '3. the zone under the pointer lights', JSON.stringify(during.hot));
  await page.evaluate(() => clearInterval(window._held));
  await page.waitForTimeout(500);
  ok(!(await page.evaluate(() => document.body.classList.contains('dragging'))), '3. the zones go when the drag leaves');

  await dropFiles(page, 2, kn.x, kn.y, 'kn');
  await until(async () => (await cinfo(page)).sections.knowledge.length === 2, 8000);
  c = await cinfo(page);
  ok(c.sections.knowledge.length === 2 && c.sections['system-prompt'].length === 0, '3. Finder files on Adjust Knowledge go to Knowledge only', JSON.stringify(c.sections));
  ok(c.field.total === 10002, '3. and join the agent (field 10,002)', String(c.field.total));
  await dropFiles(page, 3, sp.x, sp.y, 'sp');
  await until(async () => (await cinfo(page)).sections['system-prompt'].length === 3, 8000);
  c = await cinfo(page);
  ok(c.sections['system-prompt'].length === 3, '3. Finder files on Adjust DNA go to System prompt', JSON.stringify(c.sections['system-prompt']));
  await page.waitForTimeout(300);
  await dropFiles(page, 2, sk.x, sk.y, 'sk');
  await until(async () => (await cinfo(page)).skills.length === 1, 8000);
  c = await cinfo(page);
  ok(c.skills.length === 1, '3. Finder files on Create new skill make one skill', JSON.stringify(c.skills));

  // A firefly carried from the field onto Knowledge.
  const dot = c.field.dots.find(d => !c.sections.knowledge.some(f => f.path === d.id));
  await page.mouse.move(dot.x, dot.y); await page.mouse.down();
  await page.mouse.move((dot.x + kn.x) / 2, (dot.y + kn.y) / 2, { steps: 5 });
  const carry = await page.evaluate(() => ({ dragging: document.body.classList.contains('dragging'), ghost: document.querySelector('#ghost').classList.contains('on') }));
  await page.mouse.move(kn.x, kn.y, { steps: 5 });
  const hotCarry = await page.evaluate(() => [...document.querySelectorAll('#menu .hot')].map(s => s.dataset.section));
  await page.mouse.up();
  ok(carry.dragging && carry.ghost, '3. carrying a firefly shows the zones and the carried dot', JSON.stringify(carry));
  ok(JSON.stringify(hotCarry) === '["knowledge"]', '3. carried over Knowledge: Knowledge lights', JSON.stringify(hotCarry));
  await until(async () => (await cinfo(page)).sections.knowledge.length === 3, 8000);
  c = await cinfo(page);
  ok(c.sections.knowledge.some(f => f.path === dot.id) && c.field.total === 10007, '3. the carried firefly lands in Knowledge, nothing new added to the agent', c.sections.knowledge.length + ' in Knowledge, field ' + c.field.total);

  /* ---------- 4. Belt dim/bright per file, click opens the list ---------- */
  if (home) {
    const { createAgentStore, createAgents } = await import(path.join(__dirname, '..', 'src', 'creator', 'index.mjs'));
    const agents = createAgents({ store: createAgentStore({ home }), engine: {} });
    const kpaths = c.sections.knowledge.map(f => f.path);
    await agents.markProcessed(id, 'knowledge', [kpaths[0]]);
    await page.reload(); await until(async () => { try { return (await cinfo(page)).sections.knowledge.length === 3; } catch { return false; } }, 8000);
    await page.waitForTimeout(500);
    const belt = await page.evaluate(() => { const s = document.querySelector('[data-section="knowledge"]'); return { dots: [...s.querySelectorAll('.belt .d')].map(d => [d.className, getComputedStyle(d).opacity]), line: s.querySelector('.belt .line').textContent }; });
    ok(belt.dots.length === 3 && belt.dots.filter(d => d[0] === 'd processed' && +d[1] > .8).length === 1 && belt.dots.filter(d => d[0] === 'd unprocessed' && +d[1] < .4).length === 2, '4. belt: one bright, two dim', JSON.stringify(belt.dots));
    ok(belt.line === '1 used · 2 waiting', '4. belt line', belt.line);
    await page.click('[data-section="knowledge"] .belt');
    await page.waitForTimeout(500);
    const rows = await page.evaluate(() => [...document.querySelectorAll('[data-section="knowledge"] .rows li')].filter(li => li.offsetHeight).map(li => [li.className, li.querySelector('.n').textContent, li.querySelectorAll('button').length]));
    ok(rows.length === 3 && rows.every(r => r[2] === 1), '4. clicking the belt opens the list: every file once, one Remove each', JSON.stringify(rows));
    await page.click('[data-section="knowledge"] .belt'); await page.waitForTimeout(200);
    ok(await page.evaluate(() => document.querySelector('[data-section="knowledge"] .rows').hidden), '4. clicking the belt again closes it');
    await page.click('[data-section="knowledge"] .belt'); await page.waitForTimeout(400);

    /* ---------- 5. Remove: never-used leaves, used turns red until a full rebuild ---------- */
    const usedName = await page.evaluate(() => document.querySelector('[data-section="knowledge"] .rows li.processed .n').textContent);
    await page.click('[data-section="knowledge"] .rows li.processed button');
    await page.waitForTimeout(700);
    let k = await page.evaluate(() => ({ rows: [...document.querySelectorAll('[data-section="knowledge"] .rows li')].map(li => [li.className, li.querySelectorAll('button').length, (li.querySelector('.out') || {}).textContent || '', getComputedStyle(li.querySelector('.n')).color]), note: document.querySelector('#note span').textContent, undo: !document.querySelector('#note button').hidden }));
    const red = k.rows.find(r => r[0] === 'removed');
    ok(red && red[1] === 0 && red[2] === 'out at next rebuild' && red[3] === 'rgb(255, 107, 94)', '5. a used file, removed: stays, red, "out at next rebuild", no second Remove', JSON.stringify(red));
    ok(k.note.includes('not from your Mac') && k.undo, '5. confirmation says "not from your Mac", with Undo', k.note);
    let a = await api('GET', `/api/agents/${id}`);
    const gone = a.dna.find(f => f.id === 'f0.md');
    ok(gone && gone.state === 'removed', '5. on the server the used file is marked removed (kept until the rebuild)', JSON.stringify(gone && { id: gone.id, state: gone.state }));
    await page.click('#note button');
    await until(async () => (await cinfo(page)).sections.knowledge.filter(f => f.state !== 'removed').length === 3, 6000);
    c = await cinfo(page);
    ok(c.field.total === 10007, '5. Undo brings it back', JSON.stringify(c.sections.knowledge));
    await page.waitForTimeout(400);
    // remove it again (it is now unprocessed? whatever the server says) and a never-used one
    const waitingName = await page.evaluate(() => document.querySelector('[data-section="knowledge"] .rows li.unprocessed .n').textContent);
    await page.click('[data-section="knowledge"] .rows li.unprocessed button');
    await page.waitForTimeout(700);
    k = await page.evaluate(() => [...document.querySelectorAll('[data-section="knowledge"] .rows li .n')].map(n => n.textContent));
    ok(!k.includes(waitingName), '5. a never-used file, removed: leaves the list', JSON.stringify(k));
    await agents.markProcessed(id, 'knowledge', c.sections.knowledge.map(f => f.path));
    await page.reload(); await page.waitForTimeout(1500);
    await page.click('[data-section="knowledge"] .belt'); await page.waitForTimeout(400);
    await page.click('[data-section="knowledge"] .rows li.processed button'); await page.waitForTimeout(700);
    c = await cinfo(page);
    ok(c.sections.knowledge.some(f => f.state === 'removed'), '5. red after remove', JSON.stringify(c.sections.knowledge));
    const redOnField = await page.evaluate(() => window.creation.info().field.dots.some(d => d.state === 'removed'));
    await page.reload(); await page.waitForTimeout(1500);
    c = await cinfo(page);
    ok(c.sections.knowledge.some(f => f.state === 'removed'), '5. still red after a reload (until the rebuild)', JSON.stringify(c.sections.knowledge));
    await agents.rebuilt(id);
    await page.reload(); await page.waitForTimeout(1500);
    c = await cinfo(page);
    ok(!c.sections.knowledge.some(f => f.state === 'removed') && c.sections.knowledge.every(f => f.state === 'processed'), '5. after a full rebuild: red gone, the rest bright', JSON.stringify(c.sections.knowledge));
    console.log('     (red on the field before rebuild, among the first 50 drawn: ' + redOnField + ')  used file was ' + usedName);
  } else console.log('SKIP 4-5 (no --home: cannot mark files used)');

  /* ---------- 6. Popups open and save ---------- */
  const type = async (sel, text) => { await page.click(sel); await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A'); await page.keyboard.type(text); };
  await page.click('[data-open="system-prompt"]');
  await until(() => page.evaluate(() => document.querySelector('#sheet').open && !document.querySelector('#sheet-text').disabled), 4000);
  ok(await page.textContent('#sheet-title') === 'System prompt', '6. the system prompt opens');
  await type('#sheet-text', 'You are the soup agent.');
  await page.waitForTimeout(1200);
  ok((await api('GET', `/api/agents/${id}/system-prompt`)).text === 'You are the soup agent.', '6. the system prompt saves by itself after typing');
  await type('#sheet-text', 'You are the bread agent.');
  await page.keyboard.press('Escape'); await page.waitForTimeout(600);
  ok(!(await page.evaluate(() => document.querySelector('#sheet').open)) && new URL(page.url()).pathname === '/new', '6. Esc closes the popup (and stays on the screen)');
  ok((await api('GET', `/api/agents/${id}/system-prompt`)).text === 'You are the bread agent.', '6. closing saves at once');

  await page.click('[data-open="knowledge"]');
  await until(() => page.evaluate(() => document.querySelector('#sheet').open && !document.querySelector('#sheet-text').disabled), 4000);
  const kn2 = await page.evaluate(() => ({ title: document.querySelector('#sheet-title').textContent, ro: document.querySelector('#sheet-text').readOnly }));
  ok(kn2.title === 'Knowledge' && kn2.ro, '6. knowledge opens (read-only: it is built from the files)', JSON.stringify(kn2));
  await page.click('#sheet .close'); await page.waitForTimeout(300);
  ok(!(await page.evaluate(() => document.querySelector('#sheet').open)), '6. Close closes');

  await page.click('[data-section="skills"] .star');
  await until(() => page.evaluate(() => document.querySelector('#sheet').open && !document.querySelector('#sheet-text').disabled), 4000);
  const skId = (await api('GET', `/api/agents/${id}/skills`)).skills[0].id;
  await type('#sheet-name', 'Bake');
  await type('#sheet-text', 'Knead, rest, bake.');
  await page.waitForTimeout(1200);
  const skill = await api('GET', `/api/agents/${id}/skills/${encodeURIComponent(skId)}`);
  ok(skill.name === 'Bake' && skill.body === 'Knead, rest, bake.', '6. a skill opens and saves its name and steps', JSON.stringify({ name: skill.name, body: skill.body }));
  await page.mouse.click(5, 5); await page.waitForTimeout(400);
  ok(!(await page.evaluate(() => document.querySelector('#sheet').open)), '6. a click on the backdrop closes');
  ok(await page.getAttribute('[data-section="skills"] .star', 'aria-label') === 'Open skill Bake', '6. the star takes the new name');

  ok(errors.length === 0, 'no page errors', JSON.stringify(errors.slice(0, 5)));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
