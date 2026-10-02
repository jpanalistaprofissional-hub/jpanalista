# Guia para o agente do ChatGPT — bio jpanalista.com.br, "A passagem"

> **Para quem é:** o agente do ChatGPT que vai continuar este trabalho com o João Pedro (JP).
> **Fale sempre em português do Brasil e sem jargão.** O JP não lê inglês: traduza cada botão e campo.
> Os textos de geração (prompts) ficam em inglês de propósito, porque os modelos obedecem melhor assim.
> Este arquivo é autossuficiente. Escrito em 02/10/2026 a partir do trabalho feito no Claude.

## 1. O que estamos construindo

Um **link da bio** para o Instagram `@jpanalista.com.br`, no endereço **jpanalista.com.br**, no estilo
"rolagem cinematográfica": conforme a pessoa rola a página, uma câmera atravessa um escritório sem cortes.

- **Começa com o JP sentado à mesa, olhando para a câmera.** Ao rolar, a câmera passa por ele (ele segue
  olhando para a lente), entra num corredor, passa por um quadro de "agentes", atravessa uma sala de
  operação e termina numa porta que se abre em luz ciano e violeta.
- **A página já está pronta e testada** (celular e computador). Faltam só os 4 vídeos.
- Código: repositório GitHub `jpanalistaprofissional-hub/jpanalista`, branch
  `claude/validate-hostinger-vps-access-b2gvx8`.

## 2. Identidade visual (não fugir disso)

- Fundo quase preto azulado `#05070D`; **ciano `#22D3EE`** para destaque; **violeta `#8B5CF6`** como luz.
- Ambiente: escritório escuro e realista, luz âmbar quente das luminárias, acentos violeta.
- O rosto do JP é a marca, mas **nada de close no rosto em vídeo gerado**: a IA deforma o rosto quando a câmera chega perto.

## 3. As regras que evitam alucinação (as 12 da versão do Gemini)

A primeira tentativa (feita no Gemini) teve: marca d'água, olhar que desvia, rosto que muda, câmera
atravessando a mesa, corte disfarçado com troca de luz, letras inventadas no quadro, quadro que anda
sozinho, parede atravessada, monitores flutuando, luz que troca de cor, porta que brota da parede e emendas
com salto. Por isso:

1. **4 trechos de 5 segundos, uma ação por trecho.**
2. **Cada trecho começa no último quadro EXATO do trecho anterior** (extraído do vídeo final, não de prévia).
3. **Sem quadro final** (end frame). Quadro final faz o modelo "morfar" e foi isso que dissolveu o corredor.
4. **O mesmo modelo e as mesmas configurações nos 4 trechos.**
5. **Sem som**, vertical **9:16**.
6. **Aprovação do JP antes de cada geração paga.** Mostre o custo antes.

## 4. Modelo, configurações e custo (medido no Magnific do JP em 02/10)

**Modelo:** Seedance 2.5 (`bytedance-seedance-pro-2.5`), o mais indicado do catálogo; aceita quadro inicial e 9:16.

| Resolução | Custo por trecho de 5 s |
|---|---|
| Draft (rascunho) | 1.000 créditos |
| 720p | 2.200 créditos |
| 1080p | 3.950 créditos |

**Saldo do JP em 02/10:** 17.809 créditos (plano Premium, 20.000 por ciclo).

⚠️ **Gere direto em 720p.** A página usa vídeo 720x1280, então 1080p não traz ganho. E as contas:
- 4 trechos em 720p = **8.800**, mais 2 ou 3 refações = **13.200 a 15.400**. Cabe no saldo.
- Rascunho + finalizar em 1080p = 4 × (1.000 + ~3.950) = **~19.800**. **Estoura o saldo.**
- Não use rascunho e depois gere "de novo" em 720p: é outro sorteio, sai outro vídeo.

**Configurações de cada trecho:** modelo Seedance 2.5 · duração 5 s · proporção 9:16 · resolução 720p ·
sem efeitos sonoros · quadro inicial preenchido · quadro final vazio. **Anote a "seed" de cada trecho aprovado.**

## 5. Os 4 trechos (textos para colar)

### Trecho 1 — A passagem pelo JP
**Quadro inicial:** a imagem ORIGINAL do JP sentado à mesa (peça o arquivo a ele; não use quadro tirado de vídeo).

