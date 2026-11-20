# Pesquisa: o pipeline mais fluido para o voo no celular

Astucious, 19/11/2026. Cópia de trabalho: `fix/engasgo-celular` (via `git archive`). Nada foi publicado, nada foi para a VPS, nada foi enviado por push. O clone original não foi tocado.

## 1. A recomendação, em uma linha

**No celular, continuar com a sequência de imagens no canvas e trocar o motor pelo "banco de bitmaps"**: decodificação fora do fio principal, esqueleto mais janela à frente, um desenho que nunca volta para trás e um teto de memória. **O quadro passa a ter 720×1280**, a não ser que o olho do JP vete isso no A/B. Vídeo e WebCodecs ficam como plano B.

## 2. O que mudou na origem depois da nossa cópia

| Repositório | Estado em 19/11 | Serve para nós? |
|---|---|---|
| `cth9191/scroll-world` | O `scrub-engine.js` é **idêntico** à nossa original (mesmo md5, 437f9a46…). Não há commit novo de motor. | Não |
| `oso95/…/skills/scroll-world` | Só recomenda vídeo de 720p no celular, com quadro-chave a cada 4 (até 1). Não tem sequência de imagens. | Não. O vídeo já perdeu para a sequência no aparelho do JP (seção 4). |

Conclusão: **nenhum repositório tem um pipeline melhor que o nosso para o celular.** O avanço vai ter de nascer aqui.

## 3. Estado da arte (fontes)

| Fonte (data) | O que mostra |
|---|---|
| Apple, páginas de produto. Engenharia reversa por T. Inayama, dev.to (03/11/2021): https://dev.to/tetra2000/compression-algorithm-for-iphone-13s-product-page-3gde | A Apple **não usa `<video>`**. Usa sequência de quadros em canvas no formato "flow": quadros-chave a cada 4, mais diferenças por linha (149 quadros e 143 imagens no iPhone 13). |
| GSAP, `imageSequenceScrub`: https://gsap.com/docs/v3/HelperFunctions/helpers/imageSequenceScrub | É o padrão do mercado: `drawImage` de `Image` pré-carregadas num canvas, com o índice ligado à rolagem. |
| Codrops, caso OPTIKKA (abr/2025, republicado em out/2025): https://tympanus.net/codrops/2025/04/14/creating-smooth-scroll-synchronized-animation-for-optikka-from-html5-video-to-frame-sequences/ | Um estúdio de ponta **trocou o vídeo HTML5 por sequência de quadros** para a rolagem ficar lisa. |
| P. Sharma, dev.to (jul/2025): https://dev.to/pratham7711/how-i-made-a-scroll-scrubbed-video-portfolio-fast-nextjs-15-gsap-canvas-1mj6 | Usa **1280×720** a 12 fps em WebP q68 e **limita o canvas a DPR 1,5 no celular**. Tirou o vídeo por causa da busca assíncrona e dos tropeços nos quadros-chave. Mídia caiu de 12,8 para 9,8 MB. |
| Chromium, `cc/tiles/image_decode_cache_utils.cc`: https://chromium.googlesource.com/chromium/src/+/ad276a611599253ccb901b2957224efcbfc01cbc/cc/tiles/image_decode_cache_utils.cc | No **Android, o cache de imagem decodificada tem 128 MB fixos**. Um quadro de 1080×1920 ocupa 8,3 MB, então cabem cerca de 15. Um de 720×1280 ocupa 3,7 MB, e cabem cerca de 34. **O resto é decodificado de novo, no fio principal, na hora do `drawImage`.** |
| MDN, `createImageBitmap`: https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap | Decodifica fora do fio principal e o bitmap fica pronto para desenhar. É a base do motor novo. |
| Skia discuss / WebKit 234920: https://bugs.webkit.org/show_bug.cgi?id=234920 | No iOS, o canvas tem um teto de **384 MB** (relatado num iPhone 14 com iOS 16.7), e a animação ligada à rolagem treme. **Por isso o motor tem teto de memória.** |
| diffusionstudio/webcodecs-scroll-sync: https://github.com/diffusionstudio/webcodecs-scroll-sync | Faz o mesmo por **WebCodecs** (`VideoDecoder` mais mediabunny), com decodificação por hardware e um buffer de quadros. Funciona no Chrome 94+ e no Safari 16.4+. **É o plano B.** |
| Lenis (README): https://github.com/darkroomengineering/lenis | `syncTouch` vem **desligado** de propósito: no toque, o certo é a rolagem nativa. Confirma o que já fazemos. |

