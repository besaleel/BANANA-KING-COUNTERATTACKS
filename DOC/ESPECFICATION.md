# Banana King Counterattacks — Especificação Técnica e de Design

> **Versão:** 2.0 (especificação consolidada)
> **Data:** 29/07/2026
> **Plataforma:** Web / mobile, **exclusivamente retrato (portrait)**
> **Gênero:** Arcade fixed-shooter (estilo *Space Invaders*)
> **Pacote Android:** `com.bananaking.counterattacks`
> **Repositório:** `github.com/besaleel/BANANA-KING-COUNTERATTACKS`
> **Assets:** `PROJECT/assets`

---

## 0. Nota sobre o nome do produto

Este documento especifica **Banana King Counterattacks**, um jogo **novo e independente**.

- **"Banana King Counterattacks"** = nome do **jogo/aplicativo**.
- **"Banana King"** (sozinho) = nome do **personagem herói** dentro deste jogo.
- Existe um projeto anterior, distinto, também chamado **"Banana King"**. Qualquer
  referência a `C:\Sistemas\BANANA-KING`, keystore `banana-king-release.jks`,
  asset `banana-king-logo.png` ou "Épico 9.3" em documentos herdados pertence a
  **esse outro projeto** e **não** a este.
- **Regra:** ao encontrar "Banana King" em documentação, código ou configuração,
  verificar se se refere ao **personagem** (correto) ou ao **jogo antigo**
  (precisa correção). Nomes de app, pacote, keystore, artefatos de build e fichas
  de loja devem sempre usar **Counterattacks**.

---

## 1. Visão geral

O herói **Banana King** pilota uma nave espacial na base da tela e enfrenta o
vilão **Trasho** (um chimpanzé) e sua tropa estelar, no topo. O objetivo de cada
fase é **destruir toda a formação inimiga** antes de perder as 3 vidas. São
**10 fases**, cada uma com um cenário próprio e uma montagem de naves distinta.

Referência visual: `PROJECT/assets/poc-do-jogo.png` — vilão em disco voador no
topo, 4 fileiras de naves, cocos caindo, Banana King em disco na base, fileira de
bananas (barreira) e horizonte de silhueta ao fundo.

**Status atual:** protótipo da Fase 01 jogável em
[PROJECT/Banana King - Fase 01.dc.html](../PROJECT/Banana%20King%20-%20Fase%2001.dc.html).
Todos os valores marcados como *baseline v1* nesta especificação foram medidos
desse protótipo.

---

## 2. Personagens e entidades

| Entidade | Asset | Papel |
|---|---|---|
| **Banana King** (herói) | `banana-king-no-espaco.png`, `-espelhado.png` | Nave do jogador, na base |
| *(reserva)* | `banana-king-no-espaco_branco.png` | **Sem uso definido** — ver §15 |
| **Trasho** (vilão/chefe) | `vilao-Trasho.png`, `vilao-Trasho-espelhado.png` | Topo, oscila lateralmente e lança cocos |
| **Gorila (variações)** | `king-gorila.svg`, `gorila-frente-banana-01/02.svg` | Telas de vitória/derrota/menu |
| **Animação de vitória final** | `win_Walk-Frame-1/2/5-Phone.png` | Walk-cycle final (ver §7.2) |
| *(reserva)* | `win_Walk-Frame-3/4-Phone.png`, `*-Tablet.png` | **Sem uso** — escala/proporção incompatíveis, ver §7.2 e §15 |
| **Naves inimigas** | `nave-inimiga-00…05.png` | Formação (ver §2.1) |
| **Logo** | `logo.png`, `logo-transparente.png` | Menu / splash |
| **Ícone** | `icon.png` | App icon / favicon |
| **Fundos** | `background-fase01…10.png` | Um por fase |

### 2.1 Naves inimigas — poder e resistência

São **6 tipos**. "Poder" = **número de tiros do herói necessários para destruir**
(resistência) e também define pontuação e categoria.

| Nave | Poder / Resistência | Categoria | Nível na tabela de fases |
|---|---|---|---|
| `nave-inimiga-00.png` | **5** | Mais forte | 5 |
| `nave-inimiga-01.png` | **4** | Forte | 4 |
| `nave-inimiga-02.png` | **3** | Forte | 3 |
| `nave-inimiga-03.png` | **2** | Fraca | 2 |
| `nave-inimiga-04.png` | **2** | Fraca | 2 |
| `nave-inimiga-05.png` | **1** | Mais fraca | 1 |