```
Single continuous cinematic camera move, no cuts, no dissolves. The man sitting at the desk stays seated and still, hands clasped on the desk, and keeps exactly the same face, beard, hair, earring, white t-shirt and silver chain. He keeps looking straight into the camera lens the whole time: as the camera moves, only his head and eyes turn smoothly to follow the lens. The camera rises slightly and glides forward above the empty desk, never touching or passing through the desk, then curves to the left side of the frame and passes beside his right shoulder, staying at the same distance from him as at the start, never moving closer to his face. In the final second the camera faces the open glass doorway on the left side of the room and drifts slowly forward toward it. The room stays exactly the same: same shelves, warm amber lamps, plant, monitors, violet accent light and glass doorway. Same lighting and colors from start to end. No new objects, no text.
```
**Antes de aceitar, confira:** ele olha para a lente até sair do quadro · o rosto não muda · a câmera não
atravessa a mesa · termina olhando para a porta de vidro do lado esquerdo · nenhuma marca d'água.

### Trecho 2 — O corredor e o quadro dos agentes
**Quadro inicial:** o último quadro do trecho 1.

```
Single continuous cinematic camera move, no cuts, no dissolves. The camera continues the same slow forward glide through the glass doorway and straight down a glass-walled corridor, at the same height and speed, toward a glass whiteboard on a stand at the far end. The lighting stays warm amber with violet accents, with small ceiling spotlights along the corridor. As the camera approaches, simple hand-drawn boxes, circles and arrows on the board light up in cyan neon, like a network of connected agents: abstract shapes only, no letters, no words, no numbers. On the right wall, next to the board, there is an open dark doorway with soft violet light coming from inside. The board stays fixed on its stand and never moves. In the final second the camera turns slightly toward the violet doorway on the right and drifts slowly forward. No new rooms, no text.
```
**Confira:** nenhuma letra no quadro · o quadro não anda · a porta com luz violeta aparece à direita no fim.

### Trecho 3 — A sala de operação
**Quadro inicial:** o último quadro do trecho 2.

```
Single continuous cinematic camera move, no cuts, no dissolves. The camera continues forward past the right side of the glowing board, which stays fixed in place, and enters the open doorway into a dark operations room lit in deep violet: rows of white desks, each with one or two monitors on desk stands showing abstract diagrams, server racks with small blinking lights along the back wall, and desk lamps with warm light. The camera glides at the same height down the center aisle. The lighting stays dark violet the whole time, with no change of color. Every monitor stays on its stand and the number of monitors never changes. Ends with a slow, steady forward drift down the aisle. No text.
```
**Confira:** a cor violeta não muda · nenhum monitor flutua ou se multiplica.

### Trecho 4 — A porta (o convite)
**Quadro inicial:** o último quadro do trecho 3.

```
Single continuous cinematic camera move, no cuts, no dissolves. The camera continues slowly down the aisle toward the back wall. In the center of the back wall, between the server racks, a tall dark door slowly opens by itself and soft cyan and violet light pours out from the other side. The camera approaches the open door and settles into a slow, steady forward drift toward the light. Everything else in the room stays exactly the same: desks, monitors, racks and violet lighting. No white light, no text.
```
**Confira:** a porta já faz parte da parede (não nasce dos racks) · a luz é ciano e violeta, nunca branca.

## 6. Como tirar o último quadro exato

**Pelo Magnific:** a ferramenta "extrair quadros" (`video_extract_frames`) do vídeo final; use o último.

**Ou em Python (no ChatGPT), com ffmpeg:**
```bash
ffmpeg -sseof -0.1 -i trecho1.mp4 -frames:v 1 -q:v 2 trecho1-ultimo.png
```
Sem ffmpeg, com OpenCV:
```python
import cv2
v = cv2.VideoCapture("trecho1.mp4")
v.set(cv2.CAP_PROP_POS_FRAMES, int(v.get(cv2.CAP_PROP_FRAME_COUNT)) - 1)
ok, q = v.read(); cv2.imwrite("trecho1-ultimo.png", q)
```
Envie esse PNG ao Magnific como quadro inicial do próximo trecho. **Nunca** use a prévia/miniatura.

## 7. Como revisar cada trecho antes de seguir

