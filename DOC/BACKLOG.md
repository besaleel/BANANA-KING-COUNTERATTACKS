# Backlog — Banana King Counterattacks

> **Documento de referência:** [ESPECFICATION.md](ESPECFICATION.md)
> **Atualizado:** 31/07/2026
> **Legenda de status:** ⬜ pendente · 🟡 em andamento · ✅ concluído · ⏸️ bloqueado

## Sumário de épicos

| # | Épico | Status | Prioridade |
|---|---|---|---|
| 0 | Documentação e base do projeto | 🟡 | Alta |
| 1 | Protótipo Fase 01 (fatia vertical) | ✅ | — |
| 2 | Decisão de stack e migração do protótipo | ⬜ | **Bloqueante** |
| 3 | Pendências de gameplay da Fase 01 | 🟡 | Alta |
| 4 | Fases 02–10 e curva de dificuldade | 🟡 | Alta |
| 5 | Animação de vitória final | ✅ | — |
| 6 | Áudio e assets de produção | ⬜ | Média (6.0 ⚠️ **áudio mudo no mobile**) |
| 7 | Internacionalização (fechamento) | ⬜ | Média |
| 8 | Monetização — AdMob + Billing | ⬜ | Média |
| 9 | Ranking global (Play Games Services) | ⬜ | Baixa |
| 10 | Textos legais e conformidade | ⬜ | **Bloqueante p/ release** |
| 11 | Empacotamento e release | ⬜ | Alta (11.0 ⚠️ **antes do keystore**) |
| 12 | QA e testes em dispositivo | ⬜ | Alta |

---

## Épico 0 — Documentação e base do projeto

- [x] Consolidar a especificação em [DOC/ESPECFICATION.md](ESPECFICATION.md)
      a partir de `PROJECT/ESPECIFICACAO-POC.md`.
- [x] Registrar a distinção **"Banana King Counterattacks" (app)** vs.
      **"Banana King" (personagem)** vs. **projeto antigo "Banana King"** (§0 da spec).
- [x] Adaptar [DOC/GERAR-AAB.md](GERAR-AAB.md): caminhos, keystore, alias, pacote
      `com.bananaking.counterattacks` e aviso de stack indefinido.
- [x] Reescrever `README.md`: status real, índice da documentação, estrutura,
      como rodar o protótipo e identidade do app.
- [x] Remover do [GERAR-AAB.md](GERAR-AAB.md) as **4 afirmações falsas** de que
      `*.jks`, `keystore.properties`, `local.properties` e `DEPLOY/*.aab` já
      estariam no `.gitignore`; substituídas por avisos que apontam para o §0 do
      próprio documento.
- [x] Criar `servir-prototipo.py` (contorno dos caminhos inconsistentes do
      protótipo — ver épico 2).
- [ ] Atualizar `DOC/GOOGLE-ADMOB.md` com o App ID real quando a conta existir.
- [ ] Decidir se `PROJECT/ESPECIFICACAO-POC.md` vira histórico (marcar como
      superado pela spec de `DOC/`) ou é removido.
- [ ] Criar `CLAUDE.md` na raiz com convenções do projeto (assets, i18n,
      onde ficam as regras de jogo).

---

## Épico 1 — Protótipo Fase 01 (fatia vertical) ✅

Entregue em [PROJECT/Banana King - Fase 01.dc.html](../PROJECT/Banana%20King%20-%20Fase%2001.dc.html).

- [x] Tela inicial: logo, tagline, seletor de 6 idiomas, nome, última pontuação, termos.
- [x] Gameplay Fase 01: arrasto + teclado, tiro automático, 4 fileiras × 5 colunas
      com movimento alternado, Trasho oscilando e lançando cocos, barreira de 7
      bananas, 3 vidas, HUD completo, mute.
- [x] Power-ups: `triple`, `rapid`, `shield`, `life`.
- [x] Telas de vitória de fase e de derrota com "Tentar novamente".
- [x] Banner placeholder + "Remover Anúncio" → modal de compra.
- [x] i18n nos 6 idiomas.
- [x] Áudio procedural (Web Audio) com mute + toggles Música/Efeitos.
- [x] Recorde local (`localStorage`, prefixo `bkc_`).
- [x] Menu de pausa + auto-pausa por perda de foco.
- [x] Painel de calibração (`fireRateMs`, `cocoIntervalS`, `formationSpeed`,
      `powerupDropPct`).