**Naves de mesmo nível = apenas variedade visual.** Os níveis 2 e 4 possuem
**duas naves cada** com sprites diferentes (nível 2 = `nave-inimiga-03` e
`nave-inimiga-04`; nível 4 = `nave-inimiga-01`, hoje sozinha). Naves do mesmo
nível têm **resistência, pontuação e comportamento idênticos** — o sprite
alternativo existe só para a formação não parecer repetitiva. **Não** implementar
diferenças de atributo entre naves do mesmo nível.

**Feedback visual de dano:** a cada acerto a nave dá **flash branco**
(`brightness(2.2)` por ~0,1 s) e mantém **escurecimento proporcional à vida
restante** (`brightness(1 − dano × 0,45)`, onde `dano = 1 − hp/poder`).

---

## 3. Layout de tela (retrato)

**Resolução lógica de referência:** `480 × 854` (aspect-ratio 480/854), escalada
responsivamente à altura do dispositivo. **Layout único (Phone)** — sem
breakpoint de tablet.

De cima para baixo:

1. **HUD superior (barra fixa, 52 px):**
   - Esquerda: **nome do usuário** (truncado com ellipsis).
   - Direita, agrupado: **fase atual** · **pontuação** (6 dígitos com zeros à
     esquerda) · **multiplicador de combo** (visível só quando > x1) ·
     **vidas** (ícones de banana) · **botão mute/som** · **botão pausa**.
2. **Área de jogo (playfield):**
   - Topo (y ≈ 52–130): **Trasho**, oscilando lateralmente.
   - y ≈ 130 + 62·n: **4 fileiras** de naves inimigas.
   - y ≈ H − 290: **barreira de bananas** (fileira horizontal única).
   - y ≈ H − 150: **Banana King** (jogador).
3. **Rodapé:**
   - Texto **"Remover Anúncio"** (link) logo acima do **banner de anúncio**
     (320×50, AdMob — placeholder funcional). Oculto quando `remove_ads` ativo.

A barreira de bananas fica **um pouco acima do Banana King**, deixando corredor
de esquiva entre a barreira e o herói.

---

## 4. Mecânica de jogo

### 4.1 Controle do herói
- **Arrastar o dedo** move a nave na **horizontal** (segue o toque diretamente).
- **Teclado (desktop/teste):** setas ← → a 320 px/s; `Esc` pausa/retoma.
- **Tiro automático contínuo**, cadência **350 ms** (*baseline v1*; faixa
  ajustável 120–900 ms). Projétil sobe a **430 px/s**.
- Movimento limitado a 40 px de cada borda do playfield.
- **Sprite direcional:** `banana-king-no-espaco.png` ao mover para a **direita**,
  `banana-king-no-espaco-espelhado.png` para a **esquerda**.

### 4.2 Formação inimiga
- **4 fileiras × 5 colunas** por fase (espaçamento de coluna 82 px; nave
  60 × 46 px), cada fase com **montagem distinta** de tipos conforme §5.1.
- **Fileiras alternadas:** cada fileira tem **posição e direção próprias**.
  Fileiras de índice **par** (0, 2) iniciam indo para a **direita**; de índice
  **ímpar** (1, 3) para a **esquerda**.
- **Movimento clássico Space Invaders:** cada fileira anda de lado e, ao tocar a
  borda, **aquela fileira inverte o sentido** e **todo o conjunto (as 4 fileiras)
  desce um degrau de 5 px**, mantendo a formação coesa verticalmente.
- **Degrau efetivo — decisão de design.** Como as 4 fileiras batem nas bordas em
  momentos diferentes e **qualquer** batida faz o conjunto inteiro descer, a
  descida real é de até **~4 × 5 px por ciclo**. Os 5 px do *baseline v1* já
  foram calibrados **considerando esse efeito acumulado** — não é um bug, e
  aumentar o degrau tratando-o como "descida única" deixaria o jogo muito rápido.
- **Velocidade da formação:** base **26 px/s** (*baseline v1*; faixa 10–90),
  acelerando conforme a formação é destruída:
  `velocidade = base + (1 − naves_vivas/naves_totais) × 80`.
- **Aceleração global — decisão de design.** O cálculo usa o total de naves da
  **fase inteira**, não da fileira. Com uma única nave restante a velocidade
  chega a ~106 px/s (≈4× a inicial). É **intencional**: cria pressão crescente e
  evita que o fim da fase fique arrastado caçando a última nave.
- **Disparo inimigo:** **apenas o Trasho** lança cocos. As naves da formação
  **não atiram**.
- **Trasho:** oscila no topo em `x = W/2 + sin(t × 0,55) × (W/2 − 70)`, com
  sprite espelhado conforme a direção real do movimento.

