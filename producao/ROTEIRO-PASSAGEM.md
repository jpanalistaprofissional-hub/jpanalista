# Roteiro "A passagem" — bio jpanalista.com.br (versão 2, 02/10)

Substitui as cenas do `ROTEIRO-MAGNIFIC.md`. A ideia agora é a do JP: a primeira imagem é ele na mesa,
olhando para a câmera. Ao rolar, a câmera passa por ele (que segue olhando para a lente) e entra
num corredor que leva ao resto do escritório.

## O que deu errado na versão do Gemini (analisado quadro a quadro)

| # | Onde | O que aconteceu |
|---|---|---|
| 1 | todos os vídeos | **marca d'água do Gemini** (a estrelinha ✦) no canto inferior direito. Não dá para publicar. |
| 2 | 1º vídeo, ~3,3 s | você **para de olhar para a câmera** e vira o rosto para o lado oposto ao da passagem. |
| 3 | 1º vídeo, 3 a 5 s | quanto mais a câmera chega perto, **mais o rosto muda** (barba, formato do rosto). |
| 4 | 1º vídeo, 4,6 a 5,5 s | a câmera **atravessa a mesa**: ela some por baixo da lente. |
| 5 | 1º vídeo, 6,5 a 7,3 s | **corte disfarçado**: o canto escuro ao lado da estante se dissolve num corredor de vidro que não estava ali, e a luz troca de âmbar e violeta para cinza frio. |
| 6 | extensão, 10 a 13 s | os rabiscos pretos do quadro **viram neon sozinhos**, com **letras inventadas** ("Wusc", "Pigen"). |
| 7 | extensão, ~14 s | o quadro **gira e anda sozinho** na frente da câmera. |
| 8 | extensão e 3º vídeo | o corredor termina numa parede com tomada, mas a câmera **atravessa a parede** para uma sala que não existe; depois **surge uma porta** à direita do quadro. |
| 9 | 4º vídeo, 1º segundo | a luz da sala **troca de violeta para verde-azulado**. |
| 10 | 4º vídeo, 5 a 8 s | **monitores se multiplicam e flutuam** empilhados no ar, sem suporte. |
| 11 | 4º vídeo, fim | uma porta **nasce na parede de racks** e abre para uma sala branca estourada, fora da sua identidade. |
| 12 | emendas | só o 3º → 4º vídeo emenda bem (nota 0,94). Do 1º para o 3º a nota é 0,59: salto visível. |

**De onde vêm:** vídeos longos (10 a 20 s) com muita coisa acontecendo, e cada trecho começando de
uma imagem nova em vez do último quadro do anterior. Quanto mais tempo e mais ações, mais o modelo inventa.

## Como vamos fazer desta vez (o método preciso)

1. **Trechos curtos, de 5 segundos, com uma ação só cada um.**
2. **Cada trecho começa no último quadro EXATO do anterior.** Você me manda o vídeo aqui; eu tiro o
   último quadro em resolução cheia, confiro se há alucinação e te devolvo a imagem para ser o quadro
   inicial do próximo. Assim não há emenda: o vídeo seguinte nasce do pixel onde o anterior parou.
3. **Sem quadro final**, porque o quadro final força a câmera a "morfar" até ele, e foi assim que o
   corredor se dissolveu. O destino é descrito no texto.
4. **O mesmo modelo de vídeo nos 4 trechos**, sem som, vertical 9:16, maior resolução disponível.
5. **Nada de close no seu rosto.** A câmera passa por você na mesma distância do começo; o rosto muda
   quando a câmera chega perto.

## Os 4 trechos

### Trecho 1 — A passagem por você
**Quadro inicial:** a imagem original de você sentado na mesa (o arquivo da imagem, não um quadro tirado de vídeo).

```
Single continuous cinematic camera move, no cuts, no dissolves. The man sitting at the desk stays seated and still, hands clasped on the desk, and keeps exactly the same face, beard, hair, earring, white t-shirt and silver chain. He keeps looking straight into the camera lens the whole time: as the camera moves, only his head and eyes turn smoothly to follow the lens. The camera rises slightly and glides forward above the empty desk, never touching or passing through the desk, then curves to the left side of the frame and passes beside his right shoulder, staying at the same distance from him as at the start, never moving closer to his face. In the final second the camera faces the open glass doorway on the left side of the room and drifts slowly forward toward it. The room stays exactly the same: same shelves, warm amber lamps, plant, monitors, violet accent light and glass doorway. Same lighting and colors from start to end. No new objects, no text.
```

**Confira antes de aceitar:** você olha para a lente até sair do quadro; o rosto não muda; a câmera
não atravessa a mesa; termina olhando para a porta de vidro da esquerda.

### Trecho 2 — O corredor e o quadro dos agentes
**Quadro inicial:** o último quadro do trecho 1 (eu te mando).

```
Single continuous cinematic camera move, no cuts, no dissolves. The camera continues the same slow forward glide through the glass doorway and straight down a glass-walled corridor, at the same height and speed, toward a glass whiteboard on a stand at the far end. The lighting stays warm amber with violet accents, with small ceiling spotlights along the corridor. As the camera approaches, simple hand-drawn boxes, circles and arrows on the board light up in cyan neon, like a network of connected agents: abstract shapes only, no letters, no words, no numbers. On the right wall, next to the board, there is an open dark doorway with soft violet light coming from inside. The board stays fixed on its stand and never moves. In the final second the camera turns slightly toward the violet doorway on the right and drifts slowly forward. No new rooms, no text.
```

**Confira:** nenhuma letra no quadro; o quadro não anda; a porta violeta está visível à direita no fim.

### Trecho 3 — A sala de operação
**Quadro inicial:** o último quadro do trecho 2.

```
Single continuous cinematic camera move, no cuts, no dissolves. The camera continues forward past the right side of the glowing board, which stays fixed in place, and enters the open doorway into a dark operations room lit in deep violet: rows of white desks, each with one or two monitors on desk stands showing abstract diagrams, server racks with small blinking lights along the back wall, and desk lamps with warm light. The camera glides at the same height down the center aisle. The lighting stays dark violet the whole time, with no change of color. Every monitor stays on its stand and the number of monitors never changes. Ends with a slow, steady forward drift down the aisle. No text.
```

**Confira:** a cor não muda; nenhum monitor flutua nem se multiplica.

### Trecho 4 — A porta (o convite)
**Quadro inicial:** o último quadro do trecho 3.

```
Single continuous cinematic camera move, no cuts, no dissolves. The camera continues slowly down the aisle toward the back wall. In the center of the back wall, between the server racks, a tall dark door slowly opens by itself and soft cyan and violet light pours out from the other side. The camera approaches the open door and settles into a slow, steady forward drift toward the light. Everything else in the room stays exactly the same: desks, monitors, racks and violet lighting. No white light, no text.
```

**Confira:** a porta já faz parte da parede (não brota de dentro dos racks); a luz é ciano e violeta, não branca.

## Como isso vira a bio (proposta, decisão do JP)

| Trecho | Seção da bio |
|---|---|
| 1 · Você na mesa | Chegada: quem é você, IA Humanizada, WhatsApp |
| 2 · Quadro dos agentes | IA para empresas: mentoria e consultoria |
| 3 · Sala de operação | Atendimento rodando sozinho: GustoBio e GustoChat |
| 4 · A porta | Sites e tráfego, e o convite final para conversar |

## Custo

4 vídeos de 5 s, mais reserva de 2 a 3 refações (o trecho 1 é o mais difícil, por causa do seu rosto).
Nenhuma imagem nova é necessária: a primeira já existe e as outras nascem dos vídeos.
