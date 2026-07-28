# Banana King Counterattacks — Especificação Técnica e de Design

> **Versão:** 1.0 (fase de planejamento)
> **Data:** 28/07/2026
> **Plataforma:** Web / mobile, **exclusivamente retrato (portrait)**
> **Gênero:** Arcade fixed-shooter (estilo *Space Invaders*)
> **Repositório de assets:** `github.com/besaleel/BANANA-KING-COUNTERATTACKS/PROJECT/assets`

---

## 1. Visão geral

O herói **Banana King** pilota uma nave espacial na base da tela e enfrenta o vilão **Trasho** (um chimpanzé) e sua tropa estelar, no topo. O objetivo de cada fase é **destruir toda a formação inimiga** antes de perder as 3 vidas. São **10 fases**, cada uma com um cenário próprio e uma montagem de naves distinta.

Referência visual confirmada: `assets/poc-do-jogo.png` — vilão em disco voador no topo, 4 fileiras de naves, cocos caindo, Banana King em disco na base, fileira de bananas (barreira) e horizonte de silhueta ao fundo.

---

## 2. Personagens e entidades

| Entidade | Asset | Papel |
|---|---|---|
| **Banana King** (herói) | `banana-king-no-espaco.png` (+ `_branco`, `espelhado`) | Nave do jogador, na base |
| **Trasho** (vilão/chefe) | `vilao-Trasho.png`, `vilao-Trasho-espelhado.png` | Topo fixo, lança cocos o tempo todo |
| **Gorila (variações)** | `king-gorila.svg`, `gorila-frente-banana-01/02.svg` | Usar em telas (vitória/derrota/menu) |
| **Animação de vitória final** | `win_Walk-Frame-*-Phone.png` (3 frames usados) | Sequência de frames da caminhada final, parada (ver §7.2) |
| **Naves inimigas** | `nave-inimiga-00…05.png` | Formação (ver tabela abaixo) |
| **Logo** | `logo.png`, `logo-transparente.png` | Menu / splash |
| **Ícone** | `icon.png` | App icon / favicon |
| **Fundos** | `background-fase01…10.png` | Um por fase |

### 2.1 Naves inimigas — poder e resistência

São **6 tipos**. "Poder" = **número de tiros do herói necessários para destruir** (resistência) e também define pontuação e frequência de disparo.

| Nave | Poder / Resistência (tiros p/ destruir) | Categoria |
|---|---|---|
| `nave-inimiga-00.png` | **5** | Mais forte |
| `nave-inimiga-01.png` | **4** | Forte |
| `nave-inimiga-02.png` | **3** | Forte |
| `nave-inimiga-03.png` | **2** | Fraca |
| `nave-inimiga-04.png` | **2** | Fraca |
| `nave-inimiga-05.png` | **1** | Mais fraca |

> **A confirmar:** feedback visual de dano — **confirmado:** a nave dá **flash branco** + **escurecimento proporcional à vida restante** a cada acerto.

---

## 3. Layout de tela (retrato)

De cima para baixo:

1. **HUD superior (barra fixa):**
   - Esquerda: **nome do usuário**.
   - Direita (agrupado): **fase atual** · **pontuação** · **vidas** (ícones) · **botão mute/som**.
2. **Área de jogo (playfield):**
   - Topo: **Trasho** (vilão) fixo, oscilando levemente.
   - Abaixo: **4 fileiras** de naves inimigas.
   - Meio-baixo: **barreira de bananas** (fileira horizontal).
   - Base: **Banana King** (jogador).
3. **Rodapé:**
   - Texto **"Remover Anúncio"** (link/botão) logo acima do **banner de anúncio** (AdMob — placeholder funcional).

> **A confirmar:** a barreira de bananas fica a que altura? Sugestão: **um pouco acima do Banana King**, conforme o mock de referência, deixando corredor de esquiva entre a barreira e o herói.

---

## 4. Mecânica de jogo

### 4.1 Controle do herói
- **Arrastar o dedo** move a nave na **horizontal** (segue o toque).
- **Tiro automático contínuo** — disparo contínuo do herói (cadência fixa; sugestão ~350 ms/tiro, a calibrar no protótipo).
- Movimento limitado às bordas laterais do playfield.

