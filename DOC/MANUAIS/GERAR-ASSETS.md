# Geração de assets otimizados

> **Épico 6.1 do [BACKLOG.md](../Docs/BACKLOG.md).** Como sair da arte original em PNG
> para os arquivos que realmente entram no APK.
> **Atualizado:** 31/07/2026

## Resumo

| | Antes | Depois |
|---|---|---|
| `APK/public/assets/` | 26 MB (PNG cru) | **1,0 MB** |
| `APK/dist/` (bundle) | 26 MB | **1,2 MB** |
| APK de debug | — | **~4,6 MB** |
| Teto do AAB na Play Store | 50 MB | folga de ~45 MB |

## Como rodar

```bash
python APK/tools/gerar-assets.py
```

Lê de `PROJECT/assets/` (arte original, fonte da verdade) e escreve em
`APK/public/assets/`. É idempotente: pode apagar o diretório de saída inteiro e
rodar de novo. Requer **Pillow** (`pip install Pillow`).

Depois de gerar, reconstrua o bundle:

```bash
cd APK && npm run build
```

### Cenário da vitória final — `gerar-win-bg.py`

```bash
python APK/tools/gerar-win-bg.py
```

Script **à parte**, com saída própria: `APK/public/assets/win_bg.webp` (768×1376,
~16 KB). Não lê de `PROJECT/assets/` — desenha a cena por código (Pillow), então
é a única arte do projeto sem original externo. Determinístico (`random.seed(7)`):
rodar duas vezes produz o mesmo arquivo.

Desenha o pôr do sol da tela de vitória final: sol grande e centralizado no
horizonte, floresta em silhueta enquadrando as duas margens, e um caminho de luz
que guia o olhar do primeiro plano até o sol — é por ele que o personagem
caminha, encolhendo, na animação `bkwalk`.

> **Por que foi refeito.** A arte anterior tinha dois defeitos que só apareceram
> no playtest: uma **emenda vertical** visível em x=470 (61 % da largura, onde
> duas imagens tinham sido coladas) e o **sol escondido atrás da floresta**, na
> direita, quase invisível — numa tela cujo tema é caminhar rumo ao sol. Ambos
> confirmados por análise de descontinuidade de colunas antes de refazer.

Ajustes ficam nas constantes do topo do script: `HORIZON`, `SUN_CY`, `SUN_R` e a
paleta `SKY` (mesma família de cores da UI: roxo `#2b1b3d`, amarelo `#ffd23f`,
laranja `#ff8c42`).

## O que o script faz

**1. Reduz a resolução.** Os sprites vinham em 1024×1024 mas são desenhados em
~60 px ([render.js](../../APK/src/game/render.js)): naves 60×46, herói 66×66,
Trasho 96×82, com `devicePixelRatio` limitado a 2×.

**2. Converte para WebP,** preservando alpha nos sprites recortados.

**3. Mantém em PNG/SVG o que não deve ser convertido:** o favicon (reduzido de
1024 px para 192 px, de 851 KB para 55 KB) e `gorila-frente-banana-01.svg`
(vetorial — converter só pioraria).

## Por que os alvos são maiores que o "necessário"

Esta é a parte contraintuitiva. Reduzir 1024→200 e **depois** comprimir com
lossy degrada muito mais do que qualquer uma das duas operações isolada.
Medido no herói (PSNR sobre pixels opacos, na resolução de exibição):

| Operação | PSNR |
|---|---|
| Só resize 1024→200, sem WebP | 48,1 dB |
| Só WebP q95, sem resize | 47,7 dB |
| **Resize 200 + WebP q95** | **32,2 dB** ← ruim |
| **Resize 320 + WebP q92** | **36,6 dB** ← adotado |

Reduzir demais concentra o detalhe em poucos pixels, e é justamente aí que o
compressor lossy erra. Por isso os alvos ficaram em ~4× o tamanho de exibição,
não 2×. O custo é de poucos KB.

**Qualidade final:** todos os sprites entre **36,6 e 44,7 dB**.

> ⚠️ **Se for reajustar os alvos ou a qualidade, meça o PSNR sobre os pixels
> opacos**, não sobre a imagem inteira. Medir em RGB com o fundo transparente
> incluído dá números falsamente catastróficos (o herói "aparecia" com 21 dB),
> porque compara lixo de áreas invisíveis.

## Fontes embutidas

`APK/public/fonts/` traz **Press Start 2P** e **VT323** em WOFF2, subsets
`latin` + `latin-ext` — suficientes para os 6 idiomas. Declaradas via
`@font-face` em [styles.css](../../APK/src/styles.css), **sem nenhuma requisição
de rede** (a POC as puxava do Google Fonts, violando o offline-first da §8).

Ambas são **SIL Open Font License 1.1**, que permite uso comercial e embutir no
app. O comprovante está em [`APK/public/fonts/LICENSE.txt`](../../APK/public/fonts/LICENSE.txt).

Cirílico, grego e vietnamita foram omitidos: nenhum idioma suportado os usa e
custariam ~60 KB a mais.

## Versionamento

`APK/public/assets/` **é versionado** agora que contém só os WebP otimizados
(1 MB). A arte original continua em `PROJECT/assets/` e é a fonte para
regerar. PNG solto em `APK/public/assets/` é engano — o `.gitignore` os bloqueia,
com exceção do `icon.png`.

---

## Gerar o APK de teste

```bash
cd APK
npm run build          # gera dist/ (1,2 MB)
npx cap sync android   # copia dist/ para o projeto nativo
cd android && ./gradlew assembleDebug
```

Saída em `APK/android/app/build/outputs/apk/debug/app-debug.apk` (~5,4 MB).
Instale com `adb install -r <caminho do apk>`.

**Se a pasta `android/` ainda não existir:** `npx cap add android`, e depois crie
`APK/android/local.properties` com o caminho do SDK, **usando barras normais**:

```
sdk.dir=C:/Users/<voce>/AppData/Local/Android/Sdk
```

> ⚠️ Barras invertidas (`C:\Users\...`) fazem o Gradle falhar com
> `java.io.IOException: Invalid file path`, porque `\U` e `\A` são escapes
> inválidos em arquivo `.properties`.

### ⚠️ `android/` não é versionado

A pasta está no `.gitignore` (padrão do Capacitor: é saída de geração). Isso
significa que **edições manuais no projeto nativo se perdem** quando alguém roda
`npx cap add android` do zero. Hoje há **uma** edição assim:

| Arquivo | Edição | Por quê |
|---|---|---|
| `android/app/src/main/AndroidManifest.xml` | `android:screenOrientation="portrait"` na `MainActivity` | O plugin `ScreenOrientation` trava em runtime, mas sem a trava declarada a tela chega a girar por um instante ao abrir o app. |

Ao regerar a pasta, **reaplique essa linha**. Quando o épico 11 (release) fixar
o processo, vale mover isso para um passo automatizado.
