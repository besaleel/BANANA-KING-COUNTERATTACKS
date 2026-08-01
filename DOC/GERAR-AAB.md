# Como gerar o AAB de release — Banana King Counterattacks

Passo a passo para gerar o pacote `.aab` assinado, pronto para upload na Google
Play Console, e deixá-lo em `DEPLOY/`.

> ✅ **Validado de ponta a ponta em 01/08/2026** com o stack real
> (**vanilla JS + canvas + Capacitor**, decidido no épico 2): keystore gerado,
> assinatura ligada ao Gradle, R8 configurado e **AAB assinado produzido e
> verificado** (`jarsigner` → `jar verified`).
>
> O aviso anterior de "documento adaptado de outro projeto, stack indefinido"
> não vale mais. O que **ainda não foi feito** é o upload à Play Console (conta
> de desenvolvedor, ficha da loja, Play App Signing) — épico 11.1 do
> [BACKLOG.md](BACKLOG.md).

## Identidade do app (confirmada)

| Item | Valor |
|---|---|
| Nome do app | **Banana King Counterattacks** |
| Pacote Android | `com.bananaking.counterattacks` |
| App ID AdMob | `ca-app-pub-XXX` *(a substituir pelo real)* |
| Keystore | `banana-king-counterattacks-release.jks` |
| Alias da chave | `bkcounterattacks` |
| AAB de saída | `DEPLOY/banana-king-counterattacks-v<versionName>-<versionCode>.aab` |

> Rode todos os comandos a partir da pasta `APK/` do projeto, exceto onde
> indicado.

---

## 0. ✅ Pré-requisito — proteger segredos no `.gitignore` *(concluído)*

> **Resolvido em 31/07/2026.** Os cinco padrões abaixo foram adicionados ao
> `.gitignore` da raiz e verificados com `git check-ignore -v` **antes** da
> geração do keystore (01/08/2026). A pasta `APK/android/` inteira também é
> ignorada, o que cobre o `.jks` e o `keystore.properties` em segunda camada.
>
> A seção fica aqui como referência de *por que* isso importa — releia antes de
> mexer no `.gitignore`.

Arquivos sensíveis do processo de release e o risco de cada um:

| Arquivo | Risco se commitado |
|---|---|
| `*.jks` / `*.keystore` | **Irreversível.** Chave de assinatura exposta compromete o app permanentemente — qualquer um pode publicar updates falsos. Não há como revogar. |
| `keystore.properties` | Senhas do keystore em texto puro. |
| `local.properties` | Caminho local do SDK (vaza estrutura da máquina). |
| `DEPLOY/*.aab` | Binário grande e desnecessário no histórico do git. |

Padrões ativos no `.gitignore` da raiz:

```gitignore
# Assinatura Android — NUNCA commitar
*.jks
*.keystore
keystore.properties
local.properties
DEPLOY/*.aab
DEPLOY/*.apk
*.apk
```

Para reconferir a qualquer momento (deve listar a regra que casa com cada um):

```powershell
Set-Location "C:\Sistemas\BANANA-KING-COUNTERATTACKS"
git check-ignore -v APK/android/banana-king-counterattacks-release.jks APK/android/keystore.properties APK/android/local.properties DEPLOY/x.aab
```

> Se um keystore já tiver sido commitado por acidente, **remover em um commit
> novo não basta** — ele permanece no histórico. Nesse caso a chave deve ser
> considerada comprometida: gere um keystore novo antes da primeira publicação.
> Depois da primeira publicação, a chave não pode mais ser trocada.

---

## 1. Pré-requisitos (uma vez só)

- Node.js e npm instalados.
- JDK 17+ (o JDK embutido no Android Studio funciona: normalmente em
  `C:\Program Files\Android\Android Studio\jbr`).