### 4.3 Cocos (projétil do vilão)
- Desenho **redondo** (coco pixelado, raio 13 px, com rotação).
- Disparo **aleatório, esporádico e de baixa constância**: intervalo base
  **4,5 s** (*baseline v1*; faixa 0,8–8 s) multiplicado por um fator aleatório
  de **0,6 a 1,5**.
- Queda a **130–185 px/s** com deriva horizontal de **−20 a +20 px/s**.
- A frequência **aumenta gradualmente fase a fase**.

### 4.4 Barreira de bananas

A barreira tem **duas funções**: absorver cocos e **destruir naves da formação
que descerem até ela**.

- Uma **fileira horizontal única** de **7 bananas deitadas** (`- - - - -`,
  **não** vertical `| | |`), distribuídas em `x = (W/8) × (i+1)`.
- **Contra cocos:** cada banana absorve **2 cocos** e então é **destruída**
  (explosão + som). O coco é **bloqueado** — ambos somem no impacto.
  Banana com 1 de vida exibe estado **danificado** (cor mais escura + rachaduras).
- **Contra naves (linha de defesa):** a nave inimiga que **atinge a barreira é
  destruída**, e a **banana atingida é destruída junto** — troca mútua,
  independente de a banana ter 1 ou 2 de vida. Consequências:
  - A nave destruída na barreira **não dá pontos** e **não incrementa o combo**
    (só destruições **por tiro** pontuam). Isso impede "farmar" pontos deixando
    a formação descer.
  - A barreira é **finita**: cada nave que passa consome uma banana. A defesa se
    desgasta, criando tensão real conforme a formação avança.
  - Se **toda** a formação for destruída na barreira, a fase é **vencida
    normalmente** — a condição de vitória continua sendo "formação vazia",
    qualquer que seja a causa.
#### Persistência da barreira — "vida extra" do jogador

A barreira é um **recurso de longo prazo**, deliberadamente escasso. O estado das
7 bananas (destruída / 1 de vida / 2 de vida) é **persistente e nunca regenera
sozinho**:

| Evento | Estado da barreira |
|---|---|
| Trocar de fase (vitória) | **Preservado** como está |
| Perder uma vida (fase reinicia) | **Preservado** como estava no momento da morte |
| Pegar a **banana bônus** | **Barreira nova completa** (única forma de recuperar) |
| Game over (3 vidas) → Fase 01 | Restaurada (jogo novo) |

> **Razão de design:** a barreira funciona como uma **reserva de vidas extras**.
> Ela não volta de graça — nem ao trocar de fase, nem ao reiniciar após a morte.
> Perder bananas é uma perda real e acumulativa ao longo da partida.

#### Banana bônus (único jeito de recuperar a barreira)

Uma banana cai pela tela e é coletada por contato, **igual aos power-ups de tiro**
(§4.6). Ao ser coletada, **restaura a barreira completa**: as 7 bananas voltam com
**2 de vida cada**, independente de quantas estavam destruídas ou danificadas.

Duas origens, que **convivem**:

1. **Por marco de pontuação (qualquer fase):** a cada **X pontos acumulados** cai
   uma banana bônus, repetindo a cada novo múltiplo de X.
   *X a definir em playtest — ver pendência #9.*
2. **Fase 5 (garantida):** a Fase 5 solta **uma banana bônus garantida**,
   independente da pontuação. Mantida como marco de progressão da campanha.

- Se o jogador **não pegar**, a banana é **perdida** ao atingir a base — sem
  segunda chance e sem reoferta. Pegar exige atenção, como qualquer power-up.
- A banana bônus é **visualmente distinta** dos power-ups de tiro (é uma banana,
  não um quadrado com letra) para o jogador reconhecer o que está em jogo.

### 4.5 Vidas
- **3 vidas.** Vida é perdida **exclusivamente por contato direto com o herói**:
  - coco que atinge o herói → **−1 vida**;
  - nave da formação que encosta no herói → **−1 vida**.
- **Não existe game over por alcance.** Na prática a formação raramente alcança o
  herói, porque as naves **se destroem na barreira de bananas** (§4.4). Se ainda
  assim uma nave chegar ao herói, ela tira 1 vida pela regra acima.
- **Ao perder uma vida (tendo vidas restantes): a fase é reiniciada por
  completo.**
  - A **formação volta à posição inicial no topo**, com **todas as naves
    restauradas** (a fase recomeça do zero).
  - O herói volta ao **centro**, com explosão e **invulnerabilidade de 2 s**
    (piscando).
  - **Pontuação acumulada e vidas restantes são mantidas** — não se perde o placar.
  - O **multiplicador de combo zera**.
  - Projéteis, cocos e power-ups em tela são limpos.