### 4.2 Formação inimiga
- **4 fileiras** por fase; cada fase tem **montagem distinta** de tipos de nave conforme o poder (fases mais avançadas → naves mais fortes / mais densas).
- **Movimento clássico Space Invaders:** o bloco anda de lado e **desce um degrau** ao tocar a borda.
- **Efeito de fileiras alternadas:** fileiras adjacentes se movem em **sentidos opostos** (fileira A → direita enquanto fileira B, logo abaixo, → esquerda). Ao bater na borda, cada fileira inverte e o conjunto desce.
- **Disparo inimigo:** **apenas o Vilão (Trasho)** lança **cocos**. Ele fica no **topo**, andando de um lado para o outro, e dispara **cocos redondos** de forma **aleatória**, **esporádica e de baixa constância**, aumentando **gradualmente fase a fase**. As naves da formação **não atiram**.

> **A confirmar:**
> - ~~Quando a formação alcança a linha do herói~~ — **resolvido (revisado): NÃO há game over por alcance.** A formação desce até o nível do herói e para ali; **nave que encosta no herói tira 1 vida** (com invulnerabilidade breve). Ultrapassar a barreira de bananas **não** tira vida.

### 4.3 Barreira de bananas
- Uma **fileira horizontal** de bananas deitadas (`- - - - -`, **não** vertical `| | |`).
- **7 bananas** em **1 única fileira** (confirmado).
- Cada banana absorve **2 tiros de coco** e então é **destruída** (com explosão/som). O coco é **bloqueado** pela banana (ambos somem no impacto).
- **Não regenera** ao trocar de fase.
- **Fase 5:** o jogo solta **uma banana bônus** caindo na tela; se o herói a **pega**, ganha **uma barreira nova**.

> **A confirmar:** **ajustar as escalas** dos personagens/naves na tela conforme o mock (`uploads/Meshy_AI_Gameplay Prototype Banana Barriers.png`).

### 4.4 Vidas
- **3 vidas.** Vida só é perdida por **contato direto com o herói**: coco que atinge o herói → **-1 vida**; nave da formação que encosta no herói → **-1 vida**. Sempre com respawn breve + invulnerabilidade curta. **Ultrapassar a barreira de bananas não tira vida.**
- Ao zerar vidas → **tela de derrota** (nave do herói destruída + botão **"Tentar novamente"**).

### 4.5 Power-ups (drops)
Aparecem ocasionalmente ao destruir naves. Funcionam por **ciclos** (duração temporizada por ciclo, cujo tamanho será **testado e validado** no protótipo):
- **Tiro triplo / rápido** (temporário, por ciclo).
- **Escudo temporário** (absorve N cocos / por ciclo).
- **Vida extra** (+1, **teto de 3 vidas**).

> **A confirmar:** duração exata de cada ciclo (a calibrar), se power-ups **empilham** ou o novo substitui o ativo, e a **taxa de drop**.

### 4.6 Condição de vitória
- **Fase vencida** = destruir **todas** as naves da formação → **tela de vitória** (herói comemorando + nave do vilão destruída) → próxima fase.
- **Jogo vencido** (após fase 10) = **animação final** (ver §7.2): Banana King caminhando no **pôr do sol** com um **troféu**, **pontuação final em destaque** e **frase de vitória** (localizada).

---

## 5. Progressão das 10 fases

Cada fase = **1 background** (já disponível, `background-fase01..10.png`) + **4 fileiras** de naves. A dificuldade é **gradual**: a Fase 01 usa apenas as naves mais fracas e, a cada fase, uma nave **mais forte** é introduzida, até a Fase 10 (mais difícil + final). "Nível" abaixo = **poder/resistência** da nave (1 = mais fraca `nave-05`; 5 = mais forte `nave-00`).

### 5.1 Composição das fileiras por fase

Cada célula indica o **nível de poder** das naves naquela fileira (topo → base). Padrão: a fileira do topo sempre traz a nave mais forte da fase.

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

> Mapeamento nave↔nível: **1** = `nave-inimiga-05` · **2** = `nave-inimiga-03`/`04` · **3** = `nave-inimiga-02` · **4** = `nave-inimiga-01` · **5** = `nave-inimiga-00`.

