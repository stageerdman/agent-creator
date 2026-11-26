// Checks for Eraser's Glade Home v2 cuts (A1, C1-C4) at 1024x768.
const { chromium } = require('playwright-core');
const path = require('path');
const dir = path.resolve(__dirname, '../updates/2026-11-26 GLADE-HOME-V2');
const url = (f, q = '') => 'file://' + path.join(dir, f) + q;
const out = [];
const ok = (c, msg) => out.push((c ? 'ok   ' : 'FAIL ') + msg);

(async () => {
  const br = await chromium.launch({ channel: 'chrome' });
  const pg = await br.newPage({ viewport: { width: 1024, height: 768 } });
  pg.setDefaultTimeout(4000);
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('about:blank');

  // A1: no flash on the chat header mark (mouse and Return, with and without rm).
  for (const q of ['?n=12', '?n=12&rm=1', '?n=1']) {
    await pg.goto(url('concept-a-path.html', q));
    await pg.waitForTimeout(100);
    if (q === '?n=1') await pg.click('#chat'); else { await pg.keyboard.type('con'); await pg.keyboard.press('Enter'); }
    const anims = await pg.evaluate(() => { const m = document.querySelector('#bigmark'); return m ? m.getAnimations().length : -1; });
    ok(anims === 0, `A1 ${q} no animation on chat header mark (${anims})`);
  }
  ok(await pg.evaluate(() => typeof Concept.afterChat) === 'undefined', 'A1 Concept.afterChat is gone');

  // C at 1, 12, 50.
  for (const n of [1, 12, 50]) {
    const t = `C@${n}`;
    await pg.goto(url('concept-c-groves.html', '?n=' + n));
    await pg.waitForTimeout(150);
    const r = await pg.evaluate(() => {
      const g = document.querySelector('#groves'), d = document.querySelector('#doorpanel');
      const full = name => {
        const row = [...document.querySelectorAll('#cols .gr')].find(x => x.dataset.name === name);
        if (!row) return null;
        const nm = row.querySelector('.nm'), rl = row.querySelector('.rl');
        return nm.scrollWidth <= nm.clientWidth + 1 && rl.scrollHeight <= rl.clientHeight + 1;
      };
      const clamped = [...document.querySelectorAll('#cols .gr')].filter(r => { const rl = r.querySelector('.rl'), nm = r.querySelector('.nm'); return rl.scrollHeight > rl.clientHeight + 1 || nm.scrollHeight > nm.clientHeight + 1; }).map(r => r.dataset.name);
      const chip = getComputedStyle(document.querySelector('#chip'));
      return {
        fit: g.scrollHeight <= g.clientHeight + 1 && g.scrollWidth <= g.clientWidth + 1,
        doorW: d.getBoundingClientRect().width,
        four: ['Amara', 'Dev', 'Jun', 'Untitled sketch'].map(full),
        clamped,
        ask: document.querySelector('#home').textContent.includes('Who do you have in mind?'),
        chipBorder: chip.borderTopWidth, chipBg: chip.backgroundColor,
        plantedInBtn: !!document.querySelector('#door #planted'),
      };
    });
    ok(r.fit, `${t} C1 groves fit with no scroll`);
    ok(r.doorW === 200, `${t} C1 door is 200px (${r.doorW})`);
    if (n === 50) ok(r.four.every(x => x === true), `${t} C1 Contract lawyer, Startup board advisor, Imported from Lena, Untitled sketch in full ${JSON.stringify(r.four)}`);
    out.push(`info ${t} C1 rows that still need a 3rd line (clamped at 2): ${r.clamped.join(', ') || 'none'}`);
    ok(!r.ask, `${t} C3 no "Who do you have in mind?" on Home`);
    ok(r.chipBorder === '0px' && r.chipBg === 'rgba(0, 0, 0, 0)', `${t} C4 chip has no box (${r.chipBorder}, ${r.chipBg})`);
    ok(!r.plantedInBtn, `${t} C2 #planted not inside the button`);
    await pg.screenshot({ path: `${__dirname}/shots/cuts-c-${n}.png` });

    // C2: after Keep, planted shows, clicking it does nothing, button name is just New agent.
    await pg.click('#door');
    ok(await pg.isVisible('#who'), `${t} New agent opens from the button`);
    ok(await pg.evaluate(() => document.querySelector('#stubp').textContent.includes('Who do you have in mind?')), `${t} C3 question still on New agent screen`);
    await pg.keyboard.type('x'); await pg.keyboard.press('Enter');
    ok(await pg.isVisible('#planted'), `${t} C2 planted line shows after Keep`);
    await pg.click('#planted');
    ok(await pg.isVisible('#home') && await pg.isHidden('#screen'), `${t} C2 clicking planted does nothing`);
    const name = await pg.evaluate(() => { const b = document.querySelector('#door'); return [...b.childNodes].map(c => c.getAttribute && c.getAttribute('aria-hidden') === 'true' ? '' : c.textContent).join(' ').replace(/\s+/g, ' ').trim(); });
    ok(!name.includes('Nell'), `${t} C2 button name is "${name}"`);
    const fit = await pg.evaluate(() => { const g = document.querySelector('#groves'); return g.scrollHeight <= g.clientHeight + 1; });
    ok(fit, `${t} still fits after Nell`);
    await pg.screenshot({ path: `${__dirname}/shots/cuts-c-${n}-planted.png` });
  }
  // C at 0: Home is the New agent screen, the question is there.
  await pg.goto(url('concept-c-groves.html', '?n=0'));
  ok(await pg.isVisible('#who') && await pg.evaluate(() => document.querySelector('#stubp').textContent.includes('Who do you have in mind?')), 'C@0 C3 question still shows at 0');

  ok(!errs.length, 'no page errors ' + errs.join(' | '));
  console.log(out.join('\n'));
  await br.close();
})();