- **A barreira NÃO é restaurada** no reinício da fase — as bananas ficam exatamente
  como estavam no momento da morte. Ela é a "vida extra" do jogador e só volta com
  a **banana bônus** (§4.4).
- Ao zerar as 3 vidas → **tela de derrota** (nave do herói destruída + botão
  **"Tentar novamente"**), que **reinicia o jogo da Fase 01**.

### 4.6 Power-ups (drops)
Aparecem ao destruir naves **por tiro**, com **4 %** de chance por nave
(*baseline v1*; faixa 0–40 %). Caem a 95 px/s e são coletados por contato.

| Tipo | Efeito | Duração (*baseline v1*) |
|---|---|---|
| `triple` | Tiro triplo (3 projéteis, deriva lateral −70 / 0 / +70 px/s) | 8 s |
| `rapid` | Cadência de tiro **× 0,5** (350 ms → 175 ms no baseline) | 8 s |
| `shield` | Escudo que absorve **1** coco e então se consome | 8 s ou até absorver |
| `life` | **+1 vida**, com **teto de 3 vidas** | instantâneo |
| `banana` | **Restaura a barreira completa** (7 bananas × 2 de vida) — ver §4.4 | instantâneo |

O drop de **4 %** vale para os power-ups de combate (`triple`, `rapid`, `shield`,
`life`). A **banana bônus não é um drop aleatório**: ela aparece por **marco de
pontuação** ou na **Fase 5**, conforme §4.4.

**Regra de acumulação:**
- `triple` e `rapid` ocupam o **mesmo slot de arma** — são **mutuamente
  exclusivos**. Pegar um enquanto o outro está ativo **troca a arma** e reinicia
  a duração. Não existe "tiro triplo rápido".
- `shield` é **independente** e **coexiste** com qualquer arma ativa.
- `life` é instantâneo e não ocupa slot.

### 4.7 Condição de vitória
- **Fase vencida** = destruir **todas** as naves da formação → **tela de vitória**
  (herói comemorando + nave do vilão destruída) → próxima fase.
- **Jogo vencido** (após a fase 10) = **animação final** (§7.2): Banana King
  caminhando no pôr do sol com um troféu, **pontuação final em destaque** e
  **frase de vitória** localizada.

---

## 5. Progressão das 10 fases

Cada fase = **1 background** (`background-fase01..10.png`, vinculado pelo número)
+ **4 fileiras** de naves. A dificuldade é **gradual**: a Fase 01 usa apenas as
naves mais fracas e, a cada fase, uma nave **mais forte** é introduzida, até a
Fase 10.

### 5.1 Composição das fileiras por fase

Cada célula indica o **nível de poder** das naves naquela fileira (topo → base).
A fileira do topo sempre traz a nave mais forte da fase.

| Fase | Fileira 1 (topo) | Fileira 2 | Fileira 3 | Fileira 4 (base) | Níveis presentes |
|---|---|---|---|---|---|
| 01 | 2 | 2 | 1 | 1 | 1, 2 |
| 02 | 2 | 2 | 2 | 1 | 1, 2 |
| 03 | 3 | 2 | 2 | 1 | 1, 2, 3 |
| 04 | 3 | 3 | 2 | 1 | 1, 2, 3 |
| 05 | 4 | 3 | 2 | 1 | 1–4 *(+ banana bônus)* |
| 06 | 4 | 3 | 3 | 2 | 2, 3, 4 |
| 07 | 5 | 4 | 3 | 2 | 2–5 |
| 08 | 5 | 4 | 4 | 3 | 3, 4, 5 |
| 09 | 5 | 5 | 4 | 3 | 3, 4, 5 |
| 10 | 5 | 5 | 4 | 4 | 4, 5 (final) |

> Mapeamento nível↔nave: **1** = `nave-inimiga-05` · **2** = `nave-inimiga-03`
> e `nave-inimiga-04` · **3** = `nave-inimiga-02` · **4** = `nave-inimiga-01` ·
> **5** = `nave-inimiga-00`.

**Fase 01 conforme implementada (referência):** fileiras
`nave-03 (nível 2)`, `nave-04 (nível 2)`, `nave-05 (nível 1)`,
`nave-05 (nível 1)` — 5 colunas cada, 20 naves no total.

Além da composição, crescem gradualmente por fase: **velocidade da formação**,
**tamanho do degrau de descida** e **frequência de cocos** do Trasho (valores por
fase a calibrar — ver backlog).

---

## 6. Pontuação e ranking