Além da composição de naves, crescem gradualmente por fase: **velocidade da formação**, **tamanho do degrau de descida** e **frequência de cocos** do Vilão (valores a calibrar no protótipo).

> **A confirmar:** esta tabela de composição é uma proposta seguindo seu exemplo (01: níveis 1,2 · 02: 1,2 · 03: 1,2,3 …). Ajuste livremente as células se quiser outra curva. Cada background já está vinculado à sua fase pelo número do arquivo.

---

## 6. Pontuação e ranking

- **Pontos por nave** proporcionais ao poder. Sugestão: `pontos = poder × 100` (nave poder 5 = 500; poder 1 = 100).
- **Bônus de fase:** concluir sem perder vida → bônus (ex.: +1000).
- **Bônus por vidas restantes** ao vencer o jogo.
- **Multiplicador / combo:** **sim** — acertos consecutivos (ou destruições em sequência) aumentam um multiplicador que se aplica aos pontos.
- **Recorde salvo localmente** (localStorage): melhor pontuação + iniciais/nome. Funciona **offline**.
- **Ranking global (futuro):** usar **Google Play Games Services (Leaderboards)** para rankeamento online. Camada de score desacoplada para plugar depois.

> **A confirmar:** critérios exatos de pontos por nave e do multiplicador/combo (quanto cresce, quando zera); formato do ranking local (top 10?).

---

## 7. Fluxo de telas

