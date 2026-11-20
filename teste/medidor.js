// Medidor de fluidez da página de teste (/teste/). Carregado ANTES da engine: a engine vê
// window.__swMedidor e avisa cada quadro desenhado e cada decodificação.
// O placar mostra os números da ÚLTIMA ROLAGEM (zera a cada toque novo), para o print do JP.
(function () {
  var q = new URLSearchParams(location.search);
  var ua = navigator.userAgent;
  var aparelho = /iPhone|iPad/.test(ua) ? 'iPhone' : /Android/.test(ua) ? 'Android' : 'Computador';
  var insta = /Instagram/i.test(ua) ? ' · dentro do Instagram' : /FBAN|FBAV/.test(ua) ? ' · dentro do Facebook' : '';

  var z;   // contadores da rolagem atual
  function zerar() {
    z = { t0: performance.now(), rafs: 0, mov: 0, movRafs: 0, y: scrollY, gaps: [], ultimoRaf: 0, travadas: 0, pior: 0,
          desenhos: 0, certos: 0, dsN: 0, dsSoma: 0, dsPior: 0, paradas: 0, movQ: 0, tremidas: 0, atrasoSoma: 0, atrasoN: 0, decN: 0, decSoma: 0, decPior: 0,
          ult: new Map() };
  }
  zerar();

  window.__swMedidor = {
    desenho: function (p, alvo, quadro) {
      z.desenhos++;
      if (quadro === alvo) z.certos++;
      var u = z.ult.get(p);
      if (u) {
        // "Tremida": o quadro na tela anda contra o sentido do alvo, ou se afasta do alvo.
        var dAlvo = Math.sign(alvo - u.alvo), dQuadro = Math.sign(quadro - u.quadro);
        if ((dAlvo !== 0 && dQuadro === -dAlvo) || Math.abs(alvo - quadro) > Math.abs(alvo - u.quadro)) z.tremidas++;
      }
      z.ult.set(p, { alvo: alvo, quadro: quadro });
    },
    desenhoMs: function (ms) { z.dsN++; z.dsSoma += ms; if (ms > z.dsPior) z.dsPior = ms; },
    decod: function (ms) { z.decN++; z.decSoma += ms; if (ms > z.decPior) z.decPior = ms; }
  };

  var tocando = false;
  addEventListener('touchstart', function () { tocando = true; zerar(); }, { passive: true });
  addEventListener('touchend', function () { tocando = false; }, { passive: true });

  // Laço próprio: mede o ritmo real da tela e o atraso (quadro na tela × quadro que a rolagem pede).
  function laco(agora) {
    // Só conta enquanto a página se move (a rolagem mudou neste quadro): parado não é fluidez.
    var mexeu = scrollY !== z.y;
    if (z.ultimoRaf) {
      var gap = agora - z.ultimoRaf;
      if (mexeu) {
        z.mov += gap; z.movRafs++;
        if (gap > 50) z.travadas++;
        if (gap > z.pior) z.pior = gap;
      }
    }
    z.y = scrollY;
    z.ultimoRaf = agora; z.rafs++;
    var ps = window.__swSeq || [];
    for (var i = 0; i < ps.length; i++) {
      var p = ps[i];
      if (mexeu && p.ativo && p.shown >= 0) {
        z.atrasoSoma += Math.abs(p.k - p.shown); z.atrasoN++;
        // Parado: a rolagem pede outro quadro e a tela continua no mesmo desde o quadro anterior.
        if (p.k !== p.shown) { z.movQ++; if (p.shown === p._ant) z.paradas++; }
      }
      p._ant = p.shown;
    }
    requestAnimationFrame(laco);
  }
  requestAnimationFrame(laco);

  // Placar
  var el = document.createElement('div');
  el.id = 'medidor';
  el.style.cssText = 'position:fixed;left:8px;right:8px;top:calc(8px + env(safe-area-inset-top));z-index:9999;' +
    'background:rgba(0,0,0,.78);color:#fff;font:12px/1.35 system-ui,sans-serif;padding:8px 10px;border-radius:10px;' +
    'font-variant-numeric:tabular-nums;pointer-events:auto';
  var info = document.createElement('div'), modos = document.createElement('div');
  modos.style.cssText = 'display:flex;gap:6px;margin-top:6px';
  [['No ar', 'motor=img&res=1080'], ['No ar 720', 'motor=img&res=720'], ['Novo 720', 'motor=bitmap&res=720'],
   ['Novo 1080', 'motor=bitmap&res=1080'], ['720 mistura', 'motor=bitmap&res=720&mistura=1']].forEach(function (m) {
    var a = document.createElement('a');
    a.href = '?' + m[1]; a.textContent = m[0];
    var atual = ('?' + m[1]) === location.search || (!location.search && m[1] === 'motor=bitmap&res=720');
    a.style.cssText = 'flex:1;text-align:center;padding:7px 2px;border-radius:999px;text-decoration:none;font-weight:700;' +
      'border:1px solid #22D3EE;' + (atual ? 'background:#22D3EE;color:#05070D' : 'color:#fff');
    modos.appendChild(a);
  });
  el.appendChild(info); el.appendChild(modos);
  document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(el); });

  var modo = (q.get('motor') || 'bitmap') + ' · ' + (q.get('res') || '720') + (q.get('mistura') === '1' ? ' · mistura' : '');
  function n0(x) { return isFinite(x) ? Math.round(x) : 0; }
  function pinta() {
    var seg = Math.max(0.001, z.mov / 1000);
    var mem = window.__swBanco ? (window.__swBanco.bytes / 1048576) : NaN;
    var b = function (x) { return '<b style="color:#22D3EE;font-size:15px">' + x + '</b>'; };
    info.innerHTML =
      '<div style="display:flex;justify-content:space-between;gap:8px"><span>MODO ' + b(modo) + '</span>' +
      '<span>' + aparelho + insta + ' · ' + screen.width + '×' + screen.height + ' @' + devicePixelRatio + '</span></div>' +
      'tela ' + b(n0(z.movRafs / seg)) + ' fps · quadros novos ' + b(n0(z.desenhos / seg)) + '/s · certos ' +
      b(z.desenhos ? n0(100 * z.certos / z.desenhos) + '%' : '–') + '<br>' +
      'atraso médio ' + b(z.atrasoN ? (z.atrasoSoma / z.atrasoN).toFixed(1) : '–') + ' quadros · tremidas ' + b(z.tremidas) +
      ' · parados ' + b(z.movQ ? n0(100 * z.paradas / z.atrasoN) + '%' : '0%') + '<br>travadas ' + b(z.travadas) + ' (pior ' + n0(z.pior) + ' ms)<br>' +
      ' · desenho ' + (z.dsN ? (z.dsSoma / z.dsN).toFixed(1) + ' ms (pior ' + n0(z.dsPior) + ')' : '–') + '<br>' +
      'decodificação ' + (z.decN ? n0(z.decSoma / z.decN) + ' ms (pior ' + n0(z.decPior) + ')' : '–') +
      (isFinite(mem) ? ' · memória ' + n0(mem) + ' MB' : '') +
      ' · ' + (tocando ? 'medindo…' : 'solte e tire o print');
  }
  setInterval(pinta, 300);
})();
