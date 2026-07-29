#!/usr/bin/env python3
"""
Servidor local para o protótipo da Fase 01.

Por que este script existe em vez de um `python -m http.server` simples:
o protótipo tem caminhos inconsistentes entre si.

  - `support.js` é referenciado como  ./support.js        (relativo ao HTML)
  - os assets são referenciados como  PROJECT/assets/...  (relativo à raiz)

Servindo da raiz, o browser resolve os assets a partir do diretório do
documento (`/PROJECT/`) e pede `/PROJECT/PROJECT/assets/...` → 404.
Servindo de dentro de `PROJECT/`, o `support.js` carrega mas os assets
pedem `/PROJECT/assets/...`, que também não existe daquele ponto → 404.

Este servidor colapsa qualquer repetição de `/PROJECT/` no caminho, então
as duas convenções passam a funcionar ao mesmo tempo, sem editar o protótipo.

Uso (a partir da raiz do repositório):
    python servir-prototipo.py

A correção definitiva é padronizar os caminhos no HTML — ver épico 2 do
DOC/BACKLOG.md (migração do protótipo para o stack de produção).
"""

import http.server
import os
import re
import socketserver
import sys
import webbrowser

PORT = 8080
PAGE = "/PROJECT/Banana%20King%20-%20Fase%2001.dc.html"


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        # /PROJECT/PROJECT/assets/x.png -> /PROJECT/assets/x.png
        path = re.sub(r"(/PROJECT)+/", "/PROJECT/", path)
        return super().translate_path(path)

    def log_message(self, fmt, *args):
        # silencia 200s, mostra só erros (404 etc.)
        if args and str(args[1]).startswith(("4", "5")):
            sys.stderr.write("  %s %s\n" % (args[1], args[0]))


def main():
    if not os.path.isdir("PROJECT/assets"):
        sys.exit("Erro: rode este script a partir da raiz do repositório.")

    socketserver.TCPServer.allow_reuse_address = True
    url = f"http://localhost:{PORT}{PAGE}"
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Protótipo em: {url}")
        print("Ctrl+C para parar.")
        webbrowser.open(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nEncerrado.")


if __name__ == "__main__":
    main()
