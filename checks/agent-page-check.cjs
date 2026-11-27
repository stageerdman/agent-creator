// Browser check for the agent page (design/agent-page.md): Edit, Profile, DNA, Talk, the draft line.
// Usage: node checks/agent-page-check.cjs http://localhost:3505
// It CREATES two agents and talks to one through the REAL /api/agents/:id/talk route, so start
// the real server with only the CLI faked (it echoes what it is sent), on a scratch home:
//   AGENT_CREATOR_HOME=<scratch folder> PORT=3505 node checks/mock-engine-server.mjs
const pw = require('playwright-core');
const base = process.argv[2] || 'http://localhost:3505';
let fails = 0;
const ok = (cond, label, extra = '') => { if (!cond) fails++; console.log((cond ? 'PASS ' : 'FAIL ') + label + (extra ? '  ' + extra : '')); };
const api = async (method, url, body) => {
  const r = await fetch(base + url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  if (!r.ok) throw new Error(`${method} ${url}: ${r.status}`);
  return r.json();
};
// The fake CLI answers "Echo: " + these words: markdown, then the block naming what it used.
const ASK = 'Here is **one** thing:\n\n1. `tax`\n<used>{"files":["knowledge.md","not-given.pdf"]}</used>';

async function one(kind, launch, created, draft) {
  console.log(`== ${kind} against ${base}`);
  const browser = await launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const talks = [];
  page.on('response', r => { if (/\/api\/agents\/[^/]+\/talk$/.test(r.url())) talks.push(r.status()); if (r.status() >= 400 && process.env.TRACE) console.log('.. ' + r.status() + ' ' + r.url()); });

  page.on('console', m => { if (m.type() === 'error' && !/favicon\.ico$/.test(m.location().url || '')) errors.push(m.text() + ' ' + (m.location().url || '')); });
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

  const before = (await api('GET', `/api/agents/${created}`)).talk.length;
  await page.fill('#talk-box', ASK);
  await page.press('#talk-box', 'Enter');
  await page.waitForSelector('#talk-log .agent:last-child .used', { timeout: 8000 });
  const r = await page.$eval('#talk-log', l => { const a = l.querySelector('.agent:last-child'); return { you: [...l.querySelectorAll('.you')].pop()?.textContent, strong: a.querySelectorAll('strong').length, code: a.querySelectorAll('code').length, ol: a.querySelectorAll('ol').length, text: a.querySelector('.md').textContent, used: a.querySelector('.used').textContent }; });
  ok(talks.length === 1 && talks[0] === 200, `G4 ${kind}: the real talk route answered`, JSON.stringify(talks));
  ok(r.you === ASK, `G4 ${kind}: your line shows`);
  ok(r.strong === 1 && r.code === 1 && r.ol === 1 && !r.text.includes('**') && !r.text.includes('<used>'), `F14 ${kind}: the answer is formatted markdown, the block never shows`, JSON.stringify(r));
  ok(r.used === 'Used · knowledge.md', `F14 ${kind}: a quiet line says what it used (only names it was given)`, r.used);
  const kept = (await api('GET', `/api/agents/${created}`)).talk;
  ok(kept.length === before + 2 && kept.at(-1).who === 'agent', `G4 ${kind}: the talk is saved with the agent`, String(kept.length));
  await page.reload();
  await page.waitForSelector('#talk-log .agent .used', { timeout: 8000 });
  ok(await page.$$eval('#talk-log .agent', d => d.length) === kept.filter(t => t.who === 'agent').length, `G4 ${kind}: after a reload the talk is still there`);

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