- **Pontos por nave:** `pontos = poder × 100 × multiplicador` (nave nível 5 =
  500 base; nível 1 = 100 base). Pontos flutuam na tela ao serem ganhos.
  **Somente naves destruídas por tiro pontuam** — naves consumidas na barreira de
  bananas valem 0 e não contam para o combo (§4.4).
- **Multiplicador de combo:** `mult = 1 + min(4, floor(destruições_seguidas / 4))`
  → varia de **x1 a x5**, subindo a cada 4 naves destruídas em sequência.
  **Zera** quando o herói perde uma vida.
- **Bônus de fase:** concluir a fase sem perder vida → **+1000**.
  ⚠️ *Especificado, ainda não implementado na POC (item no backlog).*
- **Bônus por vidas restantes** ao vencer o jogo (valor a definir).
  ⚠️ *Especificado, ainda não implementado.*
- **Recorde salvo localmente** (`localStorage`, prefixo `bkc_`): melhor
  pontuação + nome. Funciona **offline**.
- **Ranking global (futuro):** **Google Play Games Services (Leaderboards)**.
  Camada de score desacoplada para plugar depois.

### 6.1 Chaves de persistência local (`localStorage`)

Todas prefixadas com `bkc_`: `lang`, `name`, `muted`, `music`, `fx`, `ads`,
`last` (última pontuação), `high` (recorde).

---

## 7. Fluxo de telas

```
[Splash/Logo]
      ↓
[Tela inicial]
  - Logo do game
  - Texto descritivo curto (localizado)
  - Seletor de idioma (6)
  - Campo de nome + botão "JOGAR"
  - Toggles Música / Efeitos
  - Última pontuação
  - Link "Termos de uso e privacidade"
      ↓
[Gameplay — Fase N]  ←──────────┐
      ↓ (vitória)                │ (próxima fase)
[Tela de vitória de fase] ───────┘
      ↓ (após fase 10)
[Animação final — troféu/pôr do sol]

Em qualquer fase, ao zerar vidas:
[Gameplay] → [Tela de derrota: herói destruído + "Tentar novamente"]
```

### 7.1 Telas detalhadas
- **Tela inicial:** logo (flutuando), texto descritivo, dropdown de idioma,
  input de nome (máx. 14 caracteres; padrão `PLAYER 1` se vazio), botão JOGAR,
  toggles **Música** e **Efeitos**, "última pontuação", link de
  termos/privacidade (**placeholder no protótipo**).
- **Vitória de fase:** herói comemorando + nave do vilão destruída + pontuação
  parcial + botão continuar.
- **Derrota (3 vidas perdidas):** herói destruído + pontuação + botão
  **"Tentar novamente"** → **reinicia o jogo da Fase 01** (placar zerado).
  Enquanto houver vidas, o jogador **permanece na fase atual**, que **reinicia
  por completo** mantendo placar e vidas (§4.5).
- **Vitória final:** animação Banana King + troféu + pôr do sol + pontuação em
  destaque + frase localizada + botão (menu/recomeçar).
- **Pausa:** botão de pausa no HUD (ou `Esc`) abre menu com **Continuar**,
  **Reiniciar o jogo**, toggles de **Música** e **Efeitos** e **salva a fase
  atual**. O jogo também **pausa automaticamente** quando a aba/app perde o foco
  (`visibilitychange`) e ao abrir o modal de anúncio.

### 7.2 Animação de vitória final (walk-cycle)

Cena **pré-renderizada** (fundo pôr do sol + floresta já embutidos em cada frame)
da caminhada do Banana King segurando o troféu — **walk-cycle em sprites**, não
uma animação por camadas.

- **Frames:** **3 frames distintos** — `win_Walk-Frame-1`, `-2` e `-5-Phone.png`
  — a **~8 fps** (125 ms por frame).
  ⚠️ **Corrigido em 31/07/2026:** esta seção dizia `1/3/5`. Os frames **3 e 4**
  foram renderizados em 937×1679 com o personagem em **outra escala e
  enquadramento**, enquanto 1, 2 e 5 são 768×1376 sobre o mesmo cenário
  (diferença medida: ~1 % dos pixels, restrita à faixa do personagem).
  Misturar as duas famílias produz salto de zoom, não caminhada.
- **Reprodução:** ciclo **1 → 2 → 5 → 2**; personagem **parado** (walk-cycle no
  lugar, sem transladar pela tela).
- **Overlays:** pontuação final e frase de vitória localizada sobrepostas, com
  botão de ação (menu/recomeçar) na base.
- **Layout único (Phone)** escalado — os assets Tablet não são necessários.

