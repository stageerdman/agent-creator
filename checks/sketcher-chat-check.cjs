// Browser check: the Sketcher panel answers for real (the user's own `claude` CLI, nothing faked),
// changes the agent, and the talk is there again after a reload.
// Usage: AGENT_CREATOR_HOME=<scratch folder> PORT=3506 npm start, then
//        node checks/sketcher-chat-check.cjs http://localhost:3506
// Needs playwright-core (npm install --no-save playwright-core). Costs a few cents of CLI use.
const pw = require('playwright-core');
const base = process.argv[2] || 'http://localhost:3506';
const fail = msg => { console.error('FAIL', msg); process.exit(1); };

(async () => {
  const post = (p, body) => fetch(base + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body && JSON.stringify(body) }).then(r => r.json());
  const { id } = await post('/api/agents');
  await post(`/api/agents/${id}/files`, { files: [{ path: 'talks/one.md', size: 2048 }] });

  const browser = await pw.chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('crash', () => console.error('page crashed'));
  page.on('pageerror', e => console.error('page error:', e.message));
  await page.goto(`${base}/new?agent=${id}`);
  await page.waitForSelector('#handle.in');
  await page.click('#handle');
  await page.fill('#sketcher-box', 'A calm chess coach for kids. Use the talks folder as knowledge.');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => { const p = document.querySelector('#sketcher-log > .sketcher:last-child'); return p && !p.classList.contains('wait'); }, null, { timeout: 180000 });
  let agent;   // the first words are on screen; the turn is done once it is saved
  for (let t = 0; t < 180 && !(agent && agent.chat.length); t++) {
    agent = await fetch(`${base}/api/agents/${id}`).then(r => r.json());
    await new Promise(r => setTimeout(r, 1000));
  }
  const answer = await page.textContent('#sketcher-log > .sketcher:last-child');
  if (/couldn.t answer/i.test(answer)) fail('Sketcher did not answer: ' + answer);
  console.log('answer:', answer.slice(0, 160).replace(/\n/g, ' '));
  if (!agent.draft.name) fail('the chat did not build the draft');
  console.log('draft name:', agent.draft.name, '| talks/one.md feeds:', agent.files[0].feeds.join(',') || 'none');

  await page.reload();
  await page.waitForSelector('#handle.in');
  const lines = await page.$$eval('#sketcher-log > div', ps => ps.map(p => p.classList[0]));
  if (lines.join() !== 'you,sketcher') fail('talk not shown after reload: ' + lines.join());
  await page.screenshot({ path: '.tmp-test/sketcher-chat.png' });
  console.log('PASS: real answer, draft built, talk kept over a reload');
  await browser.close();
})().catch(e => fail(e.stack));
