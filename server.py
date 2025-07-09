
#!/usr/bin/env python3
import http.server
import socketserver
import os
from urllib.parse import urlparse

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Se for uma requisição para a raiz, serve o index.html
        if self.path == '/' or self.path == '':
            self.path = '/index.html'
        return super().do_GET()

if __name__ == "__main__":
    PORT = int(os.environ.get('PORT', 5000))
    
    # Muda para o diretório do script para servir arquivos corretamente
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("0.0.0.0", PORT), CORSRequestHandler) as httpd:
        print(f"Servidor rodando na porta {PORT}")
        print(f"Acesse: http://0.0.0.0:{PORT}")
        httpd.serve_forever()
