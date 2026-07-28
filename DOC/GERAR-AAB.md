precisamos atualizar esse arquivo para o novo nome do app, que é "Banana King Counterattacks".
Incluindo o nome do app e o ID do aplicativo no Google AdMob, que é `ca-app-pub-XXX`.
E o nome do pacote no google play console, que é `com.bananaking.counterattacks`.

# Como gerar o AAB de release (Banana King)

Passo a passo para gerar o pacote `.aab` assinado, pronto para upload na Google
Play Console, e deixá-lo em `DEPLOY/`.

> Rode todos os comandos a partir da pasta `APK/` do projeto, exceto onde indicado.

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
  Esse arquivo é local e já está no `.gitignore` do Android.)

## 2. Criar o keystore de assinatura (uma vez só, e guardar para sempre)

O Google Play exige que toda atualização do app seja assinada com a **mesma
chave**. Se você perder o keystore ou a senha, **não é possível publicar
atualizações do app nunca mais** — só lançar um app novo, com pacote
diferente. Faça backup do arquivo `.jks` gerado (fora do repositório) em pelo
menos dois lugares seguros (ex. gerenciador de senhas + storage em nuvem
pessoal).

Rode a partir da pasta `APK/android`:

```powershell
Set-Location "C:\Sistemas\BANANA-KING\APK\android"
keytool -genkeypair -v -keystore banana-king-release.jks -alias bananaking -keyalg RSA -keysize 2048 -validity 10000
```

O `keytool` vai pedir uma senha do keystore, uma senha da chave (pode ser a
mesma) e alguns dados (nome, organização, cidade, etc. — podem ser
genéricos, não são validados). Guarde a senha com cuidado.

Esse arquivo (`banana-king-release.jks`) **nunca deve ser commitado** — já está
coberto por `*.jks` no `.gitignore` de `APK/android/`.

## 3. Configurar as credenciais do keystore no projeto

Crie o arquivo `APK/android/keystore.properties` (também já ignorado pelo
git) com:

```properties
storeFile=banana-king-release.jks
storePassword=SENHA_DO_KEYSTORE
keyAlias=bananaking
keyPassword=SENHA_DA_CHAVE
```

`storeFile` é relativo à pasta `APK/android`. Se preferir manter o `.jks` em
outro local (recomendado, fora do repositório), use um caminho absoluto.

> Sem esse arquivo, o Gradle assina o release com a chave de **debug**
> automaticamente (útil para testar o processo, mas esse AAB **não pode ser
> enviado à Play Store** — o Google rejeita builds assinados com chave
> debug). O `APK/android/app/build.gradle` já está preparado para usar
> `keystore.properties` quando ele existir.

## 4. Build de produção do Angular + sync Android

```powershell
Set-Location "C:\Sistemas\BANANA-KING\APK"
npm run build
npx cap sync android
```

Isso gera `APK/www` (build otimizado de produção) e copia para
`APK/android/app/src/main/assets/public`.

## 5. Gerar o AAB assinado

```powershell
Set-Item -Path Env:JAVA_HOME -Value "C:\Program Files\Android\Android Studio\jbr"
Set-Item -Path Env:PATH -Value "$Env:JAVA_HOME\bin;$Env:PATH"
Set-Location "C:\Sistemas\BANANA-KING\APK\android"
.\gradlew bundleRelease
```

O arquivo assinado sai em:
```
APK\android\app\build\outputs\bundle\release\app-release.aab
```

## 6. Copiar para DEPLOY

```powershell
Copy-Item "C:\Sistemas\BANANA-KING\APK\android\app\build\outputs\bundle\release\app-release.aab" "C:\Sistemas\BANANA-KING\DEPLOY\banana-king-release.aab"
```

`DEPLOY/*.aab` já está no `.gitignore` da raiz do projeto — o binário fica só
local, não é versionado.

## 7. Antes de cada novo release

- Suba `versionCode` e `versionName` em `APK/android/app/build.gradle`
  (`versionCode` é um inteiro que deve **sempre aumentar**; `versionName` é o
  texto visível ao usuário, ex. `"1.1"`).
- Repita os passos 4–6.
- Use **o mesmo keystore** do passo 2 — nunca gere um novo para o mesmo app.

---

## Checklist rápido (releases seguintes, keystore já existe)

```powershell
Set-Location "C:\Sistemas\BANANA-KING\APK"
npm run build
npx cap sync android

Set-Item -Path Env:JAVA_HOME -Value "C:\Program Files\Android\Android Studio\jbr"
Set-Item -Path Env:PATH -Value "$Env:JAVA_HOME\bin;$Env:PATH"
Set-Location "C:\Sistemas\BANANA-KING\APK\android"
.\gradlew bundleRelease

Copy-Item "app\build\outputs\bundle\release\app-release.aab" "C:\Sistemas\BANANA-KING\DEPLOY\banana-king-release.aab"
```

## Assets de loja (a gerar)

- Ícone de alta resolução (512×512) para a ficha da Play Store:
  `DEPLOY/store-assets/icon-512.png`, a gerar a partir de
  `PROJECT/assets/banana-king-logo.png` (ver Épico 9.3 do backlog).