> **Resolvido em 31/07/2026 — posicionamento dos overlays.** Com `object-fit:
> cover` a arte 768×1376 entra no frame 480×854 a 0,625 de escala (corte de 6 px
> no topo, sem perda de conteúdo) e o personagem ocupa **y 286–620**. Os textos
> vão para dois blocos: **topo** (título + frase, y 0–134) e **base** (placar,
> bônus e botões, y 635–854), deixando a faixa central livre. Medido no pior
> caso de layout (alemão, duas linhas de bônus).

---

## 8. Áudio

- **Offline-first:** todas as **fontes** e **arquivos de áudio** devem ser
  **incorporados/empacotados** no jogo (nada carregado da rede em runtime).
  ✅ **Fontes: feito em 31/07/2026** — `Press Start 2P` e `VT323` em WOFF2
  (subsets `latin` + `latin-ext`, 57 KB) em `APK/public/fonts/`, declaradas por
  `@font-face` local. Licença SIL OFL arquivada em `public/fonts/LICENSE.txt`.
  Ver [GERAR-ASSETS.md](GERAR-ASSETS.md). ⬜ Áudio: pendente.
- **Licença livre para uso comercial** (preferir **CC0**), com comprovantes
  arquivados.
- Eventos com som: **tiro laser**, **acerto sem destruir** (tick), **explosão de
  nave**, **explosão de banana**, **impacto de coco no herói**, **power-up
  coletado**, **vitória**, **derrota**, **clique de UI**.
- **Controles de áudio separados:** **Música** e **Efeitos** com liga/desliga
  **independentes**, disponíveis na **tela inicial** e no **menu de pausa**.
  O botão **mute** do HUD alterna o áudio geral. Estados persistidos.

> **Nota sobre a POC:** o protótipo gera todo o áudio **proceduralmente via Web
> Audio API** (osciladores + ruído filtrado), inclusive a música de fundo
> (loop de baixo + arpejo a 250 ms/step). Isso é zero-asset e já é offline;
> decidir na produção se mantém o áudio procedural ou substitui por arquivos
> CC0 — ver backlog.

---

## 9. Monetização (AdMob)

- **Banner 320×50** na base + texto **"Remover Anúncio"** logo acima.
- Clique em "Remover Anúncio" → **modal de compra** (fluxo funcional na UI;
  integração de pagamento e AdMob **implementados depois**). O modal **pausa**
  o jogo enquanto aberto.
- **Produto único:** `remove_ads` — **compra única**, referência **USD 1,90**.
  O sistema deve **consultar o preço junto à loja** e exibir o **valor correto
  conforme a localidade** (moeda/preço regional). No protótipo o valor é
  placeholder fixo (USD 1,90).
- Quando `remove_ads` está ativo, **todo o rodapé de anúncio é oculto**.
- **App ID AdMob:** `ca-app-pub-XXX` (a substituir pelo real — ver
  [GOOGLE-ADMOB.md](GOOGLE-ADMOB.md)).

---

## 10. Internacionalização (i18n)

- Idiomas: **PT-BR, EN, ES, FR, IT, DE**. Padrão inicial: **PT-BR**.
- Todo texto vindo de dicionário de strings por idioma (sem texto hardcoded).
- Seletor de idioma na tela inicial; preferência persistida (`bkc_lang`).
- Cobertura: menu, HUD, botões, vitória/derrota, pausa, frase de vitória final,
  modal de anúncio, termos, e o **texto curto de apresentação** do jogo.
- **Traduções:** geradas por nós, **revisadas pelo cliente**.
- Testar layout com strings longas (**DE** e **FR** costumam estourar).

### 10.1 Texto descritivo da tela inicial

**PT-BR:**
> *"Defenda a Terra do chimpanzé Trasho e sua tropa estelar! Deslize para
> desviar dos cocos, destrua a formação e vença as 10 fases."*

**EN:**
> *"Defend Earth from the chimp Trasho and his star troop! Slide to dodge
> coconuts, destroy the formation and beat all 10 levels."*

As versões ES / FR / IT / DE estão implementadas no protótipo e seguem a mesma
estrutura.

---

## 11. Escopo do protótipo (fatia vertical) — **entregue**

**1 fase totalmente jogável e polida.** Estado atual do protótipo:

