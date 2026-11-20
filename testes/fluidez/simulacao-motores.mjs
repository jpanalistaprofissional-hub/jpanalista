// Simulação determinística dos dois motores de bitmap (sem navegador): a rolagem anda SEMPRE para a
// frente e a decodificação tem latência variável. Conta "tremidas": desenhos em que o quadro na tela
// anda para trás, ou se afasta do alvo. Prova a LÓGICA de cada motor, não a fluidez de um aparelho.
//   node testes/fluidez/simulacao-motores.mjs
// Modelo: tela a 60 Hz; cada decodificação leva U(min,max) ms; todos os arquivos já baixados.

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- Motor de 19/11 (bbe7f10), reproduzido linha a linha ----------
function motorAntigo(n, decodMs) {
  const bms = new Array(n).fill(false), busy = new Array(n).fill(false), pool = [];
  let k = 0, shown = -1, dir = 1, inflight = 0;
  const desenhos = [];
  const ativos = true, AHEAD = 20, BEHIND = 8, CAP = 40;
  const want = (i) => { const d = (i - k) * dir; return d >= -BEHIND && d <= AHEAD; };
  const evict = () => {
    if (pool.length <= CAP) return;
    pool.sort((x, y) => Math.abs(y - k) - Math.abs(x - k));
    while (pool.length > CAP) { const i = pool.shift(); bms[i] = false; }
  };
  const draw = (agora) => {
    if (k === shown) return;
    let j = -1;
    for (let d = 0; d < n && j < 0; d++) j = bms[k - d] ? k - d : bms[k + d] ? k + d : -1;
    if (j < 0) return;
    desenhos.push({ t: agora, alvo: k, quadro: j });
    shown = j === k ? k : -2;
  };
  const pump = (agora, fila) => {
    const order = [k];
    for (let d = 1; d <= AHEAD; d++) order.push(k + dir * d);
    for (let d = 1; d <= BEHIND; d++) order.push(k - dir * d);
    for (const i of order) {
      if (inflight >= 3) return;
      if (i < 0 || i >= n || bms[i] || busy[i]) continue;
      busy[i] = true; inflight++;
      fila.push({ t: agora + decodMs(), fn: (t) => {
        busy[i] = false; inflight--;
        if (!want(i)) { pump(t, fila); return; }
        bms[i] = true; pool.push(i); evict(); draw(t); pump(t, fila);
      } });
    }
  };
  return {
    desenhos, get shown() { return shown === -2 ? (desenhos.length ? desenhos[desenhos.length - 1].quadro : -1) : shown; },
    set(alvo, agora, fila) { if (alvo !== k) dir = alvo > k ? 1 : -1; k = alvo; draw(agora); pump(agora, fila); },
  };
}

// ---------- Motor novo (esqueleto + janela, desenho monotônico) ----------
function motorNovo(n, decodMs, { passo = 8, frente = 12, tras = 4, cap = 43, voandoMax = 2, esqueletoAntes = true } = {}) {
  const bms = new Array(n).fill(false), ocupado = new Array(n).fill(false);
  let k = 0, dir = 1, shown = -1, voando = 0;
  const desenhos = [];
  const esq = []; for (let i = 0; i < n; i += passo) esq.push(i); if (esq[esq.length - 1] !== n - 1) esq.push(n - 1);
  const draw = (agora) => {
    const s = shown; let j = -1;
    if (bms[k]) j = k;
    else if (s < 0) { for (let d = 1; d < n && j < 0; d++) j = bms[k - d] ? k - d : bms[k + d] ? k + d : -1; }
    else if (s !== k) { const st = k > s ? 1 : -1; for (let i = k - st; i !== s; i -= st) if (bms[i]) { j = i; break; } }
    if (j < 0 || j === s) return;
    desenhos.push({ t: agora, alvo: k, quadro: j });
    shown = j;
  };
  const planejar = (agora, fila) => {
    const lista = [], add = (i) => { if (i >= 0 && i < n) lista.push(i); };
    add(k); for (let s = 1; s <= 3; s++) add(k + dir * s);
    const sk = () => esq.slice().sort((a, b) => Math.abs(a - k) - Math.abs(b - k)).forEach(add);
    if (esqueletoAntes) sk();
    for (let s = 4; s <= frente; s++) add(k + dir * s);
    if (!esqueletoAntes) sk();
    for (let s = 1; s <= tras; s++) add(k - dir * s);
    const manter = new Set(), ordem = [];
    for (const i of lista) { if (manter.has(i)) continue; if (manter.size >= cap) break; manter.add(i); ordem.push(i); }
    for (let i = 0; i < n; i++) if (bms[i] && i !== shown && !manter.has(i)) bms[i] = false;
    for (const i of ordem) {
      if (voando >= voandoMax) break;
      if (bms[i] || ocupado[i]) continue;
      ocupado[i] = true; voando++;
      fila.push({ t: agora + decodMs(), fn: (t) => { ocupado[i] = false; voando--; bms[i] = true; draw(t); planejar(t, fila); } });
    }
  };
  return {
    desenhos, get shown() { return shown; },
    set(alvo, agora, fila) { if (alvo !== k) { dir = alvo > k ? 1 : -1; k = alvo; planejar(agora, fila); } draw(agora); },
  };
}

