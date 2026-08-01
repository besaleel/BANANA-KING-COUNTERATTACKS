"""
Gera as paginas legais do GitHub Pages (epico 10 do backlog).

  python docs/gerar.py

Le _data.json (titular, contato, datas) e _content.json (textos nos 6 idiomas)
e escreve os HTML estaticos. Idempotente: pode rodar quantas vezes quiser.

Saida:
  docs/index.html                landing com os links
  docs/privacy/index.html        politica em ingles (URL canonica p/ Play Console)
  docs/privacy/<lang>.html       demais idiomas
  docs/terms/index.html          termos em ingles
  docs/terms/<lang>.html         demais idiomas

A URL informada a Play Console e ao AdMob e' a de privacy/, que precisa ficar
publica e estavel - nao renomeie essas pastas depois de cadastrar.
"""
import json
import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
DATA = json.loads((ROOT / '_data.json').read_text(encoding='utf-8'))
CONTENT = json.loads((ROOT / '_content.json').read_text(encoding='utf-8'))

LANGS = ['en', 'pt', 'es', 'fr', 'it', 'de']
DEFAULT = 'en'   # a Play Console exige uma URL; o ingles e' o denominador comum

CSS = """
:root {
  --bg: #14091f; --panel: #1d0f30; --ink: #fff3d6; --dim: #c9bda8;
  --accent: #ffd23f; --line: rgba(255,210,63,.25);
}
* { box-sizing: border-box; }
body {
  margin: 0; padding: 0; background: var(--bg); color: var(--ink);
  font: 16px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}
.wrap { max-width: 760px; margin: 0 auto; padding: 32px 20px 72px; }
header { border-bottom: 2px solid var(--line); padding-bottom: 20px; margin-bottom: 28px; }
.app { color: var(--accent); font-weight: 700; letter-spacing: .04em; font-size: 14px;
       text-transform: uppercase; margin: 0 0 6px; }
h1 { font-size: 28px; line-height: 1.25; margin: 0 0 10px; }
.meta { color: var(--dim); font-size: 14px; margin: 0; }
h2 { font-size: 19px; margin: 32px 0 10px; color: var(--accent); }
p, li { color: var(--ink); }
ul { padding-left: 22px; }
li { margin: 5px 0; }
a { color: var(--accent); }
.intro { background: var(--panel); border: 1px solid var(--line); border-radius: 10px;
         padding: 16px 18px; margin: 0 0 8px; }
.langs { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0 0; padding: 0; list-style: none; }
.langs a { display: inline-block; padding: 5px 12px; border: 1px solid var(--line);
           border-radius: 999px; text-decoration: none; font-size: 14px; }
.langs a[aria-current="true"] { background: var(--accent); color: #3a2415; border-color: var(--accent); font-weight: 600; }
footer { margin-top: 48px; padding-top: 20px; border-top: 2px solid var(--line);
         color: var(--dim); font-size: 14px; }
footer a { color: var(--dim); }
.cards { display: grid; gap: 14px; margin-top: 24px; }
.card { background: var(--panel); border: 1px solid var(--line); border-radius: 10px;
        padding: 18px 20px; text-decoration: none; display: block; color: var(--ink); }
.card:hover { border-color: var(--accent); }
.card b { color: var(--accent); display: block; margin-bottom: 4px; font-size: 17px; }
.card span { color: var(--dim); font-size: 14px; }
@media (prefers-color-scheme: light) {
  :root { --bg: #fdfaf3; --panel: #fff; --ink: #241a12; --dim: #6b5f52; --accent: #9a6a00;
          --line: rgba(154,106,0,.28); }
  .card b, h2, .app { color: var(--accent); }
}
"""