| Item | Status |
|---|---|
| Tela inicial (idioma + nome + última pontuação + termos) | ✅ |
| Fase 01 jogável: arrasto, tiro automático, 4 fileiras alternadas, cocos, barreira, 3 vidas, pontuação, HUD, mute | ✅ |
| Power-ups (os 4: triple, rapid, shield, life) | ✅ |
| Telas de vitória de fase e derrota ("Tentar novamente") | ✅ |
| Banner placeholder + "Remover Anúncio" → modal | ✅ |
| i18n nos 6 idiomas | ✅ |
| Som (laser, explosões, música) com mute + toggles separados | ✅ (procedural) |
| Recorde local | ✅ |
| Menu de pausa + auto-pausa por perda de foco | ✅ |
| Bônus de fase (+1000 sem perder vida) | ❌ pendente |
| Bônus por vidas restantes no fim do jogo | ❌ pendente |
| Fases 02–10 | ❌ fora do escopo do protótipo |
| Animação de vitória final | ❌ fora do escopo do protótipo |
| AdMob real, billing, ranking global | ❌ fora do escopo do protótipo |

---

## 12. Considerações técnicas

- **Orientação:** travar retrato; layout responsivo à altura do dispositivo.
  **Layout único (Phone)** escalado — sem breakpoint de tablet.
- **Renderização:** `<canvas>` 2D em resolução lógica 480×854, escalado por
  `devicePixelRatio` (limitado a 2×), com `imageSmoothingEnabled = false`
  para preservar o aspecto pixel-art.
- **Loop:** `requestAnimationFrame` com `dt` limitado a **33 ms** (evita saltos
  de física após throttling da aba). HUD atualizado no máximo a cada 150 ms
  para reduzir re-renders de UI.
- **Arquitetura de dados:** separar **config de fases** (JSON de parâmetros:
  composição de fileiras, velocidade, degrau, cadência de coco) da lógica, para
  ajuste rápido de dificuldade.
- **Painel de calibração:** parâmetros expostos como props ajustáveis
  (`fireRateMs`, `cocoIntervalS`, `formationSpeed`, `powerupDropPct`).
- **Score/ranking:** camada isolada para plugar backend futuro
  (**Google Play Games Services — Leaderboards**).
- **Performance:** pooling de sprites (tiros, cocos, explosões, partículas) para
  evitar GC em mobile.
- **Assets:** backgrounds PNG são grandes (~1 MB cada) — converter para **WebP**
  e/ou gerar atlas no build final.
- **Empacotamento: decisão pendente.** A POC é HTML + canvas puro. As opções em
  avaliação são vanilla+Capacitor, Angular+Capacitor ou TWA — ver
  [GERAR-AAB.md](GERAR-AAB.md) e o backlog.

### 12.1 Tabela consolidada de calibração (*baseline v1*)

| Parâmetro | Valor | Faixa ajustável |
|---|---|---|
| Cadência de tiro do herói | **350 ms** | 120–900 ms |
| Velocidade do projétil do herói | 430 px/s | — |
| Velocidade horizontal do herói (teclado) | 320 px/s | — |
| Intervalo base do coco | **4,5 s** × fator 0,6–1,5 | 0,8–8 s |
| Velocidade de queda do coco | 130–185 px/s | — |
| Velocidade base da formação | **26 px/s** | 10–90 px/s |
| Aceleração da formação | +80 px/s conforme naves são destruídas | — |
| Degrau de descida | **5 px** por toque na borda | — |
| Chance de drop de power-up | **4 %** | 0–40 % |
| Duração de triple / rapid / shield | 8 s | — |
| Invulnerabilidade após dano | 2 s | — |
| Vida da banana | 2 cocos | — |
| Grade da formação | 4 fileiras × 5 colunas, coluna 82 px | — |

---

## 13. Decisões fechadas

1. **Quem lança cocos:** só o **Trasho**, andando no topo, disparo aleatório.
2. **Barreira:** **1 fileira única de 7 bananas**, 2 cocos cada. **Também destrói
   naves** que descem até ela (troca mútua: nave e banana morrem juntas).
   Funciona como **reserva de vidas extras**: **nunca regenera** — nem ao trocar
   de fase, nem ao reiniciar a fase após perder vida. A **única** forma de
   recuperá-la é a **banana bônus** (marco de pontuação em qualquer fase +
   garantida na Fase 5), que restaura as 7 bananas completas.
3. **Altura da barreira:** um pouco acima do Banana King (y ≈ H − 290).
4. **Feedback de dano:** flash branco + escurecimento proporcional à vida.
5. **Formação alcança o herói:** **sem game over por alcance**. As naves são
   destruídas na barreira antes de chegar ao herói; se alguma chegar, tira 1 vida
   e a fase reinicia (mantendo placar e vidas).
6. **Cadência:** herói contínuo (350 ms); coco esporádico (4,5 s base),
   crescendo por fase.
7. **Power-ups:** 4 tipos, 8 s, drop 4 %, teto de 3 vidas. `triple` e `rapid` são
   mutuamente exclusivos (mesmo slot de arma); `shield` coexiste.