function rodar(fabrica, { n = 121, velocidade, decod: [dmin, dmax], seed = 7 }) {
  const r = rng(seed), decodMs = () => dmin + (dmax - dmin) * r();
  const m = fabrica(n, decodMs), fila = [];
  // 300 ms parado no quadro 0 (pré-carga), depois rola para a frente até o fim e fica 300 ms parado.
  let f = 0, t = 0, paradas = 0, ticks = 0, atraso = 0, saltoMax = 0, ant = -1;
  const passoTela = 1000 / 60;
  const fim = 300 + ((n - 1) / velocidade) * passoTela + 300;
  for (; t <= fim; t += 1) {
    fila.sort((a, b) => a.t - b.t);
    while (fila.length && fila[0].t <= t) fila.shift().fn(t);
    if (t % passoTela < 1) {
      const movendo = t > 300 && f < n - 1;
      if (t > 300) f = Math.min(n - 1, f + velocidade);
      m.set(Math.round(f), t, fila);
      const sh = m.shown;
      if (movendo && ant >= 0) {
        ticks++; atraso += Math.round(f) - sh;
        if (sh === ant && Math.round(f) !== sh) paradas++;
        saltoMax = Math.max(saltoMax, sh - ant);
      }
      ant = sh;
    }
  }
  let tremidas = 0, certos = 0, ult = null;
  for (const d of m.desenhos) {
    if (d.quadro === d.alvo) certos++;
    if (ult) {
      const dA = Math.sign(d.alvo - ult.alvo), dQ = Math.sign(d.quadro - ult.quadro);
      if ((dA !== 0 && dQ === -dA) || Math.abs(d.alvo - d.quadro) > Math.abs(d.alvo - ult.quadro) || (dA >= 0 && dQ < 0)) tremidas++;
    }
    ult = d;
  }
  return { desenhos: m.desenhos.length, certos, tremidas, paradasPct: Math.round(100 * paradas / Math.max(1, ticks)), atraso: (atraso / Math.max(1, ticks)).toFixed(1), saltoMax };
}

const cenarios = [];
for (const velocidade of [0.5, 1, 2, 4]) for (const decod of [[10, 30], [20, 60], [40, 120]]) cenarios.push({ velocidade, decod });
const motores = {
  '19/11': motorAntigo,
  'novo-v1 (2 juntos, esqueleto antes)': (n, d) => motorNovo(n, d, { voandoMax: 2, esqueletoAntes: true }),
  'novo-v2 (3 juntos, janela antes)': (n, d) => motorNovo(n, d, { voandoMax: 3, esqueletoAntes: false }),
};
console.log('Colunas: desenhos / % de quadros de tela PARADOS com a rolagem andando / atraso médio (quadros) / maior salto / tremidas');
for (const [nome, fab] of Object.entries(motores)) {
  console.log('');
  console.log('== ' + nome);
  console.log('rolagem q/tela | decod ms  || desenhos parados atraso salto tremidas');
  for (const c of cenarios) {
    const r = rodar(fab, c);
    console.log(`${String(c.velocidade).padStart(5)}        | ${String(c.decod[0]).padStart(3)}–${String(c.decod[1]).padEnd(4)}|| ` +
      `${String(r.desenhos).padStart(7)} ${String(r.paradasPct + '%').padStart(7)} ${String(r.atraso).padStart(6)} ${String(r.saltoMax).padStart(5)} ${String(r.tremidas).padStart(8)}`);
  }
}
