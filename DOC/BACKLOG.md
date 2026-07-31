# Backlog — Banana King Counterattacks

> **Documento de referência:** [ESPECFICATION.md](ESPECFICATION.md)
> **Atualizado:** 29/07/2026
> **Legenda de status:** ⬜ pendente · 🟡 em andamento · ✅ concluído · ⏸️ bloqueado

## Sumário de épicos

| # | Épico | Status | Prioridade |
|---|---|---|---|
| 0 | Documentação e base do projeto | 🟡 | Alta |
| 1 | Protótipo Fase 01 (fatia vertical) | ✅ | — |
| 2 | Decisão de stack e migração do protótipo | ⬜ | **Bloqueante** |
| 3 | Pendências de gameplay da Fase 01 | 🟡 | Alta |
| 4 | Fases 02–10 e curva de dificuldade | ⬜ | Alta |
| 5 | Animação de vitória final | ⬜ | Média |
| 6 | Áudio e assets de produção | ⬜ | Média |
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

- [ ] Implementar a **progressão de fases** (avanço automático após vitória,
      persistência da fase atual na pausa).
- [ ] Implementar as composições de fileiras das fases 02–10 (§5.1 da spec).
- [ ] Definir e calibrar **por fase**: velocidade da formação, degrau de descida
      e intervalo de coco. *(Pendência #4)*
- [ ] Vincular `background-fase02..10.png` às respectivas fases.
- [ ] **Persistir o estado das 7 bananas ao trocar de fase** (a barreira nunca
      regenera — ver épico 3.1).
- [ ] Ativar a **banana bônus garantida da Fase 5** (mecânica implementada no
      épico 3.2; aqui é só o gatilho da fase).
- [ ] Playtest de dificuldade fase a fase; ajustar a curva.

---

## Épico 5 — Animação de vitória final

- [ ] Implementar o walk-cycle com `win_Walk-Frame-1/3/5-Phone.png` a ~8 fps,
      personagem parado.
- [ ] **Definir a posição dos overlays** (pontuação final + frase de vitória)
      para não cobrir o personagem. *(Pendência #1)*
- [ ] Botão de ação (menu / recomeçar) na base.
- [ ] Frase de vitória localizada nos 6 idiomas.
- [ ] Confirmar que os assets Tablet permanecem fora de escopo.

---

## Épico 6 — Áudio e assets de produção

- [ ] **Decidir:** manter o áudio procedural (Web Audio) ou migrar para arquivos
      CC0. *(Pendência #6)*
- [ ] Se migrar: selecionar e licenciar SFX + música (CC0 / uso comercial) e
      **arquivar os comprovantes de licença**.
- [ ] Cobrir todos os eventos: laser, tick de acerto, explosão de nave, explosão
      de banana, impacto no herói, power-up, vitória, derrota, clique de UI.
- [ ] Otimizar/comprimir áudios e **embutir offline** no pacote.
- [ ] **Embutir as fontes** `Press Start 2P` e `VT323` no pacote — a POC as
      carrega do Google Fonts, o que viola o requisito offline-first (§8 da spec).
- [ ] Converter `background-fase01..10.png` (~1 MB cada) para **WebP**.
- [ ] Gerar sprite atlas das naves e do herói.

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

- [ ] Ao gerar os WebP, remover `public/assets/` do `APK/.gitignore` e versionar
      apenas os assets otimizados.

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
  release.
- Naves de mesmo nível (`nave-03`/`nave-04`) são **só variedade visual** — decidido
  em 29/07/2026, não implementar diferenças de atributo entre elas.

---

> Este backlog é vivo: novos itens devem ser adicionados ao épico correspondente
> à medida que surgirem, e as pendências numeradas devem espelhar §14 da
> [ESPECFICATION.md](ESPECFICATION.md).