**Síntese:** quem faz isso bem (Apple, OPTIKKA, GSAP) usa sequência em canvas, e não `<video>`. O limite no celular é a **vazão de decodificação** e a **memória**, não a rede.

## 4. Diagnóstico: provado e hipótese

### Provado

- **A sequência ganha do vídeo no aparelho do JP.** A medida dele de 20/10, no Instagram em Android, deu cerca de 19 trocas por segundo com o vídeo, contra cerca de 36 com o WebP no canvas (registro no `processar.mjs` e nas rodadas).
- **A origem não tem novidade** (seção 2).
- **A lógica do motor de 19/11 não recua quadro com a rolagem indo para a frente.** A simulação determinística `testes/fluidez/simulacao-motores.mjs` deu ~0 "tremidas" em todos os 12 cenários. A hipótese de "quadros fora de ordem e fallback alternando" **não se confirmou**.
- **O que o mesmo modelo mostra é falta de vazão.** Com a decodificação entre 40 e 120 ms por quadro, a tela fica **parada em 54% a 90% do tempo** enquanto a rolagem anda, com **saltos de 6 a 12 quadros** e atraso de até 51 quadros. É o retrato de "para e pula".
- **720 e 1080 quase não se distinguem num quadro real.** O recorte de 540 px ampliado lado a lado está em `scratchpad\comparativo-720-1080.png`: a 720 fica um pouco mais macia nas bordas, e só isso. A fonte já é um vídeo macio.
- **A página A/B funciona (só a parte funcional).** Os cinco modos rodaram sem erro num Chromium sem tela, emulando um Pixel 7. As três cenas chegam ao quadro 120. A memória máxima do banco ficou em 144 MB (720) e 158 MB (1080). O print do placar está em `scratchpad\prints-ab\`.

### Hipóteses (não medidas no celular)

1. **A versão no ar é "estranha" porque:** (a) quadros de 1080 que saem do cache de 128 MB voltam a ser decodificados de forma síncrona no `drawImage`, o que dá cerca de 36 trocas por segundo em ritmo irregular enquanto o texto corre liso a 60–120 Hz; (b) a 24 fps, numa rolagem lenta, cada degrau do vídeo aparece; (c) não há nenhuma suavização entre quadros.
2. **A versão bitmap de 19/11 ("trator") tremeu porque:** decodificar um 1080 para 810 no aparelho é lento (estimo 40–120 ms, sem medida). Com isso o motor "para e pula", a imagem se descola do texto, que segue liso, e a memória sobe a 187 MB. Não há sinal de defeito na ordem dos quadros.
3. **Um 720 deve decodificar cerca de 2,25× mais rápido**, porque tem 44% dos pixels. A conta é de proporção e não foi medida no aparelho.

> O Chromium sem tela usa a CPU do computador: os números da página dele **não provam fluidez no celular** (as decodificações de 10 ms e 25 ms são da máquina daqui).

## 5. O que muda

### Engine (`scrub-engine.js`, já feito na cópia)

- **`seqPlayer` escolhe o motor**: `config.seqMotor` aceita `'bitmap'` (o padrão) ou `'img'`, que é o motor que está no ar, igual linha a linha.
- **Banco de bitmaps compartilhado entre as cenas**:
  - teto em `config.seqMemoriaMB` (160 por padrão), no máximo 3 decodificações ao mesmo tempo;
  - prioridade por fases: o quadro alvo e os 3 seguintes, depois a janela de 4 a 14 à frente, depois o esqueleto a cada 8 quadros e por último 4 para trás;
  - as cenas ociosas guardam só as pontas (0, 1, n−1, n−2), para a emenda nunca ficar vazia;
  - nunca libera o quadro que está na tela.
- **Desenho monotônico**: desenha o alvo se ele estiver pronto. Senão, desenha o melhor quadro **entre o que está na tela e o alvo**. Senão, segura. Nunca recua e nunca passa do alvo.
- **Mistura de sub-quadro (opcional, `seqMistura`)**: um `globalAlpha` entre k e o vizinho tira o degrau dos 24 fps numa rolagem lenta. É uma questão de gosto, e o JP decide no A/B.
- **Canvas `{alpha:false}`** com o tamanho do quadro: o 720 desenha 1:1 e quem amplia é o compositor. Isso já tem o efeito do "teto de DPR" do caso Sharma.
- **Medidor opcional**: a engine só avisa o `window.__swMedidor` se ele existir. Em produção não pesa nada.

### Produção (`producao/processar.mjs`, já feito na cópia)

- Entrou `SEQ_LARGURA`, separado da `LARGURA` do vídeo. O padrão continua igual a `LARGURA` (1080), então **nada muda até o A/B**. Depois do "sim" do JP: `SEQ_LARGURA=720 node producao/processar.mjs`, e o `cenas.js` sai com `w/h` de 720.
- Atenção ao comentário no arquivo: **o JP descartou o 720p em 03/10** ("fica baixo no celular"). Aquilo era **vídeo H.264**, com outro artefato. O WebP q80 por quadro é outra coisa, mas **só o olho dele decide**. Se ele vetar o 720, o meio-termo é `SEQ_LARGURA=900`: 1,9× menos área que o 1080.
- Na prova, gerei o `assets/seq720/` a partir dos quadros de 1080. **Para produção, gere a partir do bruto.**

## 6. Como provar no celular real

Página `teste/index.html` (com `noindex`), um placar fixo no topo e cinco botões:

| Botão | URL | O que é |
|---|---|---|
| No ar | `?motor=img&res=1080` | o que está no ar hoje |
| No ar 720 | `?motor=img&res=720` | isola o efeito da resolução |
| **Novo 720** | `?motor=bitmap&res=720` | **a recomendação** |
| Novo 1080 | `?motor=bitmap&res=1080` | o motor novo com a nitidez atual |
| 720 mistura | `?motor=bitmap&res=720&mistura=1` | mais a suavização |

O placar zera a cada toque e conta só enquanto a página se move. Ele mostra:

- **fps da tela**, **quadros novos por segundo** e **% de certos**;
- **atraso médio** (quadros entre a rolagem e a tela), **tremidas** (o quadro voltando ou se afastando do alvo) e **% parados**;
- **travadas** acima de 50 ms e o pior intervalo;
- a **decodificação média e a pior**, e a **memória**;
- o aparelho, se está **dentro do Instagram**, e a tela com o DPR.

**Critério para aprovar o "Novo 720"** (é meta, não medida): tremidas 0, parados ≤ 10%, atraso médio ≤ 1,5 quadro, travadas ≤ 1 por rolagem, e o JP achar a imagem boa. **Se a decodificação passar de ~25 ms no aparelho**, o 720 não segura sozinho, e o próximo passo é o WebCodecs (plano B).

**Protocolo:** em cada modo, uma rolagem lenta e uma rápida pela página inteira. Solte o dedo, tire o print do placar e anote a impressão em uma palavra. Faça isso no Chrome e dentro do Instagram.

## 7. O que precisa do JP

1. **Palavra para subir o `/teste/`** num endereço que o celular dele abra (por exemplo `jpanalista.com.br/teste/`, com `noindex`). Publicar é decisão dele.
2. **Rodar o protocolo** nos cinco modos, no Chrome e no Instagram, e mandar os prints dizendo **qual é o aparelho**.
3. **Decidir pelo gosto**: 720 contra 1080 (nitidez) e mistura ligada ou não.

Depois disso: rodar `processar.mjs` com a `SEQ_LARGURA` escolhida a partir do bruto, levar a engine para a branch, registrar a rodada em `linktree-premium/referencias/rodadas.md` e promover a regra para o `SKILL.md`: "celular = sequência em canvas, banco de bitmaps, desenho monotônico, resolução escolhida pelo A/B".

## 8. Arquivos (todos na cópia)

- `scrub-engine.js`: os motores `img` e `bitmap`, o banco e a ligação com o medidor.
- `teste/index.html` e `teste/medidor.js`: a página A/B com o placar.
- `testes/fluidez/simulacao-motores.mjs`: a simulação dos motores (`node testes/fluidez/simulacao-motores.mjs`).
- `producao/processar.mjs`: o `SEQ_LARGURA`.
- `assets/seq720/cena{1,2,3}/`: os quadros de 720 da prova (a partir dos de 1080).
