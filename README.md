# Banana King Counterattacks

Arcade *fixed-shooter* (estilo *Space Invaders*) para web/mobile, **exclusivamente
em retrato**. O herói **Banana King** defende a Terra do chimpanzé **Trasho** e sua
tropa estelar ao longo de **10 fases**.

> **Atenção ao nome:** *Banana King Counterattacks* é o **jogo**. *Banana King*
> (sozinho) é o **personagem herói**. Existe um projeto anterior e distinto também
> chamado "Banana King" — ver §0 da [especificação](DOC/ESPECFICATION.md) antes de
> tratar qualquer referência a esse nome como sendo deste projeto.

## Status

**Fase de protótipo.** A Fase 01 está jogável de ponta a ponta em
[PROJECT/Banana King - Fase 01.dc.html](PROJECT/Banana%20King%20-%20Fase%2001.dc.html)
— tela inicial, gameplay completo, power-ups, vitória/derrota, pausa, i18n nos 6
idiomas, áudio e recorde local.

O **stack de produção foi decidido em 31/07/2026: vanilla JS/canvas + Capacitor**
(épico 2 do [backlog](DOC/BACKLOG.md)). O projeto de produção vive em
[APK/](APK/), onde a lógica da Fase 01 já foi portada do protótipo — sem o
framework de prototipagem, com config de fases e i18n em JSON e pooling de
entidades. O protótipo em `PROJECT/` permanece como referência histórica.

## Documentação

| Documento | Conteúdo |
| --- | --- |
| [DOC/ESPECFICATION.md](DOC/ESPECFICATION.md) | **Especificação técnica e de design.** Fonte da verdade das regras de jogo, calibração, telas, i18n e monetização. |
| [DOC/BACKLOG.md](DOC/BACKLOG.md) | Backlog de produção em 13 épicos, do protótipo à publicação. |
| [DOC/GERAR-AAB.md](DOC/GERAR-AAB.md) | Processo de build do AAB assinado para a Play Store. Herdado de outro projeto — válido só a partir da decisão de stack. |
| [DOC/GOOGLE-ADMOB.md](DOC/GOOGLE-ADMOB.md) | Identificadores do AdMob (App ID ainda placeholder). |

> Regras de jogo mudam **primeiro na especificação**, depois no código.

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `PROJECT/` | Protótipo jogável e especificação original da POC |
| `PROJECT/assets/` | Arte do jogo (~30 MB): 10 backgrounds de fase, personagens, 6 naves inimigas, frames da animação final, logo e ícone |
| `PROJECT/uploads/` | Mocks de referência visual |
| `DOC/` | Documentação do projeto |
| `APK/` | **Projeto de produção** — vanilla JS + Vite + Capacitor |
| `DEPLOY/` | Artefatos de publicação e assets de loja |

## Como rodar o projeto de produção (`APK/`)

Os assets **não são versionados** em `APK/public/assets/` — hoje seriam cópias
byte a byte de `PROJECT/assets/` (~26 MB de PNG), e commitar as duas gravaria
~56 MB permanentes no histórico. Copie-os na primeira execução:

```powershell
Copy-Item PROJECT/assets APK/public/assets -Recurse
cd APK
npm install
npm run dev
```

`npm run build` gera o bundle em `APK/dist/`.

> Quando o épico 6 gerar os **WebP otimizados**, só a versão otimizada passa a
> ser versionada em `APK/` e este passo de cópia desaparece. A conversão é
> **requisito de release**: 26 MB de PNG cru contra o teto de 50 MB do AAB.

> As fontes `Press Start 2P` e `VT323` ainda **não estão embutidas** — o
> carregamento via Google Fonts foi removido por violar o requisito
> offline-first, então a UI cai em `monospace` até o épico 6.

## Como rodar o protótipo (histórico)

A partir da raiz do repositório:

```powershell
python servir-prototipo.py
```

O script sobe um servidor em `localhost:8080` e abre o protótipo no browser.

**Controles:** arrastar (ou setas ← →) move a nave; o tiro é automático; `Esc`
pausa.

> **Por que não `python -m http.server`:** o protótipo tem caminhos
> inconsistentes — `support.js` é relativo ao HTML (`./support.js`) e os assets
> são relativos à raiz (`PROJECT/assets/...`). Nenhuma raiz de servidor satisfaz
> os dois ao mesmo tempo, e abrir o `.html` direto do disco também não funciona.
> O script contorna isso sem editar o protótipo; a padronização dos caminhos
> está no épico 2 do [backlog](DOC/BACKLOG.md).

## O jogo em uma tela

- **4 fileiras × 5 colunas** de naves inimigas descendo em sentidos alternados.
- **Tiro automático** contínuo; o jogador só se posiciona.
- **Trasho** oscila no topo lançando **cocos** de forma esporádica.
- **Barreira de 7 bananas** que absorve cocos **e destrói naves** que descem até
  ela — funciona como reserva de vidas extras e **nunca regenera** sozinha.
- **3 vidas**, perdidas apenas por contato direto. Ao perder uma, a fase reinicia
  mantendo o placar.
- **Power-ups:** tiro triplo, tiro rápido, escudo, vida extra e a **banana bônus**
  (única forma de recuperar a barreira).

Detalhes e valores de calibração: [DOC/ESPECFICATION.md](DOC/ESPECFICATION.md).

## Identidade do app

| Item | Valor |
| --- | --- |
| Nome | Banana King Counterattacks |
| Pacote Android | `com.bananaking.counterattacks` |
| Idiomas | PT-BR (padrão), EN, ES, FR, IT, DE |
| Monetização | Banner AdMob + compra única `remove_ads` (ref. USD 1,90) |
| Orientação | Retrato, layout único (Phone) escalado |
