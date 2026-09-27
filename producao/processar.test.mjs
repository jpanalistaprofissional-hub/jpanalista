// Teste do processar.mjs com um ffmpeg de mentira: prova a costura (arquivos, emendas,
// cenas.js e códigos de saída), não a qualidade do vídeo. O ffmpeg real se prova no PC.
// Uso: node producao/processar.test.mjs
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(AQUI, 'processar.mjs');

// ffmpeg de mentira: cria o arquivo de saída; no filtro ssim, devolve a próxima nota da lista.
const FAKE = `#!/usr/bin/env node
const fs = require('fs');
const a = process.argv.slice(2);
if (a.includes('-lavfi')) {
  const f = process.env.FAKE_CONTADOR;
  const n = fs.existsSync(f) ? +fs.readFileSync(f, 'utf8') : 0;
  fs.writeFileSync(f, String(n + 1));
  const v = process.env.FAKE_SSIM.split(',')[n];
  process.stderr.write('[Parsed_ssim_0 @ 0x1] SSIM Y:' + v + ' U:1 V:1 All:' + v + ' (12.3)\\n');
} else { fs.writeFileSync(a[a.length - 1], 'x'); }
`;

function cenario(nome, { notas, faltar = [] }) {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'proc-'));
  const brutos = path.join(raiz, 'producao', 'brutos');
  fs.mkdirSync(brutos, { recursive: true });
  fs.mkdirSync(path.join(raiz, 'assets'));
  for (let i = 1; i <= 4; i++) {
    if (!faltar.includes(`cena${i}`)) fs.writeFileSync(path.join(brutos, `cena${i}.png`), 'x');
    if (!faltar.includes(`voo${i}`)) fs.writeFileSync(path.join(brutos, `voo${i}.mp4`), 'x');
  }
  const fake = path.join(raiz, 'ffmpeg-falso');
  fs.writeFileSync(fake, FAKE, { mode: 0o755 });
  const r = spawnSync(process.execPath, [SCRIPT], {
    encoding: 'utf8',
    env: { ...process.env, FFMPEG: fake, RAIZ: raiz, FAKE_SSIM: notas.join(','), FAKE_CONTADOR: path.join(raiz, 'contador') },
  });
  return { nome, raiz, codigo: r.status, saida: r.stdout + r.stderr };
}

let falhas = 0;
function confere(cond, msg) { console.log(`${cond ? '✅' : '❌'} ${msg}`); if (!cond) falhas++; }

const ok = cenario('tudo passa', { notas: [0.95, 0.93, 0.91] });
confere(ok.codigo === 0, 'emendas boas → sai com 0');
const cenas = fs.readFileSync(path.join(ok.raiz, 'assets', 'cenas.js'), 'utf8');
confere((cenas.match(/assets\/vid\/cena\d\.mp4/g) || []).length === 4, 'cenas.js liga os 4 vídeos');
confere(['cena1.jpg', 'cena4-poster.jpg', 'vid/cena3.mp4'].every(f => fs.existsSync(path.join(ok.raiz, 'assets', f))),
  'gera imagem, pôster e vídeo convertido');
confere(/voo 3 → voo 4: 0\.910/.test(ok.saida), 'relata a nota de cada emenda');

const aviso = cenario('aviso', { notas: [0.95, 0.80, 0.92] });
confere(aviso.codigo === 0 && /⚠️ +voo 2 → voo 3/.test(aviso.saida), 'nota entre 0,75 e 0,90 → aviso, sem travar');

const ruim = cenario('emenda ruim', { notas: [0.95, 0.60, 0.92] });
confere(ruim.codigo === 1 && /❌ voo 2 → voo 3/.test(ruim.saida), 'nota abaixo de 0,75 → falha e sai com 1');

const falta = cenario('falta arquivo', { notas: [], faltar: ['voo3'] });
confere(falta.codigo === 2 && /voo3\.mp4/.test(falta.saida), 'falta um voo → avisa qual e sai com 2');

console.log(falhas ? `\nFALHAS: ${falhas}` : '\nTUDO OK');
process.exit(falhas ? 1 : 0);
