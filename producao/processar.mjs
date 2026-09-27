#!/usr/bin/env node
// Processa os brutos do Magnific e liga as cenas reais na página.
//
// Entrada (baixados do Magnific, tamanho original):
//   producao/brutos/cena1.png … cena4.png   (também aceita .jpg, .jpeg, .webp)
//   producao/brutos/voo1.mp4  … voo4.mp4
// Saída:
//   assets/cenaN.jpg          imagem da cena (usada se o celular estiver em modo economia)
//   assets/vid/cenaN.mp4      vídeo 720x1280, sem som, quadro-chave a cada 4 (rolagem lisa no celular)
//   assets/cenaN-poster.jpg   1º quadro do vídeo já convertido (troca imagem→vídeo sem salto)
//   assets/cenas.js           a página passa a usar as cenas reais
// E mede cada emenda (último quadro do voo N × primeiro do voo N+1) com SSIM:
//   ≥ 0,90 passa · 0,75 a 0,90 aviso (olhar no navegador) · < 0,75 falha (refazer o voo)
//
// Uso:  node producao/processar.mjs          (precisa do ffmpeg no PATH, ou FFMPEG=caminho)
// Sai com código 2 se faltar arquivo, 1 se alguma emenda falhar, 0 se tudo passar.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FF = process.env.FFMPEG || 'ffmpeg';
const RAIZ = process.env.RAIZ || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRUTOS = path.join(RAIZ, 'producao', 'brutos');
const ASSETS = path.join(RAIZ, 'assets');
const VID = path.join(ASSETS, 'vid');
const N = 4;
const PASSA = 0.90, AVISO = 0.75;

function ff(args, { verboso = false } = {}) {
  const r = spawnSync(FF, ['-hide_banner', '-v', verboso ? 'info' : 'error', '-y', ...args], { encoding: 'utf8' });
  if (r.error) throw new Error(`não consegui rodar o ffmpeg (${FF}): ${r.error.message}`);
  if (r.status !== 0) throw new Error(`ffmpeg falhou: ${args.join(' ')}\n${r.stderr}`);
  return r.stderr || '';
}

function acharCena(i) {
  for (const ext of ['png', 'jpg', 'jpeg', 'webp']) {
    const p = path.join(BRUTOS, `cena${i}.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

// 1) Conferir os brutos antes de gastar tempo.
const faltando = [];
const brutos = [];
for (let i = 1; i <= N; i++) {
  const cena = acharCena(i);
  const voo = path.join(BRUTOS, `voo${i}.mp4`);
  if (!cena) faltando.push(`cena${i}.png`);
  if (!fs.existsSync(voo)) faltando.push(`voo${i}.mp4`);
  brutos.push({ i, cena, voo });
}
if (faltando.length) {
  console.error(`Faltam em producao/brutos/: ${faltando.join(', ')}`);
  process.exit(2);
}

fs.mkdirSync(VID, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bio-emendas-'));

// 2) Converter cada cena e cada voo.
for (const { i, cena, voo } of brutos) {
  ff(['-i', cena, '-vf', 'scale=720:-2', '-q:v', '3', path.join(ASSETS, `cena${i}.jpg`)]);
  ff(['-i', voo, '-an', '-vf', 'scale=720:-2,unsharp=5:5:0.6:5:5:0.0',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '23', '-pix_fmt', 'yuv420p',
      '-g', '4', '-keyint_min', '4', '-sc_threshold', '0', '-movflags', '+faststart',
      path.join(VID, `cena${i}.mp4`)]);
  ff(['-ss', '0', '-i', path.join(VID, `cena${i}.mp4`), '-frames:v', '1', '-q:v', '3',
      path.join(ASSETS, `cena${i}-poster.jpg`)]);
  console.log(`cena ${i}: convertida`);
}

// 3) Medir as emendas nos arquivos JÁ convertidos (é o que o visitante vê).
const emendas = [];
for (let i = 1; i < N; i++) {
  const fim = path.join(tmp, `fim${i}.png`);
  const inicio = path.join(tmp, `inicio${i + 1}.png`);
  ff(['-sseof', '-0.15', '-i', path.join(VID, `cena${i}.mp4`), '-frames:v', '1', fim]);
  ff(['-ss', '0', '-i', path.join(VID, `cena${i + 1}.mp4`), '-frames:v', '1', inicio]);
  const saida = ff(['-i', fim, '-i', inicio, '-lavfi', 'ssim', '-f', 'null', '-'], { verboso: true });
  const m = saida.match(/All:\s*([0-9.]+)/);
  if (!m) throw new Error(`não achei o valor de SSIM na emenda ${i}→${i + 1}:\n${saida}`);
  const v = parseFloat(m[1]);
  const veredito = v >= PASSA ? 'passa' : v >= AVISO ? 'aviso' : 'falha';
  emendas.push({ de: i, para: i + 1, ssim: v, veredito });
}
fs.rmSync(tmp, { recursive: true, force: true });

// 4) Ligar as cenas na página.
const cenas = brutos.map(({ i }) => ({
  still: `assets/cena${i}.jpg`,
  poster: `assets/cena${i}-poster.jpg`,
  clip: `assets/vid/cena${i}.mp4`,
}));
fs.writeFileSync(path.join(ASSETS, 'cenas.js'),
  '// Gerado por producao/processar.mjs. Não editar à mão.\n' +
  `window.CENAS = ${JSON.stringify(cenas, null, 2)};\n`);

// 5) Relatório.
console.log('\nEmendas (SSIM do último quadro × primeiro quadro seguinte):');
for (const e of emendas) {
  const icone = e.veredito === 'passa' ? '✅' : e.veredito === 'aviso' ? '⚠️ ' : '❌';
  console.log(`  ${icone} voo ${e.de} → voo ${e.para}: ${e.ssim.toFixed(3)} (${e.veredito})`);
}
const falhas = emendas.filter(e => e.veredito === 'falha');
if (falhas.length) {
  console.log(`\n${falhas.length} emenda(s) com salto visível. Refaça o voo que chega nela ` +
              '(quadro final = a cena seguinte) e rode de novo.');
  process.exit(1);
}
console.log('\nPronto: assets/cenas.js atualizado. Rode o teste de layout e confira no celular.');
