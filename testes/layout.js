// Teste de layout do link da bio: celular (iPhone, Android) e computador (1024, 1440, 1920).
// Uso: python3 -m http.server 8765 --bind 127.0.0.1  e, noutra aba,  node testes/layout.js
// Sai com código 1 se algo quebrar (rolagem horizontal, botão sob a barra, texto cortado, texto sobre o vídeo).
const { chromium } = (function(){try{return require('playwright')}catch(e){return require('/opt/node22/lib/node_modules/playwright')}})();
const OUT = process.env.OUT || require('path').join(__dirname, 'capturas');
const URL = process.env.URL || 'http://127.0.0.1:8765/';
const perfis = [
  { nome: 'iphone', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { nome: 'android', viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { nome: 'desk1024', viewport: { width: 1024, height: 768 } },
  { nome: 'desk1440', viewport: { width: 1440, height: 900 } },
  { nome: 'desk1920', viewport: { width: 1920, height: 1080 } },
];
const inter = (a, b) => a && b && !(a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top);
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  let falhas = 0;
  for (const p of perfis) {
    const ctx = await browser.newContext(p);
    const page = await ctx.newPage();
    const erros = [];
    page.on('pageerror', e => erros.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL_CONNECTION_FAILED/.test(m.text())) erros.push(m.text()); });
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    const posicoes = [0, 0.3, 0.55, 0.8, 1];
    for (const f of posicoes) {
      await page.evaluate(y => window.scrollTo(0, y), Math.round(H * f));
      await page.waitForTimeout(500);
      const r = await page.evaluate(() => {
        const box = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { left: b.left, right: b.right, top: b.top, bottom: b.bottom, w: b.width, h: b.height }; };
        const visiveis = [...document.querySelectorAll('.sw-copy')].filter(c => +getComputedStyle(c).opacity > 0.5);
        const copy = visiveis[0];
        const bar = document.querySelector('.jp-bar');
        const barVis = bar && getComputedStyle(bar).display !== 'none';
        return {
          overflowX: document.documentElement.scrollWidth > innerWidth,
          copy: box(copy), cta: box(copy && copy.querySelector('.sw-copy__cta')),
          titulo: copy && copy.querySelector('.sw-copy__title') && copy.querySelector('.sw-copy__title').textContent,
          bar: barVis ? box(bar) : null,
          stage: box(document.querySelector('.sw-stage')),
          topcta: getComputedStyle(document.querySelector('.sw-topcta')).display !== 'none',
        };
      });
      const probs = [];
      if (r.overflowX) probs.push('rolagem horizontal');
      if (r.bar && r.cta && inter(r.cta, r.bar)) probs.push('botão da cena embaixo da barra');
      if (r.bar && (r.bar.bottom > p.viewport.height + 1)) probs.push('barra fora da tela');
      if (!p.isMobile && r.copy && inter(r.copy, r.stage)) probs.push('texto em cima da coluna do vídeo');
      if (r.copy && (r.copy.top < 0 || r.copy.bottom > p.viewport.height)) probs.push('texto cortado');
      falhas += probs.length;
      console.log(`${p.nome} @${Math.round(f*100)}% | cena: ${r.titulo || '(transição)'} | coluna ${r.stage.w|0}x${r.stage.h|0} | ${probs.length ? '❌ ' + probs.join(', ') : '✅'}`);
      await page.screenshot({ path: `${OUT}/${p.nome}-${Math.round(f*100)}.png` });
    }
    // lista de links: abre, pula para a cena 2, fecha
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
    const abriu = await page.evaluate(() => { const b = document.querySelector(innerWidth > 860 ? '.sw-copy__cta a[href="#links"]' : '[data-open-links]'); b.click(); return document.getElementById('links').open; });
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${OUT}/${p.nome}-links.png` });
    await page.evaluate(() => document.querySelector('[data-jump="2"]').click());
    await page.waitForTimeout(1500);
    const depois = await page.evaluate(() => ({ aberto: document.getElementById('links').open,
      titulo: [...document.querySelectorAll('.sw-copy')].find(c => +getComputedStyle(c).opacity > 0.5)?.querySelector('.sw-copy__title').textContent }));
    const wa = await page.evaluate(() => document.querySelector('.jp-bar [data-wa]').href);
    const okLinks = abriu && !depois.aberto && /time de IA/.test(depois.titulo || '');
    if (!okLinks) falhas++;
    if (erros.length) falhas++;
    console.log(`${p.nome} | lista de links abre: ${abriu} · pula para "${depois.titulo}" e fecha: ${!depois.aberto} ${okLinks ? '✅' : '❌'} | erros no console: ${erros.length ? erros.join(' / ') : 'nenhum'}`);
    if (p.nome === 'iphone') console.log('link da barra:', decodeURIComponent(wa));
    await ctx.close();
  }
  await browser.close();
  console.log(falhas ? `\nFALHAS: ${falhas}` : '\nTUDO OK');
  process.exit(falhas ? 1 : 0);
})();
