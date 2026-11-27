// Browser check for the agent page (design/agent-page.md): Edit, Profile, DNA, Talk, the draft line.
// Usage: node checks/agent-page-check.cjs http://localhost:3505
// It CREATES two agents, so start the server with a scratch home:
//   AGENT_CREATOR_HOME=<scratch folder> PORT=3505 npm start
// The talk endpoint is stubbed in the browser (page.route), so no AI is needed.
const pw = require('playwright-core');
const base = process.argv[2] || 'http://localhost:3505';
let fails = 0;
const ok = (cond, label, extra = '') => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + label + (extra ? '  ' + extra : '')); };
const api = async (method, url, body) => {
  const r = await fetch(base + url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(`${method} ${url}: ${r.status}`);
  return r.json();
};
const SSE = 'event: delta\ndata: {"text":"Here is **one** thing:\\n\\n1. "}\n\n'
  + 'event: done\ndata: {"say":"Here is **one** thing:\\n\\n1. `tax`","used":[{"kind":"skill","name":"Taxes"},{"kind":"file","name":"law.pdf"}]}\n\n';

async function one(kind, launch, created, draft) {
  console.log(`== ${kind} against ${base}`);
  const browser = await launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/api/agents/*/talk', route => route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: SSE }));

  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${base}/agents/${encodeURIComponent(created)}`);
  await page.waitForSelector('#views:not([hidden])', { timeout: 8000 }).catch(async e => {
    console.log('.. page shows:', await page.$eval('#name', n => n.textContent), errors.join(' | '));
    throw e;
  });
  const edit = await page.$eval('#edit', e => ({ href: e.getAttribute('href'), hidden: e.hidden }));
  ok(!edit.hidden && edit.href === `/new?agent=${encodeURIComponent(created)}`, `C9 ${kind}: Edit (top right) goes back to the build screen`, JSON.stringify(edit));
  const labels = await page.$$eval('#profile-list dt', d => d.map(x => x.textContent));
  ok(labels.join('|') === 'Good at|Medium|Not trained for', `G1 ${kind}: Profile shows the three words`, labels.join('|'));
  ok(await page.$eval('#name', e => e.textContent) === 'Tax Helper', `G1 ${kind}: name on the page`);
  await page.click('#tab-dna');
  const h2 = await page.$$eval('#dna:not([hidden]) h2', d => d.map(x => x.textContent));
  ok(h2.join('|') === 'Instructions|Made from|RAG files|Quality', `G2 ${kind}: DNA in order`, h2.join('|'));
  ok(await page.$eval('#profile', e => e.hidden), `G2 ${kind}: one view at a time`);
  ok(await page.isVisible('#talk-box') && await page.$eval('#not-yet', e => e.hidden), `G4 ${kind}: a created agent has the talk box`);

  await page.fill('#talk-box', 'What do you know?');
  await page.press('#talk-box', 'Enter');
  await page.waitForSelector('#talk-log .agent .used', { timeout: 8000 });
  const r = await page.$eval('#talk-log', l => ({ you: l.querySelector('.you')?.textContent, strong: l.querySelectorAll('.agent strong').length, code: l.querySelectorAll('.agent code').length, ol: l.querySelectorAll('.agent ol').length, raw: l.querySelector('.agent .md').textContent.includes('**'), used: l.querySelector('.agent .used').textContent }));
  ok(r.you === 'What do you know?', `G4 ${kind}: your line shows`);
  ok(r.strong === 1 && r.code === 1 && r.ol === 1 && !r.raw, `F14 ${kind}: the answer is formatted markdown`, JSON.stringify(r));
  ok(r.used === 'Used · Taxes, law.pdf', `F14 ${kind}: a quiet line says what it used`, r.used);

  await page.goto(`${base}/agents/${encodeURIComponent(draft)}`);
  await page.waitForSelector('#views:not([hidden])', { timeout: 8000 });
  ok(await page.isVisible('#not-yet') && !(await page.isVisible('#talk')), `G4 ${kind}: a draft says "Not created yet" and has no talk box`);

  ok(errors.length === 0, `${kind}: no page errors`, errors.slice(0, 3).join(' | '));
  // Last, on purpose: its 404 is the point.
  await page.goto(`${base}/agents/no-such-agent`);
  await page.waitForFunction(() => document.getElementById('name').textContent.length > 0, null, { timeout: 8000 });
  ok(/isn.t here/.test(await page.$eval('#name', e => e.textContent)), `${kind}: an unknown agent says it isn't here`);
  await browser.close();
}

(async () => {
  const created = (await api('POST', '/api/agents')).id;
  await api('PUT', `/api/agents/${created}/draft`, { name: 'Tax Helper', instructions: 'You help with **taxes**.' });
  await api('POST', `/api/agents/${created}/save`);
  const draft = (await api('POST', '/api/agents')).id;
  await api('PUT', `/api/agents/${draft}/draft`, { name: 'Half Done' });
  await one('chrome', () => pw.chromium.launch({ channel: 'chrome' }), created, draft);
  await one('webkit', () => pw.webkit.launch(), created, draft);
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