---

## Épico 2 — Decisão de stack e migração do protótipo ⏸️ *bloqueia 4, 11*

A POC roda no framework `DCLogic`/`support.js`, que não é um alvo de produção.

- [x] **Decidir o stack** — **vanilla JS/canvas + Capacitor** (decidido em
      31/07/2026). *(Pendência #5 da spec)*
      **Razão:** a POC já é canvas 2D puro; o porte é quase direto, o bundle fica
      mínimo e o FPS em Android de entrada é melhor sem overhead de framework.
      O Capacitor cobre AdMob, Billing, lock de orientação e offline real.
      Angular/Ionic foi descartado por adicionar peso a um jogo que renderiza
      tudo em `<canvas>`; TWA foi descartado por exigir hospedagem online e
      limitar AdMob/Billing nativos, conflitando com o offline-first (§8).
- [ ] Avaliar tamanho de bundle, performance em mobile de entrada e esforço de
      port do código da POC.
- [ ] Montar o projeto em `APK/` com o stack escolhido.
- [ ] Portar a lógica de jogo da POC (`update`/`draw`/`loop`) preservando os
      valores de *baseline v1* (§12.1 da spec).
- [ ] **Padronizar os caminhos de assets.** Hoje o protótipo é incoerente:
      `support.js` é relativo ao HTML (`./support.js`) e os assets são relativos à
      raiz (`PROJECT/assets/...`) — nenhuma raiz de servidor satisfaz os dois, e
      abrir o arquivo direto do disco não funciona. Contornado por
      `servir-prototipo.py`, que deve ser **descartado** após a padronização.
- [ ] Extrair a **config de fases para JSON** separado da lógica (§12 da spec).
- [ ] Implementar **pooling** de tiros, cocos, partículas e textos flutuantes.
- [ ] Travar orientação retrato no wrapper nativo.

---

## Épico 3 — Pendências de gameplay da Fase 01

### 3.1 Regras novas — barreira como linha de defesa (decidido em 29/07/2026)

Mecânica definida na revisão da spec e **ainda não implementada**. Resolve o
problema crítico de a formação parar sobre o herói e drenar as 3 vidas em ~4 s.

- [x] **Nave que atinge a barreira de bananas é destruída** (§4.4 da spec).
      *(31/07/2026)*
- [x] **A banana atingida é destruída junto** — troca mútua, independente de ter
      1 ou 2 de vida. *(31/07/2026 — `bn.hp = 0` direto, não decrementa)*
- [x] Nave destruída na barreira **não dá pontos** e **não incrementa o combo**
      (impede farmar pontos deixando a formação descer). *(31/07/2026)*
- [x] Formação inteira consumida na barreira → **fase vencida normalmente**.
      *(31/07/2026 — condição continua sendo "formação vazia")*
- [x] **Ao perder uma vida (com vidas restantes): reiniciar a fase completa** —
      formação restaurada no topo, herói ao centro, projéteis/cocos/power-ups
      limpos, **mantendo pontuação e vidas**, combo zerado. *(30/07/2026, épico 2)*
- [x] **Barreira persistente:** ao reiniciar a fase, as bananas ficam **exatamente
      como estavam** no momento da morte (não regeneram). Idem ao trocar de fase.
      A barreira é a "reserva de vidas extras" do jogador. *(30/07/2026, épico 2)*
- [x] Remover o clamp `r.y = hero.y − 20` ou reavaliá-lo: com as naves morrendo na
      barreira, ele passa a ser um caso de borda raro
      ([html:414](../PROJECT/Banana%20King%20-%20Fase%2001.dc.html#L414)).
      *(31/07/2026 — **avaliado e MANTIDO** como rede de segurança: a barreira é
      finita, então após bananas destruídas abre-se um corredor por onde a
      formação passa sem ser consumida. Sem o clamp ela afundaria indefinidamente
      fora da tela, e como não há game over por alcance (§4.5) o jogo travaria
      sem condição de término. Com o clamp, a nave para sobre o herói e tira 1
      vida pela regra normal.)*

### 3.2 Banana bônus — recuperação da barreira (decidido em 29/07/2026)

Única forma de recuperar a barreira. Ver §4.4 da spec.

- [x] Implementar o power-up **`banana`**: ao coletar, **restaura a barreira
      completa** (7 bananas × 2 de vida), independente do estado anterior.
      *(31/07/2026)*
- [x] **Origem 1 — marco de pontuação:** a cada **X pontos acumulados** cai uma
      banana bônus, repetindo a cada novo múltiplo de X. Vale em **qualquer fase**.
      *(31/07/2026)*
- [ ] **Definir o valor de X** em playtest. *(Pendência #9)*
      ⚠️ **Provisório em uso: `bananaBonusScoreMilestone = 20000`** em
      `APK/src/config/fases.json`. Escolhido por simulação da economia (fase
      limpa vale ~7,8k na fase 01 e ~25,8k na fase 10; campanha ~166k), dando
      ~1 reposição a cada 1,4 fases para o jogador habilidoso e ~1 a cada 2,5
      para o fraco. **Falta validar com humano jogando.**
- [x] **Origem 2 — Fase 5:** banana bônus **garantida**, independente da
      pontuação. Convive com os marcos de pontuação. *(31/07/2026 — campo
      `bananaBonusGuaranteed` em `fases.json`)*
- [x] Banana não coletada é **perdida** ao atingir a base — sem reoferta.
      *(31/07/2026)*
- [x] **Arte distinta:** a banana bônus deve ser visualmente diferente dos
      power-ups de combate (que hoje são quadrados com letra), para o jogador
      reconhecer o que está caindo. *(31/07/2026 — banana desenhada no canvas
      com halo pulsante e rotação, reusando as cores da barreira)*

- [ ] **Playtest de economia da barreira:** 7 bananas contra 20 naves por fase,
      sem regeneração entre fases. Verificar se o marco de pontuação repõe em
      ritmo suficiente ou se o jogador fica sem defesa alguma no meio da campanha.
      ⚠️ **Playtest humano — não substituível por simulação.** A simulação de
      economia só mediu a *frequência* de reposição, não a sensação de jogo nem
      o ritmo real de desgaste da barreira.

### 3.3 Pontuação

- [x] **Bônus de fase: +1000** ao concluir sem perder vida. *(Pendência #2)*
      *(31/07/2026 — `phaseClearBonus` no config; flag por fase, derrubado ao
      perder vida)*
- [x] **Bônus por vidas restantes** ao vencer o jogo — definir o valor e
      implementar. *(Pendências #2 e #3)* *(31/07/2026 — implementado; concedido
      só após a fase 10)*
- [ ] **Confirmar o valor do bônus por vidas restantes.** *(Pendência #3)*
      ⚠️ **Provisório em uso: `lifeBonusPerLife = 5000`** (3 vidas = 15000,
      ~8 % de uma campanha completa ≈ o valor de uma fase média). Alto o
      bastante para pesar no ranking, baixo o bastante para não deixar o jogo
      cauteloso vencer o jogo habilidoso. **Falta validar em playtest.**

### 3.4 Ajustes e correções

- [x] Corrigir a divergência de default do drop de power-up: a spec fixa **4 %**,
      mas o fallback no código é `12` em
      [Banana King - Fase 01.dc.html:361](../PROJECT/Banana%20King%20-%20Fase%2001.dc.html#L361).
      Alinhar em 4 %. *(30/07/2026, épico 2 — `powerupDropPct: 4` no config;
      taxa medida em 3,80 % sobre 4000 naves destruídas)*
- [ ] **Ajustar escalas** de personagens/naves conforme o mock
      `PROJECT/uploads/Meshy_AI_Gameplay Prototype Banana Barriers.png`.
      *(Pendência #7)*
- [ ] Validar em playtest a duração de 8 s dos power-ups e o drop de 4 %.
- [ ] Adicionar splash/logo antes da tela inicial (previsto no fluxo §7, ausente
      na POC).
- [ ] Confirmar que a exclusividade `triple` × `rapid` está clara na UI — hoje o
      indicador mostra só `x3` ou `>>`, sem sinalizar que um cancelou o outro.

---

## Épico 4 — Fases 02–10 e curva de dificuldade

- [x] Implementar a **progressão de fases** (avanço automático após vitória,
      persistência da fase atual na pausa). *(31/07/2026 — `Game.nextPhase()`;
      a tela de vitória agora oferece **CONTINUAR** para a fase N+1 em vez de
      recomeçar da 01. A pausa passou a **realmente** gravar `bkc_phase`,
      `bkc_progScore` e `bkc_progLives` — antes o texto "Fase atual salva" era
      falso, nada era persistido.)*
- [x] Implementar as composições de fileiras das fases 02–10 (§5.1 da spec).
      *(31/07/2026 — já estavam corretas desde o épico 2; **verificadas 1:1**
      contra a tabela da §5.1, incluindo níveis, sprites válidos por nível e
      vínculo do background. Zero divergências.)*
- [x] Definir e calibrar **por fase**: velocidade da formação, degrau de descida
      e intervalo de coco. *(Pendência #4)* *(31/07/2026 — curva **provisória**
      em `fases.json`, ver nota abaixo)*
- [x] Vincular `background-fase02..10.png` às respectivas fases.
      *(31/07/2026 — vínculo conferido para as 10 fases + **pré-carga** do fundo
      da fase seguinte na tela de vitória, para não piscar na transição)*
- [x] **Persistir o estado das 7 bananas ao trocar de fase** (a barreira nunca
      regenera — ver épico 3.1). *(31/07/2026 — testado da fase 1→2 e 2→4)*
- [x] Ativar a **banana bônus garantida da Fase 5** (mecânica implementada no
      épico 3.2; aqui é só o gatilho da fase). *(31/07/2026 — testado tanto
      entrando direto na fase 5 quanto **chegando nela por progressão**)*
- [ ] Playtest de dificuldade fase a fase; ajustar a curva.
      ⚠️ **Playtest humano — não substituível por simulação.** A curva atual foi
      dimensionada por simulação de pressão (tempo de limpeza × tempo de descida
      × consumo da barreira), mas o *feeling* de cada fase precisa de jogador
      real, como foi feito na Fase 01.

> **Curva de dificuldade (provisória, 31/07/2026) — pendências #4 e #10.**
> Valores em `APK/src/config/fases.json`, ajustáveis sem tocar em código.
> A **Fase 01 não mudou** (26 px/s · degrau 5 · coco 4,5 s — aprovada em playtest).
>
> | Fase | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 | 10 |
> |---|---|---|---|---|---|---|---|---|---|---|
> | `formationSpeed` | 26 | 27 | 28 | 30 | 31 | 32 | 34 | 35 | 36 | 38 |
> | `stepDown` | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 | 5 |
> | `cocoIntervalS` | 4,5 | 4,3 | 4,1 | 3,9 | 3,7 | 3,4 | 3,2 | 3,0 | 2,8 | 2,6 |
>
> **Por que a curva é suave:** a simulação mostrou que a **composição sozinha já
> é a curva** — o HP da formação triplica (30 na Fase 01 → 90 na Fase 10)
> enquanto o tempo de descida é constante, então a partir da Fase 05 a formação
> **já alcança a barreira sem nenhum ajuste**. Subir a velocidade agressivamente
> em cima disso esgotaria a barreira, que **não regenera entre fases** (§4.4).
> Por isso:
> - `formationSpeed` sobe pouco (26→38, dentro da faixa 10–90);
> - `stepDown` fica **fixo em 5** — a §4.2 avisa que o degrau é aplicado por
>   **cada** fileira que toca a borda (efeito real ~4×), e aumentá-lo tratando
>   como "descida única" deixaria o jogo rápido demais;
> - o grosso da ameaça vai para `cocoIntervalS` (4,5 s → 2,6 s), que pressiona
>   **sem consumir a barreira**: os cocos por fase sobem de ~2 para ~11.

---

## Épico 5 — Animação de vitória final

- [x] Implementar o walk-cycle a ~8 fps, personagem parado.
      *(31/07/2026 — `APK/src/game/winanim.js`, 125 ms por frame)*
      ⚠️ **Divergência do plano original:** o backlog pedia os frames **1/3/5**,
      mas os assets **não sustentam essa combinação** — ver a nota abaixo.
      Implementado com **1 → 2 → 5 → 2**.
- [x] **Definir a posição dos overlays** (pontuação final + frase de vitória)
      para não cobrir o personagem. *(Pendência #1)* *(31/07/2026 — resolvido e
      **medido**, ver a nota de geometria abaixo)*
- [x] Botão de ação (menu / recomeçar) na base. *(31/07/2026 — `JOGAR DE NOVO`
      + `Menu` no bloco inferior)*
- [x] Frase de vitória localizada nos 6 idiomas. *(31/07/2026 — chaves
      `winPhrase`, `winFinalScore`, `winBest`, `winNewBest`)*
- [x] Confirmar que os assets Tablet permanecem fora de escopo.
      *(31/07/2026 — **mantidos fora**. Os 3 arquivos `*-Tablet.png` estão em
      896×1200 e 1081×1455, proporções ~0,75 contra os 0,562 do frame retrato
      480×854: não são uma versão "maior" da mesma cena, e sim outro
      enquadramento. Como a §7 fixa retrato em todos os aparelhos, não há tela
      que os use.)*

> **Nota (31/07/2026) — por que 1-2-5 e não 1-3-5.**
> Os cinco `win_Walk-Frame-*-Phone.png` **não são sprites recortados**: cada um
> é uma cena completa (céu, sol, floresta, chão) com o gorila embutido.
> - Os frames **1, 2 e 5** são 768×1376 e compartilham o mesmo cenário. A
>   diferença medida pixel a pixel entre eles é de **~1 % da imagem**, restrita
>   à faixa **y 467–1001** — que é exatamente o personagem. São um walk-cycle
>   legítimo.
> - Os frames **3 e 4** foram renderizados em **937×1679 / 936×1681**, com o
>   personagem em **outra escala e enquadramento**. Alterná-los com 1 e 5
>   produziria um *salto de zoom* a cada 125 ms, não um passo.
>
> Por isso o ciclo usa `1 → 2 → 5 → 2` (`WIN_FRAMES` em `APK/src/game/assets.js`),
> que alterna as pernas sem mexer no cenário. Os frames 3 e 4 seguem nos assets,
> sem uso — candidatos ao inventário de descarte da §15 da spec.

> **Nota (31/07/2026) — geometria dos overlays (pendência #1).**
> A arte é 768×1376 (0,558) e o frame é 480×854 (0,562): com `object-fit: cover`
> a escala é 0,625 e o corte é de **6 px no topo**, sem perder conteúdo. Nessa
> projeção o personagem ocupa **y 286–620** dos 854 px de altura.
> Medido no browser, no **pior caso** (alemão, rótulos mais longos, duas linhas
> de bônus):
>
> | Bloco | Ocupa | Folga até o personagem |
> |---|---|---|
> | Overlay superior (título + frase) | y 0–134 | **152 px** |
> | Overlay inferior (placar + botões) | y 635–854 | **15 px** |
>
> Nenhum elemento estoura a largura de 480 px. A faixa central fica livre.

---

## Épico 6 — Áudio e assets de produção

### 6.0 ⚠️ Áudio mudo no browser mobile — verificar (aberto em 31/07/2026)

**Sintoma reproduzido:** o áudio procedural toca normalmente no **browser do
desktop**, mas fica **mudo no Chrome do Android e no Safari do iPhone**. Não é
regressão — no mobile nunca chegou a tocar.

- [ ] **Investigar em dispositivo, com depurador conectado** (Safari Web
      Inspector via cabo para o iPhone; `chrome://inspect` para o Android).
      Sem ler o estado real do `AudioContext` no aparelho, qualquer correção é
      chute — foi o erro cometido na primeira tentativa.
- [ ] Confirmar o `AudioContext.state` **depois** do primeiro gesto: se ficar
      em `suspended`, o problema é o gate de gesto do Web Audio; se for
      `running` e ainda assim não houver som, a causa é outra (roteamento de
      saída, switch de silencioso do iOS, volume de mídia).
- [ ] **iOS:** o interruptor lateral de silencioso corta Web Audio (tratada como
      som "ambiente"), enquanto `<audio>`/`<video>` continuam tocando. Confirmar
      se é isso antes de mexer em código — pode não ser bug do jogo.
- [ ] Testar a hipótese do gesto: `resume()` é assíncrono e o desbloqueio no iOS
      só vale se algo for tocado **sincronamente dentro do handler**. Validar em
      aparelho antes de adotar.
- [ ] Reavaliar depois de decidir procedural × CC0 (item abaixo): elementos
      `<audio>` com arquivos têm regras de autoplay diferentes da Web Audio e
      **podem tornar o problema irrelevante**.
- [ ] Cobrir também o retorno de background (o iOS suspende o contexto e não o
      retoma sozinho) e validar dentro do **WebView do Capacitor**, que é o alvo
      real de produção — o comportamento pode diferir do browser.

> **Tentativa revertida (31/07/2026):** uma primeira correção (gate `_ready`,
> reenfileiramento de sons em Promise, buffer silencioso para iOS, listeners de
> gesto) foi escrita e **revertida sem commit** por não resolver em nenhum dos
> dois aparelhos. Passou em teste sintético no Node, o que só provou que o teste
> não reproduzia a causa real. **Lição:** este bug precisa de depurador em
> dispositivo, não de teste simulado.

### 6.1 Produção de áudio

- [ ] **Decidir:** manter o áudio procedural (Web Audio) ou migrar para arquivos
      CC0. *(Pendência #6)* — decidir **junto** com o 6.0: se a migração para
      `<audio>` resolver o mudo no mobile, ela deixa de ser só preferência.
- [ ] Se migrar: selecionar e licenciar SFX + música (CC0 / uso comercial) e
      **arquivar os comprovantes de licença**.
- [ ] Cobrir todos os eventos: laser, tick de acerto, explosão de nave, explosão
      de banana, impacto no herói, power-up, vitória, derrota, clique de UI.
- [ ] Otimizar/comprimir áudios e **embutir offline** no pacote.
- [x] **Embutir as fontes** `Press Start 2P` e `VT323` no pacote — a POC as
      carrega do Google Fonts, o que viola o requisito offline-first (§8 da spec).
      *(31/07/2026 — WOFF2, subsets `latin` + `latin-ext`, 57 KB no total, em
      `APK/public/fonts/`. **Descoberta:** o port para `APK/` nunca chegou a
      carregar as fontes — não havia `<link>` nem `@font-face`, então o app
      rodava inteiro no fallback `monospace`. Agora usa a pixel art de
      verdade. Licença SIL OFL arquivada em `public/fonts/LICENSE.txt`.)*
- [x] Converter `background-fase01..10.png` (~1 MB cada) para **WebP**.
      *(31/07/2026 — junto com todos os demais sprites; ver a nota abaixo)*
- [ ] Gerar sprite atlas das naves e do herói.
      *(prioridade caiu: os sprites somam 40 KB depois da otimização — o ganho
      agora seria de draw calls, não de tamanho)*

> **✅ Concluído em 31/07/2026 — assets otimizados.** Processo documentado em
> [GERAR-ASSETS.md](GERAR-ASSETS.md), reproduzível por
> `python APK/tools/gerar-assets.py`.
>
> | | Antes | Depois |
> |---|---|---|
> | `APK/public/assets/` | 26 MB | **1,0 MB** |
> | `APK/dist/` | 26 MB | **1,2 MB** |
> | APK de debug | — | **~5,4 MB** |
>
> Duas economias somadas: **resolução** (os sprites vinham em 1024×1024 mas são
> desenhados em ~60 px) e **formato** (WebP no lugar de PNG).
>
> **Achado que vale registrar:** reduzir 1024→200 e *depois* comprimir com lossy
> degrada muito mais que cada operação isolada — o herói caía para 32,2 dB de
> PSNR, contra 48 dB de cada etapa sozinha. Reduzir demais concentra o detalhe
> em poucos pixels, que é onde o compressor erra. Os alvos ficaram em ~4× o
> tamanho de exibição, não 2×, ao custo de poucos KB. **Qualidade final: 36,6 a
> 44,7 dB em todos os sprites.**
>
> O favicon caiu de 851 KB para 55 KB (1024→192 px): ele não é a fonte do ícone
> do launcher Android, que vem dos mipmaps em `android/app/src/main/res/`.
>
> **O que domina o APK agora não são os assets** (1 MB), e sim o `classes.dex`
> do runtime do Capacitor (7,2 MB sem otimização em debug). O R8/ProGuard do
> build de release deve reduzir isso — a medir no épico 11.

> **⚠️ Elevado a requisito de release (31/07/2026):** os assets somam **26 MB de
> PNG cru** (só os 10 backgrounds são ~10 MB), contra o teto de **50 MB** do AAB.
> A conversão para WebP deixou de ser otimização cosmética e virou **requisito de
> publicação**.
>
> **Decisão de versionamento:** `APK/public/assets/` está no `.gitignore` e **não
> é versionado** — hoje é cópia byte a byte de `PROJECT/assets/`, e commitar as
> duas gravaria ~56 MB permanentes no histórico. A fonte segue sendo
> `PROJECT/assets/`; para rodar em dev, copie para `APK/public/assets/`. Quando
> este épico gerar os **WebP**, só a versão otimizada é commitada em `APK/`.

- [x] Ao gerar os WebP, remover `public/assets/` do `APK/.gitignore` e versionar
      apenas os assets otimizados. *(31/07/2026 — o ignore agora bloqueia só
      `public/assets/*.png`, com exceção do `icon.png`)*
- [ ] **Reaplicar `android:screenOrientation="portrait"` se a pasta `android/`
      for regerada.** Ela está no `.gitignore` (é saída do `cap add`), então a
      edição manual do `AndroidManifest.xml` se perde. Detalhes em
      [GERAR-ASSETS.md](GERAR-ASSETS.md). Automatizar no épico 11.

---

## Épico 7 — Internacionalização (fechamento)

- [ ] Extrair as strings do código para arquivos de dicionário por idioma.
- [ ] Revisão das traduções dos 6 idiomas **pelo cliente**.
- [ ] Traduzir a frase de vitória final e os textos legais.
- [ ] Traduzir a ficha da loja (6 idiomas).
- [ ] Testar layout de UI com strings longas (**DE** e **FR** estouram com mais
      frequência).

---

## Épico 8 — Monetização: AdMob + Billing

### 8.1 AdMob (anúncios)
- [ ] Criar conta/app no **Google AdMob** e vincular à conta de pagamentos.
- [ ] Cadastrar o **banner** e gerar a **Ad Unit ID** de produção.
- [ ] Criar unidade de teste (test ad unit) para desenvolvimento.
- [ ] Registrar o **App ID real** em [GOOGLE-ADMOB.md](GOOGLE-ADMOB.md)
      (hoje `ca-app-pub-XXX`).
- [ ] Integrar o SDK e exibir o banner real na base (substituir o placeholder
      320×50).
- [ ] Implementar a lógica de **ocultar o banner** quando `remove_ads` estiver ativo.
- [ ] Configurar consentimento (**UMP / GDPR / ATT** no iOS).

### 8.2 Billing — compra única `remove_ads`
- [ ] Criar o **produto gerenciado** `remove_ads` no Play Console, preço base
      **USD 1,90** (a loja aplica preço regional).
- [ ] (iOS, se houver) criar o produto equivalente no App Store Connect.
- [ ] Integrar **Google Play Billing**: compra, verificação e **restauração**.
- [ ] Buscar o **preço localizado** via API da loja e exibir no modal
      (substituir o placeholder fixo "USD 1,90").
- [ ] Persistir "ads removidos" e **restaurar em reinstalação/novo dispositivo**
      (hoje só `localStorage`, que se perde na reinstalação).

---

## Épico 9 — Ranking global (Play Games Services)

- [ ] Habilitar **Play Games Services** no projeto.
- [ ] Criar o **Leaderboard** de pontuação global e obter os IDs.
- [ ] Integrar login PGS (opcional / anônimo) e envio de score.
- [ ] Definir a política de sincronização recorde local → global.
- [ ] Manter a camada de score desacoplada (§6 da spec).

---

## Épico 10 — Textos legais e conformidade ⏸️ *bloqueia o release*

- [ ] Redigir os **Termos de Uso** reais, localizados nos 6 idiomas.
      *(Pendência #8)*
- [ ] Redigir a **Política de Privacidade** real e **hospedar em URL pública**
      (exigida pelas lojas e pelo AdMob).

> **Nota (31/07/2026) — hospedagem dos textos legais:** os **Termos de Uso** e a
> **Política de Privacidade** serão publicados no **GitHub Pages** deste
> repositório. URL prevista:
> `https://besaleel.github.io/BANANA-KING-COUNTERATTACKS/privacy` (e `/terms`).
> É essa URL pública que será informada no Play Console e no AdMob, e para onde
> apontam os links da tela inicial (§7.1 da spec).

- [ ] Habilitar **GitHub Pages** no repositório e criar as páginas `terms` e
      `privacy` (6 idiomas).
- [ ] Substituir os placeholders da tela inicial pelos textos/links reais.
- [ ] Revisar conformidade **COPPA / público infantil** — afeta anúncios e coleta
      de dados, e o jogo tem apelo infantil.
- [ ] Preencher **Data safety / Segurança de dados** no Play Console.

---

## Épico 11 — Empacotamento e release

### 11.0 ⚠️ Proteger segredos no `.gitignore` — **antes de gerar o keystore**

Bloqueia a geração do keystore (11.1). O `.gitignore` atual cobre apenas
`APK/*.apk` e `APK/*.aab`; os arquivos sensíveis do release estão descobertos.
Detalhes e o bloco pronto para colar estão no §0 do
[GERAR-AAB.md](GERAR-AAB.md).

- [x] Adicionar ao `.gitignore` da raiz: `*.jks`, `*.keystore`,
      `keystore.properties`, `local.properties`, `DEPLOY/*.aab`. *(31/07/2026)*
- [x] Confirmar com `git check-ignore -v` que cada padrão está ativo **antes** de
      criar o keystore. *(31/07/2026 — os 5 padrões verificados e ativos)*

> **Por que é crítico:** chave de assinatura commitada é **irreversível** — não há
> como revogar, e quem a tiver pode publicar updates falsos do app. Remover em um
> commit posterior não resolve: o arquivo continua no histórico. Depois da
> primeira publicação na Play Store a chave **não pode mais ser trocada**.

### 11.1 Build e publicação

- [ ] Criar conta de **desenvolvedor** no Google Play Console (se não existir).
- [ ] Configurar **ícone, splash e nome** por plataforma
      (`com.bananaking.counterattacks`).
- [ ] Gerar o **keystore** exclusivo deste app
      (`banana-king-counterattacks-release.jks`) e fazer backup em 2 locais
      seguros — ver [GERAR-AAB.md](GERAR-AAB.md) §2.
- [ ] Configurar **Play App Signing**.
- [ ] **Cadastrar o game** na loja: título, descrições localizadas (6 idiomas),
      ícone 512×512, screenshots retrato, feature graphic 1024×500, categoria,
      classificação etária (content rating).
- [ ] Definir países/regiões de distribuição (app gratuito + IAP).
- [ ] Gerar `DEPLOY/store-assets/icon-512.png` a partir de
      `PROJECT/assets/logo.png` ou `icon.png`.
- [ ] Gerar o **AAB assinado** e enviar às faixas de teste
      (internal → closed → open).
- [ ] Validar o processo de [GERAR-AAB.md](GERAR-AAB.md) de ponta a ponta com o
      stack definitivo e corrigir o documento se divergir.

---

## Épico 12 — QA e testes em dispositivo

- [ ] Testes em dispositivos reais: vários tamanhos de tela, sempre retrato.
- [ ] Validar o escalonamento do canvas 480×854 em telas muito estreitas e muito
      largas.
- [ ] QA de **offline** total (sem rede: fontes, áudio, assets).
- [ ] QA de **compra** `remove_ads` (compra, cancelamento, restauração).
- [ ] QA de **anúncios** (banner aparece/oculta corretamente).
- [ ] QA de **mute** e dos toggles Música/Efeitos, incluindo persistência.
- [ ] QA de **persistência de progresso** (fase salva na pausa, recorde, nome,
      idioma).
- [ ] Verificar a pausa automática por perda de foco em app nativo (background /
      chamada telefônica).
- [ ] Medir FPS em dispositivo de entrada e validar a ausência de GC visível
      (pooling do épico 2).

---

## Itens em observação (sem tarefa definida ainda)

- Comportamento em telas com notch / safe area no topo (HUD de 52 px).
- **Assets sem uso definido** — inventário completo em §15 da
  [ESPECFICATION.md](ESPECFICATION.md). Decidir aplicação ou descarte antes do
  release. Confirmados sem uso em 31/07/2026 (épico 5): `win_Walk-Frame-3` e
  `win_Walk-Frame-4-Phone.png` (escala incompatível com o ciclo) e os três
  `win_Walk-Frame-*-Tablet.png` (proporção de paisagem, e o jogo é só retrato).
  São ~5,8 MB de PNG que podem sair do pacote — relevante para o teto de 50 MB
  do AAB (épico 6).
- Naves de mesmo nível (`nave-03`/`nave-04`) são **só variedade visual** — decidido
  em 29/07/2026, não implementar diferenças de atributo entre elas.

---

> Este backlog é vivo: novos itens devem ser adicionados ao épico correspondente
> à medida que surgirem, e as pendências numeradas devem espelhar §14 da
> [ESPECFICATION.md](ESPECFICATION.md).
