# Publicar na Google Play Console — Banana King Counterattacks

> Guia do cadastro na loja. Para **gerar** o `.aab`, ver
> [GERAR-AAB.md](GERAR-AAB.md). Para os assets, ver
> [GERAR-ASSETS.md](GERAR-ASSETS.md).
> **Atualizado:** 01/08/2026

## O que já está pronto

| Item | Onde |
|---|---|
| AAB assinado (2,4 MB) | `DEPLOY/banana-king-counterattacks-release.aab` |
| APK de release (2,05 MB, para testar) | `DEPLOY/banana-king-counterattacks-release.apk` |
| Mapping do R8 | `DEPLOY/mapping-v1.txt` |
| Ícone 512×512 | `DEPLOY/store-assets/icon-512.png` |
| Feature graphic 1024×500 | `DEPLOY/store-assets/feature-graphic.png` |
| Screenshots (pt-BR e en-US) | `DEPLOY/store-assets/screenshots/` |
| Política de Privacidade (6 idiomas) | `docs/privacy/` → GitHub Pages |
| Termos de Uso (6 idiomas) | `docs/terms/` → GitHub Pages |

## ✅ Passo 0 — GitHub Pages *(concluído em 01/08/2026)*

A Play Console **exige uma URL pública** de política de privacidade. Já está no
ar, com HTTPS forçado:

| Página | URL |
|---|---|
| **Política de Privacidade** (informar na Console e no AdMob) | `https://besaleel.github.io/BANANA-KING-COUNTERATTACKS/privacy/` |
| Termos de Uso | `https://besaleel.github.io/BANANA-KING-COUNTERATTACKS/terms/` |
| Índice | `https://besaleel.github.io/BANANA-KING-COUNTERATTACKS/` |

Cada página traz seletor dos 6 idiomas (`privacy/pt.html`, `privacy/de.html`…).

> ⚠️ **Não renomeie** as pastas `docs/privacy` e `docs/terms` depois de cadastrar
> essas URLs na loja — o link quebraria e a ficha seria reprovada na revisão.
>
> Para republicar após editar os textos: `python docs/gerar.py`, commit e push —
> o Pages reconstrói sozinho em ~1 min.

## Identidade do app

| Campo | Valor |
|---|---|
| **Título** (máx. 30) | `Banana King Counterattacks` (26) |
| Pacote | `com.bananaking.counterattacks` |
| Desenvolvedor | Maratimba Games |
| Contato | besaleel@gmail.com |
| Categoria | Jogos → **Arcade** |
| Preço | Gratuito |

> O nome tem de ser o **completo**, com *Counterattacks* — existe um projeto
> anterior chamado só "Banana King" (§0 da [ESPECFICATION.md](ESPECFICATION.md)).

## Descrição curta (máx. 80 caracteres)

| Idioma | Texto |
|---|---|
| pt-BR | `Defenda a Terra do chimpanzé Trasho! Arcade espacial offline com 10 fases.` (73) |
| en-US | `Defend Earth from Trasho the chimp! Offline space arcade with 10 levels.` (71) |

## Descrição completa

**pt-BR:**

```
O chimpanzé Trasho e sua tropa estelar cercaram a Terra. Só um gorila pode
impedi-los: o BANANA KING.

Pilote sua nave, desvie dos cocos e destrua a formação inimiga em 10 fases de
dificuldade crescente.

COMO JOGAR
• Arraste o dedo para mover — o tiro é automático
• Desvie dos cocos lançados pelo Trasho
• Destrua toda a formação para vencer a fase

A BARREIRA DE BANANAS
Sete bananas protegem sua base. Cada nave que encosta nelas é destruída — mas
leva uma banana junto. A barreira NÃO se regenera entre as fases: é sua reserva
de vidas extras, e cabe a você administrá-la ao longo da campanha.

POWER-UPS
• Tiro triplo e tiro rápido
• Escudo e vida extra
• Banana bônus, que restaura a barreira inteira

RECURSOS
• 100% OFFLINE — jogue em qualquer lugar, sem internet
• Sem cadastro, sem login, sem coleta de dados
• 10 fases com cenários próprios
• 6 idiomas
• Recorde local e progresso salvo
• Leve: menos de 3 MB

Sem anúncios nesta versão.
```

**en-US:**