```
[Splash/Logo]
      ↓
[Tela inicial]
  - Logo do game
  - Seletor de idioma
  - Campo de nome + botão "Confirmar"
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
- **Tela inicial:** logo, dropdown de idioma (6 idiomas), input de nome, botão confirmar, "última pontuação", link de termos/privacidade (**placeholder no protótipo** — ver nota de backlog).
- **Vitória de fase:** herói comemorando + nave do vilão destruída + pontuação parcial + botão continuar.
- **Derrota (3 vidas perdidas):** herói destruído + pontuação + botão **"Tentar novamente"** → **reinicia o jogo do início (Fase 01)**. Enquanto o usuário ainda tiver vidas, ele **permanece na fase atual** (apenas respawn).
- **Vitória final:** animação Banana King + troféu + pôr do sol + pontuação em destaque + frase localizada + botão (menu/recomeçar).

- **Pausa:** botão de pausa durante o gameplay abre menu com **Continuar**, **Reiniciar o jogo**, toggles de **Música** e **Efeitos** (liga/desliga separados) e, ao pausar, **salva a fase atual** (retomar depois).

> **A confirmar:** — (todos os pontos deste fluxo resolvidos).

### 7.2 Animação de vitória final (walk-cycle)

Cena **pré-renderizada** (fundo pôr do sol + floresta já embutidos em cada frame) da caminhada do Banana King segurando o troféu. É um **ciclo de caminhada em sprites**, não uma animação a montar por camadas.

- **Frames utilizados:** **3 frames** para o walk-cycle — **frames 1, 3 e 5 (Phone)** a **~8 fps** (decisão confirmada; replanejar se não ficar bom).
- **Reprodução:** loop dos 3 frames em sequência (~6–10 fps) dando a sensação de caminhada; personagem **parado** (walk-cycle no lugar, sem transladar pela tela); sobrepor **pontuação final** e **frase de vitória** localizada por cima da cena; botão de ação (menu/recomeçar) na base.
- **Layout único:** o jogo terá **um só layout** (Phone), escalado responsivamente; os assets Tablet não são necessários para esta animação.

> **A confirmar:** posição dos overlays (pontuação/frase) para não cobrir o personagem. (Frames 1/3/5 a ~8 fps — confirmado.)

---

## 8. Áudio

- **Bibliotecas públicas de efeitos** (SFX) + **música de fundo**, com **licença livre para uso comercial** (preferir CC0).
- **Offline-first:** todas as **fontes** e **arquivos de áudio** devem ser **incorporados/empacotados no jogo** (nada carregado da rede em runtime).
- Eventos com som: **tiro laser** do herói, **pequena explosão** de nave, **explosão** de banana destruída, **impacto de coco** no herói, **power-up coletado**, **vitória/derrota**, **clique de UI**.
- **Controles de áudio separados:** **Música** e **Efeitos** têm liga/desliga **independentes**, disponíveis na **tela inicial** e no **menu de pausa**. O botão **mute** do HUD alterna o áudio geral. Estados persistidos (localStorage).

> **A confirmar:** — (controles separados Música/Efeitos na tela inicial e pausa; áudio incorporado e offline — confirmado).

---

## 9. Monetização (AdMob)

- **Banner** na base + texto **"Remover Anúncio"** logo acima.
- Clique em "Remover Anúncio" → **modal de compra** (fluxo funcional na UI; integração de pagamento e AdMob **implementados depois**).
- **Produto único:** `remove_ads` — **compra única** de referência **USD 1,90**. Ao clicar em remover, o sistema deve **consultar o preço junto ao Google AdMob/Billing** e exibir o **valor correto conforme a localidade** do usuário (moeda/preço regional).
- Banner atual = **placeholder** identificado.

> **A confirmar:** ~~planos/preços~~ — **resolvido: produto único `remove_ads`, compra única, USD 1,90 de referência, preço regional via loja.** No protótipo o valor é exibido como placeholder (USD 1,90) até a integração de billing.

---

## 10. Internacionalização (i18n)

- Idiomas: **EN, ES, PT-BR, FR, IT, DE**. Padrão inicial: **PT-BR**.
- Todo texto vindo de dicionário de strings por idioma (sem texto "hardcoded").
- Seletor de idioma na tela inicial; preferência persistida (localStorage).
- Frases-chave a traduzir: menu, HUD, botões, vitória/derrota, frase de vitória final, modal de anúncio, termos, e um **texto curto e objetivo descrevendo o jogo** na tela inicial.
- **Traduções:** nós **geramos os 6 idiomas** e o cliente **revisa**.

### 10.1 Texto descritivo da tela inicial
Texto curto e objetivo (1–2 frases) apresentando o jogo, exibido na tela inicial e localizado nos 6 idiomas.

**Rascunho (PT-BR) para aprovação:**
> *"Banana King Counterattacks — defenda a Terra do chimpanzé Trasho e sua tropa estelar! Deslize para desviar dos cocos, destrua a formação e vença as 10 fases."*

---

## 11. Escopo do primeiro protótipo (fatia vertical)

**Confirmado:** **1 fase totalmente jogável e polida.**

Incluído no protótipo:
- Tela inicial (idioma + nome + última pontuação + termos).
- **Fase 01** completa e jogável: controle por arrasto, tiro automático, formação de 4 fileiras com movimento alternado, cocos do vilão, barreira de bananas (2 tiros/banana), 3 vidas, pontuação, HUD completo, mute.
- Power-ups (ao menos 1 dos 3, idealmente os 3).
- Telas de **vitória de fase** e **derrota** ("Tentar novamente").
- Banner placeholder + "Remover Anúncio" → modal.
- i18n funcionando em PT-BR + EN (demais idiomas com estrutura pronta).
- Som (laser, explosões, música) com mute.
- Recorde local.

Fora do protótipo inicial (fases 02–10, animação final completa, AdMob real, pagamento, ranking global) — estrutura preparada, implementação posterior.

---

## 12. Considerações técnicas

- **Orientação:** travar retrato; layout responsivo à altura do dispositivo. **Layout único (Phone)** escalado — sem breakpoint de tablet.
- **Assets:** importar do repositório GitHub para o projeto (PNGs de fundo são grandes ~1 MB cada — considerar compressão/`webp` no build final).
- **Arquitetura de dados:** separar **config de fases** (JSON de parâmetros) da lógica, para ajuste rápido de dificuldade.
- **Score/ranking:** camada isolada para plugar backend futuro (**Google Play Games Services — Leaderboards** para ranking global).
- **Performance:** pooling de sprites (tiros, cocos, explosões) para evitar GC em mobile.

---

## 13. Lista consolidada de itens "A confirmar" antes do desenvolvimento

1. ~~Quem lança cocos~~ — **resolvido: só o Trasho**, andando no topo e disparando aleatoriamente.
2. ~~Nº de bananas~~ — **resolvido: 1 fileira única de 7 bananas.**
3. ~~Altura da barreira~~ — **resolvido: um pouco acima do Banana King, conforme o mock de referência.**
4. ~~Feedback de dano nas naves~~ — **resolvido: flash branco + escurecimento proporcional à vida restante.**
5. ~~Formação alcança a linha do herói~~ — **resolvido (revisado): sem game over por alcance; a formação para no nível do herói e nave que encosta tira 1 vida.**
6. ~~Cadência de tiro~~ — **resolvido: herói contínuo; coco esporádico/baixa constância, crescendo fase a fase.** (Valores exatos a calibrar no protótipo.)
7. ~~Power-ups~~ — **resolvido: por ciclos (duração a testar), teto de 3 vidas.** Falta calibrar duração/empilhamento/drop no protótipo.
8. ~~Pontuação~~ — **resolvido: multiplicador/combo sim; ranking local offline + Google Play Games (Leaderboards) no futuro.** Valores exatos a calibrar.
9. ~~"Tentar novamente"/pausa~~ — **resolvido: 3 vidas perdidas volta à Fase 01; com vidas, respawn na fase atual. Menu de pausa: Continuar / Reiniciar / toggles Música+Efeitos; salva a fase atual.**
10. ~~Mapeamento background↔fase e dificuldade~~ — **resolvido: backgrounds vinculados pelo número; dificuldade gradual conforme tabela §5.1** (velocidade/cadência a calibrar).
11. ~~Fontes/licenças de áudio~~ — **resolvido: licença livre (CC0), áudio + fontes incorporados, offline; controles separados Música × Efeitos (tela inicial + pausa).**
12. ~~Planos do modal~~ — **resolvido: produto único `remove_ads`, compra única, USD 1,90 (preço regional via loja).**
13. ~~Origem das traduções~~ — **resolvido: nós geramos os 6 idiomas, cliente revisa.** Inclui **texto curto de apresentação** na tela inicial (rascunho em §10.1 para aprovação).
14. ~~Textos legais~~ — **resolvido: placeholder no protótipo.** ⚠️ **BACKLOG:** redigir/adicionar **Termos de Uso** e **Política de Privacidade** reais antes do lançamento (obrigatório para publicação nas lojas).
15. ~~Animação final~~ — **resolvido: frames 1/3/5 a ~8 fps** (replanejar se necessário); falta só a posição dos overlays.
16. ~~Assets Phone vs Tablet~~ — **resolvido: layout único (Phone escalado).**

---

## 14. Backlog de produção (pós-aprovação do protótipo)

> Atividades **fora do protótipo** que precisam ser executadas para levar o jogo à publicação. Status inicial: **pendente**. Executar após o protótipo da Fase 01 ser confirmado.

### 14.1 Google AdMob (anúncios)
- [ ] Criar conta/app no **Google AdMob** e vincular à conta de pagamentos.
- [ ] Cadastrar o **anúncio (banner)** e gerar a **Ad Unit ID / Key** de produção.
- [ ] Criar unidade de teste (test ad unit) para desenvolvimento.
- [ ] Integrar o SDK do AdMob e exibir o banner real na base (substituir placeholder).
- [ ] Implementar a lógica de **ocultar o banner** quando `remove_ads` estiver ativo.
- [ ] Configurar consentimento (**UMP / GDPR / ATT** no iOS) para privacidade de anúncios.

### 14.2 Google Play Console (publicação)
- [ ] Criar conta de **desenvolvedor** no Google Play Console (se ainda não existir).
- [ ] **Cadastrar o game** (ficha da loja): título, descrições localizadas (6 idiomas), ícone, screenshots, feature graphic, categoria, classificação etária (questionário de content rating).
- [ ] Configurar **ficha da loja** por idioma (EN, ES, PT-BR, FR, IT, DE).
- [ ] Definir países/regiões de distribuição e preço (app gratuito).
- [ ] Preencher **Data safety / Segurança de dados** e declarações obrigatórias.
- [ ] Configurar **assinatura de app (Play App Signing)** e faixas de teste (internal / closed / open).

### 14.3 Billing / Compra única (`remove_ads`)
- [ ] Criar o **produto único gerenciado** `remove_ads` no Play Console (**In-app product**), preço base **USD 1,90** (a loja aplica preço regional).
- [ ] (iOS/App Store, se houver) criar o produto equivalente no **App Store Connect**.
- [ ] Integrar **Google Play Billing** (compra + verificação + restauração de compra).
- [ ] Buscar o **preço localizado** via API da loja e exibir no modal (substituir placeholder).
- [ ] Persistir o estado "ads removidos" e restaurar em reinstalação/novo dispositivo.

### 14.4 Ranking / Google Play Games Services
- [ ] Habilitar **Play Games Services** no projeto.
- [ ] Criar **Leaderboard** (pontuação global) e IDs correspondentes.
- [ ] Integrar login PGS (opcional/anônimo) e envio de score.
- [ ] Definir política de sincronização do recorde local → global.

### 14.5 Textos legais e conformidade
- [ ] Redigir **Termos de Uso** reais (localizados nos 6 idiomas).
- [ ] Redigir **Política de Privacidade** real e hospedar URL pública (exigida pelas lojas e pelo AdMob).
- [ ] Substituir os placeholders da tela inicial pelos textos/links reais.
- [ ] Revisar conformidade **COPPA / público infantil** (afeta anúncios e coleta de dados).

### 14.6 Áudio e assets finais
- [ ] Selecionar e licenciar (CC0 / uso comercial) todos os SFX e a música; **arquivar comprovantes de licença**.
- [ ] Otimizar/comprimir áudios e **embutir offline** no pacote.
- [ ] Converter backgrounds PNG (~1 MB) para formato otimizado (ex.: WebP) e gerar sprites/atlas.
- [ ] Fornecer/validar assets faltantes (ex.: frames Tablet, se o escopo mudar).

### 14.7 Internacionalização
- [ ] Gerar as traduções dos 6 idiomas (EN, ES, PT-BR, FR, IT, DE) — **cliente revisa**.
- [ ] Traduzir a ficha da loja e a frase de vitória final.
- [ ] Testar layout de UI com strings longas (DE/FR costumam estourar).

### 14.8 Fases 02–10 e telas finais
- [ ] Implementar as **fases 02–10** com a tabela de dificuldade §5.1 (calibrar velocidade, degrau, cadência de coco).
- [ ] Implementar a **banana bônus** da Fase 5 (nova barreira ao coletar).
- [ ] Finalizar a **animação de vitória final** (frames 1/3/5 ~8 fps + overlays de pontuação/frase).
- [ ] Balancear power-ups (duração de ciclo, empilhamento, taxa de drop) e pontuação/combo.

### 14.9 Empacotamento / Release
- [ ] Empacotar o jogo web como app (ex.: **Capacitor/Cordova/TWA**) para Android (e iOS, se aplicável).
- [ ] Configurar **ícone, splash e nome** por plataforma.
- [ ] Testes em dispositivos reais (vários tamanhos de tela, retrato).
- [ ] Gerar build assinado (**AAB**) e enviar às faixas de teste.
- [ ] QA de compra, anúncios, offline, mute e persistência de progresso.

> **Observação:** esta lista será refinada conforme o protótipo evoluir; novos itens devem ser adicionados aqui à medida que surgirem.

---

*Ao aprovar/ajustar esta especificação, seguimos para o desenvolvimento do protótipo (fatia vertical — Fase 01).*


---

## 15. Decisões de calibração do protótipo (28/07/2026)

- **Coco**: desenho **redondo**; ocorrência reduzida (intervalo base **4,5s**, ajustável na Calibração).
- **Descida da formação**: degrau reduzido de 15px → **5px** por toque na borda (bem mais lento).
- **Sprites direcionais**: herói usa `banana-king-no-espaco.png` ao mover para a **direita** e `banana-king-no-espaco-espelhado.png` para a **esquerda** (asset espelhado gerado). Trasho idem com `vilao-Trasho.png` / `vilao-Trasho-espelhado.png`, conforme a **direção real** do movimento.
- **Vidas**: apenas contato direto (coco ou nave) tira vida; barreira ultrapassada não tira vida nem encerra o jogo. Corrigido bug de morte sem ser atingido (era o game-over por alcance).
- **Power-up drop**: padrão ajustado para **4%**.
