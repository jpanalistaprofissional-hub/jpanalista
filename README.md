# jpanalista.com.br — link da bio

Página que abre em **jpanalista.com.br**, o link da bio do Instagram `@jpanalista.com.br`.
Estilo **ultra premium**, feito pelo agente `astucious`: conforme a pessoa rola a página, uma
câmera atravessa quatro cenas, cada uma com um serviço e o seu botão.

**Estado: rascunho.** O layout funciona e passa no teste. As cenas ainda são desenhos
provisórios marcados "RASCUNHO"; os vídeos serão gerados depois.

## Como a página funciona

- **Celular primeiro.** Os vídeos são gerados na vertical (9:16). Uma barra fixa embaixo deixa o
  WhatsApp e a lista "Todos os links" a um toque desde o primeiro segundo.
- **No computador**, o vídeo vertical vira uma coluna à direita e o texto fica à esquerda.
- **Quem não quer rolar** abre "Todos os links": a lista clássica de link da bio, com atalho
  para cada cena.
- **Celular em modo economia** (ou sem animação) vê as imagens com transição, sem vídeo travado.
- **Sem JavaScript**, e para o Google, o texto das cenas está no próprio HTML (`data-sw-seo`).

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | a página: textos das cenas, número do WhatsApp, mensagens prontas |
| `bio.css` | as adaptações do visual (tema escuro, coluna no computador, barra fixa, lista de links) |
| `scrub-engine.js` | a engine da rolagem, cópia **sem alteração** do repositório `cth9191/scroll-world` (licença MIT em `LICENSE-scroll-world`) |
| `assets/` | cenas provisórias; depois, os vídeos, pôsteres e imagens finais |
| `testes/layout.js` | teste automático no iPhone, Android e três tamanhos de computador |

A engine não é editada: tudo que muda fica no `bio.css`. Assim ela pode ser atualizada pelo
repositório de origem sem conflito.

## Testar

```bash
python3 -m http.server 8765 --bind 127.0.0.1
node testes/layout.js      # noutra aba; capturas em testes/capturas/
```

O teste falha se aparecer rolagem para o lado, botão escondido pela barra, texto cortado ou
texto em cima do vídeo no computador.

## Próximos passos

1. **Gerar as cenas** pela skill `scroll-world` (nível Lean: 4 cenas, câmera sempre para
   frente, na vertical). Cada cena ganha `clip`, `clipMobile`, `poster` e `posterMobile` em
   `index.html`.
2. **Rodar a checagem das emendas** (SSIM ≥ 0,90) e o teste de layout.
3. **Testar no celular de verdade, dentro do app do Instagram**, num iPhone e num Android.
4. **Publicar** (abaixo).

## Publicar sem quebrar o que já está no domínio

O domínio já serve outras páginas na mesma pasta de hospedagem. **A área de contratos em
`/cliente/` não pode ser apagada nem sobrescrita.** Na publicação:

- enviar só os arquivos deste repositório, sem apagar pastas existentes;
- decidir antes para onde vai a página atual do domínio (por exemplo `/consultoria/`);
- conferir se já existe um `.htaccess` na raiz antes de enviar qualquer regra; se existir,
  **juntar**, nunca substituir. A regra sugerida está em `htaccess.sugerido`;
- depois de publicar, abrir `/` e `/cliente/` para provar que os dois respondem.