```
Trasho the chimp and his star troop have surrounded Earth. Only one gorilla can
stop them: the BANANA KING.

Fly your ship, dodge the coconuts and destroy the enemy formation across 10
levels of rising difficulty.

HOW TO PLAY
• Drag your finger to move — firing is automatic
• Dodge the coconuts Trasho throws at you
• Wipe out the whole formation to clear the level

THE BANANA BARRIER
Seven bananas protect your base. Any ship that touches them is destroyed — but
it takes a banana down with it. The barrier does NOT regenerate between levels:
it is your reserve of extra lives, and managing it across the campaign is up to
you.

POWER-UPS
• Triple shot and rapid fire
• Shield and extra life
• Bonus banana, which restores the whole barrier

FEATURES
• 100% OFFLINE — play anywhere, no internet needed
• No sign-up, no login, no data collection
• 10 levels, each with its own backdrop
• 6 languages
• Local high score and saved progress
• Lightweight: under 3 MB

No ads in this version.
```

## Questionário de Segurança de Dados (Data Safety)

Verificado no código em 01/08/2026: **nenhuma chamada de rede, nenhum SDK de
terceiros**. Responda:

| Pergunta | Resposta |
|---|---|
| O app coleta ou compartilha dados do usuário? | **Não** |
| Os dados são criptografados em trânsito? | N/A (nada trafega) |
| O usuário pode pedir a exclusão dos dados? | N/A (nada é coletado) |

> O nome digitado pelo jogador **não conta como coleta**: fica em `localStorage`
> no aparelho, nunca é transmitido, e some ao desinstalar.
>
> ⚠️ **Ao implementar o AdMob (épico 8), isto muda.** Anúncios coletam
> identificador de publicidade, e o formulário terá de ser refeito — junto com a
> Política de Privacidade.

## Classificação etária (IARC)

Responda com honestidade ao questionário. Para este jogo:

- Violência: **fantasiosa/leve** — naves e cocos, sem sangue, sem figuras humanas
- Sem linguagem imprópria, conteúdo sexual, drogas ou jogos de azar
- Sem interação entre usuários, sem compartilhamento de localização
- Sem compras neste build

Resultado esperado: **Livre / 3+**.

## Público-alvo e programa Famílias

Decidido em 01/08/2026: **todas as idades, incluindo crianças**.

- O app já está conforme: não coleta dados de ninguém, não tem anúncios nem
  compras, e não permite comunicação entre jogadores.
- ⚠️ **Consequência para o épico 8:** ao entrar o AdMob, os anúncios terão de
  ser adequados a crianças (`tagForChildDirectedTreatment`) e sem publicidade
  personalizada. Isso reduz a receita por anúncio — é o custo consciente da
  escolha.

## Ordem sugerida de publicação

1. **Teste interno** (até 100 testadores, disponível em minutos) — valide no
   aparelho antes de qualquer coisa.
2. **Teste fechado** — grupo maior, feedback de gameplay.
3. **Produção.**

> A primeira revisão de um app novo costuma levar **alguns dias**. Contas de
> desenvolvedor criadas recentemente podem exigir um período de teste fechado
> com um número mínimo de testadores antes de liberar produção — confira as
> regras vigentes na própria Console ao criar o app.

## ⚠️ Play App Signing — escolha irreversível

Oferecido **no primeiro envio**. Recomendado **aceitar**: o Google passa a
custodiar a chave de assinatura e o seu `.jks` vira apenas *upload key*, que
**pode ser substituída** se for perdida. Sem isso, perder o `.jks` significa
nunca mais publicar atualização deste app. Ver §2.2 do
[GERAR-AAB.md](GERAR-AAB.md).

## Checklist antes de enviar

- [x] GitHub Pages publicado e a URL de privacidade abre (passo 0)
- [ ] Título com o nome completo, "Counterattacks" incluído
- [ ] Política de privacidade cadastrada com a URL do Pages
- [ ] Data Safety preenchido (**não coleta dados**)
- [ ] Classificação etária respondida
- [ ] Público-alvo: todas as idades
- [ ] Ícone, feature graphic e ≥ 2 screenshots por idioma
- [ ] AAB enviado à faixa de **teste interno** primeiro
- [ ] `mapping.txt` da versão enviado em *Android vitals → Desofuscar arquivos*
- [ ] Play App Signing aceito