Faça uma folha com 1 quadro por segundo e olhe com calma o checklist do trecho:
```bash
ffmpeg -i trecho1.mp4 -vf "fps=2,scale=216:384,tile=5x2" -frames:v 1 folha-trecho1.png
```
Confira também a emenda: último quadro do trecho N × primeiro quadro do trecho N+1 devem ser praticamente
iguais (nota SSIM ≥ 0,90):
```bash
ffmpeg -i trecho1-ultimo.png -i trecho2-primeiro.png -lavfi ssim -f null -
```

## 8. Como ligar os vídeos na página

No repositório `jpanalista`:
1. Salve os vídeos como `producao/brutos/voo1.mp4` … `voo4.mp4` e um quadro de cada como `cena1.png` … `cena4.png`.
2. Rode `node producao/processar.mjs` (precisa de ffmpeg; aceita `FFMPEG=/caminho/do/ffmpeg`). Ele converte para
   720x1280 com quadro-chave a cada 4, tira os pôsteres, mede as 3 emendas e grava `assets/cenas.js`.
3. A página troca sozinha dos rascunhos para os vídeos reais.
4. Rode o teste de layout: `python3 -m http.server 8765` e, noutra aba, `node testes/layout.js`.

Sem Node, o equivalente manual de cada vídeo é:
```bash
ffmpeg -i voo1.mp4 -an -vf "scale=720:-2,unsharp=5:5:0.6:5:5:0.0" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart assets/vid/cena1.mp4
ffmpeg -ss 0 -i assets/vid/cena1.mp4 -frames:v 1 -q:v 3 assets/cena1-poster.jpg
```
e `assets/cenas.js` fica:
```js
window.CENAS = [
  { "still": "assets/cena1.jpg", "poster": "assets/cena1-poster.jpg", "clip": "assets/vid/cena1.mp4" },
  { "still": "assets/cena2.jpg", "poster": "assets/cena2-poster.jpg", "clip": "assets/vid/cena2.mp4" },
  { "still": "assets/cena3.jpg", "poster": "assets/cena3-poster.jpg", "clip": "assets/vid/cena3.mp4" },
  { "still": "assets/cena4.jpg", "poster": "assets/cena4-poster.jpg", "clip": "assets/vid/cena4.mp4" }
];
```

## 9. Textos da página (proposta, decisão do JP)

| Trecho | Seção da bio |
|---|---|
| 1 · JP na mesa | Chegada: quem é ele, método IA Humanizada, WhatsApp |
| 2 · Quadro dos agentes | IA para empresas: mentoria e consultoria |
| 3 · Sala de operação | Atendimento rodando sozinho: GustoBio e GustoChat |
| 4 · A porta | Sites e tráfego, e o convite para conversar |

Os textos ficam em `index.html` (lista `sections`). Hoje a ordem lá é chegada · GustoBio · IA para empresas ·
sites e tráfego; se o JP aprovar a tabela acima, troque a ordem das seções 2 e 3.

## 10. Pendências que só o JP decide

1. Ordem das seções (tabela acima).
2. Preço na bio? Hoje: sem preço, só "fale comigo".
3. Número do WhatsApp: está `5583991372862` em `index.html` (constante `WHATSAPP`). Confirmar.
4. Para onde vai a página que hoje abre em jpanalista.com.br (sugestão: `/consultoria/`).
5. Frase de marca: "consultor de IA para atendimento e vendas" (atual) ou "O Alquimista de IAs".

## 11. Antes de publicar (não pular)

- **A área de contratos `/cliente/` mora na mesma pasta da hospedagem.** Enviar só os arquivos novos, sem apagar
  nada; depois abrir `/` e `/cliente/` e provar que os dois respondem.
- Se já existir `.htaccess` na raiz, **juntar** as regras do `htaccess.sugerido`, nunca substituir.
- **Conferir a renovação do domínio e da hospedagem** na Hostinger: estavam com renovação automática desligada.
- Testar no celular de verdade, **dentro do app do Instagram**, num iPhone e num Android.
- Credenciais (Hostinger, FTP, GitHub) quem digita é o JP. Não pedir senha no chat.
- Nada de número, depoimento ou resultado sem prova (ex.: "200% de lucro" só com fonte).