8. **Pontuação:** `poder × 100 × combo`, combo x1–x5, zera ao levar dano;
   recorde local offline + Play Games (Leaderboards) no futuro.
9. **Derrota/pausa:** 3 vidas perdidas volta à Fase 01; com vidas, **a fase
   reinicia por completo** (formação restaurada no topo), mantendo placar e vidas.
   Pausa: Continuar / Reiniciar / toggles Música+Efeitos; salva a fase atual;
   auto-pausa ao perder foco.
10. **Background↔fase:** vinculados pelo número; dificuldade gradual conforme
    §5.1.
11. **Áudio:** licença livre (CC0), incorporado e offline; controles separados
    Música × Efeitos na tela inicial e na pausa. (Protótipo usa áudio procedural.)
12. **Monetização:** produto único `remove_ads`, compra única, USD 1,90 de
    referência, preço regional via loja.
13. **Traduções:** nós geramos os 6 idiomas, cliente revisa. Inclui o texto de
    apresentação (§10.1).
14. **Textos legais:** placeholder no protótipo; textos reais obrigatórios antes
    do lançamento.
15. **Animação final:** frames 1/2/5 a ~8 fps, personagem parado (ver §7.2 —
    os frames 3/4 não servem ao ciclo).
16. **Assets:** layout único (Phone escalado); assets Tablet não usados.
17. **Nome do produto:** "Banana King Counterattacks" (app) vs. "Banana King"
    (personagem) — ver §0.

---

## 14. Pendências abertas

| # | Pendência | Onde |
|---|---|---|
| 1 | ~~Posicionamento dos overlays (pontuação/frase) na animação final~~ — **resolvida em 31/07/2026** (topo y 0–134 · base y 635–854 · personagem y 286–620) | §7.2 |
| 2 | Bônus de fase (+1000) e bônus por vidas restantes — implementar | §6 |
| 3 | Valor exato do bônus por vidas restantes | §6 |
| 4 | Curva de dificuldade por fase (velocidade, degrau, cadência de coco por fase) | §5.1 |
| 5 | Decisão de stack de empacotamento (vanilla+Capacitor / Angular+Capacitor / TWA) | §12 |
| 6 | Áudio procedural vs. arquivos CC0 na versão de produção | §8 |
| 7 | Ajuste fino das escalas de personagens/naves conforme o mock `PROJECT/uploads/Meshy_AI_Gameplay Prototype Banana Barriers.png` | §3 |
| 8 | Textos legais reais (Termos de Uso + Política de Privacidade) | §13.14 |
| 9 | **Valor de X do marco de pontuação** que solta a banana bônus (a cada X pontos, repetindo) — calibrar junto com o teste "7 bananas vs. 20 naves" | §4.4 |
| 10 | Frequência de coco por fase e velocidade/degrau por fase (curva numérica) | §4.3, §5.1 |
| 11 | **Áudio procedural fica mudo no browser mobile** (Android e iOS); funciona no desktop. Investigar com depurador em dispositivo — ver épico 6.0 do backlog | §8 |

O plano de execução dessas pendências e de todo o trabalho até a publicação está
em [BACKLOG.md](BACKLOG.md).

---

## 15. Assets sem uso definido

Presentes em `PROJECT/assets` mas ainda não atribuídos a nenhuma tela. Manter no
repositório como reserva; definir aplicação ou descartar antes do release.

| Asset | Observação |
|---|---|
| `banana-king-no-espaco_branco.png` | Variante branca do herói. Possível uso: frame de dano/flash ou silhueta de vidas no HUD. |
| `king-gorila.svg` | Não referenciado. Candidato a splash ou tela de menu. |
| `gorila-frente-banana-02.svg` | Só a variante `-01` é usada (tela de vitória). |
| `win_Walk-Frame-3/4-Phone.png` | **Corrigido em 31/07/2026:** são estes os descartados, não o 2. Renderizados em 937×1679 com o personagem em outra escala/enquadramento — não intercalam com 1/2/5 (§7.2). ~3 MB. |
| `win_Walk-Frame-1/3/4-Tablet.png` | Layout tablet fora de escopo (§13.16): proporção ~0,75 contra os 0,562 do frame retrato. ~2,8 MB. |
| `poc-do-jogo.png` | Referência visual de design, não asset de runtime. |
| `PROJECT/uploads/Meshy_AI_Gameplay Prototype Banana Barriers.png` | Mock de referência para ajuste de escalas (pendência #7). |

---

*Documento base para o desenvolvimento. Alterações de regra de jogo devem ser
refletidas aqui antes de irem para o código.*
