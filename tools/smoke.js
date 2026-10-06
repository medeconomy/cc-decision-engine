#!/usr/bin/env node
/* Headless smoke test for index.html.
   Usage:  python3 -m http.server 8765 &   (from the repo root)
           npm install                      (once; installs playwright)
           npx playwright install chromium  (once, if no browser is installed)
           node tools/smoke.js [base-url]   (default http://localhost:8768/)
   Prints each scenario's tiers, cards and flags so a change in ranking is visible in the diff,
   checks the evidence-browser tabs and trial links for every histology, checks phone width,
   and exits 1 on any page error or console error. */
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:8768/';

const CASES = [
  {n:"SCC adj IB2(2018) node-neg deep+LVSI (Sedlis)", p:{hist:"scc",setting:"adjuvant",sys:"2018",stage:"IB2",size:"2to4",nodes:"negative",depth:"gt13",lvsi:"positive",margin:"negative",param:"negative"}},
  {n:"SCC adj IB1 node-neg 1 criterion (low)", p:{hist:"scc",setting:"adjuvant",sys:"2018",stage:"IB1",size:"lt2",nodes:"negative",depth:"le13",lvsi:"positive",margin:"negative",param:"negative"}},
  {n:"SCC adj IIIC1p node-positive (Peters)", p:{hist:"scc",setting:"adjuvant",sys:"2018",stage:"IIIC1",size:"2to4",nodes:"positive",depth:"gt13",lvsi:"positive",margin:"negative",param:"negative"}},
  {n:"SCC adj risk unknown (no pathology)", p:{hist:"scc",setting:"adjuvant",sys:"2018",stage:"IB2"}},
  {n:"SCC definitive IIB node-neg", p:{hist:"scc",setting:"definitive",sys:"2018",stage:"IIB",nodes:"negative"}},
  {n:"SCC definitive IIIC1r CrCl 45", p:{hist:"scc",setting:"definitive",sys:"2018",stage:"IIIC1",size:"ge4",nodes:"positive",crcl:45}},
  {n:"SCC definitive IB3 node-neg", p:{hist:"scc",setting:"definitive",sys:"2018",stage:"IB3",size:"ge4",nodes:"negative"}},
  {n:"SCC 1L IVB de novo CPS 10", p:{hist:"scc",setting:"first_line",status:"ivb",priorcis:"no",cps:10}},
  {n:"SCC 1L recurrence after CCRT CPS 5 prior RT", p:{hist:"scc",setting:"first_line",status:"recurrent",priorcis:"yes",cps:5,flags:["prior_pelvic_rt"],ledger:[["platinum","progressed_after"],["radiotherapy","progressed_after"]]}},
  {n:"SCC 1L recurrence CPS unknown autoimmune", p:{hist:"scc",setting:"first_line",status:"recurrent",priorcis:"yes",flags:["active_autoimmune_disease"],ledger:[["platinum","progressed_after"]]}},
  {n:"SCC 2L after pembro-chemo-bev", p:{hist:"scc",setting:"second_line",lines:1,cps:5,hpv:"positive",ledger:[["platinum","progressed_after"],["taxane","progressed_after"],["io","progressed_after"],["anti_vegf","progressed_after"]]}},
  {n:"SCC 2L IO-naive CPS 0 ocular disease", p:{hist:"scc",setting:"second_line",lines:1,cps:0,hpv:"positive",flags:["ocular_disease"],ledger:[["platinum","progressed_after"],["taxane","progressed_after"]]}},
  {n:"SCC neoadjuvant IB3", p:{hist:"scc",setting:"neoadjuvant",sys:"2018",stage:"IB3",size:"ge4",nodes:"negative"}},
  {n:"ADC usual IB2 node-neg Sedlis", p:{hist:"adc",setting:"adjuvant",sys:"2018",stage:"IB2",size:"2to4",nodes:"negative",depth:"gt13",lvsi:"positive",margin:"negative",param:"negative",hpv:"positive",iecc:"usual"}},
  {n:"ADC gastric IIB definitive", p:{hist:"adc",setting:"definitive",sys:"2018",stage:"IIB",nodes:"negative",hpv:"negative",iecc:"gastric"}},
  {n:"ADC 1L recurrent after surgery alone CPS 0", p:{hist:"adc",setting:"first_line",status:"recurrent",priorcis:"no",cps:0,hpv:"positive",iecc:"usual"}},
  {n:"ADC 2L HER2 3+ after chemo-IO", p:{hist:"adc",setting:"second_line",lines:1,her2:"3+",hpv:"positive",iecc:"usual",ledger:[["platinum","progressed_after"],["taxane","progressed_after"],["io","progressed_after"],["anti_vegf","progressed_after"]]}},
  {n:"ADC gastric neoadjuvant IIB", p:{hist:"adc",setting:"neoadjuvant",sys:"2018",stage:"IIB",nodes:"negative",hpv:"negative",iecc:"gastric"}},
];