def page(*, lang, title, updated_label, date, intro, sections, kind, alt_langs):
    """Monta uma pagina legal completa."""
    body = []
    for heading, html in sections:
        body.append(f'    <h2>{heading}</h2>\n    {html}')

    nav = []
    for code in LANGS:
        href = f'{code}.html' if code != DEFAULT else 'index.html'
        current = ' aria-current="true"' if code == lang else ''
        nav.append(f'<li><a href="{href}"{current}>{alt_langs[code]}</a></li>')

    # o par (privacidade <-> termos) vive na pasta irma, dai o ../
    other = 'terms' if kind == 'privacy' else 'privacy'
    other_label = CONTENT[lang][other]['title']
    other_page = 'index.html' if lang == DEFAULT else f'{lang}.html'
    other_href = f'../{other}/{other_page}'
    home = '../index.html'

    return f"""<!DOCTYPE html>
<html lang="{CONTENT[lang]['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — {DATA['app']}</title>
<meta name="description" content="{title} — {DATA['app']} ({DATA['package']}).">
<style>{CSS}</style>
</head>
<body>
<div class="wrap">
  <header>
    <p class="app">{DATA['app']}</p>
    <h1>{title}</h1>
    <p class="meta">{updated_label} {date} · {DATA['publisher']} · <code>{DATA['package']}</code></p>
    <ul class="langs">{''.join(nav)}</ul>
  </header>

  <p class="intro">{intro}</p>

{chr(10).join(body)}

  <footer>
    <p><a href="{other_href}">{other_label}</a> · <a href="{home}">Home</a></p>
    <p>{DATA['publisher']} · <a href="mailto:{DATA['contact']}">{DATA['contact']}</a></p>
  </footer>
</div>
</body>
</html>
"""


def landing():
    rows = []
    for code in LANGS:
        c = CONTENT[code]
        p = 'index.html' if code == DEFAULT else f'{code}.html'
        rows.append(
            f'<a class="card" href="privacy/{p}"><b>{c["privacy"]["title"]}</b>'
            f'<span>{c["dir"]}</span></a>'
            f'<a class="card" href="terms/{p}"><b>{c["terms"]["title"]}</b>'
            f'<span>{c["dir"]}</span></a>'
        )
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{DATA['app']} — Legal</title>
<meta name="description" content="Privacy Policy and Terms of Use for {DATA['app']}.">
<style>{CSS}</style>
</head>
<body>
<div class="wrap">
  <header>
    <p class="app">{DATA['publisher']}</p>
    <h1>{DATA['app']}</h1>
    <p class="meta">Privacy Policy and Terms of Use · <code>{DATA['package']}</code></p>
  </header>
  <p class="intro">This game runs entirely offline and <strong>collects no personal
  data</strong>. Nothing you do in the app is transmitted anywhere.</p>
  <div class="cards">{''.join(rows)}</div>
  <footer>
    <p>{DATA['publisher']} · <a href="mailto:{DATA['contact']}">{DATA['contact']}</a></p>
  </footer>
</div>
</body>
</html>
"""


if __name__ == '__main__':
    alt = {code: CONTENT[code]['dir'] for code in LANGS}
    written = []

    for kind in ('privacy', 'terms'):
        outdir = ROOT / kind
        outdir.mkdir(exist_ok=True)
        for code in LANGS:
            c = CONTENT[code][kind]
            html = page(lang=code, title=c['title'], updated_label=c['updated'],
                        date=DATA['effectiveDate'], intro=c['intro'],
                        sections=c['sections'], kind=kind, alt_langs=alt)
            name = 'index.html' if code == DEFAULT else f'{code}.html'
            (outdir / name).write_text(html, encoding='utf-8')
            written.append(f'{kind}/{name}')

    (ROOT / 'index.html').write_text(landing(), encoding='utf-8')
    written.append('index.html')

    # .nojekyll: sem ele o GitHub Pages roda Jekyll e ignora arquivos com _
    (ROOT / '.nojekyll').write_text('', encoding='utf-8')

    print(f'{len(written)} paginas geradas em docs/')
    for w in written:
        print('  ', w)
    print(f"\nURL da politica (informar a Play Console):\n  {DATA['baseUrl']}/privacy/")
