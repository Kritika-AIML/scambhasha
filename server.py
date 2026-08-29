import http.server
import socketserver
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == "__main__":
    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"==================================================")
            print(f"[ScamBhasha] Web Application is Live!")
            print(f"URL: http://localhost:{PORT}")
            print(f"==================================================")
            sys.stdout.flush()
            httpd.serve_forever()
    except OSError as e:
        PORT = 3001
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"==================================================")
            print(f"[ScamBhasha] Web Application is Live!")
            print(f"URL: http://localhost:{PORT}")
            print(f"==================================================")
            sys.stdout.flush()
            httpd.serve_forever()