- Android SDK instalado (via Android Studio) e um arquivo
  `APK/android/local.properties` apontando para ele:
  ```properties
  sdk.dir=C:/Users/SEU_USUARIO/AppData/Local/Android/Sdk
  ```
  (use barras `/`, não `\`, senão o Gradle falha com `Invalid file path`.
  Esse arquivo é local e **não deve ser commitado** — ver §0.)

## 2. Criar o keystore de assinatura (uma vez só, e guardar para sempre)

O Google Play exige que toda atualização do app seja assinada com a **mesma
chave**. Se você perder o keystore ou a senha, **não é possível publicar
atualizações do app nunca mais** — só lançar um app novo, com pacote
diferente. Faça backup do arquivo `.jks` gerado (fora do repositório) em pelo
menos dois lugares seguros (ex. gerenciador de senhas + storage em nuvem
pessoal).

> **Atenção:** este é um **app novo**, com pacote próprio
> (`com.bananaking.counterattacks`). **Não reutilize** o keystore do projeto
> anterior "Banana King" — gere um keystore novo, exclusivo deste app.

Rode a partir da pasta `APK/android`:

```powershell
Set-Location "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK\android"
keytool -genkeypair -v -keystore banana-king-counterattacks-release.jks -alias bkcounterattacks -keyalg RSA -keysize 2048 -validity 10000
```

O `keytool` vai pedir uma senha do keystore, uma senha da chave (pode ser a
mesma) e alguns dados (nome, organização, cidade, etc. — podem ser
genéricos, não são validados). Guarde a senha com cuidado.

Esse arquivo **nunca deve ser commitado**. ✅ Coberto pelo `.gitignore` desde
31/07/2026 (`*.jks`, e a pasta `APK/android/` inteira) — ver §0.

> ✅ **Feito em 01/08/2026.** Keystore gerado e conferido com `keytool -list`:
> RSA 2048, alias `bkcounterattacks`, `PrivateKeyEntry`, válido até **dez/2053**
> (o Google Play exige no mínimo out/2033).

### 2.1 Backup — o que guardar, e onde

> ✅ **`.jks` copiado para o Google Drive em 01/08/2026** (junto com os
> keystores de outros jogos).

O arquivo sozinho **não basta**. Para conseguir assinar no futuro você precisa
das três coisas, e a senha **não está** dentro do `.jks`:

| O quê | Valor | Onde guardar |
|---|---|---|
| `banana-king-counterattacks-release.jks` | o arquivo | nuvem pessoal (feito) |
| Senha do keystore / da chave | — | **gerenciador de senhas** |
| Alias | `bkcounterattacks` | junto da senha |

⚠️ **Não guarde a senha num `.txt` na mesma pasta do `.jks`.** Quem obtiver
acesso àquela pasta teria as duas peças de uma vez. Use um gerenciador de
senhas, e anote a qual app cada keystore pertence — com vários jogos na mesma
pasta, é fácil trocar um pelo outro depois.

**Guardando keystores de vários apps no mesmo lugar:** confirme que a pasta
**não está compartilhada** e que a conta tem **2FA**. Um `.jks` vazado permite
publicar updates falsos, e a chave **não pode ser revogada** depois da primeira
publicação — o estrago vale por app, então uma pasta comprometida atinge todos.

### 2.2 Play App Signing reduz esse risco — decidir antes do primeiro upload

Com **Play App Signing** ativado, o Google gera e custodia a *chave de
assinatura do app*, e o seu `.jks` passa a ser apenas a **upload key**.

A diferença que importa: **upload key perdida ou comprometida pode ser
substituída** pelo suporte do Google. A chave de assinatura do app, não.

Sem Play App Signing, o `.jks` local é ponto único de falha **permanente**.
A adesão é oferecida **no primeiro envio** do app — e a escolha não se desfaz
depois. Ver §7 do épico 11 no [BACKLOG.md](BACKLOG.md).

## 3. Configurar as credenciais do keystore no projeto

Crie o arquivo `APK/android/keystore.properties` (contém senhas em texto puro —
**não commitar**, ver §0) com:

```properties
storeFile=banana-king-counterattacks-release.jks
storePassword=SENHA_DO_KEYSTORE
keyAlias=bkcounterattacks
keyPassword=SENHA_DA_CHAVE
```

`storeFile` é relativo à pasta `APK/android`. Se preferir manter o `.jks` em
outro local (recomendado, fora do repositório), use um caminho absoluto.

**Cuidados de formato** (erram silenciosamente e o build só falha depois):
sem aspas, sem espaço em volta do `=`, e senhas com `\ : = #` precisam de
escape com barra invertida (`ab#cd` → `ab\#cd`). Em caminhos, use `/` ou `\\`.

> ✅ **Já implementado (01/08/2026).** O `app/build.gradle` lê esse arquivo e
> monta o `signingConfig` de release automaticamente. As senhas ficam só no
> `.properties` (não versionado) — nunca no `build.gradle`.
>
> **Se o arquivo não existir ou estiver incompleto,** `bundleRelease` e
> `assembleRelease` **falham com mensagem explícita**, em vez de gerar um AAB
> assinado com a chave de debug que a Play Console recusaria no upload. O build
> de **debug continua funcionando** normalmente sem ele.

## 4. Build de produção + sync Android

```powershell
Set-Location "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK"
npm run build
npx cap sync android
```

Isso gera **`APK/dist`** (build de produção pelo Vite, ~1,2 MB) e copia para
`APK/android/app/src/main/assets/public`.

> `dist` — e não `www`, que era o padrão do Angular no documento original.
> O diretório de saída está declarado em `capacitor.config.json`
> (`"webDir": "dist"`).

Se os assets tiverem mudado, regere os WebP antes deste passo — ver
[GERAR-ASSETS.md](GERAR-ASSETS.md):

```powershell
python "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK\tools\gerar-assets.py"
```

### 4.1 Ícone e splash — obrigatório a cada `cap sync`

```powershell
python "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK\tools\gerar-icones.py"
```

> ⚠️ **Não pule este passo.** `APK/android/` é saída do `cap add`/`cap sync` e
> está no `.gitignore`: a cada regeração o Capacitor repõe o **ícone placeholder**
> (um "X" azul sobre fundo branco) e a splash em branco. Foi exatamente assim que
> o **AAB v1.0.1-2 chegou à Play Store com o ícone errado** — o problema só
> aparece depois de instalar o app, porque esses arquivos não passam pelo diff.
>
> O script é idempotente: rodar duas vezes não muda nada. Ele reescreve
> `mipmap-*/ic_launcher*.png` (5 densidades), `values/ic_launcher_background.xml`
> e `drawable*/splash.png` (11 variações) a partir da arte versionada em
> `DEPLOY/store-assets/icon-512.png` e `PROJECT/assets/logo-transparente.png`.

Confira antes de empacotar — o ícone deve mostrar o gorila no disco voador:

```powershell
Start-Process "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK\android\app\src\main\res\mipmap-xxxhdpi\ic_launcher.png"
```

## 5. Gerar o AAB assinado

```powershell
Set-Item -Path Env:JAVA_HOME -Value "C:\Program Files\Android\Android Studio\jbr"
Set-Item -Path Env:PATH -Value "$Env:JAVA_HOME\bin;$Env:PATH"
Set-Location "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK\android"
.\gradlew bundleRelease
```

O arquivo assinado sai em:
```
APK\android\app\build\outputs\bundle\release\app-release.aab
```

Para conferir que ele saiu assinado com a **sua** chave (e não com a de debug):

```powershell
& "C:\Program Files\Android\Android Studio\jbr\bin\jarsigner.exe" -verify -verbose:summary -certs "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK\android\app\build\outputs\bundle\release\app-release.aab"
```

Deve terminar com **`jar verified.`** e mostrar o `CN=` do seu certificado.

### 5.0 ⚠️ Ao adicionar um plugin Capacitor, atualize o ProGuard

O R8 está ligado e o Capacitor resolve plugins **por reflexão** — o R8 não
enxerga essas referências e pode remover a classe. O app **compila normalmente**
e falha só em runtime, no build de release.

Sempre que instalar um plugin novo, acrescente a regra em
`android/app/proguard-rules.pro`:

```proguard
-keep class com.capacitorjs.plugins.<nome>.** { *; }
```

Plugins cobertos hoje: `app`, `screenorientation`, `browser`.

Para descobrir o pacote de um plugin:

```powershell
Get-ChildItem -Recurse "APK\node_modules\@capacitor\<plugin>\android\src" -Filter *.java |
  Select-Object -First 1 | Get-Content | Select-String "^package"
```

### 5.1 ⚠️ Guarde o `mapping.txt` de cada release

O R8 está ligado (`minifyEnabled true`), então o código do AAB é **ofuscado**.
Sem o arquivo de mapeamento, os relatórios de crash da Play Console vêm
ilegíveis (`a.b.c()` em vez dos nomes reais).

```
APK\android\app\build\outputs\mapping\release\mapping.txt
```

Ele fica dentro de `build/`, que é **apagado a cada `gradlew clean`**. Copie-o
para fora junto de cada AAB publicado, nomeado com a versão — por exemplo
`DEPLOY/mapping-v2.txt`. Na Play Console, envie-o em
*Qualidade do app → Android vitals → Desofuscar arquivos*.

## 6. Copiar para DEPLOY

⚠️ **O nome do arquivo tem de carregar a versão** — regra §12.1 da
[ESPECFICATION.md](ESPECFICATION.md). O trecho abaixo lê `versionName` e
`versionCode` do próprio `build.gradle` e monta o nome sozinho, para não
depender de ninguém lembrar:

```powershell
Set-Location "C:\Sistemas\BANANA-KING-COUNTERATTACKS"
$g  = Get-Content "APK\android\app\build.gradle" -Raw
$vc = [regex]::Match($g, 'versionCode\s+(\d+)').Groups[1].Value
$vn = [regex]::Match($g, 'versionName\s+"([^"]+)"').Groups[1].Value
$base = "banana-king-counterattacks-v$vn-$vc"

Copy-Item "APK\android\app\build\outputs\bundle\release\app-release.aab" "DEPLOY\$base.aab"
Copy-Item "APK\android\app\build\outputs\apk\release\app-release.apk"    "DEPLOY\$base.apk"
Copy-Item "APK\android\app\build\outputs\mapping\release\mapping.txt"    "DEPLOY\mapping-v$vc.txt"
"gerado: $base"
```

O binário **não deve ser versionado** no git. ✅ Coberto pelo `.gitignore` desde
31/07/2026 (`DEPLOY/*.aab`, `DEPLOY/*.apk`, `*.apk`) — os globs pegam o nome
versionado do mesmo jeito. Ver §0.

## 7. Antes de cada novo release

- **Suba `versionCode` e `versionName`** em `APK/android/app/build.gradle` —
  este é o passo que mais se esquece, e sem ele a Play recusa o upload.
  `versionCode` é um inteiro que deve **sempre aumentar**, inclusive quando o
  envio anterior foi **rejeitado** (o número já foi consumido); `versionName` é
  o texto visível ao usuário, ex. `"1.1"`. Regra completa: §12.1 da
  [ESPECFICATION.md](ESPECFICATION.md).
- Repita os passos 4–6.
- Use **o mesmo keystore** do passo 2 — nunca gere um novo para o mesmo app.
- Confira o `targetSdkVersion` exigido pela Play (ver abaixo).

### `targetSdkVersion` exigido pela Play Store

A Play recusa o upload quando o `targetSdkVersion` está abaixo do mínimo da
janela vigente. O primeiro envio (01/08/2026) foi barrado assim:

> No momento, o nível desejado da API do app é 34. No entanto, esse nível
> precisa ser de pelo menos 35.

Correção aplicada em `APK/android/variables.gradle` (`compileSdkVersion` e
`targetSdkVersion` = 35). Subir o SDK exigiu também subir o toolchain, porque
o AGP 8.2 não compila contra o SDK 35:

| Item | Antes | Depois |
|---|---|---|
| `targetSdkVersion` / `compileSdkVersion` | 34 | **35** |
| Android Gradle Plugin (`build.gradle` raiz) | 8.2.1 | **8.5.2** |
| Gradle wrapper (`gradle-wrapper.properties`) | 8.2.1 | **8.7** |

O mínimo sobe cerca de uma vez por ano. Confira o nível atual em
*Play Console → Política → Níveis de API desejados* antes de cada release e
repita esse mesmo trio de ajustes quando ele mudar. Verifique o resultado no
binário gerado, não só no Gradle:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\build-tools\35.0.0\aapt2.exe" dump badging "C:\Sistemas\BANANA-KING-COUNTERATTACKS\DEPLOY\banana-king-counterattacks-release.apk" | Select-String "targetSdkVersion|versionCode"
```

---

## Checklist rápido (releases seguintes, keystore já existe)

```powershell
Set-Location "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK"
npm run build
npx cap sync android

Set-Item -Path Env:JAVA_HOME -Value "C:\Program Files\Android\Android Studio\jbr"
Set-Item -Path Env:PATH -Value "$Env:JAVA_HOME\bin;$Env:PATH"
Set-Location "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK\android"
.\gradlew bundleRelease

# nome versionado, montado a partir do build.gradle (regra §12.1 da spec)
$g  = Get-Content "app\build.gradle" -Raw
$vc = [regex]::Match($g, 'versionCode\s+(\d+)').Groups[1].Value
$vn = [regex]::Match($g, 'versionName\s+"([^"]+)"').Groups[1].Value
$d  = "C:\Sistemas\BANANA-KING-COUNTERATTACKS\DEPLOY"
Copy-Item "app\build\outputs\bundle\release\app-release.aab" "$d\banana-king-counterattacks-v$vn-$vc.aab"

# guarde o mapping DESTA versao - ele some no proximo `gradlew clean` (§5.1)
Copy-Item "app\build\outputs\mapping\release\mapping.txt" "$d\mapping-v$vc.txt"
```

## Assets de loja

| Asset | Exigência | Status |
|---|---|---|
| Ícone da ficha | **512×512**, PNG **sem alpha**, ≤ 1 MB | ✅ `store-assets/icon-512.png` (512×512, 258 KB, opaco) |
| Feature graphic | exatamente **1024×500** | ✅ `store-assets/feature-graphic.png` |
| Screenshots | retrato, **mín. 2** por idioma | ⬜ |
| Ícone do launcher | 5 densidades + adaptive icon, **sem placeholder** | ✅ gerado por `tools/gerar-icones.py` (§4.1) — reconferir a cada `cap sync` |
| Splash | 11 variações (retrato/paisagem × densidade) | ✅ gerado por `tools/gerar-icones.py` (§4.1) |
| Favicon web | usa a mesma marca do ícone da loja | ✅ `APK/public/assets/icon.png` (192×192, 55 KB) |

> **Nome do produto (§0 da [ESPECFICATION.md](ESPECFICATION.md)):** o ícone traz
> "BANANA KING COUNTERATTACKS" completo ✅. O feature graphic mostra só
> "BANANA KING" — aceitável como arte promocional, já que o ícone e o título da
> ficha carregam o nome completo, mas **o título cadastrado na Play Console tem
> de ser "Banana King Counterattacks"**, sem exceção.