(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const errs = [];
  const page = async (w, h) => {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(BASE + 'index.html', { waitUntil: 'networkidle' });
    await p.evaluate(() => { try { localStorage.clear() } catch (e) {} });
    await p.reload({ waitUntil: 'networkidle' });
    return p;
  };

  const p = await page(1280, 1000);
  for (const c of CASES) {
    await p.evaluate(x => applyPreset(x), c.p);
    await p.waitForTimeout(80);
    const fields = await p.$$eval('#pf .fld', fs => fs.filter(f => f.offsetParent !== null).map(f => f.querySelector('select,input').id.replace('f_', '')).join(','));
    const notices = await p.$$eval('#results .notice', n => n.map(x => x.textContent.slice(0, 90)));
    const tiers = await p.$$eval('#results > details', ds => ds.map(d => {
      const h = d.querySelector('summary h3').textContent;
      const items = [...d.querySelectorAll('.rcard')].map(c => {
        const t = c.querySelector('.tierbadge').textContent, nm = c.querySelector('.name').textContent;
        const fl = [...c.querySelectorAll('.flag')].map(f => f.querySelector('b').textContent + ': ' + f.querySelector('span').textContent.slice(0, 60));
        return `   [${t}] ${nm.slice(0, 72)}` + (fl.length ? '\n      ' + fl.join('\n      ') : '');
      });
      return (d.open ? '▼ ' : '▶ ') + h + '\n' + items.join('\n');
    }));
    console.log(`=== ${c.n}\n  fields: ${fields}` + (notices.length ? '\n  NOTICE: ' + notices.join('\n  NOTICE: ') : '') + '\n' + tiers.join('\n'));
  }

  // evidence browser: every histology renders tabs; a trial link from the ranker opens the right page
  await p.evaluate(() => switchView('browser'));
  for (const h of await p.$$eval('#hswitch button', bs => bs.map(x => x.dataset.hist))) {
    await p.click(`#hswitch button[data-hist="${h}"]`); await p.waitForTimeout(120);
    const tabs = await p.$$eval('#tabs [role=tab]', t => t.length);
    const cards = await p.$$eval('#panels .card', c => c.length);
    console.log(`browser ${h}: ${tabs} tabs, ${cards} cards`);
    if (!tabs) errs.push(`browser ${h}: no tabs`);
  }
  await p.evaluate(() => switchView('ranker'));
  await p.evaluate(x => applyPreset(x), CASES.find(c => c.n.startsWith('ADC 2L')).p);
  const tl = await p.$('#results .tlink');
  if (tl) {
    await tl.click(); await p.waitForTimeout(250);
    const s = await p.evaluate(() => ({ browser: document.querySelector('#viewBrowser').classList.contains('on'), hist: browserHist, tab: state.tab }));
    console.log('trial link →', JSON.stringify(s));
    if (!s.browser || s.hist !== 'adc') errs.push('trial link did not open the adenocarcinoma evidence page');
  }
  await p.close();

  // phone width: no horizontal page scroll
  const ph = await page(390, 844);
  for (const c of [CASES[0], CASES[CASES.length - 1]]) {
    await ph.evaluate(x => applyPreset(x), c.p); await ph.waitForTimeout(80);
    const sw = await ph.evaluate(() => document.documentElement.scrollWidth);
    console.log(`phone ${c.n}: scrollWidth ${sw}`);
    if (sw > 390) errs.push(`phone overflow ${sw}px on ${c.n}`);
  }
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'OK — no page or console errors');
  process.exit(errs.length ? 1 : 0);
})();
