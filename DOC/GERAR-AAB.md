# Como gerar o AAB de release — Banana King Counterattacks

Passo a passo para gerar o pacote `.aab` assinado, pronto para upload na Google
Play Console, e deixá-lo em `DEPLOY/`.

> ⚠️ **Documento adaptado de outro projeto.** O processo abaixo veio do projeto
> anterior "Banana King" (distinto deste — ver §0 da
> [ESPECFICATION.md](ESPECFICATION.md)) e assume **Angular + Capacitor**.
> **O stack de empacotamento deste jogo ainda não foi decidido** — a POC atual é
> HTML + canvas puro. Os comandos dos passos 4 em diante só valem depois que o
> stack for definido e o projeto Capacitor existir em `APK/`. Os passos 1–3
> (JDK/SDK e keystore) valem para qualquer stack que gere um AAB Android.

## Identidade do app (confirmada)

| Item | Valor |
|---|---|
| Nome do app | **Banana King Counterattacks** |
| Pacote Android | `com.bananaking.counterattacks` |
| App ID AdMob | `ca-app-pub-XXX` *(a substituir pelo real)* |
| Keystore | `banana-king-counterattacks-release.jks` |
| Alias da chave | `bkcounterattacks` |
| AAB de saída | `DEPLOY/banana-king-counterattacks-release.aab` |

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

Esse arquivo **nunca deve ser commitado**. ⚠️ **O `.gitignore` atual NÃO cobre
`*.jks`** — execute o §0 antes de rodar este comando.

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

> Depende do stack escolhido. Exemplo para Angular/Capacitor:

```powershell
Set-Location "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK"
npm run build
npx cap sync android
```

Isso gera `APK/www` (build otimizado de produção) e copia para
`APK/android/app/src/main/assets/public`.

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

### 5.1 ⚠️ Guarde o `mapping.txt` de cada release

O R8 está ligado (`minifyEnabled true`), então o código do AAB é **ofuscado**.
Sem o arquivo de mapeamento, os relatórios de crash da Play Console vêm
ilegíveis (`a.b.c()` em vez dos nomes reais).

```
APK\android\app\build\outputs\mapping\release\mapping.txt
```

Ele fica dentro de `build/`, que é **apagado a cada `gradlew clean`**. Copie-o
para fora junto de cada AAB publicado, nomeado com a versão — por exemplo
`DEPLOY/mapping-v1.txt`. Na Play Console, envie-o em
*Qualidade do app → Android vitals → Desofuscar arquivos*.

## 6. Copiar para DEPLOY

```powershell
Copy-Item "C:\Sistemas\BANANA-KING-COUNTERATTACKS\APK\android\app\build\outputs\bundle\release\app-release.aab" "C:\Sistemas\BANANA-KING-COUNTERATTACKS\DEPLOY\banana-king-counterattacks-release.aab"
```

O binário **não deve ser versionado**. ✅ Coberto pelo `.gitignore` desde
31/07/2026 (`DEPLOY/*.aab`, `DEPLOY/*.apk`, `*.apk`) — ver §0.

## 7. Antes de cada novo release

- Suba `versionCode` e `versionName` em `APK/android/app/build.gradle`
  (`versionCode` é um inteiro que deve **sempre aumentar**; `versionName` é o
  texto visível ao usuário, ex. `"1.1"`).
- Repita os passos 4–6.
- Use **o mesmo keystore** do passo 2 — nunca gere um novo para o mesmo app.

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

Copy-Item "app\build\outputs\bundle\release\app-release.aab" "C:\Sistemas\BANANA-KING-COUNTERATTACKS\DEPLOY\banana-king-counterattacks-release.aab"
```

## Assets de loja (a gerar)

- Ícone de alta resolução (512×512) para a ficha da Play Store:
  `DEPLOY/store-assets/icon-512.png`, a gerar a partir de
  `PROJECT/assets/logo.png` ou `PROJECT/assets/icon.png`.
- Screenshots (retrato), feature graphic 1024×500 — ver épico de release no
  [BACKLOG.md](BACKLOG.md).
