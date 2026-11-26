const { chromium } = require('playwright-core');
const path = require('path');
const dir = path.resolve(__dirname, '../updates/2026-11-26 GLADE-HOME-V2');
const url = (f, q = '') => 'file://' + path.join(dir, f) + q;
const C = [['a', 'concept-a-path.html'], ['b', 'concept-b-field-guide.html'], ['c', 'concept-c-groves.html']];
const out = [];
const ok = (c, msg) => out.push((c ? 'ok   ' : 'FAIL ') + msg);

(async () => {
  const br = await chromium.launch({ channel: 'chrome' });
  const pg = await br.newPage({ viewport: { width: 1024, height: 768 } });
  pg.setDefaultTimeout(4000);
  const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const step = async (name, fn) => { try { await fn(); } catch (e) { out.push('FAIL ' + name + ' threw: ' + e.message.split('\n')[0]); } };

  await pg.goto(url('index.html'));
  ok((await pg.locator('a[href^="concept-"]').count()) === 3, 'index has 3 links');
  await pg.screenshot({ path: __dirname + '/shots/index.png' });

  for (const [k, f] of C) {
    for (const n of [0, 1, 12, 50]) {
      await pg.goto(url(f, '?n=' + n));
      await pg.waitForTimeout(150);
      await pg.screenshot({ path: `${__dirname}/shots/${k}-${n}.png` });
      const t = `${k}@${n}`;
      if (n === 0) {
        await step(t, async () => {
          ok(await pg.isVisible('#who'), t + ' 0 agents shows New agent start');
          ok(await pg.isHidden('#back'), t + ' no Back at 0');
        });
        continue;
      }
      await step(t + ' layout', async () => {
        const ov = await pg.evaluate(k => {
          const el = k === 'a' ? document.querySelector('#list') : k === 'b' ? document.querySelector('#sheet') : document.querySelector('#groves');
          const r = { sh: el.scrollHeight, ch: el.clientHeight, sw: el.scrollWidth, cw: el.clientWidth };
          if (k === 'b') { r.sheetBottom = document.querySelector('#sheet').getBoundingClientRect().bottom; r.gateTop = document.querySelector('#gate').getBoundingClientRect().top; }
          return r;
        }, k);
        if (!(k === 'a' && n === 50)) ok(ov.sh <= ov.ch + 1 && ov.sw <= ov.cw + 1, `${t} fits with no scroll ${JSON.stringify(ov)}`);
        if (k === 'b') ok(ov.sheetBottom <= ov.gateTop, `${t} sheet above gate`);
        ok(await pg.isVisible('#door'), t + ' New agent visible');
        ok(n === 1 ? await pg.isHidden('#chip') : await pg.isVisible('#chip'), t + ' chip ' + (n === 1 ? 'hidden' : 'shown'));
      });

      const target = n === 1 ? 'Rex' : 'Amara';
      await step(t + ' chat', async () => {
        if (n > 1) {
          await pg.keyboard.type('con');
          await pg.waitForTimeout(250);
          await pg.screenshot({ path: `${__dirname}/shots/${k}-${n}-find.png` });
          if (k !== 'a') ok(await pg.evaluate(() => document.activeElement.closest('[data-name]')?.dataset.name) === target, `${t} typing focuses ${target}`);
          await pg.keyboard.press('Enter');
        } else {
          if (k === 'a') await pg.click('#chat'); else await pg.click('.open');
        }
        ok((await pg.textContent('#stubp h1')).includes('Chat · ' + target), `${t} Chat opens ${target}`);
        await pg.keyboard.press('Escape');
        ok(await pg.isVisible('#home'), `${t} Esc back to Home`);
        if (n > 1) { await pg.keyboard.press('Escape'); ok((await pg.textContent('#chip')).includes('Type to find'), `${t} Esc clears find`); }
      });

      const ed = n === 50 ? 'Vera' : n === 12 ? 'Lena' : 'Rex';
      await step(t + ' edit', async () => {
        if (k === 'a') { if (n > 1) await pg.click(`.row[data-name="${ed}"]`); await pg.click('#edit'); }
        else await pg.click(`[data-name="${ed}"] .ed`);
        ok((await pg.textContent('#stubp h1')).includes('Edit · ' + ed), `${t} Edit opens ${ed}`);
        if (k === 'c') ok((await pg.textContent('#stubp')).includes('Grove'), `${t} Edit shows grove`);
        await pg.click('#back');
        ok(await pg.isVisible('#home'), `${t} Back to Home`);
      });

      if (n > 1) await step(t + ' arrows', async () => {
        await pg.keyboard.press('Escape');
        await pg.keyboard.press('ArrowDown'); await pg.keyboard.press('ArrowDown');
        if (k !== 'a') { await pg.keyboard.press('ArrowRight'); }
        const nm = await pg.evaluate(k => k === 'a' ? document.querySelector('.row[aria-current="true"]')?.dataset.name : document.activeElement.closest('[data-name]')?.dataset.name, k);
        ok(!!nm, `${t} arrows land on ${nm}`);
      });

      if (n > 1) await step(t + ' nomatch', async () => {
        await pg.keyboard.type('zzq');
        ok((await pg.textContent('#chip')).includes('No one called'), `${t} no-match chip`);
        await pg.keyboard.press('Enter');
        ok(await pg.isVisible('#home'), `${t} Enter on no-match stays Home`);
        await pg.keyboard.press('Escape');
      });

      await step(t + ' new', async () => {
        await pg.click('#door');
        ok(await pg.evaluate(() => document.activeElement.id) === 'who', `${t} New agent focuses the who field`);
        await pg.keyboard.type('Mum’s recipes'); await pg.keyboard.press('Enter');
        ok(await pg.isVisible('#home'), `${t} Keep returns Home`);
        ok(await pg.locator('[data-name="Nell"]').count() === 1, `${t} Nell on Home`);
        if (k === 'c') {
          ok(await pg.isVisible('#planted') && (await pg.textContent('#planted')) === 'Nell is in Home & life. Move her in Edit.', `${t} planted line`);
          await pg.screenshot({ path: `${__dirname}/shots/${k}-${n}-planted.png` });
          await pg.click('[data-name="Nell"] .ed'); await pg.click('#back');
          ok(await pg.isHidden('#planted'), `${t} planted gone next visit`);
        }
        if (k === 'b' || k === 'c') {
          const fit = await pg.evaluate(k => { const el = document.querySelector(k === 'b' ? '#sheet' : '#groves'); return el.scrollHeight <= el.clientHeight + 1; }, k);
          ok(fit, `${t} still fits after Nell`);
          await pg.screenshot({ path: `${__dirname}/shots/${k}-${n}-nell.png` });
        }
      });
    }
    await step(k + ' rm', async () => {
      await pg.goto(url(f, '?n=12&rm=1'));
      ok(await pg.getAttribute('#rmb', 'aria-pressed') === 'true', `${k} ?rm=1 sets reduced motion`);
    });
    if (pg.isClosed()) { out.push('FAIL page closed after ' + k); console.log(out.join('\n')); process.exit(1); }
  }
  ok(!errs.length, 'no console errors ' + errs.join(' | '));
  console.log(out.join('\n'));
  await br.close();
})();
